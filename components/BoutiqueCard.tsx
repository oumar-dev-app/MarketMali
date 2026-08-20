import Link from "next/link";


interface BoutiqueCardProps {

  boutique: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    ville?: string | null;
  };

}


export default function BoutiqueCard({
  boutique
}: BoutiqueCardProps) {


  return (

    <Link
      href={`/boutiques/${boutique.slug}`}
      className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-24 items-center justify-center rounded-lg bg-gray-100">
        {boutique.logo ? (
          <img
            src={boutique.logo}
            alt={boutique.nom}
            className="h-full w-full rounded-lg object-cover"
          />

        ) : (

          <span className="text-gray-400">
            Logo boutique
          </span>

        )}

      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {boutique.nom}
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        {boutique.description ?? "Aucune description"}
      </p>

      {boutique.ville && (
        <p className="mt-3 text-sm text-blue-600">
          📍 {boutique.ville}
        </p>

      )}

    </Link>

  );

}