"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import {
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    MapPin,
    Navigation,
    Package,
    Phone,
    RefreshCw,
    Truck,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Livraison {
    id: number;
    uuid: string;
    commande_id: number;
    livreur_id: number;

    status:
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivery_pending_confirmation"
    | "delivered"
    | "cancelled";

    commentaire: string | null;

    assigned_at: string | null;
    picked_up_at: string | null;
    in_transit_at: string | null;
    delivery_pending_confirmation_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;

    created_at: string | null;
    updated_at: string | null;

    commande_uuid: string;
    commande_total: string;
    commande_status: string;

    zone_livraison: string;
    adresse_livraison: string | null;

    latitude: number | string | null;
    longitude: number | string | null;
    gps_precision: number | string | null;

    client_uuid: string;
    client_nom: string;
    client_prenom: string;
    client_telephone: string;
    client_email: string;

    livreur_uuid: string;
    livreur_nom: string;
    livreur_prenom: string;
    livreur_telephone: string;
    livreur_vehicule: string | null;
}

type Onglet = "active" | "historique";

const statusLabels: Record<
    Livraison["status"],
    string
> = {
    assigned: "Assignée",
    picked_up: "Récupérée",
    in_transit: "En livraison",
    delivery_pending_confirmation:
        "En attente de confirmation",
    delivered: "Livrée",
    cancelled: "Annulée",
};

const statusClasses: Record<
    Livraison["status"],
    string
> = {
    assigned:
        "bg-yellow-100 text-yellow-800 border-yellow-200",

    picked_up:
        "bg-blue-100 text-blue-800 border-blue-200",

    in_transit:
        "bg-indigo-100 text-indigo-800 border-indigo-200",

    delivery_pending_confirmation:
        "bg-orange-100 text-orange-800 border-orange-200",

    delivered:
        "bg-green-100 text-green-800 border-green-200",

    cancelled:
        "bg-red-100 text-red-800 border-red-200",
};

