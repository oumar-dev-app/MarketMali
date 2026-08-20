"use client";

import Link from "next/link";

interface Commande {
  uuid: string;
  total: string;
  status: string;
  created_at: string;
}

interface RecentCommandesProps {
  commandes: Commande[];
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "En attente";

    case "confirmed":
      return "Confirmée";

    case "preparing":
      return "En préparation";

    case "shipped":
      return "Expédiée";

    case "delivered":
      return "Livrée";

    case "cancelled":
      return "Annulée";

    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "preparing":
      return "bg-purple-100 text-purple-700";

    case "shipped":
      return "bg-indigo-100 text-indigo-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function RecentCommandes({
  commandes = [],
}: RecentCommandesProps) {
  const recentCommandes = Array.isArray(commandes)
    ? commandes.slice(0, 5)
    : [];

  return (
    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:mt-6 sm:p-5">

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            Dernières commandes
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Les commandes les plus récentes.
          </p>
        </div>

        <Link
          href="/dashboard/commandes"
          className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-sm"
        >
          Voir tout
        </Link>
      </div>

      {recentCommandes.length === 0 ? (
        <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            Aucune commande récente.
          </p>
        </div>
      ) : (
        <>
          {/* =====================================================
              MOBILE
          ===================================================== */}
          <div className="space-y-3 md:hidden">
            {recentCommandes.map((commande) => (
              <div
                key={commande.uuid}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Commande
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                      #{commande.uuid.slice(0, 8)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(
                      commande.status
                    )}`}
                  >
                    {getStatusLabel(commande.status)}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-xs text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {Number(
                        commande.total
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {new Date(
                        commande.created_at
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                </div>

                <Link
                  href={`/dashboard/commandes/${commande.uuid}`}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Voir la commande
                </Link>
              </div>
            ))}
          </div>

          {/* =====================================================
              TABLETTE / DESKTOP
          ===================================================== */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[650px]">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Commande
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Total
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Statut
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentCommandes.map((commande) => (
                  <tr
                    key={commande.uuid}
                    className="border-t border-gray-100 text-sm"
                  >

                    <td className="px-4 py-4 font-medium text-gray-900">
                      #{commande.uuid.slice(0, 8)}...
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {Number(
                        commande.total
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                          commande.status
                        )}`}
                      >
                        {getStatusLabel(
                          commande.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-500">
                      {new Date(
                        commande.created_at
                      ).toLocaleDateString("fr-FR")}
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/commandes/${commande.uuid}`}
                        className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        Voir
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </>
      )}

    </section>
  );
}