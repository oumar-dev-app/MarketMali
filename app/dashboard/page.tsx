"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import StatCard from "./composants/StatCard";
import RecentCommandes from "./composants/RecentCommandes";
import TopProduits from "./composants/TopProduits";
import VentesChart from "./composants/VentesChart";

import { useAuth } from "@/contexts/AuthContext";

import {
  FaBox,
  FaTags,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaRoute,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
} from "react-icons/fa";

interface LivraisonLivreur {
  id: number;
  uuid: string;
  commande_id: number;
  commande_uuid: string;

  status:
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

  commentaire: string | null;

  assigned_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;

  commande_total: string;
  commande_status: string;

  adresse_livraison: string | null;
  zone_livraison: string;

  latitude: number | null;
  longitude: number | null;

  client_nom: string;
  client_prenom: string;
  client_telephone: string;
}

interface Statistiques {
  nombre_clients: number;
  nombre_produits: number;
  nombre_categories: number;
  nombre_commandes: number;
  commandes_en_attente: number;
  commandes_livrees: number;
  produits_en_rupture: number;
  chiffre_affaires: number;
}

interface Commande {
  uuid: string;
  total: string;
  frais_livraison: string;
  status: string;

  adresse_livraison: string | null;
  latitude: string | null;
  longitude: string | null;
  gps_precision: string | null;

  created_at: string;
  updated_at: string;

  boutique: {
    nom: string;
    slug: string;
  };

  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
}

interface Vente {
  mois: string;
  ventes: string | number;
}

interface ProduitVendu {
  nom: string;
  quantite_vendue: number | string;
  chiffre_affaires: number | string;
}

/* =========================================================
   DASHBOARD LIVREUR
========================================================= */


