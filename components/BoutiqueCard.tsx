import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";

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
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:border-[#fcd116]/60
        hover:shadow-2xl
      "
    >
      {/* =========================
          IMAGE / LOGO
      ========================== */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">

        {/* Halo décoratif */}
        <div
          className="
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full
            bg-[#14a800]/5
            transition-transform
            duration-500
            group-hover:scale-150
          "
        />

        {/* LOGO */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {boutique.logo ? (
            <div
              className="
                relative
                flex
                h-32
                w-32
                items-center
                justify-center
                overflow-hidden
                rounded-3xl
                border
                border-gray-100
                bg-white
                p-3
                shadow-md
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:shadow-xl
              "
            >
              <img
                src={boutique.logo}
                alt={`Logo de ${boutique.nom}`}
                className="
                  h-full
                  w-full
                  object-contain
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />
            </div>
          ) : (
            <div
              className="
                flex
                h-32
                w-32
                items-center
                justify-center
                rounded-3xl
                border
                border-[#14a800]/10
                bg-[#14a800]/5
                shadow-sm
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:bg-[#14a800]/10
              "
            >
              <Store
                size={52}
                strokeWidth={1.5}
                className="text-[#14a800]"
              />
            </div>
          )}
        </div>

        {/* BADGE */}
        <div
          className="
            absolute
            left-4
            top-4
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/80
            bg-white/95
            px-3
            py-1.5
            text-[11px]
            font-bold
            text-[#087f00]
            shadow-sm
            backdrop-blur
          "
        >
          <span className="h-2 w-2 rounded-full bg-[#14a800]" />
          Boutique
        </div>

        {/* BANDE MALI */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
          <div className="flex-1 bg-[#14a800]" />
          <div className="flex-1 bg-[#fcd116]" />
          <div className="flex-1 bg-[#ce1126]" />
        </div>
      </div>

      {/* =========================
          INFORMATIONS
      ========================== */}
      <div className="flex flex-1 flex-col p-5">

        {/* NOM + VILLE */}
        <div className="min-w-0">
          <h3
            className="
              truncate
              text-lg
              font-bold
              tracking-tight
              text-gray-900
              transition-colors
              duration-200
              group-hover:text-[#14a800]
            "
          >
            {boutique.nom}
          </h3>

          {boutique.ville && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin
                size={14}
                strokeWidth={2}
                className="shrink-0 text-[#ce1126]"
              />

              <span className="truncate">
                {boutique.ville}
              </span>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <p
          className="
            mt-4
            line-clamp-2
            min-h-[48px]
            text-sm
            leading-6
            text-gray-500
          "
        >
          {boutique.description?.trim() ||
            "Découvrez les produits de cette boutique sur MarketMali."}
        </p>

        {/* SEPARATION */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between gap-3">

            <div>
              <p className="text-xs font-medium text-gray-400">
                Marketplace
              </p>

              <p
                className="
                  mt-0.5
                  text-sm
                  font-semibold
                  text-gray-800
                  transition-colors
                  group-hover:text-[#14a800]
                "
              >
                Découvrir la boutique
              </p>
            </div>

            {/* BOUTON */}
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#14a800]/10
                text-[#14a800]
                transition-all
                duration-300
                group-hover:bg-[#14a800]
                group-hover:text-white
                group-hover:shadow-md
              "
            >
              <ArrowRight
                size={18}
                strokeWidth={2.5}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                "
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

