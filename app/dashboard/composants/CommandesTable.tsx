"use client";

import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Check,
  EllipsisVertical,
  Eye,
  PackageCheck,
  Trash2,
  X,
} from "lucide-react";

interface Commande {
  uuid: string;
  total: string;
  frais_livraison: string | number;
  status: string;

  livraison: {
    uuid: string | null;
    status:
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivery_pending_confirmation"
    | "delivered"
    | "cancelled"
    | null;
  };

  created_at: string;
  updated_at?: string;

  client?: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
}

interface Props {
  commandes: Commande[];

  commentaires: Record<string, string>;

  setCommentaires: Dispatch<
    SetStateAction<Record<string, string>>
  >;

  updateStatus: (
    uuid: string,
    status: string
  ) => void;

  deleteCommande: (
    uuid: string
  ) => void;
}

/* ========================================================= */
/* STATUTS COMMANDE */
/* ========================================================= */

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "En attente",
    className:
      "bg-yellow-100 text-yellow-800",
  },

  confirmed: {
    label: "Confirmée",
    className:
      "bg-blue-100 text-blue-800",
  },

  preparing: {
    label: "En préparation",
    className:
      "bg-indigo-100 text-indigo-800",
  },

  shipped: {
    label: "Expédiée",
    className:
      "bg-purple-100 text-purple-800",
  },

  delivered: {
    label: "Livrée",
    className:
      "bg-green-100 text-green-800",
  },

  cancelled: {
    label: "Annulée",
    className:
      "bg-red-100 text-red-800",
  },
};

/* ========================================================= */
/* STATUTS LIVRAISON */
/* ========================================================= */

const livraisonStatusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  assigned: {
    label: "Affectée au livreur",
    className:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },

  picked_up: {
    label: "Colis récupéré",
    className:
      "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  },

  in_transit: {
    label: "En cours de livraison",
    className:
      "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  },

  delivery_pending_confirmation: {
    label: "En attente de confirmation",
    className:
      "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  },

  delivered: {
    label: "Livraison confirmée",
    className:
      "bg-green-50 text-green-700 ring-1 ring-green-200",
  },

  cancelled: {
    label: "Livraison annulée",
    className:
      "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
};

/* ========================================================= */
/* FORMATAGE */
/* ========================================================= */

const formatPrice = (
  value: string | number
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0 FCFA";
  }

  return `${number.toLocaleString(
    "fr-FR"
  )} FCFA`;
};

const formatDate = (
  value: string
) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
};

const getClientName = (
  commande: Commande
) => {
  if (!commande.client) {
    return "Client supprimé";
  }

  return `${commande.client.prenom} ${commande.client.nom}`;
};

/* ========================================================= */
/* ACTION MENU */
/* ========================================================= */

interface ActionMenuProps {
  commande: Commande;
  commentaire: string;

  setCommentaire: (
    value: string
  ) => void;

  updateStatus: (
    uuid: string,
    status: string
  ) => void;

  deleteCommande: (
    uuid: string
  ) => void;
}

function ActionMenu({
  commande,
  commentaire,
  setCommentaire,
  updateStatus,
  deleteCommande,
}: ActionMenuProps) {
  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  const canManageStatus =
    commande.status === "pending" ||
    commande.status === "confirmed";

  const isDeliveryManaged =
    commande.status === "preparing" ||
    commande.status === "shipped" ||
    commande.status === "delivered";

  const isCancelled =
    commande.status === "cancelled";

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) => !previous
          )
        }
        aria-label="Actions de la commande"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

          {/* Voir */}
          <Link
            href={`/dashboard/commandes/${commande.uuid}`}
            onClick={() =>
              setOpen(false)
            }
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 text-blue-600" />

            <span>
              Voir la commande
            </span>
          </Link>

          <div className="border-t border-gray-100" />

          {/* Gestion du statut */}
          {canManageStatus && (
            <div className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Modifier le statut
              </p>

              <input
                type="text"
                value={commentaire}
                onChange={(event) =>
                  setCommentaire(
                    event.target.value
                  )
                }
                placeholder="Commentaire..."
                className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="space-y-1">

                {/* Pending */}
                {commande.status ===
                  "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateStatus(
                            commande.uuid,
                            "confirmed"
                          );
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        <Check className="h-4 w-4" />

                        <span>
                          Confirmer
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateStatus(
                            commande.uuid,
                            "cancelled"
                          );
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />

                        <span>
                          Annuler
                        </span>
                      </button>
                    </>
                  )}

                {/* Confirmed */}
                {commande.status ===
                  "confirmed" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateStatus(
                            commande.uuid,
                            "preparing"
                          );
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                      >
                        <PackageCheck className="h-4 w-4" />

                        <span>
                          Mettre en préparation
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateStatus(
                            commande.uuid,
                            "cancelled"
                          );
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />

                        <span>
                          Annuler
                        </span>
                      </button>
                    </>
                  )}
              </div>
            </div>
          )}

          {/* Livraison */}
          {isDeliveryManaged && (
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-start gap-3">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Géré par la livraison
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Le statut est maintenant géré par le processus de livraison.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Annulée */}
          {isCancelled && (
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3 text-sm font-medium text-red-600">
                <X className="h-4 w-4" />

                <span>
                  Commande annulée
                </span>
              </div>
            </div>
          )}

          {/* Suppression */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                deleteCommande(
                  commande.uuid
                );
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />

              <span>
                Supprimer la commande
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* CARTE MOBILE */
/* ========================================================= */

interface CommandeCardProps {
  commande: Commande;
  commentaire: string;

  setCommentaire: (
    value: string
  ) => void;

  updateStatus: (
    uuid: string,
    status: string
  ) => void;

  deleteCommande: (
    uuid: string
  ) => void;
}

function CommandeCard({
  commande,
  commentaire,
  setCommentaire,
  updateStatus,
  deleteCommande,
}: CommandeCardProps) {
  const status =
    statusConfig[
    commande.status
    ] ?? {
      label: commande.status,
      className:
        "bg-gray-100 text-gray-700",
    };

  const livraisonStatus =
    commande.livraison?.status
      ? livraisonStatusConfig[
      commande.livraison.status
      ]
      : {
        label: "Pas encore affectée",
        className:
          "bg-gray-50 text-gray-500 ring-1 ring-gray-200",
      };

  const clientName =
    getClientName(commande);

  const total =
    Number(commande.total);

  const livraison =
    Number(
      commande.frais_livraison ?? 0
    );

  const produits =
    Number.isFinite(total)
      ? total - livraison
      : 0;

  return (
    <article className="relative overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

      {/* Header carte */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">

        <div className="min-w-0">
          <Link
            href={`/dashboard/commandes/${commande.uuid}`}
            className="inline-flex max-w-full items-center font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            <span className="truncate">
              #{commande.uuid.slice(
                0,
                8
              )}
            </span>
          </Link>

          <p className="mt-1 truncate text-xs text-gray-400">
            {commande.uuid}
          </p>
        </div>

        <div className="shrink-0">
          <ActionMenu
            commande={commande}
            commentaire={commentaire}
            setCommentaire={
              setCommentaire
            }
            updateStatus={
              updateStatus
            }
            deleteCommande={
              deleteCommande
            }
          />
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-4 p-4">

        {/* Client */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            Client
          </p>

          <p className="font-semibold text-gray-900">
            {clientName}
          </p>

          {commande.client && (
            <p className="mt-1 text-sm text-gray-500">
              {commande.client.telephone}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Total
            </span>

            <span className="text-base font-bold text-gray-900">
              {formatPrice(
                commande.total
              )}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-gray-500">
            <span>
              Produits
            </span>

            <span>
              {formatPrice(
                produits
              )}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-4 text-xs text-gray-500">
            <span>
              Livraison
            </span>

            <span>
              {formatPrice(
                livraison
              )}
            </span>
          </div>
        </div>

        {/* Statut commande */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Statut commande
          </p>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Statut livraison */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <PackageCheck className="h-3.5 w-3.5 text-gray-400" />

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Livraison
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${livraisonStatus.className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />

            {livraisonStatus.label}
          </span>
        </div>

        {/* Date */}
        <div className="flex justify-end border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {formatDate(
              commande.created_at
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ========================================================= */
/* TABLEAU PRINCIPAL */
/* ========================================================= */

export default function CommandesTable({
  commandes,
  commentaires,
  setCommentaires,
  updateStatus,
  deleteCommande,
}: Props) {
  return (
    <div className="w-full">

      {/* ===================================================== */}
      {/* MOBILE : CARTES */}
      {/* ===================================================== */}

      <div className="space-y-4 p-3 md:hidden">
        {commandes.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
            Aucune commande trouvée.
          </div>
        ) : (
          commandes.map(
            (commande) => (
              <CommandeCard
                key={commande.uuid}
                commande={commande}
                commentaire={
                  commentaires[
                  commande.uuid
                  ] ?? ""
                }
                setCommentaire={(
                  value
                ) => {
                  setCommentaires(
                    (previous) => ({
                      ...previous,
                      [commande.uuid]:
                        value,
                    })
                  );
                }}
                updateStatus={
                  updateStatus
                }
                deleteCommande={
                  deleteCommande
                }
              />
            )
          )
        )}
      </div>

      {/* ===================================================== */}
      {/* DESKTOP : TABLEAU */}
      {/* ===================================================== */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1050px] text-sm">

          <thead>
            <tr className="border-b bg-gray-50">

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Commande
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Client
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Total
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Statut
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Livraison
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-700">
                Date
              </th>

              <th className="px-5 py-4 text-right font-semibold text-gray-700">
                Actions
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {commandes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-gray-500"
                >
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              commandes.map(
                (commande) => {

                  const status =
                    statusConfig[
                    commande.status
                    ] ?? {
                      label:
                        commande.status,
                      className:
                        "bg-gray-100 text-gray-700",
                    };

                  const livraisonStatus =
                    commande.livraison
                      ?.status
                      ? livraisonStatusConfig[
                      commande
                        .livraison
                        .status
                      ]
                      : {
                        label:
                          "Pas encore affectée",
                        className:
                          "bg-gray-50 text-gray-500 ring-1 ring-gray-200",
                      };

                  const clientName =
                    getClientName(
                      commande
                    );

                  const total =
                    Number(
                      commande.total
                    );

                  const livraison =
                    Number(
                      commande.frais_livraison ??
                      0
                    );

                  const produits =
                    Number.isFinite(
                      total
                    )
                      ? total -
                      livraison
                      : 0;

                  return (
                    <tr
                      key={
                        commande.uuid
                      }
                      className="transition hover:bg-gray-50"
                    >

                      {/* Commande */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/commandes/${commande.uuid}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          #
                          {commande.uuid.slice(
                            0,
                            8
                          )}
                        </Link>

                        <p className="mt-1 max-w-[150px] truncate text-xs text-gray-400">
                          {
                            commande.uuid
                          }
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {
                            clientName
                          }
                        </p>

                        {commande.client && (
                          <p className="mt-1 text-xs text-gray-500">
                            {
                              commande
                                .client
                                .telephone
                            }
                          </p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(
                              commande.total
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Produits :{" "}
                            {formatPrice(
                              produits
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            Livraison :{" "}
                            {formatPrice(
                              livraison
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Statut commande */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {
                            status.label
                          }
                        </span>
                      </td>

                      {/* Statut livraison */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${livraisonStatus.className}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {
                              livraisonStatus.label
                            }
                          </span>

                          {commande
                            .livraison
                            ?.uuid && (
                              <span className="max-w-[180px] truncate text-[10px] text-gray-400">
                                {
                                  commande
                                    .livraison
                                    .uuid
                                }
                              </span>
                            )}

                        </div>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(
                          commande.created_at
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <ActionMenu
                          commande={
                            commande
                          }
                          commentaire={
                            commentaires[
                            commande
                              .uuid
                            ] ?? ""
                          }
                          setCommentaire={(
                            value
                          ) => {
                            setCommentaires(
                              (
                                previous
                              ) => ({
                                ...previous,
                                [commande.uuid]:
                                  value,
                              })
                            );
                          }}
                          updateStatus={
                            updateStatus
                          }
                          deleteCommande={
                            deleteCommande
                          }
                        />
                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}