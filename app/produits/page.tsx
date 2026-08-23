"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  ArrowUpDown,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

interface Produit {
  uuid: string;
  nom: string;
  prix: string;
  image?: string | null;
  description?: string;

  categorie_nom?: string | null;
  categorie_slug?: string | null;
}

type SortOption =
  | "recent"
  | "price_asc"
  | "price_desc"
  | "name";

function ProduitsContent() {
  const [produits, setProduits] = useState<Produit[]>(
    []
  );

  const searchParams = useSearchParams();

  const categorieSlug =
    searchParams.get("categorie") ?? "";

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [sort, setSort] =
    useState<SortOption>("recent");

  async function loadProduits() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (categorieSlug) {
        params.set(
          "categorie",
          categorieSlug
        );
      }

      const url =
        params.toString()
          ? `/api/produits?${params.toString()}`
          : "/api/produits";

      const response = await fetch(
        url,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de charger les produits."
        );
      }

      setProduits(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement produits :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les produits."
      );

      setProduits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduits();
  }, [categorieSlug]);

  const produitsFiltres = useMemo(() => {
    const terme = search
      .trim()
      .toLowerCase();

    let resultat = produits.filter(
      (produit) => {
        if (!terme) {
          return true;
        }

        return (
          produit.nom
            .toLowerCase()
            .includes(terme) ||
          produit.description
            ?.toLowerCase()
            .includes(terme)
        );
      }
    );

    resultat = [...resultat].sort(
      (a, b) => {
        switch (sort) {
          case "price_asc":
            return (
              Number(a.prix) -
              Number(b.prix)
            );

          case "price_desc":
            return (
              Number(b.prix) -
              Number(a.prix)
            );

          case "name":
            return a.nom.localeCompare(
              b.nom,
              "fr"
            );

          case "recent":
          default:
            return 0;
        }
      }
    );

    return resultat;
  }, [produits, search, sort]);

  const hasSearch =
    search.trim().length > 0;

  const categorieNom =
    produits.find(
      (produit) =>
        produit.categorie_slug ===
        categorieSlug
    )?.categorie_nom ?? null;

  const hasCategorie =
    categorieSlug.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Décorations discrètes */}

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
            <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* TITRE */}

            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                  <ShoppingBag
                    size={18}
                    strokeWidth={2.2}
                  />
                </div>

                <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                  Catalogue MarketMali
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                {hasCategorie && categorieNom
                  ? categorieNom
                  : "Découvrez nos produits"}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                {hasCategorie && categorieNom
                  ? `Découvrez les produits de la catégorie ${categorieNom} proposés par les boutiques partenaires de MarketMali.`
                  : "Découvrez une sélection de produits proposés par les boutiques partenaires de MarketMali et trouvez facilement ce dont vous avez besoin."}
              </p>
            </div>

            {/* STATISTIQUE */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-4
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
                px-5
                py-4
              "
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                <Package
                  size={23}
                  strokeWidth={1.9}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {hasCategorie
                    ? "Catégorie"
                    : "Catalogue"}
                </p>

                <p className="mt-0.5 text-2xl font-extrabold text-gray-950">
                  {produits.length}
                </p>

                <p className="text-xs text-gray-500">
                  produit
                  {produits.length > 1
                    ? "s"
                    : ""}{" "}
                  disponible
                  {produits.length > 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATALOGUE
      ====================================================== */}

      {hasCategorie && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              Catégorie :
            </span>

            <span className="rounded-full bg-[#14a800]/10 px-3 py-1.5 font-bold text-[#087f00]">
              {categorieNom ?? categorieSlug}
            </span>
          </div>

          <Link
            href="/produits"
            className="
        inline-flex
        w-fit
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white
        px-4
        py-2.5
        text-sm
        font-bold
        text-gray-700
        transition
        hover:border-[#14a800]/30
        hover:bg-[#14a800]/5
        hover:text-[#14a800]
      "
          >
            Voir tous les produits
          </Link>
        </div>
      )}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* BARRE DE RECHERCHE / TRI */}

        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* RECHERCHE */}

            <div className="relative w-full lg:max-w-xl">
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
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Rechercher un produit..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  pl-11
                  pr-11
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

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Effacer la recherche"
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* TRI */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <SlidersHorizontal
                  size={15}
                />
                Trier par
              </div>

              <div className="relative">
                <ArrowUpDown
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target
                        .value as SortOption
                    )
                  }
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    pl-10
                    pr-10
                    text-sm
                    font-semibold
                    text-gray-700
                    outline-none
                    transition
                    focus:border-[#14a800]
                    focus:ring-4
                    focus:ring-[#14a800]/10
                    sm:w-56
                  "
                >
                  <option value="recent">
                    Plus récents
                  </option>

                  <option value="price_asc">
                    Prix croissant
                  </option>

                  <option value="price_desc">
                    Prix décroissant
                  </option>

                  <option value="name">
                    Nom : A à Z
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* FILTRE ACTIF */}

          {hasSearch && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 sm:text-sm">
                Résultats pour{" "}
                <span className="font-bold text-gray-900">
                  « {search} »
                </span>
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  text-xs
                  font-bold
                  text-[#14a800]
                  transition
                  hover:text-[#087f00]
                "
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
            TITRE CATALOGUE
        ====================================================== */}

        {!loading &&
          !error &&
          produits.length > 0 && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                  {hasSearch
                    ? "Résultats de recherche"
                    : "Produits disponibles"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {hasSearch
                    ? "Les produits correspondant à votre recherche."
                    : "Parcourez notre sélection de produits."}
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#14a800]/10 px-3 py-1.5 text-xs font-bold text-[#087f00]">
                {produitsFiltres.length} résultat
                {produitsFiltres.length > 1
                  ? "s"
                  : ""}
              </span>
            </div>
          )}

        {/* =====================================================
            CHARGEMENT
        ====================================================== */}

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({
              length: 10,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                "
              >
                <div className="aspect-square animate-pulse bg-gray-100" />

                <div className="space-y-3 p-4">
                  <div className="h-4 animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />

                  <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            ERREUR
        ====================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Package size={27} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-950">
              Impossible de charger les produits
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProduits}
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#14a800]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#108f00]
              "
            >
              Réessayer
            </button>
          </div>
        )}

        {/* =====================================================
            AUCUN PRODUIT
        ====================================================== */}

        {!loading &&
          !error &&
          produits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Package
                  size={34}
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-950">
                Aucun produit disponible
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Aucun produit n'est actuellement
                disponible dans les boutiques
                MarketMali.
              </p>

              <Link
                href="/boutiques"
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-gray-700
                  transition
                  hover:border-[#14a800]/30
                  hover:bg-[#14a800]/5
                  hover:text-[#14a800]
                "
              >
                Découvrir les boutiques
              </Link>
            </div>
          )}

        {/* =====================================================
            AUCUN RÉSULTAT DE RECHERCHE
        ====================================================== */}

        {!loading &&
          !error &&
          produits.length > 0 &&
          produitsFiltres.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Search
                  size={32}
                  strokeWidth={1.6}
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-gray-950">
                Aucun résultat
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Aucun produit ne correspond à votre
                recherche. Essayez avec un autre terme.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#14a800]
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#108f00]
                "
              >
                Voir tous les produits
              </button>
            </div>
          )}

        {/* =====================================================
            PRODUITS
        ====================================================== */}

        {!loading &&
          !error &&
          produitsFiltres.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
              {produitsFiltres.map(
                (produit) => (
                  <ProductCard
                    key={produit.uuid}
                    produit={produit}
                  />
                )
              )}
            </div>
          )}
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      {!loading &&
        !error &&
        produits.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 sm:px-10 sm:py-12">
              {/* Bande Mali */}

              <div className="absolute left-0 top-0 flex h-1 w-full">
                <div className="flex-1 bg-[#14a800]" />
                <div className="flex-1 bg-[#fcd116]" />
                <div className="flex-1 bg-[#ce1126]" />
              </div>

              {/* Décoration */}

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#14a800]/10" />

              <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#fcd116]/5" />

              <div className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <ShoppingBag
                    size={22}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Trouvez ce qu'il vous faut
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Découvrez les boutiques partenaires
                  de MarketMali et profitez d'une
                  expérience d'achat simple et pratique.
                </p>

                <Link
                  href="/boutiques"
                  className="
                    mt-6
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#14a800]
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#108f00]
                    hover:shadow-lg
                  "
                >
                  Découvrir les boutiques
                </Link>
              </div>
            </div>
          </section>
        )}
    </main>
  );
}



export default function ProduitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-sm text-gray-500">
              Chargement des produits...
            </div>
          </div>
        </div>
      }
    >
      <ProduitsContent />
    </Suspense>
  );
}