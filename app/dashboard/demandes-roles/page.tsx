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
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Store,
  Truck,
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
    "border-amber-200 bg-amber-50 text-amber-700",

  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

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
    useState<"all" | DemandeStatut>(
      "pending"
    );

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

        const response =
          await fetch(
            "/api/dashboard/demandes-roles",
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
    []
  );

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

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
          const fullName =
            `${demande.prenom} ${demande.nom}`
              .toLowerCase();

          const matchesSearch =
            !value ||
            fullName.includes(value) ||
            demande.email
              .toLowerCase()
              .includes(value) ||
            demande.telephone
              .toLowerCase()
              .includes(value);

          const matchesStatus =
            statutFilter === "all" ||
            demande.statut === statutFilter;

          const matchesType =
            typeFilter === "all" ||
            demande.type === typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      demandes,
      search,
      statutFilter,
      typeFilter,
    ]);

  /*
   * =========================================================
   * FILTRES PAR CARTES
   * =========================================================
   */

  const handlePendingCard = () => {
    setStatutFilter("pending");
    setTypeFilter("all");
  };

  const handleApprovedCard = () => {
    setStatutFilter("approved");
    setTypeFilter("all");
  };

  const handleRejectedCard = () => {
    setStatutFilter("rejected");
    setTypeFilter("all");
  };

  const handleVendeurCard = () => {
    setTypeFilter("vendeur");
    setStatutFilter("all");
  };

  const handleLivreurCard = () => {
    setTypeFilter("livreur");
    setStatutFilter("all");
  };

  const resetFilters = () => {
    setSearch("");
    setStatutFilter("pending");
    setTypeFilter("all");
  };

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
    <div className="min-h-full space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-3">

          <div className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-blue-600
            text-white
            shadow-lg
            shadow-blue-600/20
          ">
            <UserRoundCheck
              size={23}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">

              <h1 className="
                text-2xl
                font-bold
                tracking-tight
                text-gray-900
                sm:text-3xl
              ">
                Demandes de rôles
              </h1>

              {!loading && (
                <span className="
                  rounded-full
                  bg-blue-50
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-blue-700
                ">
                  {demandes.length}{" "}
                  demande
                  {demandes.length > 1
                    ? "s"
                    : ""}
                </span>
              )}

            </div>

            <p className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-gray-500
            ">
              Gérez les demandes des utilisateurs
              souhaitant rejoindre MarketMali comme
              vendeur ou livreur.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={loadDemandes}
          disabled={loading}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            self-start
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-gray-700
            shadow-sm
            transition-all
            hover:border-gray-300
            hover:bg-gray-50
            hover:shadow
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500/20
            disabled:cursor-not-allowed
            disabled:opacity-50
            lg:self-auto
          "
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Actualiser
        </button>

      </div>

      {/* =====================================================
          STATISTIQUES
      ====================================================== */}

      <div className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-5
      ">

        <StatCard
          label="En attente"
          value={pendingCount}
          icon={
            <Clock3 size={21} />
          }
          color="yellow"
          active={
            statutFilter === "pending" &&
            typeFilter === "all"
          }
          onClick={handlePendingCard}
        />

        <StatCard
          label="Approuvées"
          value={approvedCount}
          icon={
            <Check size={21} />
          }
          color="green"
          active={
            statutFilter === "approved" &&
            typeFilter === "all"
          }
          onClick={handleApprovedCard}
        />

        <StatCard
          label="Refusées"
          value={rejectedCount}
          icon={
            <XCircle size={21} />
          }
          color="red"
          active={
            statutFilter === "rejected" &&
            typeFilter === "all"
          }
          onClick={handleRejectedCard}
        />

        <StatCard
          label="Demandes vendeur"
          value={vendeurCount}
          icon={
            <Store size={21} />
          }
          color="blue"
          active={
            typeFilter === "vendeur" &&
            statutFilter === "all"
          }
          onClick={handleVendeurCard}
        />

        <StatCard
          label="Demandes livreur"
          value={livreurCount}
          icon={
            <Truck size={21} />
          }
          color="purple"
          active={
            typeFilter === "livreur" &&
            statutFilter === "all"
          }
          onClick={handleLivreurCard}
        />

      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <section className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
      ">

        <div className="
          flex
          flex-col
          gap-4
          border-b
          border-gray-100
          p-4
          sm:p-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-gray-100
              text-gray-600
            ">
              <SlidersHorizontal
                size={18}
              />
            </div>

            <div>
              <h2 className="
                text-sm
                font-semibold
                text-gray-900
              ">
                Filtrer les demandes
              </h2>

              <p className="
                mt-0.5
                text-xs
                text-gray-500
              ">
                Affinez les résultats affichés.
              </p>
            </div>

          </div>

          {(search ||
            statutFilter !== "pending" ||
            typeFilter !== "all") && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                inline-flex
                items-center
                gap-2
                self-start
                text-xs
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
                lg:self-auto
              "
            >
              <RotateCcw
                size={14}
              />

              Réinitialiser
            </button>
          )}

        </div>

        <div className="p-4 sm:p-5">

          <div className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-[minmax(0,1fr)_auto_auto]
          ">

            {/* Recherche */}

            <div className="relative">

              <Search
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
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
                placeholder="Rechercher par nom, email ou téléphone..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  hover:border-gray-300
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-500/10
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
                h-11
                min-w-[175px]
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-medium
                text-gray-700
                outline-none
                transition
                hover:border-gray-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
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
                h-11
                min-w-[170px]
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-medium
                text-gray-700
                outline-none
                transition
                hover:border-gray-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
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

      </section>

      {/* =====================================================
          RÉSULTATS
      ====================================================== */}

      <div className="
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div>
          <h2 className="
            text-base
            font-bold
            text-gray-900
          ">
            Liste des demandes
          </h2>

          <p className="
            mt-0.5
            text-xs
            text-gray-500
          ">
            {loading
              ? "Chargement..."
              : `${filteredDemandes.length} résultat${
                  filteredDemandes.length > 1
                    ? "s"
                    : ""
                } affiché${
                  filteredDemandes.length > 1
                    ? "s"
                    : ""
                }`}
          </p>
        </div>

      </div>

      {/* =====================================================
          TABLEAU
      ====================================================== */}

      <section className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
      ">

        {loading ? (
          <LoadingState />
        ) : filteredDemandes.length === 0 ? (
          <EmptyState
            onReset={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="
              w-full
              min-w-[1100px]
            ">

              <thead>
                <tr className="
                  border-b
                  border-gray-200
                  bg-gray-50/80
                ">

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Utilisateur
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Rôle demandé
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Motif
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="
                divide-y
                divide-gray-100
              ">

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
                        className="
                          group
                          transition-colors
                          hover:bg-gray-50/70
                        "
                      >

                        {/* Utilisateur */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-gray-100
                              text-sm
                              font-bold
                              text-gray-600
                            ">
                              {demande.prenom
                                ?.charAt(0)
                                .toUpperCase()}
                              {demande.nom
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <div className="
                                truncate
                                text-sm
                                font-semibold
                                text-gray-900
                              ">
                                {
                                  demande.prenom
                                }{" "}
                                {
                                  demande.nom
                                }
                              </div>

                              <div className="
                                mt-0.5
                                text-xs
                                text-gray-400
                              ">
                                ID #
                                {
                                  demande.user_id
                                }
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* Contact */}

                        <td className="px-5 py-4">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-700
                          ">
                            <Phone
                              size={14}
                              className="text-gray-400"
                            />

                            <span>
                              {demande.telephone ||
                                "-"}
                            </span>
                          </div>

                          <div className="
                            mt-1.5
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-gray-400
                          ">
                            <Mail
                              size={13}
                            />

                            <span>
                              {
                                demande.email
                              }
                            </span>
                          </div>

                        </td>

                        {/* Type */}

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              px-3
                              py-1.5
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
                            {demande.type ===
                            "vendeur" ? (
                              <Store
                                size={13}
                              />
                            ) : (
                              <Truck
                                size={13}
                              />
                            )}

                            {
                              typeLabels[
                                demande.type
                              ]
                            }
                          </span>

                        </td>

                        {/* Motif */}

                        <td className="max-w-[280px] px-5 py-4">

                          <p
                            className="
                              truncate
                              text-sm
                              text-gray-600
                            "
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
                              className="
                                mt-1.5
                                truncate
                                text-xs
                                font-medium
                                text-red-500
                              "
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
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              ${
                                statutClasses[
                                  demande.statut
                                ]
                              }
                            `}
                          >
                            <span className="
                              mr-1.5
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-current
                            " />

                            {
                              statutLabels[
                                demande.statut
                              ]
                            }
                          </span>

                        </td>

                        {/* Date */}

                        <td className="
                          whitespace-nowrap
                          px-5
                          py-4
                          text-sm
                          text-gray-500
                        ">
                          {formatDate(
                            demande.created_at
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">

                          {demande.statut ===
                          "pending" ? (
                            <div className="
                              flex
                              justify-end
                              gap-2
                            ">

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
                                  bg-emerald-600
                                  px-3
                                  py-2
                                  text-xs
                                  font-bold
                                  text-white
                                  shadow-sm
                                  transition
                                  hover:bg-emerald-700
                                  hover:shadow
                                  focus:outline-none
                                  focus:ring-2
                                  focus:ring-emerald-500/30
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
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  font-bold
                                  text-red-600
                                  transition
                                  hover:border-red-300
                                  hover:bg-red-50
                                  focus:outline-none
                                  focus:ring-2
                                  focus:ring-red-500/20
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
                            <div className="
                              flex
                              items-center
                              justify-end
                              gap-1.5
                              text-xs
                              font-medium
                              text-gray-400
                            ">
                              <Check
                                size={14}
                              />

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

      </section>

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
              bg-gray-950/60
              p-4
              backdrop-blur-sm
            "
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                if (!processing) {
                  setShowRejectModal(
                    false
                  );
                  setSelectedDemande(
                    null
                  );
                }
              }
            }}
          >

            <div className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            ">

              {/* Header */}

              <div className="
                flex
                items-start
                justify-between
                border-b
                border-gray-100
                px-5
                py-5
                sm:px-6
              ">

                <div className="flex items-start gap-3">

                  <div className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-600
                  ">
                    <XCircle
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="
                      text-lg
                      font-bold
                      text-gray-900
                    ">
                      Refuser la demande
                    </h2>

                    <p className="
                      mt-1
                      text-sm
                      leading-5
                      text-gray-500
                    ">
                      Cette action notifiera
                      l'utilisateur.
                    </p>
                  </div>

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
                  disabled={
                    !!processing
                  }
                  className="
                    rounded-lg
                    p-2
                    text-gray-400
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                    disabled:opacity-50
                  "
                >
                  <X size={19} />
                </button>

              </div>

              {/* Contenu */}

              <div className="
                space-y-5
                px-5
                py-5
                sm:px-6
              ">

                {/* Utilisateur */}

                <div className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-4
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-sm
                    font-bold
                    text-gray-600
                    shadow-sm
                  ">
                    {
                      selectedDemande
                        .prenom
                        ?.charAt(0)
                        .toUpperCase()
                    }
                    {
                      selectedDemande
                        .nom
                        ?.charAt(0)
                        .toUpperCase()
                    }
                  </div>

                  <div className="min-w-0">

                    <div className="
                      truncate
                      font-semibold
                      text-gray-900
                    ">
                      {
                        selectedDemande.prenom
                      }{" "}
                      {
                        selectedDemande.nom
                      }
                    </div>

                    <div className="
                      mt-1
                      text-sm
                      text-gray-500
                    ">
                      Demande pour devenir{" "}
                      <span className="
                        font-semibold
                        text-gray-700
                      ">
                        {
                          typeLabels[
                            selectedDemande
                              .type
                          ]
                        }
                      </span>
                    </div>

                  </div>

                </div>

                {/* Commentaire */}

                <div>

                  <label
                    htmlFor="commentaire"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                    "
                  >
                    Commentaire{" "}
                    <span className="
                      font-normal
                      text-gray-400
                    ">
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
                      bg-white
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                </div>

              </div>

              {/* Footer */}

              <div className="
                flex
                flex-col-reverse
                gap-2
                border-t
                border-gray-100
                bg-gray-50/50
                px-5
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-6
              ">

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
                  disabled={
                    !!processing
                  }
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={rejectDemande}
                  disabled={
                    !!processing
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-red-700
                    hover:shadow
                    focus:outline-none
                    focus:ring-2
                    focus:ring-red-500/30
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
 * CARTE STATISTIQUE
 * =========================================================
 */

function StatCard({
  label,
  value,
  icon,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color:
    | "yellow"
    | "green"
    | "red"
    | "blue"
    | "purple";
  active: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    yellow: {
      icon: "bg-amber-50 text-amber-600",
      border: "border-amber-200",
      active:
        "border-amber-400 ring-2 ring-amber-500/15",
      value: "text-amber-700",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-200",
      active:
        "border-emerald-400 ring-2 ring-emerald-500/15",
      value: "text-emerald-700",
    },

    red: {
      icon: "bg-red-50 text-red-600",
      border: "border-red-200",
      active:
        "border-red-400 ring-2 ring-red-500/15",
      value: "text-red-700",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",
      border: "border-blue-200",
      active:
        "border-blue-400 ring-2 ring-blue-500/15",
      value: "text-blue-700",
    },

    purple: {
      icon: "bg-purple-50 text-purple-600",
      border: "border-purple-200",
      active:
        "border-purple-400 ring-2 ring-purple-500/15",
      value: "text-purple-700",
    },
  };

  const styles =
    colorClasses[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        bg-white
        p-4
        text-left
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/20
        sm:p-5
        ${styles.border}
        ${
          active
            ? styles.active
            : ""
        }
      `}
    >

      {/* Barre active */}

      <span
        className={`
          absolute
          left-0
          top-0
          h-1
          w-full
          origin-left
          transition-transform
          duration-200
          ${
            active
              ? "scale-x-100 bg-current"
              : "scale-x-0"
          }
        `}
      />

      <div className="
        flex
        items-start
        justify-between
        gap-3
      ">

        <div className="min-w-0">

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-gray-500
          ">
            {label}
          </p>

          <p className={`
            mt-2
            text-3xl
            font-bold
            tracking-tight
            ${styles.value}
          `}>
            {value}
          </p>

          <p className="
            mt-1
            text-xs
            text-gray-400
          ">
            demandes
          </p>

        </div>

        <div className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          transition-transform
          duration-200
          group-hover:scale-105
          ${styles.icon}
        `}>
          {icon}
        </div>

      </div>

    </button>
  );
}

/*
 * =========================================================
 * LOADING
 * =========================================================
 */

function LoadingState() {
  return (
    <div className="
      flex
      min-h-[360px]
      flex-col
      items-center
      justify-center
      px-6
      text-center
    ">

      <div className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-2xl
        bg-blue-50
        text-blue-600
      ">
        <Loader2
          size={23}
          className="animate-spin"
        />
      </div>

      <p className="
        mt-4
        text-sm
        font-semibold
        text-gray-700
      ">
        Chargement des demandes...
      </p>

      <p className="
        mt-1
        text-xs
        text-gray-400
      ">
        Veuillez patienter quelques instants.
      </p>

    </div>
  );
}

/*
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="
      flex
      min-h-[360px]
      flex-col
      items-center
      justify-center
      px-6
      text-center
    ">

      <div className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        bg-gray-100
        text-gray-400
      ">
        <UserRoundCheck
          size={28}
        />
      </div>

      <h3 className="
        mt-5
        text-base
        font-bold
        text-gray-900
      ">
        Aucune demande trouvée
      </h3>

      <p className="
        mt-1
        max-w-md
        text-sm
        leading-6
        text-gray-500
      ">
        Aucune demande ne correspond
        aux filtres ou à la recherche
        sélectionnée.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-gray-900
          px-4
          py-2.5
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-gray-800
        "
      >
        <RotateCcw
          size={15}
        />

        Réinitialiser les filtres
      </button>

    </div>
  );
}

