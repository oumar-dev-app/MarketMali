import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Store,
  Truck,
} from "lucide-react";

import { getProduit } from "@/lib/api/produits";
import Navbar from "@/components/Navbar";
import AddToCartButton from "@/components/AddToCartButton";

interface PageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default async function ProduitPage({
  params,
}: PageProps) {
  const { uuid } = await params;

  const produit = await getProduit(uuid);

  return (
    <main className="min-h-screen bg-[#f6f8f7]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* RETOUR */}
        <div className="mb-6">
          <a
            href="/produits"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-gray-600
              transition
              hover:text-green-700
            "
          >
            <ArrowLeft size={17} />
            Retour aux produits
          </a>
        </div>

        {/* FIL D'ARIANE */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <a
            href="/"
            className="hover:text-green-700"
          >
            Accueil
          </a>

          <span>/</span>

          <a
            href="/produits"
            className="hover:text-green-700"
          >
            Produits
          </a>

          {produit.categorie && (
            <>
              <span>/</span>
              <span className="text-gray-700">
                {produit.categorie.nom}
              </span>
            </>
          )}
        </div>

        {/* PRODUIT */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

          {/* IMAGE */}
          <div>
            <div
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-gray-200
                bg-white
                shadow-sm
              "
            >
              <div className="flex min-h-105 items-center justify-center sm:min-h-125">

                {produit.image ? (
                  <img
                    src={produit.image}
                    alt={produit.nom}
                    className="
                      h-full
                      max-h-125
                      w-full
                      object-contain
                      p-6
                      sm:p-10
                    "
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package size={58} strokeWidth={1.4} />

                    <span className="mt-3 text-sm">
                      Aucune image disponible
                    </span>
                  </div>
                )}

              </div>

              {/* BADGE STOCK */}
              <div className="absolute left-5 top-5">
                {produit.stock > 0 ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-green-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-green-700
                      ring-1
                      ring-green-200
                    "
                  >
                    <CheckCircle2 size={14} />
                    Disponible
                  </span>
                ) : (
                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-red-700
                      ring-1
                      ring-red-200
                    "
                  >
                    Rupture de stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* INFORMATIONS */}
          <div className="flex flex-col">

            {/* CATEGORIE */}
            {produit.categorie && (
              <div className="mb-4">
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-yellow-50
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-yellow-700
                    ring-1
                    ring-yellow-200
                  "
                >
                  {produit.categorie.nom}
                </span>
              </div>
            )}

            {/* NOM */}
            <h1
              className="
                text-3xl
                font-extrabold
                leading-tight
                tracking-tight
                text-gray-900
                sm:text-4xl
              "
            >
              {produit.nom}
            </h1>

            {/* PRIX */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500">
                Prix
              </p>

              <p
                className="
                  mt-1
                  text-3xl
                  font-extrabold
                  tracking-tight
                  text-green-700
                  sm:text-4xl
                "
              >
                {Number(produit.prix).toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            {/* SEPARATION */}
            <div className="my-7 h-px bg-gray-200" />

            {/* DESCRIPTION */}
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {produit.description ||
                  "Aucune description disponible pour ce produit."}
              </p>
            </div>

            {/* INFORMATIONS */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              {/* STOCK */}
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-4
                "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-green-50
                      text-green-700
                    "
                  >
                    <Package size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Stock disponible
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-gray-900">
                      {produit.stock > 0
                        ? `${produit.stock} unité${
                            produit.stock > 1 ? "s" : ""
                          }`
                        : "Rupture de stock"}
                    </p>
                  </div>

                </div>
              </div>

              {/* BOUTIQUE */}
              {produit.boutique && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-4
                  "
                >
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-yellow-50
                        text-yellow-700
                      "
                    >
                      <Store size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Boutique
                      </p>

                      <p className="mt-0.5 truncate text-sm font-bold text-gray-900">
                        {produit.boutique.nom}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* LIVRAISON */}
            <div
              className="
                mt-5
                rounded-2xl
                border
                border-green-100
                bg-green-50/70
                p-4
              "
            >
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-100
                    text-green-700
                  "
                >
                  <Truck size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Livraison disponible
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Les frais de livraison sont calculés selon
                    votre zone au moment de la commande.
                  </p>
                </div>

              </div>
            </div>

            {/* BOUTON */}
            <div className="mt-8">

              {produit.stock > 0 ? (
                <div className="w-full">
                  <AddToCartButton produit={produit} />
                </div>
              ) : (
                <button
                  disabled
                  className="
                    w-full
                    cursor-not-allowed
                    rounded-2xl
                    bg-gray-200
                    px-6
                    py-4
                    text-sm
                    font-bold
                    text-gray-500
                  "
                >
                  Produit indisponible
                </button>
              )}

            </div>

            {/* GARANTIES */}
            <div className="mt-7 grid gap-3 border-t border-gray-200 pt-6 sm:grid-cols-3">

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-green-600"
                />
                Commande sécurisée
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck
                  size={16}
                  className="shrink-0 text-green-600"
                />
                Livraison locale
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin
                  size={16}
                  className="shrink-0 text-green-600"
                />
                Suivi GPS
              </div>

            </div>

          </div>
        </div>

      </section>
    </main>
  );
}

