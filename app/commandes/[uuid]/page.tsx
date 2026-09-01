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
loading: () => ( <div className="flex h-[420px] items-center justify-center rounded-2xl bg-gray-100"> <div className="text-center"> <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" /> <p className="text-sm font-medium text-gray-500">
Chargement du suivi... </p> </div> </div>
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
delivery_pending_confirmation: "Confirmation requise",
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
return "border-amber-200 bg-amber-50 text-amber-700";


case "confirmed":
  return "border-blue-200 bg-blue-50 text-blue-700";

case "preparing":
  return "border-indigo-200 bg-indigo-50 text-indigo-700";

case "shipped":
  return "border-blue-200 bg-blue-50 text-blue-700";

case "delivery_pending_confirmation":
  return "border-orange-200 bg-orange-50 text-orange-700";

case "delivered":
  return "border-emerald-200 bg-emerald-50 text-emerald-700";

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
  return "bg-emerald-50 text-emerald-600 ring-emerald-100";

case "shipped":
  return "bg-blue-50 text-blue-600 ring-blue-100";

case "preparing":
  return "bg-indigo-50 text-indigo-600 ring-indigo-100";

case "confirmed":
  return "bg-blue-50 text-blue-600 ring-blue-100";

default:
  return "bg-gray-50 text-gray-500 ring-gray-100";


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

const [deliveryOtp, setDeliveryOtp] =
useState("");

const [showOtpConfirmation, setShowOtpConfirmation] =
useState(false);

function confirmDelivery() {
if (confirmingDelivery) {
return;
}

if (
  !livraisonUuid ||
  livraisonStatus !== "delivery_pending_confirmation"
) {
  return;
}

setDeliveryOtp("");
setShowOtpConfirmation(true);

}

async function submitDeliveryConfirmation() {
if (confirmingDelivery) {
return;
}

if (
  !livraisonUuid ||
  livraisonStatus !== "delivery_pending_confirmation"
) {
  return;
}

const otp = deliveryOtp.trim();

if (!/^\d{6}$/.test(otp)) {
  alert(
    "Veuillez saisir le code de confirmation à 6 chiffres."
  );
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: "otp",
        otp,
      }),
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
  setShowOtpConfirmation(false);
  setDeliveryOtp("");

  alert("Réception confirmée. Merci !");
} catch (error) {
  console.error(
    "Erreur confirmation livraison :",
    error
  );

  alert(
    error instanceof Error
      ? error.message
      : "Impossible de confirmer la réception."
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

/*

* ============================================================
* LOADING
* ============================================================
  */

if (loading) {
return ( <div className="min-h-screen bg-[#f6f8fb]"> <Navbar />

    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-40 rounded-lg bg-gray-200" />

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="mt-3 h-8 w-80 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-56 rounded bg-gray-100" />
              </div>

              <div className="h-16 w-40 rounded-2xl bg-gray-100" />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 p-6">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="mt-6 h-16 w-full rounded bg-gray-100" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-96 rounded-3xl bg-white" />
            <div className="h-72 rounded-3xl bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-72 rounded-3xl bg-white" />
            <div className="h-56 rounded-3xl bg-white" />
            <div className="h-52 rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    </main>
  </div>
);


}

/*

* ============================================================
* ERROR
* ============================================================
  */

if (error || !commande) {
return ( <div className="min-h-screen bg-[#f6f8fb]"> <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() =>
          router.push("/commandes")
        }
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
      >
        <ArrowLeft size={17} />
        Retour à mes commandes
      </button>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12">
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
    </main>
  </div>
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
Boolean(
livraisonUuid &&
(
livraisonStatus === "picked_up" ||
livraisonStatus === "in_transit"
)
);

const needsConfirmation =
Boolean(
livraisonUuid &&
livraisonStatus ===
"delivery_pending_confirmation"
);

/*

* ============================================================
* PAGE
* ============================================================
  */

return ( <div className="min-h-screen bg-[#f6f8fb]"> <Navbar />


  {/* Header secondaire */}
  <div className="border-b border-gray-100 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <ShoppingBag size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            Espace client
          </p>

          <p className="truncate text-sm font-semibold text-gray-900">
            Détail de votre commande
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push("/commandes")
        }
        className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 sm:inline-flex"
      >
        <ArrowLeft size={15} />
        Mes commandes
      </button>
    </div>
  </div>

  <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

    {/* Retour mobile / desktop */}
    <button
      type="button"
      onClick={() =>
        router.push("/commandes")
      }
      className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
    >
      <ArrowLeft size={17} />
      Mes commandes
    </button>

    {/* =====================================================
        HERO COMMANDE
    ====================================================== */}

    <section className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <ShoppingBag size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Détail de commande
                </p>

                <h1 className="mt-1 break-all text-xl font-black tracking-tight text-gray-950 sm:text-2xl lg:text-3xl">
                  #{commande.uuid}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} />
                    {formatDate(
                      commande.created_at
                    )}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                  <span>
                    {commande.produits.length}{" "}
                    article
                    {commande.produits.length > 1
                      ? "s"
                      : ""}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />

                  <span className="inline-flex items-center gap-1.5">
                    <Store size={14} />
                    {commande.boutique.nom}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${getStatusBadge(
                commande.status
              )}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {statusLabels[commande.status] ||
                commande.status}
            </div>

            <div className="rounded-2xl bg-gray-50 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total de la commande
              </p>

              <p className="mt-0.5 text-xl font-black tracking-tight text-gray-950">
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
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-6 sm:px-7 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Progression de la commande
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Suivez les différentes étapes de votre commande
              </p>
            </div>

            {currentStepIndex >= 0 && (
              <span className="hidden rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-green-600 shadow-sm ring-1 ring-gray-100 sm:block">
                Étape {currentStepIndex + 1} /{" "}
                {statusSteps.length}
              </span>
            )}
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[620px] items-start">
              {statusSteps.map(
                (step, index) => {
                  const Icon = step.icon;

                  const active =
                    index <= currentStepIndex;

                  const isCurrent =
                    index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-1 items-start"
                    >
                      <div className="flex min-w-[84px] flex-col items-center">
                        <div
                          className={[
                            "flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all",
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
                        statusSteps.length - 1 && (
                        <div
                          className={`mt-[21px] h-0.5 flex-1 ${
                            index <
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

    {/* =====================================================
        CONFIRMATION LIVRAISON
    ====================================================== */}

    {needsConfirmation && (
      <section className="mb-6 overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
        <div className="border-l-4 border-orange-500">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Truck size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black text-gray-950 sm:text-lg">
                      Votre colis a été remis
                    </h2>

                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700">
                      Action requise
                    </span>
                  </div>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                    Le livreur indique avoir remis votre commande.
                    Pour finaliser la livraison, vérifiez votre colis
                    puis saisissez le code de confirmation à 6 chiffres
                    communiqué lors de la remise.
                  </p>
                </div>
              </div>

              {!showOtpConfirmation ? (
                <div className="rounded-2xl bg-orange-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                  <div>
                    <p className="text-sm font-bold text-orange-900">
                      Confirmation de réception
                    </p>

                    <p className="mt-1 text-xs leading-5 text-orange-700">
                      Cette étape clôt définitivement la livraison.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={confirmDelivery}
                    disabled={confirmingDelivery}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto"
                  >
                    <Check size={17} />
                    Confirmer la réception
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
                  <div className="mx-auto max-w-md">

                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <Check size={21} />
                      </div>

                      <h3 className="mt-4 text-lg font-black text-gray-950">
                        Confirmer la réception
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Saisissez le code à 6 chiffres remis avec votre
                        commande.
                      </p>
                    </div>

                    <div className="mt-6">
                      <label
                        htmlFor="delivery-otp"
                        className="mb-2 block text-center text-[11px] font-black uppercase tracking-[0.12em] text-gray-500"
                      >
                        Code de confirmation
                      </label>

                      <input
                        id="delivery-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={deliveryOtp}
                        onChange={(event) => {
                          const value =
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          setDeliveryOtp(value);
                        }}
                        placeholder="000000"
                        disabled={confirmingDelivery}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-center text-3xl font-black tracking-[0.45em] text-gray-950 outline-none transition placeholder:text-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />
                    </div>

                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpConfirmation(false);
                          setDeliveryOtp("");
                        }}
                        disabled={confirmingDelivery}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={
                          submitDeliveryConfirmation
                        }
                        disabled={
                          confirmingDelivery ||
                          deliveryOtp.length !== 6
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {confirmingDelivery ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Vérification...
                          </>
                        ) : (
                          <>
                            <Check size={17} />
                            Valider la réception
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-5 flex items-start gap-2 rounded-xl bg-white px-3 py-3 ring-1 ring-gray-100">
                      <span className="mt-0.5 text-xs">🔒</span>

                      <p className="text-[11px] leading-5 text-gray-400">
                        Ne communiquez jamais ce code à une autre
                        personne. Il permet de confirmer définitivement
                        la livraison.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )}

    {/* =====================================================
        ANNULATION
    ====================================================== */}

    {isCancelled && (
      <section className="mb-6 rounded-3xl border border-red-200 bg-red-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <XCircle size={21} />
          </div>

          <div>
            <h2 className="font-black text-red-900">
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

    {/* =====================================================
        CONTENU PRINCIPAL
    ====================================================== */}

    <div className="grid gap-6 lg:grid-cols-3">

      {/* =================================================
          COLONNE GAUCHE
      ================================================== */}

      <div className="space-y-6 lg:col-span-2">

        {/* Produits */}
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-black text-gray-950">
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

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
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
                    <h3 className="line-clamp-2 font-bold text-gray-950">
                      {produit.nom}
                    </h3>

                    <p className="mt-2 text-xs text-gray-500">
                      {formatPrice(
                        produit.prix
                      )}{" "}
                      l'unité
                    </p>

                    <div className="mt-3 inline-flex rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600">
                      Quantité :{" "}
                      {produit.quantite}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-gray-950 sm:text-base">
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
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Truck size={19} />
                  </div>

                  <div>
                    <h2 className="font-black text-gray-950">
                      Suivi de la livraison
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Suivez votre livreur en temps réel
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="hidden sm:inline">
                    En direct
                  </span>
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
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-gray-950">
                  Historique
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Toutes les étapes importantes de votre commande
                </p>
              </div>

              <Clock3
                size={19}
                className="shrink-0 text-gray-300"
              />
            </div>
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
                          commande.historique.length -
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
                            {statut.commentaire}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-7 text-center">
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

      {/* =================================================
          COLONNE DROITE
      ================================================== */}

      <aside className="space-y-6">

        {/* Livraison */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <MapPin size={19} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Livraison
              </p>

              <h2 className="font-black text-gray-950">
                Adresse de livraison
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Zone
            </p>

            <p className="mt-1 text-sm font-bold text-gray-950">
              {commande.zone_livraison}
            </p>

            {commande.adresse_livraison && (
              <>
                <div className="my-4 border-t border-gray-200" />

                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <ExternalLink size={16} />
                Ouvrir dans Google Maps
              </a>
            )}

          {livraisonUuid &&
            livraisonStatus === "assigned" && (
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
                      Votre commande est en cours de prise en charge.
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
                  Votre confirmation est nécessaire pour finaliser
                  la livraison.
                </p>
              </div>
            )}

          {livraisonUuid &&
            livraisonStatus === "delivered" && (
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
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Store size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Vendeur
              </p>

              <h2 className="truncate font-black text-gray-950">
                {commande.boutique.nom}
              </h2>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Boutique MarketMali
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/boutiques/${commande.boutique.slug}`
              )
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Visiter la boutique
            <ArrowRight size={16} />
          </button>
        </section>

        {/* Résumé */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Paiement
              </p>

              <h2 className="mt-1 font-black text-gray-950">
                Résumé
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={18} />
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">
                Sous-total
              </span>

              <span className="font-bold text-gray-900">
                {formatPrice(
                  sousTotalProduits
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">
                Livraison
              </span>

              <span className="font-bold text-gray-900">
                {formatPrice(
                  fraisLivraison
                )}
              </span>
            </div>
          </div>

          <div className="my-5 border-t border-dashed border-gray-200" />

          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total payé
                </p>

                <p className="mt-1 text-xl font-black tracking-tight text-gray-950">
                  {formatPrice(
                    totalCommande
                  )}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Check size={18} />
              </div>
            </div>
          </div>
        </section>

        {/* Informations */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <h2 className="font-black text-gray-950">
            Informations
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Commande créée
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatDateTime(
                  commande.created_at
                )}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Dernière modification
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatDateTime(
                  commande.updated_at
                )}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Référence
              </p>

              <p className="mt-1 break-all font-mono text-xs font-semibold text-gray-500">
                {commande.uuid}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>

    {/* =====================================================
        FOOTER CTA
    ====================================================== */}

    <section className="mt-8 rounded-3xl bg-gray-950 p-5 text-white shadow-xl sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Besoin d'aide ?
          </p>

          <h2 className="mt-1 text-lg font-black">
            Une question concernant votre commande ?
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Consultez vos commandes ou revenez à la boutique.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/commandes")
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-gray-100"
        >
          Voir mes commandes
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  </main>
</div>


);
}
