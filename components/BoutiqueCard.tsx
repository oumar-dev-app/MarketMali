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
  boutique,
}: BoutiqueCardProps) {
  return (
    <Link
      href={`/boutiques/${boutique.slug}`}
      className="
        group
        block
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#fcd116]/50
        hover:shadow-xl
      "
    >

      {/* LOGO */}

      <div className="relative h-44 overflow-hidden bg-gray-50">

        {boutique.logo ? (
          <img
            src={boutique.logo}
            alt={boutique.nom}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14a800]/10 text-3xl">
              🏪
            </div>

          </div>
        )}

        {/* BANDE MALI */}

        <div className="absolute bottom-0 left-0 right-0 flex h-1">

          <div className="flex-1 bg-[#14a800]" />
          <div className="flex-1 bg-[#fcd116]" />
          <div className="flex-1 bg-[#ce1126]" />

        </div>

      </div>


      {/* INFORMATIONS */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-[#14a800]">
              {boutique.nom}
            </h3>

            {boutique.ville && (
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <span>📍</span>
                {boutique.ville}
              </p>
            )}

          </div>


          <span className="shrink-0 rounded-full bg-[#14a800]/10 px-2.5 py-1 text-[11px] font-bold text-[#087f00]">
            Boutique
          </span>

        </div>


        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
          {boutique.description ??
            "Découvrez les produits de cette boutique sur MarketMali."}
        </p>


        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

          <span className="text-xs font-medium text-gray-400">
            Découvrir la boutique
          </span>

          <span className="text-lg font-bold text-[#14a800] transition-transform group-hover:translate-x-1">
            →
          </span>

        </div>

      </div>

    </Link>
  );
}