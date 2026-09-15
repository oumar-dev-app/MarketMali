import Link from "next/link";
import {
  Search,
  Package,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import SearchFilters from "./components/SearchFilters";
import SearchSort from "./components/SearchSort";

interface Produit {
  uuid: string;
  nom: string;
  prix: string | number;
  image: string | null;
  description: string;

  promotion_uuid?: string | null;
  promotion_nom?: string | null;
  promotion_type?: "percentage" | "special_price" | null;
  promotion_reduction_pourcentage?: number | string | null;
  promotion_prix_promotionnel?: number | string | null;

  note_moyenne?: number | string | null;
  total_avis?: number | string | null;
}

interface RechercheResponse {
  success: boolean;
  data: Produit[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface Categorie {
  uuid: string;
  nom: string;
  slug: string;
  status: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  status: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Categorie[];
  message?: string;
}

interface BoutiquesResponse {
  success: boolean;
  data: Boutique[];
  message?: string;
}

export const dynamic = "force-dynamic";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    boutique?: string;
    prix_min?: string;
    prix_max?: string;
    note_min?: string;
    en_stock?: string;
    promotion?: string;
    tri?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;

  const recherche = (params.q ?? "").trim();
  const categorie = (params.categorie ?? "").trim();
  const boutique = (params.boutique ?? "").trim();
  const prixMin = (params.prix_min ?? "").trim();
  const prixMax = (params.prix_max ?? "").trim();
  const noteMin = (params.note_min ?? "").trim();

  const enStock = params.en_stock === "true";
  const promotion = params.promotion === "true";

  const tri =
    params.tri === "recent" ||
      params.tri === "prix_asc" ||
      params.tri === "prix_desc" ||
      params.tri === "note"
      ? params.tri
      : "pertinence";

  const pageParam = Number(params.page ?? "1");
  const limitParam = Number(params.limit ?? "24");

  const page =
    Number.isFinite(pageParam) && pageParam >= 1
      ? Math.floor(pageParam)
      : 1;

  const limit =
    Number.isFinite(limitParam) &&
      limitParam >= 1 &&
      limitParam <= 48
      ? Math.floor(limitParam)
      : 24;

  let produits: Produit[] = [];
  let error = "";

  let pagination = {
    page,
    limit,
    total: 0,
    total_pages: 0,
  };

  /*
   * ============================================================
   * CHARGEMENT DES FILTRES
   * ============================================================
   */

  let categories: Categorie[] = [];
  let boutiques: Boutique[] = [];

  try {
    const [categoriesResult, boutiquesResult] =
      await Promise.all([
        apiGet<CategoriesResponse>("/categories"),
        apiGet<BoutiquesResponse>("/boutiques"),
      ]);

    categories = Array.isArray(categoriesResult.data)
      ? categoriesResult.data.filter(
        (item) => item.status === "active"
      )
      : [];

    boutiques = Array.isArray(boutiquesResult.data)
      ? boutiquesResult.data.filter(
        (item) => item.status === "active"
      )
      : [];
  } catch (err) {
    console.error(
      "Erreur chargement filtres recherche :",
      err
    );
  }

  /*
   * ============================================================
   * RECHERCHE AVANCÉE
   * ============================================================
   */

  if (recherche) {
    try {
      const searchQuery = new URLSearchParams();

      searchQuery.set("q", recherche);

      if (categorie) {
        searchQuery.set("categorie", categorie);
      }

      if (boutique) {
        searchQuery.set("boutique", boutique);
      }

      if (prixMin) {
        searchQuery.set("prix_min", prixMin);
      }

      if (prixMax) {
        searchQuery.set("prix_max", prixMax);
      }

      if (noteMin) {
        searchQuery.set("note_min", noteMin);
      }

      if (enStock) {
        searchQuery.set("en_stock", "true");
      }

      if (promotion) {
        searchQuery.set("promotion", "true");
      }

      if (tri !== "pertinence") {
        searchQuery.set("tri", tri);
      }

      searchQuery.set("page", String(page));
      searchQuery.set("limit", String(limit));

      const result =
        await apiGet<RechercheResponse>(
          `/recherche?${searchQuery.toString()}`
        );

      produits = Array.isArray(result.data)
        ? result.data
        : [];

      if (result.pagination) {
        pagination = result.pagination;
      }
    } catch (err) {
      console.error(
        "Erreur recherche produits :",
        err
      );

      error =
        err instanceof Error
          ? err.message
          : "Impossible d'effectuer la recherche.";
    }
  }

  const nombreProduits = produits.length;
  const totalProduits = pagination.total;

  /*
   * ============================================================
   * URL DE PAGINATION
   * ============================================================
   */

  const buildPageUrl = (targetPage: number) => {
    const query = new URLSearchParams();

    if (recherche) {
      query.set("q", recherche);
    }

    if (categorie) {
      query.set("categorie", categorie);
    }

    if (boutique) {
      query.set("boutique", boutique);
    }

    if (prixMin) {
      query.set("prix_min", prixMin);
    }

    if (prixMax) {
      query.set("prix_max", prixMax);
    }

    if (noteMin) {
      query.set("note_min", noteMin);
    }

    if (enStock) {
      query.set("en_stock", "true");
    }

    if (promotion) {
      query.set("promotion", "true");
    }

    if (tri !== "pertinence") {
      query.set("tri", tri);
    }

    query.set("page", String(targetPage));
    query.set("limit", String(limit));

    return `/recherche?${query.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-[#14a800]/5
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            -left-32
            h-80
            w-80
            rounded-full
            bg-[#fcd116]/5
          "
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-6 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                  <Search
                    size={18}
                    strokeWidth={2.2}
                  />
                </div>

                <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                  Recherche MarketMali
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Résultats de recherche
              </h1>

              {recherche ? (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                  Voici les produits correspondant à
                  votre recherche{" "}
                  <span className="font-bold text-gray-800">
                    « {recherche} »
                  </span>
                  .
                </p>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                  Recherchez facilement les produits
                  proposés par les boutiques partenaires
                  de MarketMali.
                </p>
              )}
            </div>

            {recherche && !error && (
              <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                  <Package
                    size={23}
                    strokeWidth={1.9}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Résultats
                  </p>

                  <p className="mt-0.5 text-2xl font-extrabold text-gray-950">
                    {totalProduits}
                  </p>

                  <p className="text-xs text-gray-500">
                    produit
                    {totalProduits > 1
                      ? "s"
                      : ""}{" "}
                    trouvé
                    {totalProduits > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* ===================================================
            BARRE DE RECHERCHE
        ==================================================== */}

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <form
            action="/recherche"
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="search"
                name="q"
                defaultValue={recherche}
                placeholder="Rechercher un produit..."
                aria-label="Rechercher un produit"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  pl-11
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-[#14a800]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#14a800]/10
                "
              />
            </div>

            <button
              type="submit"
              className="
                inline-flex
                h-12
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#14a800]
                px-6
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#108f00]
                active:scale-[0.98]
              "
            >
              <Search size={17} />
              Rechercher
            </button>
          </form>
        </div>

        {/* ===================================================
            RECHERCHE VIDE
        ==================================================== */}

        {!recherche && !error && (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#14a800]/10 text-[#14a800]">
              <Search size={34} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950 sm:text-2xl">
              Que recherchez-vous ?
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Utilisez la barre de recherche ci-dessus
              pour trouver rapidement un produit sur
              MarketMali.
            </p>

            <Link
              href="/produits"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#14a800]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#108f00]
              "
            >
              Parcourir les produits
              <ChevronRight size={17} />
            </Link>
          </div>
        )}

        {/* ===================================================
            ERREUR
        ==================================================== */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#ce1126]">
                <Search size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-red-900">
                  Recherche impossible
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            RÉSULTATS
        ==================================================== */}

        {recherche && !error && (
          <>
            {produits.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                  <Package size={34} />
                </div>

                <h2 className="mt-6 text-xl font-bold text-gray-950 sm:text-2xl">
                  Aucun produit trouvé
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  Aucun produit ne correspond aux
                  critères de recherche actuels.
                </p>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-400">
                  Essayez de modifier vos filtres ou
                  utilisez un autre terme de recherche.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/recherche"
                    className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#14a800]
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#108f00]
            "
                  >
                    Nouvelle recherche
                    <Search size={17} />
                  </Link>

                  <Link
                    href="/produits"
                    className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:border-[#14a800]/30
              hover:bg-[#14a800]/5
              hover:text-[#14a800]
            "
                  >
                    Voir le catalogue
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

                {/* =================================================
            COLONNE GAUCHE — FILTRES
        ================================================== */}

                <div className="lg:w-64 lg:shrink-0">

                  <div className="mb-4 hidden lg:block">
                    <h2 className="text-base font-extrabold text-gray-950">
                      Filtrer et trier les résultats
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Affinez votre recherche
                    </p>
                  </div>

                  <SearchFilters
                    categories={categories}
                    boutiques={boutiques}
                    recherche={recherche}
                    categorie={categorie}
                    boutique={boutique}
                    prixMin={prixMin}
                    prixMax={prixMax}
                    noteMin={noteMin}
                    enStock={enStock}
                    promotion={promotion}
                  />
                </div>

                {/* =================================================
            COLONNE DROITE — PRODUITS
        ================================================== */}

                <div className="min-w-0 flex-1">

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-950">
                        Produits trouvés
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {totalProduits} produit
                        {totalProduits > 1 ? "s" : ""} correspondant à votre recherche.
                      </p>
                    </div>

                    <Link
                      href="/produits"
                      className="
                inline-flex
                w-fit
                items-center
                gap-1.5
                text-sm
                font-bold
                text-[#14a800]
                transition
                hover:text-[#108f00]
              "
                    >
                      Voir le catalogue
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  {/* TRI */}

                  <SearchSort tri={tri} />

                  {/* PRODUITS */}

                  {/* PRODUITS */}

                  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                    {produits.map((produit) => (
                      <ProductCard
                        key={produit.uuid}
                        produit={{
                          uuid: produit.uuid,
                          nom: produit.nom,
                          prix: produit.prix,
                          image: produit.image,
                          description: produit.description,

                          note_moyenne: produit.note_moyenne,
                          total_avis: produit.total_avis,

                          promotion_uuid:
                            produit.promotion_uuid,
                          promotion_nom:
                            produit.promotion_nom,
                          promotion_type:
                            produit.promotion_type,
                          promotion_reduction_pourcentage:
                            produit.promotion_reduction_pourcentage,
                          promotion_prix_promotionnel:
                            produit.promotion_prix_promotionnel,
                        }}
                      />
                    ))}
                  </div>
                  {/* =============================================
              PAGINATION
          ============================================== */}

                  {pagination.total_pages > 1 && (
                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
                      <p className="text-sm text-gray-500">
                        Page{" "}
                        <span className="font-bold text-gray-800">
                          {pagination.page}
                        </span>{" "}
                        sur{" "}
                        <span className="font-bold text-gray-800">
                          {pagination.total_pages}
                        </span>
                      </p>

                      <div className="flex items-center gap-2">
                        {pagination.page > 1 ? (
                          <Link
                            href={buildPageUrl(
                              pagination.page - 1
                            )}
                            className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      font-bold
                      text-gray-700
                      shadow-sm
                      transition
                      hover:border-[#14a800]/30
                      hover:bg-[#14a800]/5
                      hover:text-[#14a800]
                    "
                          >
                            <ChevronLeft size={16} />
                            Précédent
                          </Link>
                        ) : (
                          <span
                            className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-gray-100
                      bg-gray-50
                      px-4
                      text-sm
                      font-bold
                      text-gray-300
                    "
                          >
                            <ChevronLeft size={16} />
                            Précédent
                          </span>
                        )}

                        {pagination.page <
                          pagination.total_pages ? (
                          <Link
                            href={buildPageUrl(
                              pagination.page + 1
                            )}
                            className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      bg-[#14a800]
                      px-4
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-[#108f00]
                    "
                          >
                            Suivant
                            <ChevronRight size={16} />
                          </Link>
                        ) : (
                          <span
                            className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      bg-gray-100
                      px-4
                      text-sm
                      font-bold
                      text-gray-300
                    "
                          >
                            Suivant
                            <ChevronRight size={16} />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}



        {/* ===================================================
            RETOUR
        ==================================================== */}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-500
              transition
              hover:text-[#14a800]
            "
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}