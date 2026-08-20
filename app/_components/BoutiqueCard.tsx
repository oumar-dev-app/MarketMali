import Link from "next/link";


interface BoutiqueCardProps {

  boutique: {
    uuid: string;
    nom: string;
    slug: string;
    ville?: string;
    description?: string;
  };

}



export default function BoutiqueCard({
  boutique
}: BoutiqueCardProps) {


  return (

    <div className="border rounded-xl p-5 shadow-sm">

      <h2 className="text-xl font-bold">
        {boutique.nom}
      </h2>


      <p className="text-gray-600">
        {boutique.ville}
      </p>


      <p className="mt-2">
        {boutique.description}
      </p>


      <Link
        href={`/boutiques/${boutique.slug}`}
        className="inline-block mt-4 text-blue-600"
      >
        Voir la boutique
      </Link>

    </div>

  );

}
