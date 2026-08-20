import { apiGet } from "@/lib/api";
import ProductCard from "@/components/ProductCard";


interface Produit {

  uuid: string;
  nom: string;
  prix: string;
  image: string | null;
  description: string;

}



interface RechercheResponse {

  success: boolean;
  data: Produit[];

}



export default async function RecherchePage(
  {
    searchParams
  }: {
    searchParams: Promise<{
      q?: string;
    }>
  }
) {


  const {
    q
  } = await searchParams;



  const result =
    await apiGet<RechercheResponse>(
      `/recherche?q=${q ?? ""}`
    );



  return (

    <main className="min-h-screen bg-gray-50 p-8">


      <h1 className="text-3xl font-bold mb-8">

        Résultat de recherche :

        {" "}

        {q}

      </h1>



      {
        result.data.length === 0 ? (

          <p className="text-gray-500">
            Aucun produit trouvé.
          </p>

        ) : (

          <div className="grid md:grid-cols-3 gap-6">

            {
              result.data.map(
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

        )
      }


    </main>

  );

}