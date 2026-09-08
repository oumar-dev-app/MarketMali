"use client";

import Link from "next/link";
import {
  FaBox,
  FaTags,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaStore,
  FaBullhorn,
  FaTruck,
  FaArrowRight,
} from "react-icons/fa";

import StatCard from "../StatCard";
import RecentCommandes from "../RecentCommandes";
import TopProduits from "../TopProduits";
import VentesChart from "../VentesChart";

import type {
  Statistiques,
  Commande,
  Vente,
  ProduitVendu,
} from "./types";

interface VendeurDashboardProps {
  stats: Statistiques;
  commandes: Commande[];
  ventes: Vente[];
  topProduits: ProduitVendu[];
}

export default function VendeurDashboard({
  stats,
  commandes,
  ventes,
  topProduits,
}: VendeurDashboardProps) {
  return (
    <div className="space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <FaStore size={11} />
            Espace vendeur
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Tableau de bord
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-gray-500 sm:text-base">
            Suivez les performances de votre boutique, vos commandes et vos
            ventes depuis un seul espace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/produits"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FaBox size={14} />
            Mes produits
          </Link>

          <Link
            href="/dashboard/commandes"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FaShoppingCart size={14} />
            Mes commandes
          </Link>
        </div>
      </div>


      {/* =====================================================
          INDICATEURS PRINCIPAUX
      ===================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Vue commerciale
            </h2>

            <p className="text-xs text-gray-500 sm:text-sm">
              Les chiffres clés de votre activité.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

          <StatCard
            title="Produits"
            value={stats.nombre_produits}
            icon={<FaBox />}
            color="blue"
          />

          <StatCard
            title="Commandes"
            value={stats.nombre_commandes}
            icon={<FaShoppingCart />}
            color="purple"
          />

          <StatCard
            title="En attente"
            value={stats.commandes_en_attente}
            icon={<FaClock />}
            color="orange"
          />

          <StatCard
            title="Chiffre d'affaires"
            value={`${Number(stats.chiffre_affaires).toLocaleString("fr-FR")} FCFA`}
            icon={<FaMoneyBillWave />}
            color="green"
          />

        </div>
      </section>


      {/* =====================================================
          ÉTAT DE LA BOUTIQUE
      ===================================================== */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Commandes livrées
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.commandes_livrees}
              </p>

              <p className="mt-1 text-xs text-green-600">
                Commandes finalisées
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaCheckCircle size={19} />
            </div>

          </div>
        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Produits en rupture
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.produits_en_rupture}
              </p>

              <p
                className={`mt-1 text-xs ${
                  stats.produits_en_rupture > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {stats.produits_en_rupture > 0
                  ? "Stock à réapprovisionner"
                  : "Stock disponible"}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                stats.produits_en_rupture > 0
                  ? "bg-orange-50 text-orange-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              <FaExclamationTriangle size={19} />
            </div>

          </div>
        </div>


        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Clients
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.nombre_clients}
              </p>

              <p className="mt-1 text-xs text-blue-600">
                Clients ayant commandé
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaUsers size={19} />
            </div>

          </div>
        </div>

      </section>


      {/* =====================================================
          ACTIONS RAPIDES
      ===================================================== */}

      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Actions rapides
          </h2>

          <p className="text-xs text-gray-500 sm:text-sm">
            Accédez rapidement aux fonctions principales de votre boutique.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <Link
            href="/dashboard/produits"
            className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaBox size={17} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Gérer les produits
            </h3>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-blue-600">
              Voir les produits
              <FaArrowRight size={10} />
            </div>
          </Link>


          <Link
            href="/dashboard/promotions"
            className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md sm:p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FaBullhorn size={17} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Promotions
            </h3>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-purple-600">
              Créer une offre
              <FaArrowRight size={10} />
            </div>
          </Link>


          <Link
            href="/dashboard/commandes"
            className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FaShoppingCart size={17} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Commandes
            </h3>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-orange-600">
              Gérer les commandes
              <FaArrowRight size={10} />
            </div>
          </Link>


          <Link
            href="/dashboard/livraisons"
            className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md sm:p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaTruck size={17} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              Livraisons
            </h3>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-green-600">
              Suivre les livraisons
              <FaArrowRight size={10} />
            </div>
          </Link>

        </div>
      </section>


      {/* =====================================================
          COMMANDES RÉCENTES
      ===================================================== */}

      <section>
        <RecentCommandes commandes={commandes} />
      </section>


      {/* =====================================================
          VENTES
      ===================================================== */}

      <section>
        <VentesChart ventes={ventes} />
      </section>


      {/* =====================================================
          TOP PRODUITS
      ===================================================== */}

      <section>
        <TopProduits produits={topProduits} />
      </section>


      {/* =====================================================
          RACCOURCIS BAS DE PAGE
      ===================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <FaTags className="text-blue-600" size={16} />

              <h2 className="text-base font-semibold text-gray-900">
                Développez votre boutique
              </h2>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Ajoutez de nouveaux produits, créez des promotions et optimisez
              vos conditions de livraison pour augmenter vos ventes.
            </p>
          </div>

          <Link
            href="/dashboard/promotions"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FaBullhorn size={13} />
            Gérer mes promotions
          </Link>

        </div>
      </section>

    </div>
  );
}
