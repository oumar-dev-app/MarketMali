"use client";
import dynamic from "next/dynamic";

const LivraisonMap = dynamic(
  () => import("@/app/components/livraison/LivraisonMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        Chargement de la carte...
      </div>
    ),
  }
);

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  Package,
  Truck,
  XCircle,
  Store,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

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

interface LivraisonPosition {
  latitude: number;
  longitude: number;
  precision_gps: number | null;
  updated_at: string;
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
    "En attente de votre confirmation",
};



const statusSteps = [
  {
    key: "pending",
    label: "En attente",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Confirmée",
    icon: Check,
  },
  {
    key: "preparing",
    label: "Préparation",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Expédiée",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Livrée",
    icon: Check,
  },
];

const formatPrice = (
  value: string | number
) => {
  return `${Number(value).toLocaleString(
    "fr-FR"
  )} FCFA`;
};


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
      return "bg-amber-100 text-amber-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "preparing":
      return "bg-purple-100 text-purple-700";

    case "shipped":
      return "bg-indigo-100 text-indigo-700";

    case "delivery_pending_confirmation":
      return "bg-orange-100 text-orange-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function CommandeDetailPage() {


  const params = useParams();
  const router = useRouter();

  const [livraisonUuid, setLivraisonUuid] =
    useState<string | null>(null);

  const [livraisonStatus, setLivraisonStatus] =
    useState<string | null>(null);

  const [livreurPosition, setLivreurPosition] =
    useState<LivraisonPosition | null>(null);

  const [positionError, setPositionError] =
    useState("");

  const [loadingPosition, setLoadingPosition] =
    useState(false);

  const [confirmingDelivery, setConfirmingDelivery] =
    useState(false);

  const uuid = params.uuid as string;

  const [commande, setCommande] =
    useState<Commande | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  const [cancelError, setCancelError] =
    useState("");

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [cancelCommentaire, setCancelCommentaire] =
    useState("");

  async function confirmDelivery() {
    if (
      !commande?.livraison_uuid ||
      commande.livraison_status !==
      "delivery_pending_confirmation"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
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
        return;
      }

      const response =
        await fetch(
          `/api/livraisons/${commande.livraison_uuid}/confirm`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ??
          "Impossible de confirmer la réception."
        );
      }

      /*
       * La confirmation est terminée.
       * On met immédiatement à jour
       * l'état local de la commande.
       */
      setCommande((current) =>
        current
          ? {
            ...current,
            status: "delivered",
            livraison_status: "delivered",
          }
          : current
      );

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
          }
        );

        const data =
          await response.json();

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
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (
          data.success &&
          data.data
        ) {
          setLivraisonUuid(
            data.data.uuid
          );

          setLivraisonStatus(
            data.data.status
          );
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
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />

            <div className="h-40 rounded-2xl bg-white shadow-sm" />

            <div className="h-72 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !commande) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <button
            onClick={() =>
              router.push("/commandes")
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />

            Retour à mes commandes
          </button>

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <XCircle
              size={48}
              className="mx-auto mb-4 text-red-500"
            />

            <h1 className="text-xl font-bold text-gray-900">
              Commande introuvable
            </h1>

            <p className="mt-2 text-gray-500">
              {error ||
                "Cette commande n'existe pas ou vous n'avez pas accès à celle-ci."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isCancelled =
    commande.status === "cancelled";

  const fraisLivraison =
    Number(commande.frais_livraison);

  const totalCommande =
    Number(commande.total);

  const sousTotalProduits =
    totalCommande - fraisLivraison;

  const currentStepIndex =
    statusSteps.findIndex(
      (step) =>
        step.key === commande.status
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">


        {/* Retour */}
        <button
          onClick={() =>
            router.push("/commandes")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={18} />

          Retour à mes commandes
        </button>

        {/* En-tête */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingBag
                  size={24}
                  className="text-blue-600"
                />

                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Détail de la commande
                </h1>
              </div>

              <p className="mt-2 break-all text-sm text-gray-500">
                Commande #{commande.uuid}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />

                {formatDate(
                  commande.created_at
                )}
              </div>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(
                commande.status
              )}`}
            >
              {statusLabels[
                commande.status
              ] || commande.status}
            </span>
          </div>
        </div>

        {/* Progression */}
        {!isCancelled && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              Suivi de la commande
            </h2>

            <div className="overflow-x-auto">
              <div className="flex min-w-162.5 items-start">
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
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${active
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-200 bg-white text-gray-400"
                              } ${isCurrent
                                ? "ring-4 ring-blue-100"
                                : ""
                              }`}
                          >
                            <Icon size={18} />
                          </div>

                          <span
                            className={`mt-2 text-center text-xs font-medium ${active
                              ? "text-gray-900"
                              : "text-gray-400"
                              }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {index <
                          statusSteps.length -
                          1 && (
                            <div
                              className={`mt-5 h-0.5 flex-1 ${index <
                                currentStepIndex
                                ? "bg-blue-600"
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

        {/* Commande annulée */}

        {isCancelled && (
          <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <XCircle
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <h2 className="font-semibold text-red-800">
                Commande annulée
              </h2>

              <p className="mt-1 text-sm text-red-700">
                Cette commande a été annulée par le client
                ou par le vendeur.
              </p>
            </div>
          </section>
        )}

        {commande.livraison_uuid &&
          commande.livraison_status ===
          "delivery_pending_confirmation" && (
            <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Check size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900">
                    Votre commande a été remise
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Le livreur indique vous avoir remis
                    votre commande. Si vous avez bien reçu
                    votre colis, confirmez sa réception.
                  </p>

                  <button
                    type="button"
                    onClick={confirmDelivery}
                    disabled={confirmingDelivery}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {confirmingDelivery ? (
                      <>
                        <Clock3
                          size={17}
                          className="animate-spin"
                        />
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

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Partie principale */}
          <div className="space-y-6 lg:col-span-2">

            {/* Produits */}
            <section className="rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Produits commandés
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {commande.produits.length}{" "}
                  produit
                  {commande.produits.length > 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {commande.produits.map(
                  (produit) => (
                    <div
                      key={produit.id}
                      className="flex gap-4 p-5 sm:p-6"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                        {produit.image ? (
                          <img
                            src={produit.image}
                            alt={produit.nom}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package
                            size={28}
                            className="text-gray-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {produit.nom}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantité :{" "}
                          {produit.quantite}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatPrice(
                            produit.prix
                          )}{" "}
                          / unité
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
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

            {/* Historique */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Historique de la commande
              </h2>

              {commande.historique &&
                commande.historique.length > 0 ? (
                <div className="relative space-y-6">
                  {commande.historique.map(
                    (statut, index) => (
                      <div
                        key={statut.id}
                        className="relative flex gap-4"
                      >
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ${statut.status ===
                              "cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                              }`}
                          >
                            {statut.status ===
                              "cancelled" ? (
                              <XCircle
                                size={17}
                              />
                            ) : (
                              <Check
                                size={17}
                              />
                            )}
                          </div>

                          {index <
                            commande.historique
                              .length -
                            1 && (
                              <div className="absolute top-9 h-full w-px bg-gray-200" />
                            )}
                        </div>

                        <div className="pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {statusLabels[
                                statut.status
                              ] ||
                                statut.status}
                            </h3>

                            <span className="text-xs text-gray-400">
                              {formatDateTime(
                                statut.created_at
                              )}
                            </span>
                          </div>

                          {statut.commentaire && (
                            <p className="mt-1 text-sm text-gray-600">
                              {
                                statut.commentaire
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun historique disponible.
                </p>
              )}
            </section>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Localisation de livraison */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Livraison
                  </p>

                  <h2 className="font-bold text-gray-900">
                    Localisation
                  </h2>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">
                  Zone de livraison
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {commande.zone_livraison}
                </p>
              </div>

              {commande.adresse_livraison && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Adresse de livraison
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {commande.adresse_livraison}
                  </p>
                </div>
              )}

              {commande.latitude !== null &&
                commande.longitude !== null ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Latitude
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-900">
                        {commande.latitude}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Longitude
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-900">
                        {commande.longitude}
                      </p>
                    </div>
                  </div>

                  {commande.gps_precision !== null && (
                    <p className="mt-3 text-xs text-gray-500">
                      Précision GPS :{" "}
                      <span className="font-medium text-gray-700">
                        {commande.gps_precision} m
                      </span>
                    </p>
                  )}

                  <a
                    href={`https://www.google.com/maps?q=${commande.latitude},${commande.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <MapPin size={17} />
                    Voir la localisation
                  </a>

                  {commande.livraison_uuid &&
                    (
                      commande.livraison_status === "picked_up" ||
                      commande.livraison_status === "in_transit"
                    ) && (
                      <div className="mt-6">
                        <div className="mb-3 flex items-center gap-2">
                          <Truck
                            size={20}
                            className="text-blue-600"
                          />

                          <h3 className="font-semibold text-gray-900">
                            Suivi du livreur
                          </h3>
                        </div>

                        <LivraisonMap
                          livraisonUuid={
                            commande.livraison_uuid
                          }
                          destinationLatitude={
                            commande.latitude !== null
                              ? Number(commande.latitude)
                              : null
                          }
                          destinationLongitude={
                            commande.longitude !== null
                              ? Number(commande.longitude)
                              : null
                          }
                          destinationAdresse={
                            commande.adresse_livraison
                          }
                        />
                      </div>
                    )}
                </>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Localisation GPS non disponible
                    pour cette commande.
                  </p>

                  {commande.livraison_uuid &&
                    (
                      commande.livraison_status === "assigned" ||
                      commande.livraison_status === "picked_up" ||
                      commande.livraison_status === "in_transit"
                    ) && (
                      <p className="mt-2 text-xs text-gray-500">
                        Le suivi du livreur sera disponible
                        dès que sa position GPS sera transmise.
                      </p>
                    )}
                </div>
              )}

            </section>
            {/* Boutique */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Store size={20} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Boutique
                  </p>

                  <h2 className="font-bold text-gray-900">
                    {commande.boutique.nom}
                  </h2>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/boutiques/${commande.boutique.slug}`
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Voir la boutique
              </button>
            </section>

            {/* Résumé */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-gray-900">
                Résumé
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Sous-total
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatPrice(
                      Number(commande.total) -
                      Number(
                        commande.frais_livraison ?? 0
                      )
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Livraison
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatPrice(
                      commande.frais_livraison ?? 0
                    )}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(commande.total)}
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}