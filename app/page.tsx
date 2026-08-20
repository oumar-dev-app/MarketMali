import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import BoutiqueCard from "@/components/BoutiqueCard";
import ProductCard from "@/components/ProductCard";


interface Categorie {

  uuid: string;
  nom: string;
  image?: string | null;
  description?: string | null;

}


interface Boutique {

  uuid: string;
  nom: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  ville?: string | null;

}



interface Produit {

  uuid: string;
  nom: string;
  prix: string;
  image?: string | null;
  description?: string;

}



async function getCategories() {

  const response =
    await fetch(
      "http://localhost:3000/api/categories",
      {
        cache: "no-store"
      }
    );


  const result =
    await response.json();


  return result.data ?? [];

}



async function getBoutiques() {

  const response =
    await fetch(
      "http://localhost:3000/api/boutiques",
      {
        cache: "no-store"
      }
    );


  const result =
    await response.json();


  return result.data ?? [];

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





export default async function HomePage() {


  const [
    categories,
    boutiques,
    produits
  ] = await Promise.all([

    getCategories(),

    getBoutiques(),

    getProduits()

  ]);




  return (

    <>

      <Navbar />


      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold">
            Bienvenue sur MarketMali
          </h1>
          <p className="mt-3 text-gray-600">
            Découvrez les meilleurs produits
            des boutiques maliennes.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">
            Catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {
              categories.map(
                (categorie: Categorie) => (

                  <CategoryCard
                    key={categorie.uuid}
                    categorie={categorie}
                  />

                )
              )
            }
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">
            Boutiques populaires
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {
              boutiques.map(
                (boutique: Boutique) => (

                  <BoutiqueCard
                    key={boutique.uuid}
                    boutique={boutique}
                  />

                )
              )
            }
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-5">
            Produits disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
    </>
  );
}