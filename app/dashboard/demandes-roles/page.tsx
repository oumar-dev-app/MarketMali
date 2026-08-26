"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Clock3,
  Loader2,
  Search,
  UserRoundCheck,
  X,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

type DemandeType = "vendeur" | "livreur";

type DemandeStatut =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

interface DemandeRole {
  id: number;
  uuid: string;
  user_id: number;
  user_uuid?: string;

  type: DemandeType;
  statut: DemandeStatut;

  motif: string | null;
  commentaire_admin: string | null;

  traite_par: number | null;
  traite_at: string | null;

  nom: string;
  prenom: string;
  email: string;
  telephone: string;

  created_at: string;
  updated_at: string;
}

const statutLabels: Record<
  DemandeStatut,
  string
> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
  cancelled: "Annulée",
};

const statutClasses: Record<
  DemandeStatut,
  string
> = {
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-700",

  approved:
    "border-green-200 bg-green-50 text-green-700",

  rejected:
    "border-red-200 bg-red-50 text-red-700",

  cancelled:
    "border-gray-200 bg-gray-50 text-gray-600",
};

const typeLabels: Record<
  DemandeType,
  string
> = {
  vendeur: "Vendeur",
  livreur: "Livreur",
};

export default function DemandesRolesPage() {
  const [demandes, setDemandes] =
    useState<DemandeRole[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statutFilter, setStatutFilter] =
    useState<"all" | DemandeStatut>("pending");

  const [typeFilter, setTypeFilter] =
    useState<"all" | DemandeType>("all");

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [selectedDemande, setSelectedDemande] =
    useState<DemandeRole | null>(null);

  const [commentaire, setCommentaire] =
    useState("");

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */

  const loadDemandes = useCallback(
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Vous devez être connecté."
          );
          return;
        }

        const params =
          new URLSearchParams();

        if (statutFilter !== "all") {
          params.set(
            "statut",
            statutFilter
          );
        }

        const response =
          await fetch(
            `/api/dashboard/demandes-roles?${params.toString()}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Impossible de récupérer les demandes."
          );
        }

        setDemandes(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (error) {
        console.error(
          "Erreur chargement demandes :",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    },
    [statutFilter]
  );

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  /*
   * =========================================================
   * FILTRAGE LOCAL
   * =========================================================
   */

  const filteredDemandes =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return demandes.filter(
        (demande) => {
          const matchesSearch =
            !value ||
            `${demande.prenom} ${demande.nom}`
              .toLowerCase()
              .includes(value) ||
            demande.email
              .toLowerCase()
              .includes(value) ||
            demande.telephone
              .toLowerCase()
              .includes(value);

          const matchesType =
            typeFilter === "all" ||
            demande.type === typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      demandes,
      search,
      typeFilter,
    ]);

  /*
   * =========================================================
   * STATISTIQUES
   * =========================================================
   */

  const pendingCount =
    demandes.filter(
      (item) =>
        item.statut === "pending"
    ).length;

  const approvedCount =
    demandes.filter(
      (item) =>
        item.statut === "approved"
    ).length;

  const rejectedCount =
    demandes.filter(
      (item) =>
        item.statut === "rejected"
    ).length;

  const vendeurCount =
    demandes.filter(
      (item) =>
        item.type === "vendeur"
    ).length;

  const livreurCount =
    demandes.filter(
      (item) =>
        item.type === "livreur"
    ).length;

  /*
   * =========================================================
   * APPROBATION
   * =========================================================
   */

  const approveDemande =
    async (
      demande: DemandeRole
    ) => {
      if (
        processing ||
        demande.statut !== "pending"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Voulez-vous vraiment approuver la demande de ${demande.prenom} ${demande.nom} pour devenir ${typeLabels[demande.type]} ?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setProcessing(
          demande.uuid
        );

        const token =
          localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Vous devez être connecté."
          );
          return;
        }

        const response =
          await fetch(
            `/api/dashboard/demandes-roles/${demande.uuid}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                action: "approve",
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Impossible d'approuver la demande."
          );
        }

        toast.success(
          "La demande a été approuvée."
        );

        await loadDemandes();
      } catch (error) {
        console.error(
          "Erreur approbation :",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue."
        );
      } finally {
        setProcessing(null);
      }
    };

  /*
   * =========================================================
   * OUVRIR REFUS
   * =========================================================
   */

  const openRejectModal =
    (demande: DemandeRole) => {
      setSelectedDemande(
        demande
      );

      setCommentaire("");

      setShowRejectModal(true);
    };

  /*
   * =========================================================
   * REFUS
   * =========================================================
   */

  const rejectDemande =
    async () => {
      if (
        !selectedDemande ||
        processing
      ) {
        return;
      }

      try {
        setProcessing(
          selectedDemande.uuid
        );

        const token =
          localStorage.getItem("token");

        if (!token) {
          toast.error(
            "Vous devez être connecté."
          );
          return;
        }

        const response =
          await fetch(
            `/api/dashboard/demandes-roles/${selectedDemande.uuid}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                action: "reject",
                commentaire:
                  commentaire.trim() ||
                  null,
              }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Impossible de refuser la demande."
          );
        }

        toast.success(
          "La demande a été refusée."
        );

        setShowRejectModal(
          false
        );

        setSelectedDemande(
          null
        );

        setCommentaire("");

        await loadDemandes();
      } catch (error) {
        console.error(
          "Erreur refus :",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue."
        );
      } finally {
        setProcessing(null);
      }
    };

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate =
    (date: string) => {
      try {
        return new Intl.DateTimeFormat(
          "fr-FR",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        ).format(
          new Date(date)
        );
      } catch {
        return date;
      }
    };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <UserRoundCheck
                size={22}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Demandes de rôles
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Gérez les demandes des utilisateurs souhaitant devenir vendeur ou livreur.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDemandes}
          disabled={loading}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-gray-700
            shadow-sm
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Clock3
              size={17}
            />
          )}

          Actualiser
        </button>
      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <StatCard
          label="En attente"
          value={pendingCount}
          icon={
            <Clock3 size={20} />
          }
          className="border-yellow-200"
        />

        <StatCard
          label="Approuvées"
          value={approvedCount}
          icon={
            <Check size={20} />
          }
          className="border-green-200"
        />

        <StatCard
          label="Refusées"
          value={rejectedCount}
          icon={
            <XCircle size={20} />
          }
          className="border-red-200"
        />

        <StatCard
          label="Demandes vendeur"
          value={vendeurCount}
          icon={
            <UserRoundCheck
              size={20}
            />
          }
          className="border-blue-200"
        />

        <StatCard
          label="Demandes livreur"
          value={livreurCount}
          icon={
            <UserRoundCheck
              size={20}
            />
          }
          className="border-purple-200"
        />

      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">

          {/* Recherche */}

          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher un utilisateur..."
              className="
                w-full
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:bg-white
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

          {/* Statut */}

          <select
            value={statutFilter}
            onChange={(event) =>
              setStatutFilter(
                event.target.value as
                  | "all"
                  | DemandeStatut
              )
            }
            className="
              rounded-lg
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          >
            <option value="all">
              Tous les statuts
            </option>

            <option value="pending">
              En attente
            </option>

            <option value="approved">
              Approuvées
            </option>

            <option value="rejected">
              Refusées
            </option>

            <option value="cancelled">
              Annulées
            </option>
          </select>

          {/* Type */}

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as
                  | "all"
                  | DemandeType
              )
            }
            className="
              rounded-lg
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              text-gray-700
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          >
            <option value="all">
              Tous les rôles
            </option>

            <option value="vendeur">
              Vendeur
            </option>

            <option value="livreur">
              Livreur
            </option>
          </select>

        </div>
      </div>

      {/* =====================================================
          TABLEAU
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2
                size={20}
                className="animate-spin"
              />
              Chargement des demandes...
            </div>
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <UserRoundCheck
                size={26}
              />
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              Aucune demande trouvée
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Aucune demande ne correspond aux filtres sélectionnés.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-[1050px] w-full">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Utilisateur
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rôle demandé
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Motif
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Statut
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredDemandes.map(
                  (demande) => {

                    const isProcessing =
                      processing ===
                      demande.uuid;

                    return (
                      <tr
                        key={
                          demande.uuid
                        }
                        className="transition hover:bg-gray-50"
                      >

                        {/* Utilisateur */}

                        <td className="px-5 py-4">

                          <div className="font-medium text-gray-900">
                            {demande.prenom}{" "}
                            {demande.nom}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-400">
                            ID #{demande.user_id}
                          </div>

                        </td>

                        {/* Contact */}

                        <td className="px-5 py-4">

                          <div className="text-sm text-gray-700">
                            {demande.telephone ||
                              "-"}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-400">
                            {demande.email}
                          </div>

                        </td>

                        {/* Type */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                demande.type ===
                                "vendeur"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-purple-200 bg-purple-50 text-purple-700"
                              }
                            `}
                          >
                            {typeLabels[
                              demande.type
                            ]}
                          </span>

                        </td>

                        {/* Motif */}

                        <td className="max-w-[280px] px-5 py-4">

                          <p
                            className="truncate text-sm text-gray-600"
                            title={
                              demande.motif ??
                              ""
                            }
                          >
                            {demande.motif ||
                              "Aucun motif fourni"}
                          </p>

                          {demande.commentaire_admin && (
                            <p
                              className="mt-1 truncate text-xs text-red-500"
                              title={
                                demande.commentaire_admin
                              }
                            >
                              Admin :{" "}
                              {
                                demande.commentaire_admin
                              }
                            </p>
                          )}

                        </td>

                        {/* Statut */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${statutClasses[
                                demande.statut
                              ]}
                            `}
                          >
                            {
                              statutLabels[
                                demande.statut
                              ]
                            }
                          </span>

                        </td>

                        {/* Date */}

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {formatDate(
                            demande.created_at
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">

                          {demande.statut ===
                          "pending" ? (
                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  approveDemande(
                                    demande
                                  )
                                }
                                disabled={
                                  !!processing
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  bg-green-600
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition
                                  hover:bg-green-700
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                {isProcessing ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Check
                                    size={14}
                                  />
                                )}

                                Approuver
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openRejectModal(
                                    demande
                                  )
                                }
                                disabled={
                                  !!processing
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-red-200
                                  bg-red-50
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-red-700
                                  transition
                                  hover:bg-red-100
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                <X
                                  size={14}
                                />

                                Refuser
                              </button>

                            </div>
                          ) : (
                            <div className="text-right text-xs text-gray-400">
                              Traitée
                            </div>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          MODAL REFUS
      ====================================================== */}

      {showRejectModal &&
        selectedDemande && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/50
              p-4
            "
          >

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Refuser la demande
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Cette action notifiera l'utilisateur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(
                      false
                    );
                    setSelectedDemande(
                      null
                    );
                  }}
                  disabled={!!processing}
                  className="
                    rounded-lg
                    p-2
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-600
                  "
                >
                  <X size={20} />
                </button>

              </div>

              {/* Contenu */}

              <div className="space-y-5 px-6 py-5">

                <div className="rounded-xl bg-gray-50 p-4">

                  <div className="font-semibold text-gray-900">
                    {
                      selectedDemande.prenom
                    }{" "}
                    {
                      selectedDemande.nom
                    }
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    Demande pour devenir{" "}
                    <span className="font-semibold text-gray-700">
                      {
                        typeLabels[
                          selectedDemande.type
                        ]
                      }
                    </span>
                  </div>

                </div>

                <div>

                  <label
                    htmlFor="commentaire"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Commentaire
                    <span className="ml-1 text-gray-400">
                      (optionnel)
                    </span>
                  </label>

                  <textarea
                    id="commentaire"
                    value={commentaire}
                    onChange={(event) =>
                      setCommentaire(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Expliquez éventuellement la raison du refus..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>

              {/* Footer */}

              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(
                      false
                    );
                    setSelectedDemande(
                      null
                    );
                  }}
                  disabled={!!processing}
                  className="
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={rejectDemande}
                  disabled={!!processing}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {processing ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <XCircle
                      size={17}
                    />
                  )}

                  Refuser la demande
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

/*
 * =========================================================
 * PETIT COMPOSANT STATISTIQUE
 * =========================================================
 */

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        bg-white
        p-4
        shadow-sm
        ${className}
      `}
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>

      </div>
    </div>
  );
}
