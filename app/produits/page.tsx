import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";


interface Produit {

  uuid: string;
  nom: string;
  prix: string;
  image?: string | null;
  description?: string;

}


interface ProduitResponse {

  success: boolean;
  data: Produit[];

}



async function getProduits() {

  const response =
    await fetch(
      "http://localhost:3000/api/produits",
      {
        cache: "no-store"
      }
    );


  const result =
    await response.json();


  return result.data ?? [];

}



export default async function ProduitsPage() {


  const produits =
    await getProduits();



  return (

    <main className="min-h-screen bg-gray-50">

      <Navbar />


      <section className="mx-auto max-w-7xl px-6 py-10">


        <h1 className="text-3xl font-bold mb-8">
          Tous les produits
        </h1>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">


          {
            produits.map(
              (produit: Produit) => (

                <ProductCard
                  key={produit.uuid}
                  produit={produit}
                />

              )
            )
          }


        </div>


      </section>


    </main>

  );

}
