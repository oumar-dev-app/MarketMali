"use client";

import {
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

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

interface SearchFiltersProps {
  categories: Categorie[];
  boutiques: Boutique[];
  recherche: string;
  categorie: string;
  boutique: string;
  prixMin: string;
  prixMax: string;
  noteMin: string;
  enStock: boolean;
  promotion: boolean;
}

export default function SearchFilters({
  categories,
  boutiques,
  recherche,
  categorie,
  boutique,
  prixMin,
  prixMax,
  noteMin,
  enStock,
  promotion,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [localPrixMin, setLocalPrixMin] =
    useState(prixMin);

  const [localPrixMax, setLocalPrixMax] =
    useState(prixMax);

  const updateFilters = (
    overrides: Record<string, string | null>
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.delete("page");

    Object.entries(overrides).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  };

  const applyPriceFilters = () => {
    updateFilters({
      prix_min: localPrixMin || null,
      prix_max: localPrixMax || null,
    });
  };

  const resetFilters = () => {
    const params = new URLSearchParams();

    if (recherche) {
      params.set("q", recherche);
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );

    setLocalPrixMin("");
    setLocalPrixMax("");
    setMobileOpen(false);
  };

  const activeFilters =
    Number(Boolean(categorie)) +
    Number(Boolean(boutique)) +
    Number(Boolean(prixMin)) +
    Number(Boolean(prixMax)) +
    Number(Boolean(noteMin)) +
    Number(enStock) +
    Number(promotion);

  const contenu = (
    <div className="space-y-5">
      {/* =====================================================
          CATÉGORIE
      ====================================================== */}

      <div>
        <label
          htmlFor="categorie"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500"
        >
          Catégorie
        </label>

        <select
          id="categorie"
          value={categorie}
          onChange={(e) =>
            updateFilters({
              categorie:
                e.target.value || null,
            })
          }
          className="
            h-11
            w-full
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-3
            text-sm
            font-medium
            text-gray-800
            outline-none
            transition
            focus:border-[#14a800]
            focus:bg-white
            focus:ring-4
            focus:ring-[#14a800]/10
          "
        >
          <option value="">
            Toutes les catégories
          </option>

          {categories.map((item) => (
            <option
              key={item.uuid}
              value={item.slug}
            >
              {item.nom}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          BOUTIQUE
      ====================================================== */}

      <div>
        <label
          htmlFor="boutique"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500"
        >
          Boutique
        </label>

        <select
          id="boutique"
          value={boutique}
          onChange={(e) =>
            updateFilters({
              boutique:
                e.target.value || null,
            })
          }
          className="
            h-11
            w-full
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-3
            text-sm
            font-medium
            text-gray-800
            outline-none
            transition
            focus:border-[#14a800]
            focus:bg-white
            focus:ring-4
            focus:ring-[#14a800]/10
          "
        >
          <option value="">
            Toutes les boutiques
          </option>

          {boutiques.map((item) => (
            <option
              key={item.uuid}
              value={item.slug}
            >
              {item.nom}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          PRIX
      ====================================================== */}

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Prix (FCFA)
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={localPrixMin}
            placeholder="Minimum"
            onChange={(e) =>
              setLocalPrixMin(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyPriceFilters();
              }
            }}
            className="
              h-11
              min-w-0
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-3
              text-sm
              text-gray-800
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-[#14a800]
              focus:bg-white
              focus:ring-4
              focus:ring-[#14a800]/10
            "
          />

          <input
            type="number"
            min="0"
            value={localPrixMax}
            placeholder="Maximum"
            onChange={(e) =>
              setLocalPrixMax(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyPriceFilters();
              }
            }}
            className="
              h-11
              min-w-0
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-3
              text-sm
              text-gray-800
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
          type="button"
          onClick={applyPriceFilters}
          disabled={
            localPrixMin === prixMin &&
            localPrixMax === prixMax
          }
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-[#14a800]/20
            bg-[#14a800]/5
            px-3
            py-2
            text-xs
            font-bold
            text-[#14a800]
            transition
            hover:bg-[#14a800]/10
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Appliquer le prix
        </button>
      </div>

      {/* =====================================================
          NOTE
      ====================================================== */}

      <div>
        <label
          htmlFor="note_min"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500"
        >
          Note minimale
        </label>

        <select
          id="note_min"
          value={noteMin}
          onChange={(e) =>
            updateFilters({
              note_min:
                e.target.value || null,
            })
          }
          className="
            h-11
            w-full
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-3
            text-sm
            font-medium
            text-gray-800
            outline-none
            transition
            focus:border-[#14a800]
            focus:bg-white
            focus:ring-4
            focus:ring-[#14a800]/10
          "
        >
          <option value="">
            Toutes les notes
          </option>

          <option value="5">
            ★★★★★ 5 uniquement
          </option>

          <option value="4">
            ★★★★☆ 4 et plus
          </option>

          <option value="3">
            ★★★☆☆ 3 et plus
          </option>

          <option value="2">
            ★★☆☆☆ 2 et plus
          </option>

          <option value="1">
            ★☆☆☆☆ 1 et plus
          </option>
        </select>
      </div>

      {/* =====================================================
          DISPONIBILITÉ
      ====================================================== */}

      <div className="space-y-3 border-t border-gray-100 pt-5">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="h-2 w-2 rounded-full bg-[#14a800]" />
            En stock uniquement
          </span>

          <input
            type="checkbox"
            checked={enStock}
            onChange={(e) =>
              updateFilters({
                en_stock:
                  e.target.checked
                    ? "true"
                    : null,
              })
            }
            className="
              h-4
              w-4
              rounded
              border-gray-300
              accent-[#14a800]
              focus:ring-[#14a800]
            "
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="h-2 w-2 rounded-full bg-[#ce1126]" />
            En promotion
          </span>

          <input
            type="checkbox"
            checked={promotion}
            onChange={(e) =>
              updateFilters({
                promotion:
                  e.target.checked
                    ? "true"
                    : null,
              })
            }
            className="
              h-4
              w-4
              rounded
              border-gray-300
              accent-[#14a800]
              focus:ring-[#14a800]
            "
          />
        </label>
      </div>

      {/* =====================================================
          RÉINITIALISER
      ====================================================== */}

      {activeFilters > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            font-bold
            text-gray-600
            transition
            hover:border-[#ce1126]/20
            hover:bg-[#ce1126]/5
            hover:text-[#ce1126]
          "
        >
          <RotateCcw size={15} />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="mb-5 lg:hidden">
        <button
          type="button"
          onClick={() =>
            setMobileOpen((value) => !value)
          }
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-gray-100
            bg-white
            px-4
            py-3.5
            shadow-sm
          "
        >
          <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter
              size={17}
              className="text-[#14a800]"
            />

            Filtres

            {activeFilters > 0 && (
              <span className="rounded-full bg-[#14a800] px-2 py-0.5 text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </span>

          <span className="text-xs font-semibold text-gray-400">
            {mobileOpen
              ? "Masquer"
              : "Afficher"}
          </span>
        </button>

        {mobileOpen && (
          <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {contenu}
          </div>
        )}
      </div>

      {/* =====================================================
          DESKTOP
      ====================================================== */}

      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
              <Filter size={17} />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-gray-900">
                Filtres
              </h2>

              <p className="text-[11px] text-gray-400">
                Affinez votre recherche
              </p>
            </div>
          </div>

          {contenu}
        </div>
      </aside>
    </>
  );
}

