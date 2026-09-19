
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
      <div className="relative min-h-full overflow-hidden bg-[#f7f9f7] p-4 sm:p-6 lg:p-8">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl space-y-6">

          <div className="h-10 w-56 animate-pulse rounded-xl bg-gray-200" />

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row">

              <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-gray-200" />

              <div className="flex-1 space-y-3">

                <div className="h-7 w-64 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-gray-100" />

                <div className="h-4 w-48 animate-pulse rounded-lg bg-gray-100" />

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white"
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
      <div className="relative min-h-full overflow-hidden bg-[#f7f9f7] p-4 sm:p-6 lg:p-8">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Impossible de charger votre boutique
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchBoutiqueState(true)}
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#14a800]
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#119400]
                focus:outline-none
                focus:ring-4
                focus:ring-[#14a800]/20
              "
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
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
      <div className="relative min-h-full overflow-hidden bg-[#f7f9f7]">

        {/* ========================================================
            ARRIÈRE-PLAN MARKETMALI
        ======================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />

          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />

          <div className="absolute right-[10%] top-[45%] h-40 w-40 rounded-full bg-[#ce1126]/2" />

        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* ====================================================
                HEADER MARKETMALI
            ==================================================== */}

            <section className="relative mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />

              <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />

              <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-8">

                <div className="mb-5 flex items-center gap-1">
                  <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                  <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                  <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                  <div className="max-w-2xl">

                    <div className="mb-3 flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                        <Store
                          size={18}
                          strokeWidth={2.2}
                        />
                      </div>

                      <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                        Espace vendeur
                      </span>

                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                      Ma boutique
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                      Configurez votre boutique MarketMali,
                      ajoutez vos produits et préparez votre activité
                      commerciale étape par étape.
                    </p>

                  </div>

                  <Link
                    href="/dashboard"
                    className="
                      inline-flex
                      h-11
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      font-semibold
                      text-gray-700
                      shadow-sm
                      transition
                      hover:border-[#14a800]/30
                      hover:bg-[#14a800]/5
                      hover:text-[#14a800]
                      focus:outline-none
                      focus:ring-4
                      focus:ring-[#14a800]/10
                    "
                  >
                    <ArrowLeft size={16} />
                    Retour au dashboard
                  </Link>

                </div>

              </div>

            </section>

            {/* ====================================================
                INTRODUCTION + PROGRESSION
            ==================================================== */}

            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="h-1.5 bg-[#14a800]" />

              <div className="p-6 sm:p-8 lg:p-10">

                <div className="max-w-3xl">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14a800]/10 text-[#14a800]">
                    <Store className="h-7 w-7" />
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                    Configurez votre boutique
                  </h2>

                  <p className="mt-3 leading-relaxed text-gray-600">
                    Votre espace vendeur est prêt. Nous allons maintenant
                    vous accompagner étape par étape pour préparer votre
                    boutique avant son ouverture aux clients.
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    Chaque étape est enregistrée directement dans votre
                    compte. Vous pouvez quitter cette page et revenir
                    plus tard : MarketMali reprendra automatiquement
                    là où vous vous êtes arrêté.
                  </p>

                </div>

                {/* PROGRESSION */}

                <div className="mt-8 rounded-2xl border border-[#14a800]/10 bg-[#f7f9f7] p-5 sm:p-6">

                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Configuration de votre boutique
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Étape {activeStep} sur {TOTAL_STEPS}
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-[#14a800]/10 px-3 py-1 text-sm font-bold text-[#14a800]">
                      {completedSteps}/{TOTAL_STEPS} étapes
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#14a800] transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

            </section>

            {/* ====================================================
                RÉSUMÉ DES ÉTAPES
            ==================================================== */}

            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                    <Settings2 size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-950">
                      Votre parcours
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Les étapes suivantes seront débloquées automatiquement
                      après validation de l'étape actuelle.
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-7">

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <StepSummary
                    number={1}
                    title="Créer ma boutique"
                    completed={Boolean(boutique)}
                    active={activeStep === 1}
                  />

                  <StepSummary
                    number={2}
                    title="Ajouter mes produits"
                    completed={hasProducts}
                    active={activeStep === 2}
                    locked={!boutique}
                  />

                  <StepSummary
                    number={3}
                    title="Organiser mes livraisons"
                    completed={Boolean(
                      boutique?.livraison_configuree
                    )}
                    active={activeStep === 3}
                    locked={!hasProducts}
                  />

                  <StepSummary
                    number={4}
                    title="Ajouter un livreur"
                    completed={hasLivreur}
                    active={activeStep === 4}
                    locked={!boutique?.livraison_configuree}
                  />

                  <StepSummary
                    number={5}
                    title="Configurer les tarifs"
                    completed={hasDeliveryRates}
                    active={activeStep === 5}
                    locked={!hasLivreur}
                  />

                  <StepSummary
                    number={6}
                    title="Créer une promotion"
                    completed={hasPromotion}
                    active={activeStep === 6}
                    locked={!hasDeliveryRates}
                  />

                </div>

              </div>

            </section>

            {/* ====================================================
                ÉTAPE ACTIVE
            ==================================================== */}

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="border-b border-gray-100 bg-white px-5 py-5 sm:px-7">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <div className="mb-1 flex items-center gap-2">

                      <span className="text-xs font-bold uppercase tracking-wide text-[#14a800]">
                        Étape {activeStep}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-gray-300" />

                      <span className="text-xs font-medium text-gray-400">
                        En cours
                      </span>

                    </div>

                    <h2 className="text-lg font-extrabold tracking-tight text-gray-950 sm:text-xl">

                      {activeStep === 1 &&
                        "Créer votre boutique"}

                      {activeStep === 2 &&
                        (boutique?.status === "pending"
                          ? "Validation de votre boutique"
                          : "Ajouter votre premier produit")}

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
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#14a800]">
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                  boutique?.status === "pending" ? (
                    <div className="rounded-2xl border border-[#fcd116]/40 bg-[#fcd116]/5 p-6 sm:p-8">

                      <div className="flex flex-col items-center text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fcd116]/15">
                          <Clock className="h-8 w-8 text-yellow-700" />
                        </div>

                        <h3 className="mt-5 text-xl font-extrabold tracking-tight text-gray-950">
                          Votre boutique est en attente de validation
                        </h3>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                          Votre boutique a bien été créée et les informations
                          enregistrées. Elle doit maintenant être vérifiée et activée
                          par un super administrateur avant que vous puissiez poursuivre
                          la configuration de votre espace vendeur.
                        </p>

                        <div className="mt-6 w-full max-w-2xl rounded-xl border border-[#fcd116]/30 bg-white p-4 text-left">

                          <div className="flex items-start gap-3">

                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#14a800]" />

                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                Que va-t-il se passer ?
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-500">
                                Un super administrateur va vérifier votre boutique et
                                procéder à son activation. Vous recevrez une notification
                                dès que cette étape sera terminée.
                              </p>
                            </div>

                          </div>

                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                          <Clock className="h-4 w-4" />
                          En attente de validation
                        </div>

                      </div>

                    </div>
                  ) : (
                    <AddProductStep
                      onCompleted={handleStepCompleted}
                    />
                  )
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

            </section>

            {/* ====================================================
                CONSEIL
            ==================================================== */}

            <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>

                <div>

                  <h3 className="font-bold text-blue-900">
                    Votre progression est sauvegardée
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-blue-800">
                    Vous n'avez pas besoin de terminer les six étapes
                    immédiatement. Vous pouvez quitter votre espace vendeur
                    et revenir plus tard. MarketMali vérifiera automatiquement
                    ce qui a déjà été configuré.
                  </p>

                </div>

              </div>

            </section>

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
    <div className="relative min-h-full overflow-hidden bg-[#f7f9f7]">

      {/* ========================================================
          ARRIÈRE-PLAN MARKETMALI
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />

        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />

        <div className="absolute right-[12%] top-[38%] h-40 w-40 rounded-full bg-[#ce1126]/[0.02]" />

      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          {/* ====================================================
              HEADER MARKETMALI
          ==================================================== */}

          <section className="relative mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#14a800]/5" />

            <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#fcd116]/5" />

            <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-8">

              <div className="mb-5 flex items-center gap-1">
                <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                <div className="max-w-2xl">

                  <div className="mb-3 flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                      <Store
                        size={18}
                        strokeWidth={2.2}
                      />
                    </div>

                    <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                      Espace vendeur
                    </span>

                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                    Ma boutique
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                    Gérez votre boutique MarketMali, vos produits,
                    vos livraisons et votre activité commerciale
                    depuis un seul espace.
                  </p>

                </div>

                {boutique && (
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                    <Link
                      href={`/boutiques/${boutique.slug}`}
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        text-sm
                        font-semibold
                        text-gray-700
                        shadow-sm
                        transition
                        hover:border-[#14a800]/30
                        hover:bg-[#14a800]/5
                        hover:text-[#14a800]
                        focus:outline-none
                        focus:ring-4
                        focus:ring-[#14a800]/10
                      "
                    >
                      <ExternalLink size={16} />
                      Voir ma boutique
                    </Link>

                    <Link
                      href={`/dashboard/boutiques/${boutique.uuid}/edit`}
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#14a800]
                        px-4
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#119400]
                        hover:shadow-md
                        focus:outline-none
                        focus:ring-4
                        focus:ring-[#14a800]/20
                      "
                    >
                      <Pencil size={16} />
                      Modifier
                    </Link>

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* ====================================================
              INFORMATIONS BOUTIQUE
          ==================================================== */}

          {boutique && (
            <>

              <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                <div className="p-6 sm:p-8">

                  <div className="flex flex-col gap-6 sm:flex-row">

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                      {boutique.logo ? (
                        <img
                          src={boutique.logo}
                          alt={boutique.nom}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-10 w-10 text-[#14a800]/40" />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">
                          {boutique.nom}
                        </h2>

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            px-3
                            py-1
                            text-xs
                            font-bold
                            ${currentStatus.className}
                          `}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {currentStatus.label}
                        </span>

                      </div>

                      {boutique.description && (
                        <p className="mt-3 leading-relaxed text-gray-600">
                          {boutique.description}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                        {boutique.telephone && (
                          <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#14a800]" />
                            {boutique.telephone}
                          </span>
                        )}

                        {boutique.email && (
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#14a800]" />
                            {boutique.email}
                          </span>
                        )}

                        {(boutique.adresse ||
                          boutique.ville) && (
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#14a800]" />

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

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <Link
                  href="/dashboard/produits"
                  className="
                    group
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:border-[#14a800]/20
                    hover:shadow-md
                  "
                >

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800] transition group-hover:bg-[#14a800] group-hover:text-white">
                    <Package className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-gray-950">
                    Mes produits
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Gérez votre catalogue de produits.
                  </p>

                </Link>

                <Link
                  href="/dashboard/commandes"
                  className="
                    group
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:border-[#fcd116]/40
                    hover:shadow-md
                  "
                >

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fcd116]/15 text-yellow-700 transition group-hover:bg-[#fcd116] group-hover:text-gray-950">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-gray-950">
                    Mes commandes
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Suivez et gérez les commandes reçues.
                  </p>

                </Link>

                <Link
                  href={`/boutiques/${boutique.slug}`}
                  className="
                    group
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:border-[#ce1126]/20
                    hover:shadow-md
                  "
                >

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800] transition group-hover:bg-[#14a800] group-hover:text-white">
                    <Store className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-gray-950">
                    Ma boutique publique
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Consultez la boutique telle que les clients la voient.
                  </p>

                </Link>

              </section>

              {/* ==================================================
                  INFORMATIONS
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                <div className="border-b border-gray-100 px-6 py-5 sm:px-8">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                      <Store size={18} />
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-950">
                        Informations de la boutique
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Les principales informations de votre espace vendeur.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8">

                  <InfoItem
                    label="Nom"
                    value={boutique.nom}
                  />

                  <InfoItem
                    label="Adresse"
                    value={
                      [
                        boutique.adresse,
                        boutique.ville,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "Non renseignée"
                    }
                  />

                  <InfoItem
                    label="Téléphone"
                    value={
                      boutique.telephone ||
                      "Non renseigné"
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={
                      boutique.email ||
                      "Non renseigné"
                    }
                  />

                </div>

              </section>

            </>
          )}

        </div>

      </div>
    </div>
  );
}

/**
 * ============================================================
 * ÉLÉMENT D'INFORMATION
 * ============================================================
 */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#f7f9f7] p-4 transition hover:border-[#14a800]/20">

      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-900">
        {value}
      </p>

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
          ? "border-[#14a800]/20 bg-[#14a800]/5"
          : active
            ? "border-[#14a800]/30 bg-white shadow-sm"
            : locked
              ? "border-gray-200 bg-gray-50"
              : "border-gray-200 bg-white",
      ].join(" ")}
    >

      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          completed
            ? "bg-[#14a800] text-white"
            : active
              ? "bg-[#14a800]/10 text-[#14a800]"
              : "bg-gray-200 text-gray-400",
        ].join(" ")}
      >

        {completed ? (
          <CheckCircle className="h-4 w-4" />
        ) : locked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <span className="text-sm font-bold">
            {number}
          </span>
        )}

      </div>

      <div className="min-w-0">

        <p
          className={[
            "truncate text-sm font-bold",
            completed || active
              ? "text-gray-900"
              : "text-gray-400",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
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