function LivreurDashboard({
  token,
}: {
  token: string;
}) {
  const [livraisons, setLivraisons] =
    useState<LivraisonLivreur[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadLivraisons = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/livraisons",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        console.error(
          "Erreur API livraisons :",
          data.message
        );

        return;
      }

      setLivraisons(
        Array.isArray(data.data)
          ? data.data
          : []
      );

    } catch (error) {

      console.error(
        "Erreur chargement livraisons :",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadLivraisons();
  }, [token]);

  /*
   * =========================================================
   * STATISTIQUES
   * =========================================================
   */

  const assigned =
    livraisons.filter(
      (item) =>
        item.status === "assigned"
    ).length;

  const active =
    livraisons.filter(
      (item) =>
        item.status === "picked_up" ||
        item.status === "in_transit"
    ).length;

  const delivered =
    livraisons.filter(
      (item) =>
        item.status === "delivered"
    ).length;

  const cancelled =
    livraisons.filter(
      (item) =>
        item.status === "cancelled"
    ).length;

  /*
   * =========================================================
   * LIVRAISON ACTUELLE
   * =========================================================
   */

  const currentDelivery =
    livraisons.find(
      (item) =>
        item.status === "in_transit"
    ) ??
    livraisons.find(
      (item) =>
        item.status === "picked_up"
    ) ??
    livraisons.find(
      (item) =>
        item.status === "assigned"
    ) ??
    null;

  /*
   * =========================================================
   * LABEL STATUT
   * =========================================================
   */

  const getStatusLabel = (
    status: LivraisonLivreur["status"]
  ) => {
    switch (status) {

      case "assigned":
        return "Assignée";

      case "picked_up":
        return "Commande récupérée";

      case "in_transit":
        return "En livraison";

      case "delivered":
        return "Livrée";

      case "cancelled":
        return "Annulée";

      default:
        return status;
    }
  };

  /*
   * =========================================================
   * CLASSE STATUT
   * =========================================================
   */

  const getStatusClass = (
    status: LivraisonLivreur["status"]
  ) => {
    switch (status) {

      case "assigned":
        return "bg-yellow-100 text-yellow-700";

      case "picked_up":
        return "bg-blue-100 text-blue-700";

      case "in_transit":
        return "bg-indigo-100 text-indigo-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}

        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />

      </div>
    );
  }

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <div className="space-y-6">

      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Tableau de bord livreur
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Suivez rapidement votre activité de livraison.
          </p>
        </div>

        <Link
          href="/dashboard/livraisons"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FaTruck size={15} />

          Gérer mes livraisons
        </Link>

      </div>


      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

        {/* Assignées */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Assignées
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {assigned}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
              <FaClock size={18} />
            </div>

          </div>

        </div>


        {/* En cours */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                En cours
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {active}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FaRoute size={18} />
            </div>

          </div>

        </div>


        {/* Livrées */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Livrées
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {delivered}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <FaCheckCircle size={18} />
            </div>

          </div>

        </div>


        {/* Annulées */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-xs font-medium text-gray-500 sm:text-sm">
                Annulées
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {cancelled}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <FaTruck size={18} />
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          LIVRAISON ACTUELLE
      ===================================================== */}

      {currentDelivery ? (

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Header */}

          <div className="border-b border-gray-100 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <FaTruck size={19} />
                </div>

                <div>

                  <p className="text-xs font-medium text-gray-500">
                    Livraison actuelle
                  </p>

                  <h2 className="text-lg font-bold text-gray-900">
                    Commande #{currentDelivery.commande_id}
                  </h2>

                </div>

              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                  currentDelivery.status
                )}`}
              >
                {getStatusLabel(
                  currentDelivery.status
                )}
              </span>

            </div>

          </div>


          {/* Informations */}

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">

            {/* Client */}

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Client
              </p>

              <p className="font-semibold text-gray-900">
                {currentDelivery.client_prenom}{" "}
                {currentDelivery.client_nom}
              </p>

              <a
                href={`tel:${currentDelivery.client_telephone}`}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <FaPhone size={13} />

                {currentDelivery.client_telephone}
              </a>

            </div>


            {/* Adresse */}

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Adresse
              </p>

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <FaMapMarkerAlt size={14} />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-900">
                    {currentDelivery.adresse_livraison ||
                      "Adresse non renseignée"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Zone : {currentDelivery.zone_livraison}
                  </p>

                </div>

              </div>

            </div>


            {/* Commande */}

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Commande
              </p>

              <p className="text-lg font-bold text-gray-900">
                {Number(
                  currentDelivery.commande_total
                ).toLocaleString("fr-FR")}{" "}
                FCFA
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Statut commande :{" "}
                <span className="font-medium text-gray-700">
                  {currentDelivery.commande_status}
                </span>
              </p>

            </div>

          </div>


          {/* Localisation */}

          {currentDelivery.latitude !== null &&
            currentDelivery.longitude !== null && (

              <div className="border-t border-gray-100 p-5 sm:p-6">

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${currentDelivery.latitude},${currentDelivery.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  <FaMapMarkerAlt />

                  Voir la localisation
                </a>

              </div>

            )}


          {/* Action principale */}

          <div className="border-t border-gray-100 p-5 sm:p-6">

            <Link
              href="/dashboard/livraisons"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FaTruck size={17} />

              Gérer cette livraison
            </Link>

          </div>

        </section>

      ) : (

        /* =====================================================
           AUCUNE LIVRAISON
        ===================================================== */

        <section className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <FaTruck size={26} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Aucune livraison en cours
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Vous n'avez actuellement aucune livraison
            assignée ou en cours.
          </p>

          <Link
            href="/dashboard/livraisons"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FaTruck size={15} />

            Consulter mes livraisons
          </Link>

        </section>

      )}


      {/* =====================================================
          RÉSUMÉ
      ===================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-gray-900">
              Besoin de gérer vos livraisons ?
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Retrouvez toutes vos livraisons, leur historique,
              les statuts et les actions disponibles.
            </p>

          </div>

          <Link
            href="/dashboard/livraisons"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Voir toutes les livraisons
          </Link>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   DASHBOARD PRINCIPAL
========================================================= */

export default function DashboardPage() {

  const {
    token,
    loading,
    user,
  } = useAuth();

  const [stats, setStats] =
    useState<Statistiques | null>(
      null
    );

  const [commandes, setCommandes] =
    useState<Commande[]>([]);

  const [ventes, setVentes] =
    useState<Vente[]>([]);

  const [topProduits, setTopProduits] =
    useState<ProduitVendu[]>([]);

  /*
   * Le dashboard commercial ne doit pas
   * charger ses statistiques pour un livreur.
   */
  useEffect(() => {

    if (
      loading ||
      !token ||
      user?.role === "livreur"
    ) {
      return;
    }

    async function loadDashboard() {

      try {

        const headers = {
          Authorization:
            `Bearer ${token}`,
        };

        const [
          statsResponse,
          commandesResponse,
          ventesResponse,
          topProduitsResponse,
        ] = await Promise.all([

          fetch(
            "/api/dashboard/statistiques",
            { headers }
          ),

          fetch(
            "/api/dashboard/commandes",
            { headers }
          ),

          fetch(
            "/api/dashboard/ventes",
            { headers }
          ),

          fetch(
            "/api/dashboard/top-produits",
            { headers }
          ),

        ]);

        const statsData =
          await statsResponse.json();

        const commandesData =
          await commandesResponse.json();

        const ventesData =
          await ventesResponse.json();

        const topProduitsData =
          await topProduitsResponse.json();

        if (
          statsData.success
        ) {
          setStats(
            statsData.data
          );
        }

        if (commandesData.success) {
          setCommandes(
            Array.isArray(commandesData.data)
              ? commandesData.data
              : []
          );
        }

        if (
          ventesData.success
        ) {
          setVentes(
            ventesData.data
          );
        }

        if (
          topProduitsData.success
        ) {
          setTopProduits(
            topProduitsData.data
          );
        }

      } catch (error) {

        console.error(
          "Erreur chargement dashboard:",
          error
        );

      }
    }

    loadDashboard();

  }, [
    token,
    loading,
    user?.role,
  ]);

  /*
   * Dashboard spécifique au livreur.
   */
  if (
    loading ||
    !user
  ) {
    return (
      <p className="animate-pulse">
        Chargement...
      </p>
    );
  }

  if (
    user.role === "livreur"
  ) {

    if (!token) {
      return (
        <p className="animate-pulse">
          Vérification de la session...
        </p>
      );
    }

    return (
      <LivreurDashboard
        token={token}
      />
    );
  }

  /*
   * Dashboard vendeur/admin/super-admin.
   */
  if (!stats) {

    return (
      <p className="animate-pulse">
        Chargement des statistiques...
      </p>
    );
  }

  return (
    <div>

      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Tableau de bord
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de votre activité.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">

        <StatCard
          title="Produits"
          value={stats.nombre_produits}
          icon={<FaBox />}
          color="bg-blue-100"
        />

        <StatCard
          title="Catégories"
          value={stats.nombre_categories}
          icon={<FaTags />}
          color="bg-purple-100"
        />

        <StatCard
          title="Commandes"
          value={stats.nombre_commandes}
          icon={<FaShoppingCart />}
          color="bg-green-100"
        />

        <StatCard
          title="Commandes en attente"
          value={stats.commandes_en_attente}
          icon={<FaClock />}
          color="bg-yellow-100"
        />

        <StatCard
          title="Commandes livrées"
          value={stats.commandes_livrees}
          icon={<FaCheckCircle />}
          color="bg-green-100"
        />

        <StatCard
          title="Produits en rupture"
          value={stats.produits_en_rupture}
          icon={<FaExclamationTriangle />}
          color="bg-red-100"
        />

        <StatCard
          title="Chiffre d'affaires"
          value={`${Number(
            stats.chiffre_affaires
          ).toLocaleString()} FCFA`}
          icon={<FaMoneyBillWave />}
          color="bg-emerald-100"
        />

        <StatCard
          title="Clients"
          value={stats.nombre_clients}
          icon={<FaUsers />}
          color="bg-indigo-100"
        />

      </div>

      <RecentCommandes
        commandes={commandes}
      />

      <VentesChart
        ventes={ventes}
      />

      <TopProduits
        produits={topProduits}
      />

    </div>
  );
}