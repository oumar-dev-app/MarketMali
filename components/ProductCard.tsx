import Link from "next/link";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";

interface ProductCardProps {
  produit: {
    uuid: string;
    nom: string;
    prix: string | number;
    image?: string | null;
    description?: string;

    promotion_uuid?: string | null;
    promotion_nom?: string | null;
    promotion_type?: "percentage" | "special_price" | null;
    promotion_reduction_pourcentage?: number | string | null;
    promotion_prix_promotionnel?: number | string | null;
  };
}

export default function ProductCard({
  produit,
}: ProductCardProps) {

  /* =====================================================
      PRIX NORMAL
  ====================================================== */

  const prix = Number(produit.prix);

  const prixFormate = Number.isFinite(prix)
    ? prix.toLocaleString("fr-FR")
    : String(produit.prix);


  /* =====================================================
      PROMOTION
  ====================================================== */

  const promotionActive =
    Boolean(produit.promotion_uuid);


  const reductionPourcentage =
    produit.promotion_reduction_pourcentage !== null &&
    produit.promotion_reduction_pourcentage !== undefined
      ? Number(produit.promotion_reduction_pourcentage)
      : null;


  const prixPromotionnel =
    produit.promotion_prix_promotionnel !== null &&
    produit.promotion_prix_promotionnel !== undefined
      ? Number(produit.promotion_prix_promotionnel)
      : null;


  /*
   * Pour une promotion spéciale, le prix promotionnel
   * vient directement de la base.
   *
   * Pour une promotion en pourcentage, on calcule
   * également le prix final par sécurité côté affichage.
   */

  let prixFinalPromotion = prixPromotionnel;

  if (
    produit.promotion_type === "percentage" &&
    reductionPourcentage !== null &&
    Number.isFinite(prix) &&
    Number.isFinite(reductionPourcentage)
  ) {
    prixFinalPromotion =
      prix - (prix * reductionPourcentage) / 100;
  }


  const prixPromotionFormate =
    prixFinalPromotion !== null &&
    Number.isFinite(prixFinalPromotion)
      ? Math.round(prixFinalPromotion).toLocaleString("fr-FR")
      : null;


  return (
    <Link
      href={`/produits/${produit.uuid}`}
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
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
        focus:outline-none
        focus:ring-2
        focus:ring-[#14a800]/30
        focus:ring-offset-2
      "
    >

      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          bg-gray-50
        "
      >

        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.nom}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              flex-col
              items-center
              justify-center
              bg-linear-to-br
              from-gray-50
              via-white
              to-gray-100
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-[#14a800]/50
                shadow-sm
              "
            >
              <Package
                size={28}
                strokeWidth={1.6}
              />
            </div>

            <span
              className="
                mt-3
                text-[11px]
                font-semibold
                text-gray-400
              "
            >
              Aucune image
            </span>
          </div>
        )}


        {/* =================================================
            BADGES
        ================================================== */}

        <div
          className="
            absolute
            left-3
            top-3
            flex
            flex-col
            items-start
            gap-2
          "
        >

          {/* DISPONIBLE */}

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/80
              bg-white/95
              px-2.5
              py-1.5
              text-[10px]
              font-bold
              text-[#087f00]
              shadow-sm
              backdrop-blur-sm
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#14a800]
                shadow-[0_0_0_3px_rgba(20,168,0,0.12)]
              "
            />

            Disponible
          </span>


          {/* PROMOTION */}

          {promotionActive && (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                border
                border-white/80
                bg-[#ce1126]
                px-2.5
                py-1.5
                text-[10px]
                font-extrabold
                text-white
                shadow-md
              "
            >
              <Tag
                size={11}
                strokeWidth={2.5}
              />

              {reductionPourcentage !== null &&
              Number.isFinite(reductionPourcentage)
                ? `-${reductionPourcentage}%`
                : "PROMOTION"}
            </span>
          )}

        </div>


        {/* =================================================
            ICÔNE PRODUIT
        ================================================== */}

        <div
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-white/70
            bg-white/90
            text-gray-500
            opacity-0
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <ShoppingBag
            size={16}
            strokeWidth={1.8}
          />
        </div>


        {/* =================================================
            BANDE MALI AU SURVOL
        ================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            flex
            h-1
            w-full
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        >
          <div className="flex-1 bg-[#14a800]" />
          <div className="flex-1 bg-[#fcd116]" />
          <div className="flex-1 bg-[#ce1126]" />
        </div>

      </div>


      {/* =====================================================
          CONTENU
      ====================================================== */}

      <div className="flex flex-1 flex-col p-4">

        {/* NOM */}

        <h3
          className="
            line-clamp-2
            min-h-10
            text-sm
            font-bold
            leading-5
            text-gray-900
            transition-colors
            duration-200
            group-hover:text-[#14a800]
          "
        >
          {produit.nom}
        </h3>


        {/* DESCRIPTION */}

        <div className="mt-2 min-h-10">

          {produit.description ? (
            <p
              className="
                line-clamp-2
                text-xs
                leading-5
                text-gray-500
              "
            >
              {produit.description}
            </p>
          ) : (
            <p className="text-xs text-transparent">
              -
            </p>
          )}

        </div>


        {/* =================================================
            PRIX + ACTION
        ================================================== */}

        <div className="mt-auto pt-4">

          <div
            className="
              flex
              items-end
              justify-between
              gap-3
              border-t
              border-gray-100
              pt-3
            "
          >

            {/* PRIX */}

            <div className="min-w-0">

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-gray-400
                "
              >
                {promotionActive
                  ? "Prix promotionnel"
                  : "Prix"}
              </p>


              {promotionActive &&
              prixPromotionFormate ? (

                <div className="mt-0.5">

                  {/* ANCIEN PRIX */}

                  <p
                    className="
                      truncate
                      text-xs
                      font-semibold
                      text-gray-400
                      line-through
                      sm:text-sm
                    "
                  >
                    {prixFormate}

                    <span
                      className="
                        ml-1
                        text-[9px]
                        font-bold
                        tracking-normal
                        text-gray-400
                        sm:text-[10px]
                      "
                    >
                      FCFA
                    </span>
                  </p>


                  {/* NOUVEAU PRIX */}

                  <p
                    className="
                      truncate
                      text-base
                      font-extrabold
                      tracking-tight
                      text-[#ce1126]
                      sm:text-lg
                    "
                  >
                    {prixPromotionFormate}

                    <span
                      className="
                        ml-1
                        text-[10px]
                        font-bold
                        tracking-normal
                        text-[#ce1126]
                        sm:text-xs
                      "
                    >
                      FCFA
                    </span>
                  </p>

                </div>

              ) : (

                <p
                  className="
                    mt-0.5
                    truncate
                    text-base
                    font-extrabold
                    tracking-tight
                    text-[#14a800]
                    sm:text-lg
                  "
                >
                  {prixFormate}

                  <span
                    className="
                      ml-1
                      text-[10px]
                      font-bold
                      tracking-normal
                      text-[#14a800]
                      sm:text-xs
                    "
                  >
                    FCFA
                  </span>
                </p>

              )}

            </div>


            {/* ACTION */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
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
                size={17}
                strokeWidth={2.2}
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

