"use client";

interface ProduitVendu {
  nom: string;
  quantite_vendue: number | string;
  chiffre_affaires: number | string;
}

interface Props {
  produits: ProduitVendu[];
}

export default function TopProduits({
  produits = [],
}: Props) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm sm:mt-6 sm:p-5">

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          Produits les plus vendus
        </h2>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Les produits qui génèrent le plus de ventes.
        </p>
      </div>

      {produits.length === 0 ? (
        <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            Aucun produit vendu pour le moment.
          </p>
        </div>
      ) : (
        <>
          {/* =====================================================
              MOBILE
          ===================================================== */}
          <div className="space-y-3 md:hidden">
            {produits.map((produit, index) => (
              <div
                key={`${produit.nom}-${index}`}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {produit.nom}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <div>
                        <p className="text-xs text-gray-500">
                          Quantité vendue
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {produit.quantite_vendue}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Chiffre d'affaires
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {Number(
                            produit.chiffre_affaires
                          ).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* =====================================================
              TABLETTE / DESKTOP
          ===================================================== */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px]">

              <thead className="bg-gray-50">
                <tr>

                  <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Produit
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Quantité vendue
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Chiffre d'affaires
                  </th>

                </tr>
              </thead>

              <tbody>
                {produits.map((produit, index) => (
                  <tr
                    key={`${produit.nom}-${index}`}
                    className="border-t border-gray-100 text-sm"
                  >

                    <td className="px-4 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                        {index + 1}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900">
                      {produit.nom}
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {produit.quantite_vendue}
                    </td>

                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {Number(
                        produit.chiffre_affaires
                      ).toLocaleString("fr-FR")}{" "}
                      FCFA
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