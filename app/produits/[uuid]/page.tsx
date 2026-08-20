import { getProduit } from "@/lib/api/produits";
import Navbar from "@/components/Navbar";
import AddToCartButton from "@/components/AddToCartButton";

interface PageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default async function ProduitPage({
  params,
}: PageProps) {

  const { uuid } = await params;

  const produit =
    await getProduit(uuid);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex h-96 items-center justify-center rounded-xl bg-white shadow">
            {produit.image ? (
              <img
                src={produit.image}
                alt={produit.nom}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-gray-400">
                Aucune image
              </span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {produit.nom}
            </h1>
            <p className="mt-4 text-3xl font-bold text-green-600">
              {Number(produit.prix).toLocaleString("fr-FR")} FCFA
            </p>
            <p className="mt-4 text-gray-600">
              {produit.description}
            </p>
            <div className="mt-8 space-y-3">
              <p>
                <strong>Stock :</strong>{" "}
                {produit.stock}
              </p>
              {produit.boutique && (
                <p>
                  <strong>Boutique :</strong>{" "}
                  {produit.boutique.nom}
                </p>
              )}
              {produit.categorie && (
                <p>
                  <strong>Catégorie :</strong>{" "}
                  {produit.categorie.nom}
                </p>
              )}
            </div>
            <AddToCartButton produit={produit} />
          </div>
        </div>
      </section>

    </main>
  );
}