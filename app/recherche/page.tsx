import Link from "next/link";
import { Search, Package, ArrowLeft, ChevronRight } from "lucide-react";

import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
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
  message?: string;
}

export const dynamic = "force-dynamic";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const { q } = await searchParams;

  const recherche = (q ?? "").trim();

  let produits: Produit[] = [];
  let error = "";

  if (recherche) {
    try {
      const result = await apiGet<RechercheResponse>(
        `/recherche?q=${encodeURIComponent(recherche)}`
      );

      produits = Array.isArray(result.data)
        ? result.data
        : [];
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

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Décorations */}

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
          {/* Bande Mali */}

          <div className="mb-6 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* TITRE */}

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

            {/* STATISTIQUE */}

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
                    {nombreProduits}
                  </p>

                  <p className="text-xs text-gray-500">
                    produit
                    {nombreProduits > 1
                      ? "s"
                      : ""}{" "}
                    trouvé
                    {nombreProduits > 1
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
        {/* BARRE DE RECHERCHE */}

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

        {/* =====================================================
            ERREUR
        ====================================================== */}

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

        {/* =====================================================
            RECHERCHE VIDE
        ====================================================== */}

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

        {/* =====================================================
            AUCUN RÉSULTAT
        ====================================================== */}

        {recherche &&
          !error &&
          produits.length === 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                <Package size={34} />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-950 sm:text-2xl">
                Aucun produit trouvé
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                Aucun produit ne correspond à{" "}
                <span className="font-semibold text-gray-700">
                  « {recherche} »
                </span>
                .
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-400">
                Essayez avec un autre terme, vérifiez
                l'orthographe ou consultez directement
                notre catalogue.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/produits"
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
                  Voir tous les produits
                  <ChevronRight size={17} />
                </Link>

                <Link
                  href="/"
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
                  Accueil
                </Link>
              </div>
            </div>
          )}

        {/* =====================================================
            RÉSULTATS
        ====================================================== */}

        {recherche &&
          !error &&
          produits.length > 0 && (
            <>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-950">
                    Produits trouvés
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {nombreProduits} produit
                    {nombreProduits > 1
                      ? "s"
                      : ""}{" "}
                    correspondant à votre recherche.
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

              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {produits.map((produit) => (
                  <ProductCard
                    key={produit.uuid}
                    produit={{
                      uuid: produit.uuid,
                      nom: produit.nom,
                      prix: produit.prix,
                      image: produit.image,
                      description:
                        produit.description,
                    }}
                  />
                ))}
              </div>
            </>
          )}

        {/* =====================================================
            RETOUR
        ====================================================== */}

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