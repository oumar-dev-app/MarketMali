import Link from "next/link";
import {
  MapPin,
  Store,
  ArrowUpRight,
  Tag,
} from "lucide-react";

interface BoutiqueCardProps {
  boutique: {
    uuid: string;
    nom: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    ville?: string | null;

    categories?: {
      id: number;
      uuid: string;
      parent_id: number | null;
      nom: string;
      slug: string;
      image: string | null;
    }[];

    categories_principales?: {
      id: number;
      uuid: string;
      nom: string;
      slug: string;
      image: string | null;
      sous_categories: {
        id: number;
        uuid: string;
        parent_id: number | null;
        nom: string;
        slug: string;
        image: string | null;
      }[];
    }[];
  };
}

export default function BoutiqueCard({
  boutique,
}: BoutiqueCardProps) {
  const categoriesPrincipales =
    boutique.categories_principales ?? [];

  return (
    <Link
      href={`/boutiques/${boutique.slug}`}
      className="
        group
        relative
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
        hover:border-[#14a800]/20
        hover:shadow-xl
      "
    >
      {/* =========================
          VISUEL BOUTIQUE
      ========================== */}
      <div
        className="
          relative
          flex
          aspect-4/3
          items-center
          justify-center
          overflow-hidden
          bg-linear-to-br
          from-[#f7faf7]
          via-white
          to-[#f1f5f1]
        "
      >
        {/* Halo principal */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-44
            w-44
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#14a800]/8
            blur-2xl
            transition-all
            duration-700
            group-hover:h-56
            group-hover:w-56
            group-hover:bg-[#14a800]/12
          "
        />

        {/* Décoration verte */}
        <div
          className="
            absolute
            -right-12
            -top-12
            h-32
            w-32
            rounded-full
            bg-[#14a800]/6
            transition-transform
            duration-700
            group-hover:scale-150
          "
        />

        {/* Décoration jaune */}
        <div
          className="
            absolute
            -bottom-14
            -left-10
            h-36
            w-36
            rounded-full
            bg-[#fcd116]/8
            transition-transform
            duration-700
            group-hover:scale-125
          "
        />

        {/* Petits éléments décoratifs */}
        <div className="absolute left-6 top-16 h-1.5 w-1.5 rounded-full bg-[#14a800]/30" />
        <div className="absolute right-10 top-24 h-2 w-2 rounded-full bg-[#fcd116]/50" />
        <div className="absolute bottom-16 right-8 h-1.5 w-1.5 rounded-full bg-[#ce1126]/30" />

        {/* Badge */}
        <div
          className="
            absolute
            left-3
            top-3
            z-20
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/80
            bg-white/90
            px-2.5
            py-1
            text-[10px]
            font-semibold
            text-[#087f00]
            shadow-sm
            backdrop-blur-md
          "
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14a800]/40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#14a800]" />
          </span>

          Boutique
        </div>

        {/* Bouton ouverture */}
        <div
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-8
            w-8
            translate-x-2
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-gray-500
            opacity-0
            shadow-sm
            backdrop-blur-md
            transition-all
            duration-300
            group-hover:translate-x-0
            group-hover:opacity-100
            group-hover:text-[#14a800]
          "
        >
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </div>

        {/* =========================
            LOGO
        ========================== */}
        {boutique.logo ? (
          <div
            className="
              relative
              z-10
              flex
              h-full
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-3xl
              border
              border-white
              bg-white
              p-3
              shadow-[0_12px_35px_rgba(0,0,0,0.09)]
              transition-all
              duration-500
              group-hover:scale-105
              group-hover:shadow-[0_18px_45px_rgba(20,168,0,0.15)]
            "
          >
            <img
              src={boutique.logo}
              alt={`Logo de ${boutique.nom}`}
              className="
                h-full
                w-full
                object-contain
                p-3
                transition-transform
                duration-500
                group-hover:scale-110
              "
            />
          </div>
        ) : (
          <div
            className="
              relative
              z-10
              flex
              h-32
              w-32
              items-center
              justify-center
              rounded-3xl
              border
              border-white
              bg-white
              shadow-[0_12px_35px_rgba(0,0,0,0.07)]
              transition-all
              duration-500
              group-hover:scale-105
              group-hover:shadow-[0_18px_45px_rgba(20,168,0,0.15)]
            "
          >
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-2xl
                bg-[#14a800]/8
                transition-colors
                duration-300
                group-hover:bg-[#14a800]/12
              "
            >
              <Store
                size={40}
                strokeWidth={1.5}
                className="text-[#14a800]"
              />
            </div>
          </div>
        )}

        {/* Ombre basse */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-16
            bg-linear-to-t
            from-black/5
            to-transparent
          "
        />

        {/* =========================
            COULEURS DU MALI
        ========================== */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex h-1">
          <div className="flex-1 bg-[#14a800]" />
          <div className="flex-1 bg-[#fcd116]" />
          <div className="flex-1 bg-[#ce1126]" />
        </div>
      </div>

      {/* =========================
          INFORMATIONS
      ========================== */}
      <div className="p-4">
        {/* Nom */}
        <h3
          className="
            truncate
            text-[15px]
            font-bold
            tracking-[-0.01em]
            text-gray-900
            transition-colors
            duration-200
            group-hover:text-[#14a800]
          "
        >
          {boutique.nom}
        </h3>

        {/* Ville */}
        {boutique.ville && (
          <div className="mt-2 flex items-center gap-1.5">
            <MapPin
              size={13}
              strokeWidth={2}
              className="shrink-0 text-[#ce1126]"
            />

            <span className="truncate text-xs font-medium text-gray-500">
              {boutique.ville}
            </span>
          </div>
        )}

        {/* =========================
            CATÉGORIES
        ========================== */}
        {categoriesPrincipales.length > 0 && (
          <div className="mt-3 space-y-2.5">
            {categoriesPrincipales
              .slice(0, 2)
              .map((categoriePrincipale) => {
                const sousCategories =
                  categoriePrincipale.sous_categories ?? [];

                return (
                  <div
                    key={categoriePrincipale.uuid}
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      bg-gray-50/70
                      px-3
                      py-2.5
                    "
                  >
                    {/* Catégorie principale */}
                    <div className="flex items-center gap-1.5">
                      <Tag
                        size={13}
                        strokeWidth={2}
                        className="shrink-0 text-[#14a800]"
                      />

                      <span
                        className="
                          truncate
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-800
                        "
                      >
                        {categoriePrincipale.nom}
                      </span>
                    </div>

                    {/* Sous-catégories */}
                    {sousCategories.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                        {sousCategories
                          .slice(0, 3)
                          .map((sousCategorie) => (
                            <span
                              key={sousCategorie.uuid}
                              className="
                                text-[10px]
                                font-medium
                                text-gray-500
                                after:ml-2
                                after:text-gray-300
                                after:content-['·']
                                last:after:hidden
                              "
                            >
                              {sousCategorie.nom}
                            </span>
                          ))}

                        {sousCategories.length > 3 && (
                          <span
                            className="
                              text-[10px]
                              font-semibold
                              text-[#14a800]
                            "
                          >
                            +{sousCategories.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Plus de catégories principales */}
            {categoriesPrincipales.length > 2 && (
              <span
                className="
                  inline-block
                  text-[10px]
                  font-semibold
                  text-gray-400
                "
              >
                +{categoriesPrincipales.length - 2} autre
                {categoriesPrincipales.length - 2 > 1 ? "s" : ""} catégorie
                {categoriesPrincipales.length - 2 > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