function formatPrice(value: string | number) {
    return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string | null) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortDate(value: string | null) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function LivraisonTimeline({
    livraison,
}: {
    livraison: Livraison;
}) {
    const steps = [
        {
            key: "assigned",
            label: "Livraison assignée",
            date: livraison.assigned_at,
            icon: Truck,
        },
        {
            key: "picked_up",
            label: "Commande récupérée",
            date: livraison.picked_up_at,
            icon: Package,
        },
        {
            key: "in_transit",
            label: "En livraison",
            date: livraison.in_transit_at,
            icon: Navigation,
        },
        {
            key: "delivery_pending_confirmation",
            label: "Remise déclarée",
            date:
                livraison.delivery_pending_confirmation_at,
            icon: Clock,
        },
        {
            key: "delivered",
            label: "Réception confirmée",
            date: livraison.delivered_at,
            icon: CheckCircle2,
        },
    ];

    const statusOrder: Livraison["status"][] = [
        "assigned",
        "picked_up",
        "in_transit",
        "delivery_pending_confirmation",
        "delivered",
    ];

    const currentIndex =
        statusOrder.indexOf(livraison.status);

    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">

            <h3 className="mb-5 flex items-center gap-2 font-semibold text-gray-900">
                <Clock size={18} className="text-gray-500" />
                Suivi de la livraison
            </h3>

            <div className="relative">

                {steps.map((step, index) => {

                    const StepIcon = step.icon;

                    const completed =
                        livraison.status !== "cancelled" &&
                        currentIndex >= index;

                    const current =
                        livraison.status !== "cancelled" &&
                        currentIndex === index;

                    const hasNext =
                        index < steps.length - 1;

                    return (
                        <div
                            key={step.key}
                            className="relative flex gap-4"
                        >

                            {hasNext && (
                                <div
                                    className={`absolute left-3.75 top-8 h-[calc(100%-8px)] w-0.5 ${completed &&
                                        currentIndex > index
                                        ? "bg-green-500"
                                        : "bg-gray-200"
                                        }`}
                                />
                            )}

                            <div
                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${completed
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-gray-200 bg-white text-gray-400"
                                    }`}
                            >
                                {completed ? (
                                    <Check size={16} />
                                ) : (
                                    <StepIcon size={15} />
                                )}
                            </div>

                            <div className="min-w-0 flex-1 pb-6">

                                <div className="flex flex-wrap items-center gap-2">

                                    <p
                                        className={`text-sm font-semibold ${completed
                                            ? "text-gray-900"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>

                                    {current && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                            En cours
                                        </span>
                                    )}

                                </div>

                                <p className="mt-1 text-xs text-gray-500">
                                    {step.date
                                        ? formatDate(step.date)
                                        : "En attente"}
                                </p>

                            </div>

                        </div>
                    );
                })}

                {livraison.status === "cancelled" && (
                    <div className="relative flex gap-4">

                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-white">
                            <XCircle size={16} />
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-red-700">
                                Livraison annulée
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                {livraison.cancelled_at
                                    ? formatDate(
                                        livraison.cancelled_at
                                    )
                                    : "Date inconnue"}
                            </p>

                            {livraison.commentaire && (
                                <p className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                    {livraison.commentaire}
                                </p>
                            )}

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default function LivreurLivraisons() {
    const [livraisons, setLivraisons] =
        useState<Livraison[]>([]);

    const [historique, setHistorique] =
        useState<Livraison[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [loadingHistorique, setLoadingHistorique] =
        useState(false);

    const [refreshing, setRefreshing] =
        useState(false);

    const [updating, setUpdating] =
        useState<string | null>(null);

    const [cancelModal, setCancelModal] =
        useState<Livraison | null>(null);

    const [cancelReason, setCancelReason] =
        useState("");

    const [onglet, setOnglet] =
        useState<Onglet>("active");

    const lastGPSSendAt =
        useRef<Record<string, number>>({});

    /*
 * Watch GPS actif par livraison.
 *
 * La clé correspond à l'UUID de la livraison
 * et la valeur correspond à l'identifiant retourné
 * par navigator.geolocation.watchPosition().
 */
    const gpsWatchIds =
        useRef<Record<string, number>>({});

    /*
     * Démarrer le suivi GPS d'une livraison.
     */
    function startGPSTracking(
        livraison_uuid: string
    ) {

        // Le navigateur doit supporter la géolocalisation.
        if (
            typeof navigator === "undefined" ||
            !navigator.geolocation
        ) {
            toast.error(
                "La géolocalisation n'est pas disponible sur cet appareil."
            );

            return;
        }

        // Éviter de créer plusieurs watchers
        // pour la même livraison.
        if (
            gpsWatchIds.current[livraison_uuid] !==
            undefined
        ) {
            return;
        }

        const watchId =
            navigator.geolocation.watchPosition(
                async (position) => {

                    const {
                        latitude,
                        longitude,
                        accuracy,
                    } = position.coords;

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude) ||
                        !Number.isFinite(accuracy)
                    ) {
                        console.warn(
                            "Position GPS invalide."
                        );

                        return;
                    }

                    if (accuracy > 100000) {
                        console.warn(
                            `Position GPS ignorée : précision insuffisante (${Math.round(accuracy)} m).`
                        );

                        return;
                    }

                    const now = Date.now();

                    const lastSent =
                        lastGPSSendAt.current[livraison_uuid] ?? 0;

                    if (now - lastSent < 5000) {
                        return;
                    }

                    try {

                        const token =
                            await getToken();

                        if (!token) {
                            return;
                        }

                        lastGPSSendAt.current[
                            livraison_uuid
                        ] = now;

                        const response =
                            await fetch(
                                `/api/livraisons/${livraison_uuid}/position`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        Authorization:
                                            `Bearer ${token}`,
                                    },

                                    body:
                                        JSON.stringify({
                                            latitude,
                                            longitude,
                                            precision_gps:
                                                accuracy,
                                        }),
                                }
                            );

                        const data =
                            await response.json();

                        if (
                            !response.ok ||
                            !data.success
                        ) {
                            console.error(
                                "Erreur transmission position GPS :",
                                data.message
                            );
                        }

                    } catch (error) {

                        console.error(
                            "Erreur envoi position GPS :",
                            error
                        );
                    }
                },

                (error) => {

                    console.error(
                        "Erreur GPS :",
                        error
                    );

                    switch (error.code) {

                        case error.PERMISSION_DENIED:

                            toast.error(
                                "L'accès à votre position GPS a été refusé."
                            );

                            break;

                        case error.POSITION_UNAVAILABLE:

                            toast.error(
                                "Votre position GPS est momentanément indisponible."
                            );

                            break;

                        case error.TIMEOUT:

                            console.warn(
                                "Le GPS a mis trop de temps à répondre."
                            );

                            break;

                        default:

                            toast.error(
                                "Impossible de récupérer votre position GPS."
                            );
                    }
                },

                {
                    enableHighAccuracy: true,

                    // Demander une nouvelle position
                    // au maximum toutes les 5 secondes.
                    maximumAge: 5000,

                    timeout: 10000,
                }
            );

        gpsWatchIds.current[
            livraison_uuid
        ] = watchId;
    }

    /*
     * Arrêter le suivi GPS.
     */
    function stopGPSTracking(
        livraison_uuid: string
    ) {
        const watchId =
            gpsWatchIds.current[
            livraison_uuid
            ];

        if (watchId === undefined) {
            return;
        }

        navigator.geolocation.clearWatch(
            watchId
        );

        delete gpsWatchIds.current[
            livraison_uuid
        ];

        delete lastGPSSendAt.current[
            livraison_uuid
        ];
    }

    useEffect(() => {
        livraisons.forEach((livraison) => {
            if (livraison.status === "in_transit") {
                startGPSTracking(
                    livraison.uuid
                );
            } else {
                stopGPSTracking(
                    livraison.uuid
                );
            }
        });
    }, [livraisons]);

    async function getToken() {
        return localStorage.getItem("token");
    }

    async function loadLivraisons(
        showLoader = true
    ) {

        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const token = await getToken();

            if (!token) {
                toast.error(
                    "Vous devez être connecté."
                );
                return;
            }

            const response = await fetch(
                "/api/livraisons",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                toast.error(
                    data.message ??
                    "Impossible de récupérer les livraisons."
                );
                return;
            }

            const nouvellesLivraisons: Livraison[] =
                data.data ?? [];

            setLivraisons(nouvellesLivraisons);
        } catch (error) {
            console.error(
                "Erreur chargement livraisons :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }

    async function loadHistorique(
        showLoader = true
    ) {
        try {
            if (showLoader) {
                setLoadingHistorique(true);
            }

            const token = await getToken();

            if (!token) {
                toast.error(
                    "Vous devez être connecté."
                );
                return;
            }

            const response = await fetch(
                "/api/livraisons/historique",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                toast.error(
                    data.message ??
                    "Impossible de récupérer l'historique."
                );
                return;
            }

            setHistorique(
                data.data ?? []
            );
        } catch (error) {
            console.error(
                "Erreur chargement historique :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );
        } finally {
            if (showLoader) {
                setLoadingHistorique(false);
            }
        }
    }

    useEffect(() => {
        loadLivraisons();
        loadHistorique();

        return () => {
            Object.keys(
                gpsWatchIds.current
            ).forEach((livraisonUuid) => {
                stopGPSTracking(
                    livraisonUuid
                );
            });
        };
    }, []);

    async function refreshAll() {
        await Promise.all([
            loadLivraisons(false),
            loadHistorique(false),
        ]);

        toast.success(
            "Livraisons actualisées."
        );
    }

    async function updateStatus(
        livraison: Livraison,
        status: Livraison["status"]
    ) {
        if (
            updating ||
            livraison.status === status
        ) {
            return;
        }

        try {
            setUpdating(
                livraison.uuid
            );

            const token =
                await getToken();

            if (!token) {
                toast.error(
                    "Vous devez être connecté."
                );
                return;
            }

            const response =
                await fetch(
                    `/api/livraisons/${livraison.uuid}`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            status,
                        }),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                toast.error(
                    data.message ??
                    "Impossible de modifier la livraison."
                );
                return;
            }

            toast.success(
                data.message ??
                "Statut mis à jour."
            );

            // Gestion du suivi GPS selon le nouveau statut
            if (status === "in_transit") {
                startGPSTracking(livraison.uuid);
            }

            if (
                status === "delivery_pending_confirmation" ||
                status === "delivered" ||
                status === "cancelled"
            ) {
                stopGPSTracking(livraison.uuid);
            }

            await Promise.all([
                loadLivraisons(false),
                loadHistorique(false),
            ]);
        } catch (error) {
            console.error(
                "Erreur changement statut livraison :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );
        } finally {
            setUpdating(null);
        }
    }

    function getNextAction(
        status: Livraison["status"]
    ) {
        switch (status) {
            case "assigned":
                return {
                    status:
                        "picked_up" as const,
                    label:
                        "Récupérer la commande",
                    icon: Package,
                };

            case "picked_up":
                return {
                    status:
                        "in_transit" as const,
                    label:
                        "Démarrer la livraison",
                    icon: Navigation,
                };

            case "in_transit":
                return {
                    status:
                        "delivery_pending_confirmation" as const,
                    label:
                        "Déclarer la remise",
                    icon: Check,
                };

            default:
                return null;
        }
    }

    async function cancelLivraison() {

        if (!cancelModal) {
            return;
        }

        const reason =
            cancelReason.trim();

        if (!reason) {
            toast.error(
                "Veuillez indiquer le motif de l'annulation."
            );
            return;
        }

        try {

            setUpdating(
                cancelModal.uuid
            );

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Vous devez être connecté."
                );
                return;
            }

            const response =
                await fetch(
                    `/api/livraisons/${cancelModal.uuid}`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            status: "cancelled",
                            commentaire: reason,
                        }),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                toast.error(
                    data.message ??
                    "Impossible d'annuler la livraison."
                );
                return;
            }

            toast.success(
                data.message ??
                "Livraison annulée avec succès."
            );

            // Arrêter le suivi GPS
            stopGPSTracking(
                cancelModal.uuid
            );

            setCancelModal(null);
            setCancelReason("");

            await Promise.all([
                loadLivraisons(false),
                loadHistorique(false),
            ]);

        } catch (error) {

            console.error(
                "Erreur annulation livraison :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );

        } finally {

            setUpdating(null);
        }
    }

    function getStatusIcon(
        status: Livraison["status"]
    ) {
        switch (status) {
            case "delivered":
                return CheckCircle2;

            case "cancelled":
                return XCircle;

            default:
                return Clock;
        }
    }

    const activeAssigned =
        livraisons.filter(
            (item) =>
                item.status === "assigned"
        ).length;

    const activePickedUp =
        livraisons.filter(
            (item) =>
                item.status === "picked_up"
        ).length;

    const activeInTransit =
        livraisons.filter(
            (item) =>
                item.status === "in_transit"
        ).length;

    const pendingConfirmation =
        livraisons.filter(
            (item) =>
                item.status ===
                "delivery_pending_confirmation"
        ).length;

    const deliveredCount =
        historique.filter(
            (item) =>
                item.status === "delivered"
        ).length;

    const cancelledCount =
        historique.filter(
            (item) =>
                item.status === "cancelled"
        ).length;

    const displayedLivraisons =
        onglet === "active"
            ? livraisons
            : historique;

    const currentLoading =
        onglet === "active"
            ? loading
            : loadingHistorique;

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({
                            length: 4,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                            />
                        ))}
                    </div>

                    <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* En-tête */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Mes livraisons
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Consultez et gérez les livraisons qui vous sont affectées.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={refreshAll}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Actualiser
                    </button>
                </div>

                {/* Statistiques */}
                {onglet === "active" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Total en cours
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {livraisons.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                            <p className="text-sm text-yellow-700">
                                Assignées
                            </p>

                            <p className="mt-2 text-2xl font-bold text-yellow-800">
                                {activeAssigned}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                            <p className="text-sm text-blue-700">
                                Récupérées
                            </p>

                            <p className="mt-2 text-2xl font-bold text-blue-800">
                                {activePickedUp}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                            <p className="text-sm text-orange-700">
                                En attente de confirmation
                            </p>

                            <p className="mt-2 text-2xl font-bold text-orange-800">
                                {pendingConfirmation}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                            <p className="text-sm text-indigo-700">
                                En livraison
                            </p>

                            <p className="mt-2 text-2xl font-bold text-indigo-800">
                                {activeInTransit}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-3">

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Total historique
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {historique.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                            <p className="text-sm text-green-700">
                                Livrées
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-800">
                                {deliveredCount}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                            <p className="text-sm text-red-700">
                                Annulées
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-800">
                                {cancelledCount}
                            </p>
                        </div>
                    </div>
                )}

                {/* Onglets */}
                <div className="rounded-2xl bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                setOnglet("active")
                            }
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${onglet === "active"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Truck size={17} />
                                En cours

                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${onglet === "active"
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {livraisons.length}
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setOnglet("historique")
                            }
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${onglet === "historique"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays size={17} />
                                Historique

                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${onglet === "historique"
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {historique.length}
                                </span>
                            </span>
                        </button>

                    </div>
                </div>

                {/* Chargement historique */}
                {currentLoading ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <RefreshCw
                            size={30}
                            className="mx-auto animate-spin text-blue-600"
                        />

                        <p className="mt-3 text-sm text-gray-500">
                            Chargement...
                        </p>
                    </div>
                ) : displayedLivraisons.length === 0 ? (

                    /* Aucun résultat */
                    <section className="rounded-2xl bg-white p-10 text-center shadow-sm">

                        {onglet === "active" ? (
                            <Truck
                                size={48}
                                className="mx-auto text-gray-300"
                            />
                        ) : (
                            <CalendarDays
                                size={48}
                                className="mx-auto text-gray-300"
                            />
                        )}

                        <h2 className="mt-4 text-lg font-bold text-gray-900">
                            {onglet === "active"
                                ? "Aucune livraison en cours"
                                : "Aucun historique"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {onglet === "active"
                                ? "Vous n'avez actuellement aucune livraison affectée."
                                : "Vous n'avez encore aucune livraison terminée ou annulée."}
                        </p>
                    </section>

                ) : (

                    /* Liste */
                    <div className="space-y-5">

                        {displayedLivraisons.map(
                            (livraison) => {

                                const action =
                                    getNextAction(
                                        livraison.status
                                    );

                                const ActionIcon =
                                    action?.icon;

                                const StatusIcon =
                                    getStatusIcon(
                                        livraison.status
                                    );

                                return (
                                    <section
                                        key={
                                            livraison.uuid
                                        }
                                        className="overflow-hidden rounded-2xl bg-white shadow-sm"
                                    >

                                        {/* Header */}
                                        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <h2 className="text-lg font-bold text-gray-900">
                                                        Commande #
                                                        {
                                                            livraison.commande_id
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[
                                                            livraison.status
                                                        ]
                                                            }`}
                                                    >
                                                        <StatusIcon
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {
                                                            statusLabels[
                                                            livraison.status
                                                            ]
                                                        }
                                                    </span>

                                                </div>

                                                <p className="mt-1 break-all text-xs text-gray-400">
                                                    {
                                                        livraison.commande_uuid
                                                    }
                                                </p>

                                            </div>

                                            <div className="text-left sm:text-right">

                                                <p className="text-xs text-gray-500">
                                                    Montant
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-blue-600">
                                                    {formatPrice(
                                                        livraison.commande_total
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        {/* Contenu */}
                                        {/* Contenu */}
                                        <div className="space-y-6 p-5">

                                            <div className="grid gap-6 lg:grid-cols-3">

                                                {/* Client */}
                                                <div className="space-y-3">

                                                    <h3 className="font-semibold text-gray-900">
                                                        Client
                                                    </h3>

                                                    <p className="text-sm font-medium text-gray-800">
                                                        {
                                                            livraison.client_prenom
                                                        }{" "}
                                                        {
                                                            livraison.client_nom
                                                        }
                                                    </p>

                                                    <a
                                                        href={`tel:${livraison.client_telephone}`}
                                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Phone
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        {
                                                            livraison.client_telephone
                                                        }
                                                    </a>

                                                    <div className="flex items-start gap-2 text-sm text-gray-600">

                                                        <MapPin
                                                            size={
                                                                16
                                                            }
                                                            className="mt-0.5 shrink-0"
                                                        />

                                                        <span>
                                                            {
                                                                livraison.adresse_livraison ||
                                                                "Adresse non renseignée"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* Détails */}
                                                <div className="space-y-3">

                                                    <h3 className="font-semibold text-gray-900">
                                                        Livraison
                                                    </h3>

                                                    <div className="flex items-start gap-2 text-sm text-gray-600">

                                                        <CalendarDays
                                                            size={
                                                                16
                                                            }
                                                            className="mt-0.5 shrink-0"
                                                        />

                                                        <div>
                                                            <p>
                                                                Assignée le{" "}
                                                                {
                                                                    formatDate(
                                                                        livraison.assigned_at
                                                                    )
                                                                }
                                                            </p>

                                                            {livraison.picked_up_at && (
                                                                <p className="mt-1 text-xs text-gray-400">
                                                                    Récupérée le{" "}
                                                                    {
                                                                        formatDate(
                                                                            livraison.picked_up_at
                                                                        )
                                                                    }
                                                                </p>
                                                            )}

                                                            {livraison.in_transit_at && (
                                                                <p className="mt-1 text-xs text-gray-400">
                                                                    Départ le{" "}
                                                                    {
                                                                        formatDate(
                                                                            livraison.in_transit_at
                                                                        )
                                                                    }
                                                                </p>
                                                            )}

                                                            {livraison.delivered_at && (
                                                                <p className="mt-1 text-xs text-green-600">
                                                                    Livrée le{" "}
                                                                    {
                                                                        formatDate(
                                                                            livraison.delivered_at
                                                                        )
                                                                    }
                                                                </p>
                                                            )}

                                                            {livraison.cancelled_at && (
                                                                <p className="mt-1 text-xs text-red-600">
                                                                    Annulée le{" "}
                                                                    {
                                                                        formatDate(
                                                                            livraison.cancelled_at
                                                                        )
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {livraison.zone_livraison && (
                                                        <p className="text-sm text-gray-600">
                                                            Zone :{" "}
                                                            <span className="font-medium text-gray-900">
                                                                {
                                                                    livraison.zone_livraison
                                                                }
                                                            </span>
                                                        </p>
                                                    )}

                                                    {livraison.commentaire && (
                                                        <div
                                                            className={`rounded-xl p-3 text-sm ${livraison.status ===
                                                                "cancelled"
                                                                ? "bg-red-50 text-red-700"
                                                                : "bg-gray-50 text-gray-600"
                                                                }`}
                                                        >
                                                            {
                                                                livraison.commentaire
                                                            }
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col justify-between gap-4">

                                                    {livraison.latitude !==
                                                        null &&
                                                        livraison.longitude !==
                                                        null && (

                                                            <a
                                                                href={`https://www.google.com/maps?q=${livraison.latitude},${livraison.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                                            >
                                                                <MapPin
                                                                    size={
                                                                        17
                                                                    }
                                                                />

                                                                Voir la localisation
                                                            </a>
                                                        )}

                                                    {action &&
                                                        ActionIcon && (

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    updating ===
                                                                    livraison.uuid
                                                                }
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        livraison,
                                                                        action.status
                                                                    )
                                                                }
                                                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <ActionIcon
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                                {updating ===
                                                                    livraison.uuid
                                                                    ? "Mise à jour..."
                                                                    : action.label}
                                                            </button>
                                                        )}

                                                    {livraison.status !== "delivered" &&
                                                        livraison.status !== "cancelled" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    updating === livraison.uuid
                                                                }
                                                                onClick={() => {
                                                                    setCancelModal(livraison);
                                                                    setCancelReason("");
                                                                }}
                                                                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <XCircle size={18} />
                                                                Annuler la livraison
                                                            </button>
                                                        )}

                                                    {livraison.status ===
                                                        "delivered" && (

                                                            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                                                                <Check
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                                Livraison terminée
                                                            </div>
                                                        )}

                                                    {livraison.status ===
                                                        "cancelled" && (

                                                            <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                                                <XCircle
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                                Livraison annulée
                                                            </div>
                                                        )}

                                                    {onglet ===
                                                        "historique" && (
                                                            <p className="text-center text-xs text-gray-400">
                                                                Terminée le{" "}
                                                                {formatShortDate(
                                                                    livraison.delivered_at ??
                                                                    livraison.cancelled_at
                                                                )}
                                                            </p>
                                                        )}

                                                </div>

                                            </div>
                                            <LivraisonTimeline livraison={livraison} />
                                        </div>
                                    </section>
                                );
                            }
                        )}

                    </div>
                )}
                {cancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <div className="flex items-start justify-between gap-4">

                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Annuler la livraison
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Commande #{cancelModal.commande_id}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setCancelModal(null);
                                        setCancelReason("");
                                    }}
                                    disabled={
                                        updating === cancelModal.uuid
                                    }
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <XCircle size={20} />
                                </button>

                            </div>

                            <div className="mt-5">

                                <label
                                    htmlFor="cancel-reason"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Motif de l'annulation
                                </label>

                                <textarea
                                    id="cancel-reason"
                                    value={cancelReason}
                                    onChange={(event) =>
                                        setCancelReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex. Client absent, adresse incorrecte..."
                                    rows={4}
                                    maxLength={500}
                                    disabled={
                                        updating === cancelModal.uuid
                                    }
                                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                                />

                                <div className="mt-1 flex justify-end">
                                    <span className="text-xs text-gray-400">
                                        {cancelReason.length}/500
                                    </span>
                                </div>

                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setCancelModal(null);
                                        setCancelReason("");
                                    }}
                                    disabled={
                                        updating === cancelModal.uuid
                                    }
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Retour
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelLivraison}
                                    disabled={
                                        updating === cancelModal.uuid ||
                                        !cancelReason.trim()
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <XCircle size={17} />

                                    {updating === cancelModal.uuid
                                        ? "Annulation..."
                                        : "Confirmer l'annulation"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}