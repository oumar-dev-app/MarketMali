"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  Search,
  Tag,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";

interface Categorie {
  id: number;
  uuid: string;
  parent_id: number | null;
  nom: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status?: string;
}

export default function CategoriesContent() {
  const searchParams = useSearchParams();
  const parentSlug = searchParams.get("parent") ?? "";

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerCategories() {
      try {
        setLoading(true);
        setErreur("");

        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Impossible de récupérer les catégories."
          );
        }

        setCategories(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } catch (error) {
        console.error(
          "Erreur chargement catégories :",
          error
        );

        setErreur(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerCategories();
  }, []);

  /*
   * =========================================================
   * CATÉGORIES PRINCIPALES
   * =========================================================
   */

  const categoriesPrincipales = useMemo(() => {
    return categories.filter(
      (categorie) =>
        categorie.parent_id === null
    );
  }, [categories]);

  /*
   * =========================================================
   * CATÉGORIE PRINCIPALE SÉLECTIONNÉE
   * =========================================================
   */

  const categoriePrincipale = useMemo(() => {
    if (!parentSlug) {
      return null;
    }

    return (
      categoriesPrincipales.find(
        (categorie) =>
          categorie.slug === parentSlug
      ) ?? null
    );
  }, [
    categoriesPrincipales,
    parentSlug,
  ]);

  /*
   * =========================================================
   * SOUS-CATÉGORIES
   * =========================================================
   */

  const sousCategories = useMemo(() => {
    if (!categoriePrincipale) {
      return [];
    }

    return categories.filter(
      (categorie) =>
        categorie.parent_id ===
        categoriePrincipale.id
    );
  }, [
    categories,
    categoriePrincipale,
  ]);

  /*
   * =========================================================
   * CATÉGORIES AFFICHÉES
   * =========================================================
   */

  const categoriesAffichees = useMemo(() => {
    const source = categoriePrincipale
      ? sousCategories
      : categoriesPrincipales;

    const terme = recherche
      .trim()
      .toLowerCase();

    if (!terme) {
      return source;
    }

    return source.filter(
      (categorie) =>
        categorie.nom
          .toLowerCase()
          .includes(terme) ||
        categorie.description
          ?.toLowerCase()
          .includes(terme)
    );
  }, [
    categoriePrincipale,
    sousCategories,
    categoriesPrincipales,
    recherche,
  ]);

  /*
   * =========================================================
   * RENDU
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-gray-100 bg-[#f7f9f7]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

            {/* Décoration verte */}
            <div
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-80
                w-80
                rounded-full
                bg-[#14a800]/5
              "
            />

            {/* Décoration jaune */}
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

            {/* Décoration rouge */}
            <div
              className="
                pointer-events-none
                absolute
                right-[20%]
                top-[35%]
                h-44
                w-44
                rounded-full
                bg-[#ce1126]/[0.025]
              "
            />

            <div className="relative p-6 sm:p-8 lg:p-10">

              {/* Bande Mali */}
              <div className="mb-6 flex items-center gap-1">
                <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
              </div>

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div className="max-w-2xl">

                  <div className="mb-3 flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                      <Tag
                        size={18}
                        strokeWidth={2.2}
                      />
                    </div>

                    <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                      Catalogue
                    </span>

                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                    {categoriePrincipale
                      ? categoriePrincipale.nom
                      : "Catégories"}
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                    {categoriePrincipale
                      ? categoriePrincipale.description ||
                      "Découvrez les sous-catégories disponibles dans cette catégorie."
                      : "Découvrez les différentes catégories disponibles sur MarketMali et trouvez rapidement les produits qui vous intéressent."}
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
                    bg-gray-50/80
                    px-5
                    py-4
                    shadow-sm
                  "
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                    <FolderOpen
                      size={23}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Catalogue
                    </p>

                    <p className="text-2xl font-extrabold text-gray-950">
                      {categoriesAffichees.length}
                    </p>

                    <p className="text-xs text-gray-500">
                      {categoriePrincipale
                        ? "sous-catégorie"
                        : "catégorie"}
                      {categoriesAffichees.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* RETOUR */}
        {categoriePrincipale && (
          <div className="mb-6">
            <Link
              href="/categories"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-gray-700
                shadow-sm
                transition
                hover:border-[#14a800]/30
                hover:text-[#14a800]
              "
            >
              <ArrowLeft size={16} />
              Toutes les catégories
            </Link>
          </div>
        )}

        {/* RECHERCHE */}
        <div className="mb-8">
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={recherche}
              onChange={(event) =>
                setRecherche(event.target.value)
              }
              placeholder={
                categoriePrincipale
                  ? `Rechercher dans ${categoriePrincipale.nom}...`
                  : "Rechercher une catégorie..."
              }
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-gray-200
                bg-white
                pl-11
                pr-4
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-[#14a800]
                focus:ring-4
                focus:ring-[#14a800]/10
              "
            />
          </div>
        </div>

        {/* TITRE */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14a800]/10 text-[#14a800]">
                <Tag size={16} />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#14a800]">
                {categoriePrincipale
                  ? categoriePrincipale.nom
                  : "Catalogue"}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">
              {categoriePrincipale
                ? "Explorez les sous-catégories"
                : "Explorez nos catégories"}
            </h2>

          </div>

          {!loading && (
            <span className="text-xs text-gray-400">
              {categoriesAffichees.length} résultat
              {categoriesAffichees.length > 1
                ? "s"
                : ""}
            </span>
          )}
        </div>

        {/* CHARGEMENT */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] animate-pulse bg-gray-100" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ERREUR */}
        {!loading && erreur && (
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FolderOpen
                size={28}
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-950">
              Impossible de charger les catégories
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {erreur}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-5
                rounded-xl
                bg-[#14a800]
                px-5
                py-2.5
                text-xs
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

        {/* CATÉGORIES */}
        {!loading &&
          !erreur &&
          categoriesAffichees.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

              {categoriesAffichees.map(
                (categorie) => (
                  <CategoryCard
                    key={categorie.uuid}
                    categorie={categorie}
                    hasChildren={categories.some(
                      (item) =>
                        item.parent_id ===
                        categorie.id
                    )}
                  />
                )
              )}

            </div>
          )}

        {/* AUCUN RÉSULTAT */}
        {!loading &&
          !erreur &&
          categoriesAffichees.length === 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Search
                  size={28}
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-950">
                Aucune catégorie trouvée
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Essayez avec un autre terme de recherche.
              </p>

            </div>
          )}

      </section>
    </main>
  );
}
