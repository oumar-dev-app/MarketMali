"use client";

import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Store,
  Truck,
  Users,
  Tags,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

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

interface AdminDashboardProps {
  stats: Statistiques;
  commandes: Commande[];
  ventes: Vente[];
  topProduits: ProduitVendu[];
}

export default function AdminDashboard({
  stats,
  commandes,
  ventes,
  topProduits,
}: AdminDashboardProps) {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* =========================================================
          HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-7">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
            <ShieldCheck size={14} />
            Administration MarketMali
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tableau de bord
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Supervisez l'activité commerciale de la plateforme,
            les commandes, les produits et les performances globales.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      {/* =========================================================
          STATISTIQUES PRINCIPALES
      ========================================================= */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Vue globale
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Principaux indicateurs de MarketMali
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 sm:flex">
            <BarChart3 size={15} />
            Activité globale
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Produits"
            value={stats.nombre_produits}
            icon={<Boxes size={20} />}
          />

          <StatCard
            title="Commandes"
            value={stats.nombre_commandes}
            icon={<ClipboardList size={20} />}
          />

          <StatCard
            title="Clients"
            value={stats.nombre_clients}
            icon={<Users size={20} />}
          />

          <StatCard
            title="Chiffre d'affaires"
            value={formatMoney(stats.chiffre_affaires)}
            icon={<BarChart3 size={20} />}
          />
        </div>
      </section>

      {/* =========================================================
          INDICATEURS SECONDAIRES
      ========================================================= */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Commandes en attente"
          value={stats.commandes_en_attente}
          icon={<ClipboardList size={20} />}
        />

        <StatCard
          title="Commandes livrées"
          value={stats.commandes_livrees}
          icon={<Truck size={20} />}
        />

        <StatCard
          title="Produits en rupture"
          value={stats.produits_en_rupture}
          icon={<AlertTriangle size={20} />}
        />

        <StatCard
          title="Catégories"
          value={stats.nombre_categories}
          icon={<Tags size={20} />}
        />
      </section>

      {/* =========================================================
          ACCÈS RAPIDES ADMINISTRATION
      ========================================================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Gestion de la plateforme
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Accédez rapidement aux principales sections administratives.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Link
            href="/dashboard/boutiques"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Store size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Boutiques
            </h3>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Superviser les boutiques présentes sur MarketMali.
            </p>
          </Link>

          <Link
            href="/dashboard/utilisateurs"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Users size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Utilisateurs
            </h3>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Consulter et gérer les utilisateurs de la plateforme.
            </p>
          </Link>

          <Link
            href="/dashboard/commandes"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ClipboardList size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Commandes
            </h3>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Suivre les commandes et leur évolution.
            </p>
          </Link>

          <Link
            href="/dashboard/livraisons"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Truck size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Livraisons
            </h3>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Superviser les opérations de livraison.
            </p>
          </Link>

        </div>
      </section>

      {/* =========================================================
          COMMANDES + VENTES
      ========================================================= */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                Commandes récentes
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Activité récente de la plateforme
              </p>
            </div>

            <Link
              href="/dashboard/commandes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Voir tout
              <ArrowRight size={14} />
            </Link>
          </div>

          <RecentCommandes commandes={commandes} />
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">
              Évolution des ventes
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Chiffre d'affaires enregistré par mois
            </p>
          </div>

          <VentesChart ventes={ventes} />
        </div>

      </section>

      {/* =========================================================
          TOP PRODUITS
      ========================================================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900">
              Produits les plus performants
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Top 5 des produits selon leur chiffre d'affaires
            </p>
          </div>

          <Link
            href="/dashboard/produits"
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Gérer les produits
            <ArrowRight size={14} />
          </Link>
        </div>

        <TopProduits produits={topProduits} />
      </section>

      {/* =========================================================
          BLOC FINAL
      ========================================================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Administration de MarketMali
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                Utilisez les outils d'administration pour assurer
                le bon fonctionnement de la plateforme et superviser
                son activité.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/boutiques"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Store size={16} />
              Boutiques
            </Link>

            <Link
              href="/dashboard/livreurs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Truck size={16} />
              Livreurs
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
