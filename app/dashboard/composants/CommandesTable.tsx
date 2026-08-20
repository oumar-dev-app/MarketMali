"use client";

import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
} from "react";

interface Commande {
  uuid: string;
  total: string;
  frais_livraison: string | number;
  status: string;
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

const formatPrice = (
  value: string | number
) => {
  return `${Number(value).toLocaleString(
    "fr-FR"
  )} FCFA`;
};

const formatDate = (
  value: string
) => {
  return new Date(
    value
  ).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function CommandesTable({
  commandes,
  commentaires,
  setCommentaires,
  updateStatus,
  deleteCommande,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-275 text-sm">
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
              Date
            </th>

            <th className="px-5 py-4 text-left font-semibold text-gray-700">
              Commentaire
            </th>

            <th className="px-5 py-4 text-left font-semibold text-gray-700">
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
            commandes.map((commande) => {
              const status =
                statusConfig[
                commande.status
                ] ?? {
                  label: commande.status,
                  className:
                    "bg-gray-100 text-gray-700",
                };

              const clientName =
                commande.client
                  ? `${commande.client.prenom} ${commande.client.nom}`
                  : "Client supprimé";

              return (
                <tr
                  key={commande.uuid}
                  className="transition hover:bg-gray-50"
                >
                  {/* Commande */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/commandes/${commande.uuid}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      #{commande.uuid.slice(
                        0,
                        8
                      )}
                    </Link>

                    <p className="mt-1 max-w-37.5 truncate text-xs text-gray-400">
                      {commande.uuid}
                    </p>
                  </td>

                  {/* Client */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {clientName}
                    </p>

                    {commande.client && (
                      <p className="mt-1 text-xs text-gray-500">
                        {
                          commande.client
                            .telephone
                        }
                      </p>
                    )}
                  </td>

                  {/* Total */}
                  {/* Total */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(commande.total)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Produits :{" "}
                        {formatPrice(
                          Number(commande.total) -
                          Number(commande.frais_livraison ?? 0)
                        )}
                      </p>

                      <p className="text-xs text-gray-500">
                        Livraison :{" "}
                        {formatPrice(
                          commande.frais_livraison ?? 0
                        )}
                      </p>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                    {formatDate(
                      commande.created_at
                    )}
                  </td>

                  {/* Commentaire */}
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      value={
                        commentaires[
                        commande.uuid
                        ] ?? ""
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setCommentaires(
                          (previous) => ({
                            ...previous,
                            [commande.uuid]:
                              value,
                          })
                        );
                      }}
                      placeholder="Commentaire..."
                      className="w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={
                          commande.status
                        }
                        onChange={(event) => {
                          updateStatus(
                            commande.uuid,
                            event.target.value
                          );
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="pending">
                          En attente
                        </option>

                        <option value="confirmed">
                          Confirmée
                        </option>

                        <option value="preparing">
                          En préparation
                        </option>

                        <option value="shipped">
                          Expédiée
                        </option>

                        <option value="delivered">
                          Livrée
                        </option>

                        <option value="cancelled">
                          Annulée
                        </option>
                      </select>

                      <Link
                        href={`/dashboard/commandes/${commande.uuid}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700"
                      >
                        Voir
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          deleteCommande(
                            commande.uuid
                          );
                        }}
                        className="rounded-lg bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

