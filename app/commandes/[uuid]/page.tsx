"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Truck,
  XCircle,
} from "lucide-react";

const LivraisonMap = dynamic(
  () => import("@/app/components/livraison/LivraisonMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-105 items-center justify-center rounded-2xl bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">
            Chargement du suivi...
          </p>
        </div>
      </div>
    ),
  }
);

interface Produit {
  id: number;
  commande_id?: number;
  produit_id?: number;
  nom: string;
  slug?: string;
  quantite: number;
  prix: string;
  sous_total: string;
  image?: string | null;
  uuid?: string;
}

interface HistoriqueStatut {
  id: number;
  commande_id: number;
  status: string;
  commentaire: string | null;
  created_at: string;
}

interface Commande {
  uuid: string;
  total: string;
  frais_livraison: string | number;
  zone_livraison: string;
  status: string;
  created_at: string;
  updated_at: string;

  livraison_uuid: string | null;

  livraison_status:
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivery_pending_confirmation"
  | "delivered"
  | "cancelled"
  | null;

  adresse_livraison: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  gps_precision: number | string | null;

  boutique: {
    uuid: string;
    nom: string;
    slug: string;
  };

  client: {
    uuid: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };

  produits: Produit[];
  historique: HistoriqueStatut[];
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  delivery_pending_confirmation:
    "Confirmation requise",
};

const statusSteps = [
  {
    key: "pending",
    label: "Commande reçue",
    shortLabel: "Reçue",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Commande confirmée",
    shortLabel: "Confirmée",
    icon: Check,
  },
  {
    key: "preparing",
    label: "Préparation",
    shortLabel: "Préparation",
    icon: Package,
  },
  {
    key: "shipped",
    label: "En livraison",
    shortLabel: "Livraison",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Livrée",
    shortLabel: "Livrée",
    icon: CheckCircle2,
  },
];

function formatPrice(value: string | number) {
  return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "confirmed":
      return "border-green-200 bg-green-50 text-green-700";

    case "preparing":
      return "border-green-200 bg-green-50 text-green-700";

    case "shipped":
      return "border-green-200 bg-green-50 text-green-700";

    case "delivery_pending_confirmation":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "delivered":
      return "border-green-200 bg-green-50 text-green-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getHistoryIcon(status: string) {
  switch (status) {
    case "cancelled":
      return XCircle;

    case "delivered":
      return CheckCircle2;

    case "shipped":
      return Truck;

    case "preparing":
      return Package;

    case "confirmed":
      return Check;

    default:
      return Clock3;
  }
}

function getHistoryIconClass(status: string) {
  switch (status) {
    case "cancelled":
      return "bg-red-50 text-red-600 ring-red-100";

    case "delivered":
      return "bg-green-50 text-green-600 ring-green-100";

    case "shipped":
      return "bg-green-50 text-green-600 ring-green-100";

    case "preparing":
      return "bg-green-50 text-green-600 ring-green-100";

    default:
      return "bg-green-50 text-green-600 ring-green-100";
  }
}

