import Link from "next/link";

import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import BoutiqueCard from "@/components/BoutiqueCard";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
export const dynamic = "force-dynamic";

interface Categorie {
  id: number;
  uuid: string;
  nom: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  ville?: string | null;
}

interface Produit {
  uuid: string;
  nom: string;
  prix: string;
  image?: string | null;
  description?: string;
}

async function getCategories(): Promise<Categorie[]> {
  try {
    const response = await fetch(
      "http://localhost:3000/api/categories",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    return Array.isArray(result.data)
      ? result.data
      : [];
  } catch (error) {
    console.error(
      "Erreur chargement catégories :",
      error
    );

    return [];
  }
}

async function getBoutiques(): Promise<Boutique[]> {
  try {
    const response = await fetch(
      "http://localhost:3000/api/boutiques",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    return Array.isArray(result.data)
      ? result.data
      : [];
  } catch (error) {
    console.error(
      "Erreur chargement boutiques :",
      error
    );

    return [];
  }
}

async function getProduits(): Promise<Produit[]> {
  try {
    const response = await fetch(
      "http://localhost:3000/api/produits",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    return Array.isArray(result.data)
      ? result.data
      : [];
  } catch (error) {
    console.error(
      "Erreur chargement produits :",
      error
    );

    return [];
  }
}

export default async function HomePage() {
  const [
    categories,
    boutiques,
    produits,
  ] = await Promise.all([
    getCategories(),
    getBoutiques(),
    getProduits(),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f8f6]">

      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden bg-white">

          {/* Décorations */}

          <div className="absolute left-0 top-0 h-full w-1 bg-[#14a800]" />

          <div className="absolute right-0 top-0 h-full w-1 bg-[#ce1126]" />

          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#fcd116]/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#14a800]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

              {/* =================================================
                  TEXTE HERO
              ================================================== */}

              <div>

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14a800]/20 bg-[#14a800]/5 px-4 py-2">

                  <span className="h-2 w-2 rounded-full bg-[#14a800]" />

                  <span className="text-xs font-bold text-[#087f00] sm:text-sm">
                    Marketplace 100% malienne
                  </span>

                </div>


                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">

                  Achetez local.

                  <span className="block text-[#14a800]">
                    Vendez simplement.
                  </span>

                </h1>


                <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">

                  Découvrez les produits proposés par
                  les boutiques maliennes et faites vos
                  achats directement en ligne, simplement
                  et en toute confiance.

                </p>


                {/* RECHERCHE */}

                <div className="mt-8 max-w-2xl">

                  <SearchBar variant="hero" />

                </div>


                {/* BOUTONS */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <Link
                    href="/produits"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#14a800]
                      px-6
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-lg
                      shadow-[#14a800]/20
                      transition
                      hover:bg-[#108f00]
                    "
                  >
                    Découvrir les produits
                    <span className="ml-2">
                      →
                    </span>
                  </Link>


                  <Link
                    href="/boutiques"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-6
                      py-3.5
                      text-sm
                      font-bold
                      text-gray-800
                      transition
                      hover:border-[#fcd116]
                      hover:bg-[#fcd116]/10
                    "
                  >
                    Explorer les boutiques
                  </Link>

                </div>


                {/* CONFIANCE */}

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-500">

                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14a800]/10 text-[#14a800]">
                      ✓
                    </span>
                    Boutiques locales
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fcd116]/20 text-[#9a7800]">
                      ✓
                    </span>
                    Commande en ligne
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ce1126]/10 text-[#ce1126]">
                      ✓
                    </span>
                    Livraison
                  </div>

                </div>

              </div>


              {/* =================================================
                  VISUEL HERO
              ================================================== */}

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">

                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-2xl bg-[#fcd116] opacity-80 sm:-right-6 sm:-top-6" />

                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-2xl bg-[#ce1126] opacity-80 sm:-bottom-6 sm:-left-6" />


                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 p-5 shadow-2xl sm:p-7">

                  {/* En-tête */}

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        MarketMali
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
                        Tout le Mali, en ligne
                      </p>

                    </div>


                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#14a800] text-xl text-white shadow-lg">
                      🛍️
                    </div>

                  </div>


                  {/* Mini dashboard */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#14a800]/10 text-lg">
                        🏪
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        Boutiques
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Des vendeurs locaux
                      </p>

                    </div>


                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fcd116]/20 text-lg">
                        📦
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        Produits
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Pour tous vos besoins
                      </p>

                    </div>


                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ce1126]/10 text-lg">
                        🚚
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        Livraison
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Dans plusieurs zones
                      </p>

                    </div>


                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                        🔒
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        Sécurisé
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Achetez en confiance
                      </p>

                    </div>

                  </div>


                  {/* Bandeau */}

                  <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">

                    <div className="flex h-1">

                      <div className="flex-1 bg-[#14a800]" />
                      <div className="flex-1 bg-[#fcd116]" />
                      <div className="flex-1 bg-[#ce1126]" />

                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-4">

                      <div>

                        <p className="text-xs font-bold text-gray-900">
                          Une marketplace pensée pour le Mali
                        </p>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Découvrez, commandez et faites-vous livrer.
                        </p>

                      </div>

                      <span className="shrink-0 text-lg">
                        🇲🇱
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            STATISTIQUES
        ====================================================== */}

        <section className="border-y border-gray-100 bg-white">

          <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-gray-100 px-4 sm:px-6 lg:px-8">

            <div className="px-3 py-7 text-center sm:py-8">

              <p className="text-2xl font-extrabold text-[#14a800] sm:text-3xl">
                {categories.length}
              </p>

              <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-sm">
                Catégories
              </p>

            </div>


            <div className="px-3 py-7 text-center sm:py-8">

              <p className="text-2xl font-extrabold text-[#9a7800] sm:text-3xl">
                {boutiques.length}
              </p>

              <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-sm">
                Boutiques
              </p>

            </div>


            <div className="px-3 py-7 text-center sm:py-8">

              <p className="text-2xl font-extrabold text-[#ce1126] sm:text-3xl">
                {produits.length}
              </p>

              <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-sm">
                Produits
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            CATEGORIES
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="mb-8 flex items-end justify-between gap-4">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-1 w-8 rounded-full bg-[#14a800]" />

                <span className="text-xs font-bold uppercase tracking-wider text-[#14a800] sm:text-sm">
                  Explorer
                </span>

              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Nos catégories
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Trouvez rapidement ce dont vous avez besoin.
              </p>

            </div>


            {categories.length > 6 && (
              <Link
                href="/categories"
                className="hidden shrink-0 text-sm font-bold text-[#14a800] transition hover:text-[#087f00] hover:underline sm:block"
              >
                Voir toutes →
              </Link>
            )}

          </div>


          {categories.length > 0 ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {categories
                .slice(0, 6)
                .map((categorie) => (

                  <CategoryCard
                    key={categorie.uuid}
                    categorie={categorie}
                  />

                ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              Aucune catégorie disponible pour le moment.
            </div>

          )}

        </section>


        {/* =====================================================
            BOUTIQUES
        ====================================================== */}

        <section
          id="boutiques"
          className="border-y border-gray-100 bg-white"
        >

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

            <div className="mb-8 flex items-end justify-between gap-4">

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span className="h-1 w-8 rounded-full bg-[#fcd116]" />

                  <span className="text-xs font-bold uppercase tracking-wider text-[#9a7800] sm:text-sm">
                    Nos vendeurs
                  </span>

                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Boutiques populaires
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
                  Découvrez les boutiques qui proposent leurs
                  produits sur MarketMali.
                </p>

              </div>


              <Link
                href="/boutiques"
                className="hidden shrink-0 text-sm font-bold text-[#14a800] transition hover:text-[#087f00] hover:underline sm:block"
              >
                Voir toutes les boutiques →
              </Link>

            </div>


            {boutiques.length > 0 ? (

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {boutiques
                  .slice(0, 6)
                  .map((boutique) => (

                    <BoutiqueCard
                      key={boutique.uuid}
                      boutique={boutique}
                    />

                  ))}

              </div>

            ) : (

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
                Aucune boutique disponible pour le moment.
              </div>

            )}


            {/* Bouton mobile */}

            {boutiques.length > 6 && (

              <div className="mt-8 text-center sm:hidden">

                <Link
                  href="/boutiques"
                  className="inline-flex rounded-xl border border-[#14a800] px-5 py-3 text-sm font-bold text-[#14a800] transition hover:bg-[#14a800] hover:text-white"
                >
                  Voir toutes les boutiques
                </Link>

              </div>

            )}

          </div>

        </section>


        {/* =====================================================
            PRODUITS
        ====================================================== */}

        <section
          id="produits"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >

          <div className="mb-8 flex items-end justify-between gap-4">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-1 w-8 rounded-full bg-[#ce1126]" />

                <span className="text-xs font-bold uppercase tracking-wider text-[#ce1126] sm:text-sm">
                  À découvrir
                </span>

              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Produits disponibles
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Une sélection de produits disponibles sur MarketMali.
              </p>

            </div>


            {produits.length > 8 && (

              <Link
                href="/produits"
                className="hidden shrink-0 text-sm font-bold text-[#14a800] transition hover:text-[#087f00] hover:underline sm:block"
              >
                Voir tous les produits →
              </Link>

            )}

          </div>


          {produits.length > 0 ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

              {produits
                .slice(0, 8)
                .map((produit) => (

                  <ProductCard
                    key={produit.uuid}
                    produit={produit}
                  />

                ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              Aucun produit disponible pour le moment.
            </div>

          )}


          {produits.length > 8 && (

            <div className="mt-8 text-center sm:hidden">

              <Link
                href="/produits"
                className="inline-flex rounded-xl border border-[#14a800] px-5 py-3 text-sm font-bold text-[#14a800] transition hover:bg-[#14a800] hover:text-white"
              >
                Voir tous les produits
              </Link>

            </div>

          )}

        </section>


        {/* =====================================================
            COMMENT ÇA MARCHE
        ====================================================== */}

        <section className="border-y border-gray-100 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <div className="mb-2 flex items-center justify-center gap-2">

                <span className="h-1 w-8 rounded-full bg-[#14a800]" />

                <span className="text-xs font-bold uppercase tracking-wider text-[#14a800] sm:text-sm">
                  Simple et rapide
                </span>

                <span className="h-1 w-8 rounded-full bg-[#ce1126]" />

              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Comment ça marche ?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                MarketMali simplifie vos achats en ligne,
                de la recherche jusqu'à la livraison.
              </p>

            </div>


            <div className="mt-10 grid gap-5 md:grid-cols-3">

              {/* ÉTAPE 1 */}

              <div className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14a800]/10 text-2xl">
                  🔎
                </div>

                <div className="mt-5">

                  <span className="text-xs font-bold uppercase tracking-wider text-[#14a800]">
                    Étape 01
                  </span>

                  <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                    Trouvez
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Recherchez un produit ou explorez
                    les catégories et boutiques.
                  </p>

                </div>

              </div>


              {/* ÉTAPE 2 */}

              <div className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcd116]/20 text-2xl">
                  🛒
                </div>

                <div className="mt-5">

                  <span className="text-xs font-bold uppercase tracking-wider text-[#9a7800]">
                    Étape 02
                  </span>

                  <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                    Commandez
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Ajoutez vos produits au panier et
                    passez votre commande en quelques clics.
                  </p>

                </div>

              </div>


              {/* ÉTAPE 3 */}

              <div className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ce1126]/10 text-2xl">
                  🚚
                </div>

                <div className="mt-5">

                  <span className="text-xs font-bold uppercase tracking-wider text-[#ce1126]">
                    Étape 03
                  </span>

                  <h3 className="mt-1 text-lg font-extrabold text-gray-900">
                    Recevez
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Suivez votre commande et recevez
                    vos produits à l'adresse indiquée.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CTA
        ====================================================== */}

        <section className="px-4 py-16 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#14a800]">

            <div className="relative px-6 py-12 sm:px-10 lg:px-16 lg:py-14">

              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#fcd116]/20" />

              <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-[#ce1126]/20" />


              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

                <div className="max-w-2xl">

                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#fcd116] sm:text-sm">
                    MarketMali
                  </p>

                  <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                    Prêt à découvrir votre prochain produit ?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
                    Parcourez nos boutiques et trouvez les
                    produits qui correspondent à vos besoins.
                  </p>

                </div>


                <Link
                  href="/produits"
                  className="
                    shrink-0
                    rounded-xl
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-[#087f00]
                    shadow-lg
                    transition
                    hover:bg-[#fcd116]
                    hover:text-gray-900
                  "
                >
                  Commencer mes achats
                  <span className="ml-2">
                    →
                  </span>
                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="border-t border-gray-200 bg-white">

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

              {/* BRAND */}

              <div className="sm:col-span-2 lg:col-span-2">

                <Link
                  href="/"
                  className="text-2xl font-extrabold tracking-tight"
                >
                  <span className="text-[#14a800]">
                    Market
                  </span>

                  <span className="text-[#fcd116]">
                    M
                  </span>

                  <span className="text-[#ce1126]">
                    ali
                  </span>
                </Link>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                  La marketplace qui rapproche les clients
                  des boutiques et vendeurs locaux au Mali.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span>🇲🇱</span>
                  <span>Fait pour le Mali.</span>
                </div>

              </div>


              {/* NAVIGATION */}

              <div>

                <h3 className="text-sm font-bold text-gray-900">
                  Marketplace
                </h3>

                <div className="mt-4 flex flex-col gap-3">

                  <Link
                    href="/produits"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Produits
                  </Link>

                  <Link
                    href="/boutiques"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Boutiques
                  </Link>

                  <Link
                    href="/categories"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Catégories
                  </Link>

                </div>

              </div>


              {/* CLIENT */}

              <div>

                <h3 className="text-sm font-bold text-gray-900">
                  Mon espace
                </h3>

                <div className="mt-4 flex flex-col gap-3">

                  <Link
                    href="/compte"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Mon compte
                  </Link>

                  <Link
                    href="/panier"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Mon panier
                  </Link>

                  <Link
                    href="/commandes"
                    className="text-sm text-gray-500 transition hover:text-[#14a800]"
                  >
                    Mes commandes
                  </Link>

                </div>

              </div>

            </div>


            <div className="mt-10 border-t border-gray-100 pt-6">

              <p className="text-center text-xs text-gray-400 sm:text-left">
                © {new Date().getFullYear()} MarketMali. Tous droits réservés.
              </p>

            </div>

          </div>


          {/* Bande Mali */}

          <div className="flex h-1">

            <div className="flex-1 bg-[#14a800]" />

            <div className="flex-1 bg-[#fcd116]" />

            <div className="flex-1 bg-[#ce1126]" />

          </div>

        </footer>

      </main>

    </div>
  );
}