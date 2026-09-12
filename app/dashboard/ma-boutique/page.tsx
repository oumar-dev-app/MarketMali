"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  ExternalLink,
  Pencil,
  Package,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  ArrowLeft,
  Truck,
  Settings2,
  Users,
  Tag,
  Lock,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";

import CreateBoutiqueStep from "@/app/dashboard/_components/boutique-setup/CreateBoutiqueStep";
import AddProductStep from "@/app/dashboard/_components/boutique-setup/AddProductStep";
import DeliveryConfigurationStep from "@/app/dashboard/_components/boutique-setup/DeliveryConfigurationStep";
import AddLivreurStep from "../_components/boutique-setup/AddLivreurStep";
import DeliveryRatesStep from "@/app/dashboard/_components/boutique-setup/DeliveryRatesStep";
import PromotionStep from "@/app/dashboard/_components/boutique-setup/PromotionStep";

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  status: "active" | "pending" | "blocked";
  livraison_configuree: boolean;
  activation_expires_at: string | null;
  created_at: string;
}

interface BoutiqueResponse {
  success: boolean;
  message?: string;
  data: Boutique | null;
}

interface ListResponse {
  success: boolean;
  data: unknown[];
}

const TOTAL_STEPS = 6;

export default function MaBoutiquePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [boutique, setBoutique] =
    useState<Boutique | null>(null);

  const [hasProducts, setHasProducts] =
    useState(false);

  const [hasLivreur, setHasLivreur] =
    useState(false);

  const [hasDeliveryRates, setHasDeliveryRates] =
    useState(false);

  const [hasPromotion, setHasPromotion] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /**
   * ------------------------------------------------------------
   * RÉCUPÉRATION DE L'ÉTAT RÉEL DE L'ONBOARDING
   * ------------------------------------------------------------
   *
   * La base de données reste la source de vérité.
   * Aucun état d'avancement n'est enregistré dans localStorage.
   */
  const fetchBoutiqueState = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const result =
          await apiGet<BoutiqueResponse>(
            "/dashboard/boutiques"
          );

        const currentBoutique =
          result?.data ?? null;

        setBoutique(currentBoutique);

        if (!currentBoutique) {
          setHasProducts(false);
          setHasLivreur(false);
          setHasDeliveryRates(false);
          setHasPromotion(false);

          return;
        }

        const [
          productsResult,
          livreursResult,
          tarifsResult,
          promotionsResult,
        ] = await Promise.allSettled([
          apiGet<ListResponse>(
            "/dashboard/produit?mine=true"
          ),

          apiGet<ListResponse>(
            "/dashboard/livreurs"
          ),

          apiGet<ListResponse>(
            "/dashboard/tarifs-livraison"
          ),

          apiGet<ListResponse>(
            "/promotions"
          ),
        ]);

        if (productsResult.status === "fulfilled") {
          setHasProducts(
            Array.isArray(productsResult.value?.data) &&
              productsResult.value.data.length > 0
          );
        } else {
          console.error(
            "Erreur récupération produits :",
            productsResult.reason
          );

          setHasProducts(false);
        }

        if (livreursResult.status === "fulfilled") {
          setHasLivreur(
            Array.isArray(livreursResult.value?.data) &&
              livreursResult.value.data.length > 0
          );
        } else {
          console.error(
            "Erreur récupération livreurs :",
            livreursResult.reason
          );

          setHasLivreur(false);
        }

        if (tarifsResult.status === "fulfilled") {
          setHasDeliveryRates(
            Array.isArray(tarifsResult.value?.data) &&
              tarifsResult.value.data.length > 0
          );
        } else {
          console.error(
            "Erreur récupération tarifs :",
            tarifsResult.reason
          );

          setHasDeliveryRates(false);
        }

        if (promotionsResult.status === "fulfilled") {
          setHasPromotion(
            Array.isArray(
              promotionsResult.value?.data
            ) &&
              promotionsResult.value.data.length > 0
          );
        } else {
          console.error(
            "Erreur récupération promotions :",
            promotionsResult.reason
          );

          setHasPromotion(false);
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer votre boutique."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "vendeur") {
      router.push("/dashboard");
      return;
    }

    fetchBoutiqueState(true);
  }, [
    user,
    authLoading,
    router,
    fetchBoutiqueState,
  ]);

  /**
   * ------------------------------------------------------------
   * PROGRESSION
   * ------------------------------------------------------------
   */

  const completedSteps =
    (boutique ? 1 : 0) +
    (hasProducts ? 1 : 0) +
    (boutique?.livraison_configuree ? 1 : 0) +
    (hasLivreur ? 1 : 0) +
    (hasDeliveryRates ? 1 : 0) +
    (hasPromotion ? 1 : 0);

  const progress =
    (completedSteps / TOTAL_STEPS) * 100;

  /**
   * Première étape non terminée.
   *
   * Même si plusieurs éléments existent déjà en base,
   * on ne rend active qu'une seule étape à la fois.
   */
  const activeStep =
    !boutique
      ? 1
      : !hasProducts
        ? 2
        : !boutique.livraison_configuree
          ? 3
          : !hasLivreur
            ? 4
            : !hasDeliveryRates
              ? 5
              : !hasPromotion
                ? 6
                : null;

  /**
   * ------------------------------------------------------------
   * VALIDATION D'UNE ÉTAPE
   * ------------------------------------------------------------
   */
  const handleStepCompleted = async () => {
    await fetchBoutiqueState(false);
  };

  /**
   * ------------------------------------------------------------
   * CHARGEMENT
   * ------------------------------------------------------------
   */

  if (authLoading || loading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-10 w-56 bg-gray-200 rounded-xl animate-pulse" />

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />

              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-80 max-w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 bg-white border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * ------------------------------------------------------------
   * ERREUR
   * ------------------------------------------------------------
   */

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Impossible de charger votre boutique
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchBoutiqueState(true)
              }
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * ONBOARDING
   * ============================================================
   */

  if (completedSteps < TOTAL_STEPS) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div>
                <p className="text-sm text-gray-500">
                  Espace vendeur
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Bienvenue sur MarketMali 👋
                </h1>
              </div>
            </div>
          </div>

          {/* INTRODUCTION + PROGRESSION */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="h-2 bg-gray-900" />

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="max-w-3xl">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-5">
                  <Store className="w-7 h-7 text-white" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Configurez votre boutique
                </h2>

                <p className="text-gray-600 mt-3 leading-relaxed">
                  Votre espace vendeur est prêt. Nous allons maintenant
                  vous accompagner étape par étape pour préparer votre
                  boutique avant son ouverture aux clients.
                </p>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  Chaque étape est enregistrée directement dans votre
                  compte. Vous pouvez quitter cette page et revenir
                  plus tard : MarketMali reprendra automatiquement
                  là où vous vous êtes arrêté.
                </p>
              </div>

              {/* PROGRESSION */}
              <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Configuration de votre boutique
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Étape {activeStep} sur {TOTAL_STEPS}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {completedSteps}/{TOTAL_STEPS} étapes
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RÉSUMÉ DES ÉTAPES */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

            <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Votre parcours
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Les étapes suivantes seront débloquées automatiquement
                après validation de l'étape actuelle.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                {/* 1 */}
                <StepSummary
                  number={1}
                  title="Créer ma boutique"
                  completed={Boolean(boutique)}
                  active={activeStep === 1}
                />

                {/* 2 */}
                <StepSummary
                  number={2}
                  title="Ajouter mes produits"
                  completed={hasProducts}
                  active={activeStep === 2}
                  locked={!boutique}
                />

                {/* 3 */}
                <StepSummary
                  number={3}
                  title="Organiser mes livraisons"
                  completed={Boolean(
                    boutique?.livraison_configuree
                  )}
                  active={activeStep === 3}
                  locked={!hasProducts}
                />

                {/* 4 */}
                <StepSummary
                  number={4}
                  title="Ajouter un livreur"
                  completed={hasLivreur}
                  active={activeStep === 4}
                  locked={!boutique?.livraison_configuree}
                />

                {/* 5 */}
                <StepSummary
                  number={5}
                  title="Configurer les tarifs"
                  completed={hasDeliveryRates}
                  active={activeStep === 5}
                  locked={!hasLivreur}
                />

                {/* 6 */}
                <StepSummary
                  number={6}
                  title="Créer une promotion"
                  completed={hasPromotion}
                  active={activeStep === 6}
                  locked={!hasDeliveryRates}
                />

              </div>
            </div>
          </div>

          {/* ====================================================
              ÉTAPE ACTIVE
              ==================================================== */}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-5 sm:px-7 py-5 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Étape {activeStep}
                  </p>

                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                    {activeStep === 1 &&
                      "Créer votre boutique"}

                    {activeStep === 2 &&
                      "Ajouter votre premier produit"}

                    {activeStep === 3 &&
                      "Organiser vos livraisons"}

                    {activeStep === 4 &&
                      "Ajouter votre premier livreur"}

                    {activeStep === 5 &&
                      "Configurer vos tarifs de livraison"}

                    {activeStep === 6 &&
                      "Créer votre première promotion"}
                  </h2>
                </div>

                {refreshing && (
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualisation...
                  </div>
                )}

              </div>
            </div>

            <div className="p-5 sm:p-7">

              {activeStep === 1 && (
                <CreateBoutiqueStep
                  onCompleted={handleStepCompleted}
                />
              )}

              {activeStep === 2 && (
                <AddProductStep
                  onCompleted={handleStepCompleted}
                />
              )}

              {activeStep === 3 && (
                <DeliveryConfigurationStep
                  onCompleted={handleStepCompleted}
                />
              )}

              {activeStep === 4 && (
                <AddLivreurStep
                  onCompleted={handleStepCompleted}
                />
              )}

              {activeStep === 5 && (
                <DeliveryRatesStep
                  onCompleted={handleStepCompleted}
                />
              )}

              {activeStep === 6 && (
                <PromotionStep
                  onCompleted={handleStepCompleted}
                />
              )}

            </div>
          </div>

          {/* CONSEIL */}
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">

              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-blue-900">
                  Votre progression est sauvegardée
                </h3>

                <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                  Vous n'avez pas besoin de terminer les six étapes
                  immédiatement. Vous pouvez quitter votre espace vendeur
                  et revenir plus tard. MarketMali vérifiera automatiquement
                  ce qui a déjà été configuré.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * BOUTIQUE TERMINÉE
   * ============================================================
   */

  const statusConfig = {
    active: {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    pending: {
      label: "En attente",
      className:
        "bg-orange-50 text-orange-700 border-orange-200",
      icon: Clock,
    },
    blocked: {
      label: "Bloquée",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: Ban,
    },
  };

  const currentStatus =
    boutique?.status
      ? statusConfig[boutique.status]
      : statusConfig.pending;

  const StatusIcon =
    currentStatus.icon;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">

            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
              title="Retour au dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <p className="text-sm text-gray-500">
                Espace vendeur
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Ma boutique
              </h1>
            </div>

          </div>

          {boutique && (
            <div className="flex flex-wrap gap-2">

              <Link
                href={`/boutiques/${boutique.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Voir ma boutique
              </Link>

              <Link
                href={`/dashboard/boutiques/${boutique.uuid}/edit`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>

            </div>
          )}

        </div>

        {/* BOUTIQUE */}
        {boutique && (
          <>
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="p-6 sm:p-8">

                <div className="flex flex-col sm:flex-row gap-6">

                  <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">

                    {boutique.logo ? (
                      <img
                        src={boutique.logo}
                        alt={boutique.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-gray-400" />
                    )}

                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-2xl font-bold text-gray-900">
                        {boutique.nom}
                      </h2>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${currentStatus.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {currentStatus.label}
                      </span>

                    </div>

                    {boutique.description && (
                      <p className="text-gray-600 mt-3 leading-relaxed">
                        {boutique.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-gray-500">

                      {boutique.telephone && (
                        <span className="inline-flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {boutique.telephone}
                        </span>
                      )}

                      {boutique.email && (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {boutique.email}
                        </span>
                      )}

                      {(boutique.adresse ||
                        boutique.ville) && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="w-4 h-4" />

                          {[
                            boutique.adresse,
                            boutique.ville,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* ACTIONS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <Link
                href="/dashboard/produits"
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Package className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-gray-900">
                  Mes produits
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Gérez votre catalogue de produits.
                </p>
              </Link>

              <Link
                href="/dashboard/commandes"
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-gray-900">
                  Mes commandes
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Suivez et gérez les commandes reçues.
                </p>
              </Link>

              <Link
                href={`/boutiques/${boutique.slug}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Store className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-gray-900">
                  Ma boutique publique
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Consultez la boutique telle que les clients la voient.
                </p>
              </Link>

            </section>

            {/* INFORMATIONS */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">

              <h2 className="font-semibold text-gray-900">
                Informations de la boutique
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Nom
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {boutique.nom}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Adresse
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {[
                      boutique.adresse,
                      boutique.ville,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Non renseignée"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Téléphone
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {boutique.telephone ||
                      "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Email
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {boutique.email ||
                      "Non renseigné"}
                  </p>
                </div>

              </div>

            </section>
          </>
        )}

      </div>
    </div>
  );
}

/**
 * ============================================================
 * RÉSUMÉ D'UNE ÉTAPE
 * ============================================================
 */

interface StepSummaryProps {
  number: number;
  title: string;
  completed: boolean;
  active: boolean;
  locked?: boolean;
}

function StepSummary({
  number,
  title,
  completed,
  active,
  locked = false,
}: StepSummaryProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-3 transition",
        completed
          ? "border-emerald-200 bg-emerald-50/50"
          : active
            ? "border-gray-300 bg-white shadow-sm"
            : locked
              ? "border-gray-200 bg-gray-50"
              : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div
        className={[
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          completed
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-400",
        ].join(" ")}
      >
        {completed ? (
          <CheckCircle className="w-4 h-4" />
        ) : locked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <span className="text-sm font-bold">
            {number}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p
          className={[
            "text-sm font-medium truncate",
            completed || active
              ? "text-gray-900"
              : "text-gray-400",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="text-xs mt-0.5 text-gray-500">
          {completed
            ? "Terminée"
            : active
              ? "En cours"
              : "Verrouillée"}
        </p>
      </div>
    </div>
  );
}