import Link from "next/link";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  Star,
  Tag,
} from "lucide-react";

interface ProductCardProps {
  produit: {
    uuid: string;
    nom: string;
    prix: string | number;
    image?: string | null;
    description?: string;

    note_moyenne?: string | number | null;
    total_avis?: string | number | null;

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
     PRIX
  ====================================================== */

  const prix = Number(produit.prix);

  const prixValide =
    Number.isFinite(prix) && prix >= 0;

  const prixFormate = prixValide
    ? Math.round(prix).toLocaleString("fr-FR")
    : String(produit.prix);

  /* =====================================================
     PROMOTION
  ====================================================== */

  const promotionActive =
    Boolean(produit.promotion_uuid);

  const reductionPourcentage =
    produit.promotion_reduction_pourcentage !== null &&
      produit.promotion_reduction_pourcentage !== undefined
      ? Number(
        produit.promotion_reduction_pourcentage
      )
      : null;

  const prixPromotionnel =
    produit.promotion_prix_promotionnel !== null &&
      produit.promotion_prix_promotionnel !== undefined
      ? Number(
        produit.promotion_prix_promotionnel
      )
      : null;

  let prixFinalPromotion: number | null =
    prixPromotionnel;

  if (
    produit.promotion_type === "percentage" &&
    reductionPourcentage !== null &&
    Number.isFinite(reductionPourcentage) &&
    prixValide
  ) {
    prixFinalPromotion =
      prix -
      (prix * reductionPourcentage) / 100;
  }

  const promotionValide =
    promotionActive &&
    prixFinalPromotion !== null &&
    Number.isFinite(prixFinalPromotion) &&
    prixFinalPromotion >= 0;

  const prixPromotionFormate =
    typeof prixFinalPromotion === "number" &&
      Number.isFinite(prixFinalPromotion)
      ? Math.round(prixFinalPromotion).toLocaleString("fr-FR")
      : null;

  /* =====================================================
     NOTES / AVIS
  ====================================================== */

  const noteMoyenne =
    produit.note_moyenne !== null &&
      produit.note_moyenne !== undefined
      ? Number(produit.note_moyenne)
      : null;

  const totalAvis =
    produit.total_avis !== null &&
      produit.total_avis !== undefined
      ? Number(produit.total_avis)
      : 0;

  const noteValide =
    noteMoyenne !== null &&
    Number.isFinite(noteMoyenne) &&
    noteMoyenne >= 0 &&
    noteMoyenne <= 5 &&
    Number.isFinite(totalAvis) &&
    totalAvis > 0;

  const avisLabel =
    totalAvis === 1 ? "avis" : "avis";

  return (
    <Link
      href={`/produits/${produit.uuid}`}
      aria-label={`Voir le produit ${produit.nom}`}
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#14a800]/20
        hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)]
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
          bg-[#f7f9f7]
        "
      >
        {/* Décorations */}

        <div
          className="
            pointer-events-none
            absolute
            -right-12
            -top-12
            h-32
            w-32
            rounded-full
            bg-[#14a800]/5
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-12
            -left-10
            h-w
            w-w
            rounded-full
            bg-[#fcd116]/5
          "
        />

        {/* Image produit */}

        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.nom}
            loading="lazy"
            className="
      absolute
      inset-0
      z-10
      h-full
      w-full
      object-cover
      transition-transform
      duration-500
      ease-out
      group-hover:scale-[1.03]
    "
          />
        ) : (
          <div
            className="
      relative
      z-10
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
        text-[#14a800]/40
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
        text-[10px]
        font-semibold
        text-gray-400
      "
            >
              Aucune image
            </span>
          </div>
        )}

        {/* =================================================
            PROMOTION
        ================================================== */}

        {promotionActive && (
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
              bg-[#ce1126]
              px-3
              py-1.5
              text-[10px]
              font-extrabold
              text-white
              shadow-lg
              shadow-[#ce1126]/20
            "
          >
            <Tag
              size={11}
              strokeWidth={2.5}
            />

            {reductionPourcentage !== null &&
              Number.isFinite(
                reductionPourcentage
              ) ? (
              <>
                -
                {Math.round(
                  reductionPourcentage
                )}
                %
              </>
            ) : (
              "PROMOTION"
            )}
          </div>
        )}

        {/* =================================================
            ACTION VISUELLE
        ================================================== */}

        <div
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            translate-y-1
            items-center
            justify-center
            rounded-full
            border
            border-white/80
            bg-white/90
            text-gray-600
            opacity-0
            shadow-md
            backdrop-blur-md
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
          aria-hidden="true"
        >
          <ShoppingBag
            size={17}
            strokeWidth={1.9}
          />
        </div>

        {/* =================================================
            DISPONIBLE
        ================================================== */}

        <div
          className="
            absolute
            bottom-3
            left-3
            z-20
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/80
            bg-white/90
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-[#087f00]
            opacity-0
            shadow-sm
            backdrop-blur-md
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#14a800]
              shadow-[0_0_0_3px_rgba(20,168,0,0.10)]
            "
          />

          Disponible
        </div>

        {/* =================================================
            BANDE MALI
        ================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            z-20
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
          INFORMATIONS
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-4
          sm:p-4.5
        "
      >
        {/* NOM */}

        <h3
          className="
            line-clamp-2
            min-h-10
            text-[14px]
            font-extrabold
            leading-5
            tracking-[-0.01em]
            text-gray-950
            transition-colors
            duration-200
            group-hover:text-[#14a800]
          "
        >
          {produit.nom}
        </h3>

        {/* NOTE */}

        {noteValide ? (
          <div
            className="
              mt-2.5
              flex
              items-center
              gap-1.5
            "
          >
            <div
              className="
                flex
                items-center
                gap-0.5
              "
              aria-label={`Note moyenne : ${noteMoyenne.toFixed(
                1
              )} sur 5`}
            >
              <Star
                size={13}
                fill="currentColor"
                className="text-[#fcd116]"
              />

              <span
                className="
                  text-[11px]
                  font-extrabold
                  text-gray-700
                "
              >
                {noteMoyenne.toFixed(1)}
              </span>
            </div>

            <span
              className="
                text-[10px]
                text-gray-300
              "
            >
              •
            </span>

            <span
              className="
                text-[10px]
                font-medium
                text-gray-400
              "
            >
              {totalAvis} {avisLabel}
            </span>
          </div>
        ) : (
          <div className="mt-2.5 h-4" />
        )}

        {/* DESCRIPTION */}

        {produit.description ? (
          <p
            className="
              mt-2
              line-clamp-2
              text-[11px]
              leading-4
              text-gray-400
            "
          >
            {produit.description}
          </p>
        ) : (
          <div className="mt-2 h-4" />
        )}

        {/* =================================================
            PRIX
        ================================================== */}

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-3
            border-t
            border-gray-100
            pt-4
          "
        >
          <div className="min-w-0">
            {promotionValide ? (
              <>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    text-gray-400
                    line-through
                  "
                >
                  {prixFormate} FCFA
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-lg
                    font-black
                    tracking-tight
                    text-[#ce1126]
                    sm:text-xl
                  "
                >
                  {prixPromotionFormate}

                  <span
                    className="
                      ml-1
                      text-[10px]
                      font-bold
                      text-[#ce1126]
                      sm:text-xs
                    "
                  >
                    FCFA
                  </span>
                </p>
              </>
            ) : (
              <p
                className="
                  truncate
                  text-lg
                  font-black
                  tracking-tight
                  text-[#14a800]
                  sm:text-xl
                "
              >
                {prixFormate}

                <span
                  className="
                    ml-1
                    text-[10px]
                    font-bold
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
              h-10
              w-10
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
            aria-hidden="true"
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
    </Link>
  );
}

