"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Produit {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  stock: number;
  image: string | null;
  categorie_id: number;
}

interface Categorie {
  id: number;
  uuid: string;
  boutique_id: number;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
}

interface BoutiqueProductsProps {
  produits: Produit[];
  categories: Categorie[];
}

export default function BoutiqueProducts({
  produits,
  categories,
}: BoutiqueProductsProps) {
  const [categorieActive, setCategorieActive] =
    useState<number | null>(null);

  const produitsFiltres = useMemo(() => {
    if (categorieActive === null) {
      return produits;
    }

    return produits.filter(
      (produit) =>
        produit.categorie_id === categorieActive
    );
  }, [produits, categorieActive]);

  return (
    <section>
      {/* CATEGORIES */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Catégories
          </h2>

          <span className="text-xs text-gray-400 sm:text-sm">
            {produitsFiltres.length} produit
            {produitsFiltres.length > 1 ? "s" : ""}
          </span>
        </div>

        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-2
            scrollbar-none
          "
        >
          {/* TOUTES */}
          <button
            type="button"
            onClick={() => setCategorieActive(null)}
            className={`
              shrink-0
              rounded-full
              px-4
              py-2
              text-sm
              font-semibold
              transition-all
              ${
                categorieActive === null
                  ? "bg-[#14a800] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-[#14a800]/30 hover:text-[#14a800]"
              }
            `}
          >
            Toutes
          </button>

          {/* CATEGORIES */}
          {categories.map((categorie) => (
            <button
              key={categorie.uuid}
              type="button"
              onClick={() =>
                setCategorieActive(categorie.id)
              }
              className={`
                shrink-0
                rounded-full
                px-4
                py-2
                text-sm
                font-semibold
                transition-all
                ${
                  categorieActive === categorie.id
                    ? "bg-[#14a800] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#14a800]/30 hover:text-[#14a800]"
                }
              `}
            >
              {categorie.nom}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUITS */}
      {produitsFiltres.length > 0 ? (
        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:gap-5
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {produitsFiltres.map((produit) => (
            <ProductCard
              key={produit.uuid}
              produit={{
                uuid: produit.uuid,
                nom: produit.nom,
                prix: produit.prix,
                image: produit.image,
                description: produit.description,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-gray-200
            bg-gray-50
            px-6
            py-14
            text-center
          "
        >
          <p className="text-sm font-semibold text-gray-600">
            Aucun produit dans cette catégorie.
          </p>

          <button
            type="button"
            onClick={() => setCategorieActive(null)}
            className="
              mt-3
              text-sm
              font-semibold
              text-[#14a800]
              hover:underline
            "
          >
            Voir tous les produits
          </button>
        </div>
      )}
    </section>
  );
}