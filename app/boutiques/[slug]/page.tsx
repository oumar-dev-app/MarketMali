import { apiGet } from "@/lib/api";
import ProductCard from "@/components/ProductCard";


interface Produit {

  uuid: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  stock: number;
  image: string | null;

}


interface ProduitResponse {

  success: boolean;
  data: Produit[];

}



interface Boutique {

  uuid: string;
  nom: string;
  slug: string;
  description: string;
  ville: string;

}



interface BoutiqueResponse {

  success: boolean;
  data: Boutique;

}



export default async function BoutiquePage(
  {
    params
  }: {
    params: Promise<{ slug: string }>
  }
) {


  const { slug } =
    await params;



  const boutique =
    await apiGet<BoutiqueResponse>(
      `/boutiques/slug/${slug}`
    );



  const produits =
    await apiGet<ProduitResponse>(
      `/boutiques/slug/${slug}/produits`
    );



  return (

    <main className="p-8">


      <section className="mb-10">

        <h1 className="text-3xl font-bold">
          {boutique.data.nom}
        </h1>


        <p className="mt-3 text-gray-600">
          {boutique.data.description}
        </p>


        <p>
          {boutique.data.ville}
        </p>


      </section>



      <h2 className="text-2xl font-bold mb-5">
        Produits
      </h2>



<div className="grid md:grid-cols-3 gap-6">

{
  produits.data.map(
    produit => (

      <ProductCard
        key={produit.uuid}
        produit={{
          uuid: produit.uuid,
          nom: produit.nom,
          prix: produit.prix,
          image: produit.image,
          description: produit.description
        }}
      />

    )
  )
}

</div>


    </main>

  );

}
