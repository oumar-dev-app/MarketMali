import { apiGet } from "@/lib/api";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";



interface Produit {
  id: number;
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  stock: number;
  image: string | null;
  boutique_id: number;
  boutique_nom?: string;
  boutique_slug?: string;

}



interface ProduitResponse {
  success: boolean;
  data: Produit[];
}



export default async function ProduitPage(
  {
    params
  }: {
    params: Promise<{
      slug: string;
      produitSlug: string;
    }>
  }
) {


  const {
    slug,
    produitSlug
  } = await params;



  const response =
    await apiGet<ProduitResponse>(
      `/boutiques/slug/${slug}/produits`
    );



  const produit =
    response.data.find(
      item =>
        item.slug === produitSlug
    );



  if (!produit) {

    return (

      <main className="p-8">

        <h1 className="text-2xl font-bold">
          Produit introuvable
        </h1>

      </main>

    );

  }



  return (

    <main className="p-8">


      <Link
        href={`/boutiques/${slug}`}
        className="text-blue-600"
      >
        ← Retour boutique
      </Link>



      <section className="mt-8 border rounded-xl p-6">


        <h1 className="text-3xl font-bold">
          {produit.nom}
        </h1>



        <p className="mt-4 text-gray-700">
          {produit.description}
        </p>



        <p className="mt-5 text-2xl font-bold">
          {produit.prix} FCFA
        </p>



        <p className="mt-2">
          Stock disponible :
          {" "}
          {produit.stock}
        </p>



        <AddToCartButton
          produit={{
            uuid: produit.uuid,
            id: produit.id,
            boutique_id: produit.boutique_id,
            nom: produit.nom,
            prix: produit.prix,
            image: produit.image,
            stock: produit.stock,
          }}
        />


      </section>


    </main>

  );

}