"use client";

import Link from "next/link";
import {
  ArrowRight,
  FolderOpen,
  Package,
  Search,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";



interface Categorie {
  id: number;
  uuid: string;
  nom: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerCategories() {
      try {
        setLoading(true);
        setErreur("");

        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

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

  const categoriesFiltrees = useMemo(() => {
    const terme = recherche
      .trim()
      .toLowerCase();

    if (!terme) {
      return categories;
    }

    return categories.filter(
      (categorie) =>
        categorie.nom
          .toLowerCase()
          .includes(terme) ||
        categorie.description
          ?.toLowerCase()
          .includes(terme)
    );
  }, [categories, recherche]);

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
        HERO
    ====================================================== */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {/* BANDE MALI */}

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* TITRE */}

                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#14a800]/10 px-3 py-1.5 text-xs font-bold text-[#087f00]">
                    <Tag size={14} />

                    MarketMali
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                    Catégories
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                    Découvrez les différentes catégories
                    disponibles sur MarketMali et trouvez
                    rapidement les produits qui vous intéressent.
                  </p>
                </div>

                {/* STATISTIQUE */}

                <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
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
                      {categories.length}
                    </p>

                    <p className="text-xs text-gray-500">
                      catégorie
                      {categories.length > 1
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
              placeholder="Rechercher une catégorie..."
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
                Catalogue
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">
              Explorez nos catégories
            </h2>
          </div>

          {!loading && (
            <span className="text-xs text-gray-400">
              {categoriesFiltrees.length} résultat
              {categoriesFiltrees.length > 1
                ? "s"
                : ""}
            </span>
          )}
        </div>

        {/* =================================================
            CHARGEMENT
        ================================================== */}

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

        {/* =================================================
            ERREUR
        ================================================== */}

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

        {/* =================================================
            CATEGORIES
        ================================================== */}

        {!loading &&
          !erreur &&
          categoriesFiltrees.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {categoriesFiltrees.map((categorie) => (
                <CategoryCard
                  key={categorie.uuid}
                  categorie={categorie}
                />
              ))}
            </div>
          )}

        {/* =================================================
            AUCUN RÉSULTAT
        ================================================== */}

        {!loading &&
          !erreur &&
          categoriesFiltrees.length === 0 && (
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
                {recherche
                  ? "Aucune catégorie ne correspond à votre recherche."
                  : "Aucune catégorie active n'est actuellement disponible."}
              </p>

              {recherche && (
                <button
                  type="button"
                  onClick={() =>
                    setRecherche("")
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
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}
      </section>
    </main>
  );
}

