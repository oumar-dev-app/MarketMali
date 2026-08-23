"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Search,
  Store,
  Package,
  Phone,
  Mail,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";

interface Categorie {
  id: number;
  uuid: string;
  nom: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

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

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  logo: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
}

interface BoutiqueClientProps {
  boutique: Boutique;
  categories: Categorie[];
  produits: Produit[];
}

export default function BoutiqueClient({
  boutique,
  categories,
  produits,
}: BoutiqueClientProps) {
  const [categorieActive, setCategorieActive] =
    useState<number | null>(null);

  const [recherche, setRecherche] = useState("");

  const produitsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return produits.filter((produit) => {
      const correspondCategorie =
        categorieActive === null ||
        produit.categorie_id === categorieActive;

      const correspondRecherche =
        !terme ||
        produit.nom.toLowerCase().includes(terme) ||
        produit.description?.toLowerCase().includes(terme);

      return (
        correspondCategorie &&
        correspondRecherche
      );
    });
  }, [
    produits,
    categorieActive,
    recherche,
  ]);

  function reinitialiserFiltres() {
    setCategorieActive(null);
    setRecherche("");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      {/* =====================================================
          HEADER BOUTIQUE
      ====================================================== */}


      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

            {/* Décoration arrière-plan */}

            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#14a800]/5" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-[#fcd116]/5" />

            <div className="relative p-5 sm:p-7 lg:p-8">

              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                {/* =================================================
              IDENTITÉ BOUTIQUE
          ================================================== */}

                <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">

                  {/* LOGO */}

                  <div
                    className="
                relative
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                shadow-sm
                sm:h-24
                sm:w-24
                lg:h-28
                lg:w-28
              "
                  >
                    {boutique.logo ? (
                      <img
                        src={boutique.logo}
                        alt={`Logo ${boutique.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store
                        size={40}
                        strokeWidth={1.5}
                        className="text-[#14a800]"
                      />
                    )}

                    {/* Petit indicateur */}

                    <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white bg-[#14a800]" />
                  </div>

                  {/* INFORMATIONS */}

                  <div className="min-w-0 flex-1">

                    {/* BADGES */}

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#14a800]">
                        Boutique MarketMali
                      </span>

                      {boutique.ville && (
                        <span className="hidden text-gray-300 sm:inline">
                          •
                        </span>
                      )}

                      {boutique.ville && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <MapPin
                            size={13}
                            className="text-gray-400"
                          />
                          {boutique.ville}
                        </span>
                      )}

                    </div>

                    {/* NOM */}

                    <h1
                      className="
                  truncate
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-gray-950
                  sm:text-3xl
                  lg:text-4xl
                "
                    >
                      {boutique.nom}
                    </h1>

                    {/* DESCRIPTION */}

                    {boutique.description && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        {boutique.description}
                      </p>
                    )}

                    {/* INFORMATIONS RAPIDES */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      {boutique.adresse && (
                        <span
                          className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-gray-50
                      px-2.5
                      py-1.5
                      text-xs
                      font-medium
                      text-gray-600
                    "
                        >
                          <Store
                            size={13}
                            className="text-gray-400"
                          />

                          {boutique.adresse}
                        </span>
                      )}

                      {boutique.telephone && (
                        <a
                          href={`tel:${boutique.telephone}`}
                          className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-gray-50
                      px-2.5
                      py-1.5
                      text-xs
                      font-medium
                      text-gray-600
                      transition
                      hover:bg-[#14a800]/10
                      hover:text-[#14a800]
                    "
                        >
                          <Phone
                            size={13}
                            className="text-gray-400"
                          />

                          {boutique.telephone}
                        </a>
                      )}

                      {boutique.email && (
                        <span
                          className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-gray-50
                      px-2.5
                      py-1.5
                      text-xs
                      font-medium
                      text-gray-600
                    "
                        >
                          <Mail
                            size={13}
                            className="text-gray-400"
                          />

                          {boutique.email}
                        </span>
                      )}

                    </div>
                  </div>
                </div>

                {/* =================================================
              BLOC DROIT
          ================================================== */}

                <div className="flex shrink-0 flex-row items-center gap-3 lg:ml-6">

                  {/* STATISTIQUE */}

                  <div
                    className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                sm:px-5
              "
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                      <Package
                        size={20}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Catalogue
                      </p>

                      <p className="text-xl font-extrabold leading-tight text-gray-950">
                        {produits.length}
                      </p>

                      <p className="text-[11px] text-gray-500">
                        produit
                        {produits.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* BOUTON APPELER */}

                  {boutique.telephone && (
                    <a
                      href={`tel:${boutique.telephone}`}
                      className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#14a800]
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#108f00]
                  hover:shadow-md
                  active:scale-95
                  sm:h-auto
                  sm:w-auto
                  sm:px-4
                  py-2
                "
                    >
                      <Phone size={18} />

                      <span className="ml-2 hidden text-xs font-bold sm:inline">
                        Appeler
                      </span>
                    </a>
                  )}

                </div>
              </div>

              {/* =================================================
            STATUT
        ================================================== */}

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                <div className="flex items-center gap-2">

                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14a800]/40" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#14a800]" />
                  </span>

                  <span className="text-xs font-semibold text-gray-600">
                    Boutique active
                  </span>

                  <CheckCircle2
                    size={14}
                    className="text-[#14a800]"
                  />

                </div>

                <span className="hidden text-xs text-gray-400 sm:block">
                  Produits disponibles sur MarketMali
                </span>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* RECHERCHE */}

        <div className="mb-6">
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
              placeholder={`Rechercher dans ${boutique.nom}...`}
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

        {/* =====================================================
            CATEGORIES
        ====================================================== */}

        {categories.length > 0 && (
          <div className="mb-8">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Catégories
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Filtrez les produits de cette boutique
                </p>
              </div>

              <span className="text-xs text-gray-400">
                {categories.length} catégorie
                {categories.length > 1 ? "s" : ""}
              </span>

            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">

              <button
                type="button"
                onClick={reinitialiserFiltres}
                className={`
                  shrink-0
                  rounded-xl
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition-all
                  ${categorieActive === null
                    ? "bg-[#14a800] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#14a800]/30 hover:text-[#14a800]"
                  }
                `}
              >
                Tous les produits
              </button>

              {categories.map((categorie) => (
                <button
                  key={categorie.uuid}
                  type="button"
                  onClick={() =>
                    setCategorieActive(categorie.id)
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    transition-all
                    ${categorieActive === categorie.id
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
        )}

        {/* =====================================================
            PRODUITS
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#14a800]">
              Catalogue
            </p>

            <h2 className="text-xl font-extrabold tracking-tight text-gray-950">
              Produits de la boutique
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {produitsFiltres.length} produit
              {produitsFiltres.length > 1 ? "s" : ""}

              {recherche && (
                <>
                  {" "}
                  trouvé
                  {produitsFiltres.length > 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {categorieActive !== null && (
            <button
              type="button"
              onClick={() =>
                setCategorieActive(null)
              }
              className="w-fit text-xs font-bold text-[#14a800] hover:underline"
            >
              Voir tous les produits
            </button>
          )}

        </div>

        {produitsFiltres.length > 0 ? (

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">

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

          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <Package
                size={28}
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-950">
              Aucun produit trouvé
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {recherche
                ? "Aucun produit ne correspond à votre recherche."
                : "Cette boutique ne propose actuellement aucun produit dans cette catégorie."}
            </p>

            {(recherche || categorieActive !== null) && (
              <button
                type="button"
                onClick={reinitialiserFiltres}
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
                Réinitialiser
              </button>
            )}

          </div>
        )}

      </section>
    </main>
  );
}

