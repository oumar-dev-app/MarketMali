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
import ProductInteractiveSection from "./components/ProductInteractiveSection";
import ProductReviews from "./components/ProductReviews";

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
        <ProductInteractiveSection produit={produit} />

        <ProductReviews produitUuid={uuid} />
      </section>
    </main>
  );
}