export default function CommandeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const uuid = params.uuid as string;

  const [commande, setCommande] =
    useState<Commande | null>(null);

  const [livraisonUuid, setLivraisonUuid] =
    useState<string | null>(null);

  const [livraisonStatus, setLivraisonStatus] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [confirmingDelivery, setConfirmingDelivery] =
    useState(false);

  async function confirmDelivery() {
    if (confirmingDelivery) {
      return;
    }

    if (
      !livraisonUuid ||
      livraisonStatus !==
      "delivery_pending_confirmation"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Confirmez-vous avoir bien reçu votre commande ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setConfirmingDelivery(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Votre session a expiré. Veuillez vous reconnecter."
        );

        router.push("/login");

        return;
      }

      const response = await fetch(
        `/api/livraisons/${livraisonUuid}/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
          "Impossible de confirmer la réception."
        );
      }

      setCommande((current) =>
        current
          ? {
            ...current,
            status: "delivered",
            livraison_status: "delivered",
          }
          : current
      );

      setLivraisonStatus("delivered");
    } catch (error) {
      console.error(
        "Erreur confirmation livraison :",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la confirmation."
      );
    } finally {
      setConfirmingDelivery(false);
    }
  }

  useEffect(() => {
    async function loadCommande() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `/api/commandes/${uuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.message ||
            "Impossible de récupérer la commande."
          );

          return;
        }

        setCommande(data.data);
      } catch (error) {
        console.error(
          "Erreur chargement commande",
          error
        );

        setError(
          "Une erreur est survenue lors du chargement de la commande."
        );
      } finally {
        setLoading(false);
      }
    }

    if (uuid) {
      loadCommande();
    }
  }, [uuid, router]);

  useEffect(() => {
    async function loadLivraison() {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `/api/livraisons/commande/${uuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.success && data.data) {
          setLivraisonUuid(data.data.uuid);
          setLivraisonStatus(data.data.status);
        }
      } catch (error) {
        console.error(
          "Erreur chargement livraison",
          error
        );
      }
    }

    if (uuid) {
      loadLivraison();
    }
  }, [uuid]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-36 rounded-lg bg-gray-200" />

            <div className="rounded-3xl bg-white p-6">
              <div className="h-7 w-72 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-52 rounded bg-gray-100" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="h-96 rounded-3xl bg-white" />
                <div className="h-64 rounded-3xl bg-white" />
              </div>

              <div className="space-y-6">
                <div className="h-72 rounded-3xl bg-white" />
                <div className="h-48 rounded-3xl bg-white" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !commande) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f8fa]">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <button
              type="button"
              onClick={() =>
                router.push("/commandes")
              }
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950"
            >
              <ArrowLeft size={17} />
              Retour à mes commandes
            </button>

            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <XCircle size={30} />
              </div>

              <h1 className="mt-5 text-xl font-bold text-gray-950">
                Commande introuvable
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {error ||
                  "Cette commande n'existe pas ou vous n'avez pas accès à celle-ci."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/commandes")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Retour aux commandes
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </>

    );
  }

  const isCancelled =
    commande.status === "cancelled";

  const fraisLivraison =
    Number(commande.frais_livraison || 0);

  const totalCommande =
    Number(commande.total || 0);

  const sousTotalProduits =
    Math.max(
      0,
      totalCommande - fraisLivraison
    );

  const currentStepIndex =
    statusSteps.findIndex(
      (step) =>
        step.key === commande.status
    );

  const isTracking =
    livraisonUuid &&
    (
      livraisonStatus === "picked_up" ||
      livraisonStatus === "in_transit"
    );

  const needsConfirmation =
    livraisonUuid &&
    livraisonStatus ===
    "delivery_pending_confirmation";

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Retour */}
        <button
          type="button"
          onClick={() =>
            router.push("/commandes")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={17} />
          Mes commandes
        </button>

        {/* Hero commande */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ShoppingBag size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Commande
                    </p>

                    <h1 className="mt-0.5 truncate text-xl font-bold text-gray-950 sm:text-2xl">
                      #{commande.uuid}
                    </h1>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    {formatDate(
                      commande.created_at
                    )}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-300" />

                  <span>
                    {commande.produits.length}{" "}
                    article
                    {commande.produits.length > 1
                      ? "s"
                      : ""}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusBadge(
                    commande.status
                  )}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {statusLabels[
                    commande.status
                  ] || commande.status}
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Total
                  </p>

                  <p className="text-base font-bold text-gray-950">
                    {formatPrice(
                      commande.total
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression */}
          {!isCancelled && (
            <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-6 sm:px-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-950">
                    Progression de la commande
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Suivez chaque étape de votre commande
                  </p>
                </div>

                {currentStepIndex >= 0 && (
                  <span className="hidden text-xs font-semibold text-blue-600 sm:block">
                    Étape {currentStepIndex + 1} /{" "}
                    {statusSteps.length}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <div className="flex min-w-160 items-start">
                  {statusSteps.map(
                    (step, index) => {
                      const Icon = step.icon;

                      const active =
                        index <=
                        currentStepIndex;

                      const isCurrent =
                        index ===
                        currentStepIndex;

                      return (
                        <div
                          key={step.key}
                          className="flex flex-1 items-start"
                        >
                          <div className="flex min-w-20 flex-col items-center">
                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-2xl border transition",
                                active
                                  ? "border-green-600 bg-green-600 text-white shadow-sm shadow-green-200"
                                  : "border-gray-200 bg-white text-gray-400",
                                isCurrent
                                  ? "ring-4 ring-green-100"
                                  : "",
                              ].join(" ")}
                            >
                              <Icon size={18} />
                            </div>

                            <span
                              className={[
                                "mt-2 text-center text-[11px] font-semibold",
                                active
                                  ? "text-gray-900"
                                  : "text-gray-400",
                              ].join(" ")}
                            >
                              <span className="hidden sm:inline">
                                {step.label}
                              </span>

                              <span className="sm:hidden">
                                {step.shortLabel}
                              </span>
                            </span>
                          </div>

                          {index <
                            statusSteps.length -
                            1 && (
                              <div
                                className={`mt-5 h-0.5 flex-1 ${index <
                                  currentStepIndex
                                  ? "bg-green-600"
                                  : "bg-gray-200"
                                  }`}
                              />
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Confirmation livraison */}
        {needsConfirmation && (
          <section className="mb-6 overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm">
            <div className="border-l-4 border-orange-500 p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Truck size={22} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-gray-950">
                        Votre colis a été remis
                      </h2>

                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                        Action requise
                      </span>
                    </div>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                      Le livreur indique avoir remis votre
                      commande. Confirmez la réception uniquement
                      si vous avez bien reçu votre colis.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={confirmDelivery}
                  disabled={confirmingDelivery}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {confirmingDelivery ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      Confirmer la réception
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Annulation */}
        {isCancelled && (
          <section className="mb-6 rounded-3xl border border-red-200 bg-red-50/70 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <XCircle size={21} />
              </div>

              <div>
                <h2 className="font-bold text-red-900">
                  Commande annulée
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  Cette commande a été annulée par le client
                  ou par la boutique.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* COLONNE PRINCIPALE */}
          <div className="space-y-6 lg:col-span-2">

            {/* Produits */}
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-bold text-gray-950">
                    Articles commandés
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {commande.produits.length}{" "}
                    article
                    {commande.produits.length > 1
                      ? "s"
                      : ""}{" "}
                    dans cette commande
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                  <Package size={18} />
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {commande.produits.map(
                  (produit) => (
                    <div
                      key={produit.id}
                      className="flex gap-4 p-5 transition hover:bg-gray-50/60 sm:p-6"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24">
                        {produit.image ? (
                          <img
                            src={produit.image}
                            alt={produit.nom}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <Package size={28} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 font-semibold text-gray-950">
                          {produit.nom}
                        </h3>

                        <p className="mt-2 text-xs text-gray-500">
                          {formatPrice(
                            produit.prix
                          )}{" "}
                          l'unité
                        </p>

                        <div className="mt-3 inline-flex rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          Quantité :{" "}
                          {produit.quantite}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-gray-950 sm:text-base">
                          {formatPrice(
                            produit.sous_total
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Suivi GPS */}
            {isTracking && (
              <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Truck size={19} />
                      </div>

                      <div>
                        <h2 className="font-bold text-gray-950">
                          Suivi de la livraison
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Suivez votre livreur en temps réel
                        </p>
                      </div>
                    </div>

                    <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      En direct
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <LivraisonMap
                    livraisonUuid={
                      livraisonUuid!
                    }
                    destinationLatitude={
                      commande.latitude !== null
                        ? Number(
                          commande.latitude
                        )
                        : null
                    }
                    destinationLongitude={
                      commande.longitude !== null
                        ? Number(
                          commande.longitude
                        )
                        : null
                    }
                    destinationAdresse={
                      commande.adresse_livraison
                    }
                  />
                </div>
              </section>
            )}

            {/* Historique */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-7">
                <h2 className="font-bold text-gray-950">
                  Historique
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Toutes les étapes importantes de votre commande
                </p>
              </div>

              {commande.historique &&
                commande.historique.length > 0 ? (
                <div className="space-y-7">
                  {commande.historique.map(
                    (statut, index) => {
                      const Icon =
                        getHistoryIcon(
                          statut.status
                        );

                      return (
                        <div
                          key={statut.id}
                          className="relative flex gap-4"
                        >
                          <div className="relative flex shrink-0 flex-col items-center">
                            <div
                              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl ring-4 ${getHistoryIconClass(
                                statut.status
                              )}`}
                            >
                              <Icon size={17} />
                            </div>

                            {index <
                              commande
                                .historique
                                .length -
                              1 && (
                                <div className="absolute top-10 h-[calc(100%+1.75rem)] w-px bg-gray-200" />
                              )}
                          </div>

                          <div className="min-w-0 flex-1 pb-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="text-sm font-bold text-gray-950">
                                {statusLabels[
                                  statut.status
                                ] ||
                                  statut.status}
                              </h3>

                              <time className="text-xs text-gray-400">
                                {formatDateTime(
                                  statut.created_at
                                )}
                              </time>
                            </div>

                            {statut.commentaire && (
                              <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm leading-5 text-gray-600">
                                {
                                  statut.commentaire
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-6 text-center">
                  <Clock3
                    size={24}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-2 text-sm text-gray-500">
                    Aucun historique disponible.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-6">

            {/* Livraison */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <MapPin size={19} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Livraison
                  </p>

                  <h2 className="font-bold text-gray-950">
                    Adresse de livraison
                  </h2>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-400">
                  Zone
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-950">
                  {commande.zone_livraison}
                </p>

                {commande.adresse_livraison && (
                  <>
                    <div className="my-4 border-t border-gray-200" />

                    <p className="text-xs font-medium text-gray-400">
                      Adresse
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                      {commande.adresse_livraison}
                    </p>
                  </>
                )}
              </div>

              {commande.latitude !== null &&
                commande.longitude !== null && (
                  <a
                    href={`https://www.google.com/maps?q=${commande.latitude},${commande.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <ExternalLink size={16} />
                    Ouvrir dans Google Maps
                  </a>
                )}

              {livraisonUuid &&
                livraisonStatus ===
                "assigned" && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Truck
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-blue-900">
                          Livreur assigné
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                          Votre commande est en cours de prise
                          en charge.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {livraisonUuid &&
                livraisonStatus ===
                "delivery_pending_confirmation" && (
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-sm font-bold text-orange-900">
                      Livraison effectuée
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      Votre confirmation est nécessaire pour
                      finaliser la livraison.
                    </p>
                  </div>
                )}

              {livraisonUuid &&
                livraisonStatus ===
                "delivered" && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={19}
                        className="text-emerald-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-emerald-900">
                          Livraison terminée
                        </p>

                        <p className="mt-0.5 text-xs text-emerald-700">
                          Merci pour votre confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </section>

            {/* Boutique */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <MapPin size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Vendeur
                  </p>

                  <h2 className="truncate font-bold text-gray-950">
                    {commande.boutique.nom}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/boutiques/${commande.boutique.slug}`
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Visiter la boutique
                <ArrowRight size={16} />
              </button>
            </section>

            {/* Résumé */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold text-gray-950">
                  Résumé de la commande
                </h2>

                <ShoppingBag
                  size={18}
                  className="text-gray-400"
                />
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">
                    Sous-total
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatPrice(
                      sousTotalProduits
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">
                    Livraison
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatPrice(
                      fraisLivraison
                    )}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-gray-200" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Total payé
                  </p>

                  <p className="mt-1 text-xl font-black text-gray-950">
                    {formatPrice(
                      totalCommande
                    )}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Check size={18} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}