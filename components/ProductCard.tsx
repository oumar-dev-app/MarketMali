import Link from "next/link";


interface ProductCardProps {

  produit: {
    uuid: string;
    nom: string;
    prix: string;
    image?: string | null;
    description?: string;
  };

}


export default function ProductCard({
  produit
}: ProductCardProps) {


  return (

    <Link
      href={`/produits/${produit.uuid}`}
      className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >

      <div className="flex h-40 items-center justify-center rounded-lg bg-gray-100">

        {produit.image ? (

          <img
            src={produit.image}
            alt={produit.nom}
            className="h-full w-full object-cover rounded-lg"
          />

        ) : (

          <span className="text-gray-400">
            Pas d'image
          </span>

        )}

      </div>


      <h3 className="mt-4 font-semibold">
        {produit.nom}
      </h3>


      <p className="mt-2 text-blue-600 font-bold">
        {Number(produit.prix).toLocaleString("fr-FR")} FCFA
      </p>


    </Link>

  );

}