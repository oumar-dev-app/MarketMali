"use client";

import LivreurQrScanner from "./LivreurQrScanner";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    MapPin,
    Navigation,
    Package,
    Phone,
    QrCode,
    RefreshCw,
    Truck,
    User,
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

const statusLabels: Record<Livraison["status"], string> = {
    assigned: "Assignée",
    picked_up: "Colis récupéré",
    in_transit: "En livraison",
    delivery_pending_confirmation: "En attente de confirmation",
    delivered: "Livrée",
    cancelled: "Annulée",
};

const statusClasses: Record<Livraison["status"], string> = {
    assigned: "border-blue-200 bg-blue-50 text-blue-700",
    picked_up: "border-indigo-200 bg-indigo-50 text-indigo-700",
    in_transit: "border-purple-200 bg-purple-50 text-purple-700",
    delivery_pending_confirmation:
        "border-orange-200 bg-orange-50 text-orange-700",
    delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
};

const statusDotClasses: Record<Livraison["status"], string> = {
    assigned: "bg-blue-500",
    picked_up: "bg-indigo-500",
    in_transit: "bg-purple-500",
    delivery_pending_confirmation: "bg-orange-500",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-500",
};

function formatPrice(value: string | number) {
    return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortDate(value: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getStatusIcon(status: Livraison["status"]) {
    switch (status) {
        case "assigned":
            return Clock;

        case "picked_up":
            return Package;

        case "in_transit":
            return Navigation;

        case "delivery_pending_confirmation":
            return AlertCircle;

        case "delivered":
            return CheckCircle2;

        case "cancelled":
            return XCircle;

        default:
            return Clock;
    }
}

function getStepIndex(status: Livraison["status"]) {
    const steps: Livraison["status"][] = [
        "assigned",
        "picked_up",
        "in_transit",
        "delivery_pending_confirmation",
        "delivered",
    ];

    return steps.indexOf(status);
}

function getStatusMessage(status: Livraison["status"]) {
    switch (status) {
        case "assigned":
            return {
                title: "Nouvelle livraison assignée",
                description:
                    "Scannez le QR code du colis pour confirmer sa récupération.",
                icon: QrCode,
                className:
                    "border-blue-200 bg-blue-50 text-blue-800",
            };

        case "picked_up":
            return {
                title: "Colis récupéré",
                description:
                    "Le colis est avec vous. Vous pouvez maintenant démarrer la livraison.",
                icon: Package,
                className:
                    "border-indigo-200 bg-indigo-50 text-indigo-800",
            };

        case "in_transit":
            return {
                title: "Livraison en cours",
                description:
                    "Votre position GPS est transmise pendant le trajet.",
                icon: Navigation,
                className:
                    "border-purple-200 bg-purple-50 text-purple-800",
            };

        case "delivery_pending_confirmation":
            return {
                title: "Remise déclarée",
                description:
                    "Le client doit confirmer la réception avant que la livraison soit finalisée.",
                icon: AlertCircle,
                className:
                    "border-orange-200 bg-orange-50 text-orange-800",
            };

        case "delivered":
            return {
                title: "Livraison confirmée",
                description:
                    "La réception du colis a été confirmée par le client.",
                icon: CheckCircle2,
                className:
                    "border-emerald-200 bg-emerald-50 text-emerald-800",
            };

        case "cancelled":
            return {
                title: "Livraison annulée",
                description:
                    "Cette livraison ne peut plus être reprise.",
                icon: XCircle,
                className:
                    "border-red-200 bg-red-50 text-red-800",
            };

        default:
            return {
                title: "Livraison",
                description: "",
                icon: Clock,
                className:
                    "border-gray-200 bg-gray-50 text-gray-700",
            };
    }
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
            shortLabel: "Assignée",
            date: livraison.assigned_at,
            icon: Truck,
        },
        {
            key: "picked_up",
            label: "Commande récupérée",
            shortLabel: "Récupérée",
            date: livraison.picked_up_at,
            icon: Package,
        },
        {
            key: "in_transit",
            label: "En livraison",
            shortLabel: "En route",
            date: livraison.in_transit_at,
            icon: Navigation,
        },
        {
            key: "delivery_pending_confirmation",
            label: "Remise déclarée",
            shortLabel: "Remise",
            date: livraison.delivery_pending_confirmation_at,
            icon: Clock,
        },
        {
            key: "delivered",
            label: "Réception confirmée",
            shortLabel: "Confirmée",
            date: livraison.delivered_at,
            icon: CheckCircle2,
        },
    ];

    const currentIndex = getStepIndex(livraison.status);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 sm:text-base">
                        <Clock className="h-4 w-4 text-gray-500" />
                        Progression
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                        Suivi des différentes étapes
                    </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-500">
                    {livraison.status === "cancelled"
                        ? "Annulée"
                        : `${Math.max(currentIndex + 1, 1)}/5`}
                </span>
            </div>

            <div className="hidden sm:block">
                <div className="relative flex justify-between">
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />

                    <div
                        className="absolute left-0 top-4 h-0.5 bg-emerald-500 transition-all"
                        style={{
                            width:
                                currentIndex <= 0
                                    ? "0%"
                                    : `${(currentIndex / (steps.length - 1)) *
                                    100}%`,
                        }}
                    />

                    {steps.map((step, index) => {
                        const StepIcon = step.icon;

                        const completed =
                            livraison.status !== "cancelled" &&
                            currentIndex >= index;

                        const current =
                            livraison.status !== "cancelled" &&
                            currentIndex === index;

                        return (
                            <div
                                key={step.key}
                                className="relative z-10 flex w-1/5 flex-col items-center"
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${completed
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-gray-200 bg-white text-gray-400"
                                        } ${current
                                            ? "ring-4 ring-emerald-50"
                                            : ""
                                        }`}
                                >
                                    {completed ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <StepIcon className="h-3.5 w-3.5" />
                                    )}
                                </div>

                                <p
                                    className={`mt-2 text-center text-[10px] font-semibold ${completed
                                        ? "text-gray-800"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {step.shortLabel}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3 sm:hidden">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;

                    const completed =
                        livraison.status !== "cancelled" &&
                        currentIndex >= index;

                    const current =
                        livraison.status !== "cancelled" &&
                        currentIndex === index;

                    return (
                        <div
                            key={step.key}
                            className="flex items-center gap-3"
                        >
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${completed
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-100 text-gray-400"
                                    }`}
                            >
                                {completed ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <StepIcon className="h-4 w-4" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p
                                    className={`text-xs font-semibold ${completed
                                        ? "text-gray-900"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {step.label}
                                </p>

                                <p className="mt-0.5 text-[11px] text-gray-400">
                                    {step.date
                                        ? formatDate(step.date)
                                        : "En attente"}
                                </p>
                            </div>

                            {current && (
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                                    En cours
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {livraison.status === "cancelled" && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Livraison annulée
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                            {livraison.cancelled_at
                                ? formatDate(livraison.cancelled_at)
                                : "Date inconnue"}
                        </p>

                        {livraison.commentaire && (
                            <p className="mt-2 rounded-lg bg-white/70 p-3 text-xs leading-5 text-red-700">
                                {livraison.commentaire}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    className,
}: {
    label: string;
    value: number;
    description: string;
    icon: typeof Truck;
    className: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-gray-500 sm:text-sm">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                        {value}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
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

    const [qrScannerLivraison, setQrScannerLivraison] =
        useState<Livraison | null>(null);

    const [onglet, setOnglet] =
        useState<Onglet>("active");

    const lastGPSSendAt =
        useRef<Record<string, number>>({});

    const gpsWatchIds =
        useRef<Record<string, number>>({});

    function startGPSTracking(
        livraison_uuid: string
    ) {
        if (
            typeof navigator === "undefined" ||
            !navigator.geolocation
        ) {
            toast.error(
                "La géolocalisation n'est pas disponible sur cet appareil."
            );

            return;
        }

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

                    if (accuracy > 500) {
                        console.warn(
                            `Position GPS ignorée : précision insuffisante (${Math.round(
                                accuracy
                            )} m).`
                        );

                        return;
                    }

                    const now = Date.now();

                    const lastSent =
                        lastGPSSendAt.current[
                        livraison_uuid
                        ] ?? 0;

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
                                    body: JSON.stringify({
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
                    maximumAge: 5000,
                    timeout: 10000,
                }
            );

        gpsWatchIds.current[
            livraison_uuid
        ] = watchId;
    }

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

            setLivraisons(
                nouvellesLivraisons
            );
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

            if (status === "in_transit") {
                startGPSTracking(
                    livraison.uuid
                );
            }

            if (
                status ===
                "delivery_pending_confirmation" ||
                status === "delivered" ||
                status === "cancelled"
            ) {
                stopGPSTracking(
                    livraison.uuid
                );
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
                    status: "assigned" as const,
                    label: "Scanner le QR du colis",
                    icon: QrCode,
                };

            case "picked_up":
                return {
                    status: "in_transit" as const,
                    label: "Démarrer la livraison",
                    icon: Navigation,
                };

            case "in_transit":
                return {
                    status:
                        "delivery_pending_confirmation" as const,
                    label: "Déclarer la remise",
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

    const activeDelivery =
        useMemo(() => {
            const priority: Livraison["status"][] = [
                "in_transit",
                "delivery_pending_confirmation",
                "picked_up",
                "assigned",
            ];

            for (const status of priority) {
                const found =
                    livraisons.find(
                        (item) =>
                            item.status === status
                    );

                if (found) {
                    return found;
                }
            }

            return null;
        }, [livraisons]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200" />

                        <div className="space-y-2">
                            <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Array.from({
                            length: 4,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                            />
                        ))}
                    </div>

                    <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/80">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

                {/* HEADER */}
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                            <Truck className="h-6 w-6" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                Mes livraisons
                            </h1>

                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Gérez vos livraisons et suivez chaque étape.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={refreshAll}
                        disabled={refreshing}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        {refreshing
                            ? "Actualisation..."
                            : "Actualiser"}
                    </button>
                </header>

                {/* LIVRAISON PRIORITAIRE */}
                {onglet === "active" &&
                    activeDelivery && (
                        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 bg-gray-900 px-4 py-4 text-white sm:px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Livraison prioritaire
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold">
                                            Commande #
                                            {
                                                activeDelivery.commande_id
                                            }
                                        </h2>
                                    </div>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-xs ${statusClasses[
                                            activeDelivery.status
                                        ]}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${statusDotClasses[
                                                activeDelivery.status
                                            ]}`}
                                        />

                                        {
                                            statusLabels[
                                            activeDelivery.status
                                            ]
                                        }
                                    </span>
                                </div>
                            </div>

                            {(() => {
                                const message =
                                    getStatusMessage(
                                        activeDelivery.status
                                    );

                                const MessageIcon =
                                    message.icon;

                                return (
                                    <div
                                        className={`border-b p-4 sm:p-5 ${message.className}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                                                <MessageIcon className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-bold">
                                                    {
                                                        message.title
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs leading-5 opacity-80">
                                                    {
                                                        message.description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
                                <div className="rounded-xl bg-gray-50 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                        Client
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-gray-900">
                                        {
                                            activeDelivery.client_prenom
                                        }{" "}
                                        {
                                            activeDelivery.client_nom
                                        }
                                    </p>

                                    <a
                                        href={`tel:${activeDelivery.client_telephone}`}
                                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600"
                                    >
                                        <Phone className="h-3.5 w-3.5" />

                                        {
                                            activeDelivery.client_telephone
                                        }
                                    </a>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                        Destination
                                    </p>

                                    <p className="mt-1.5 text-sm font-semibold text-gray-900">
                                        {
                                            activeDelivery.zone_livraison
                                        }
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        {activeDelivery.adresse_livraison ||
                                            "Adresse non renseignée"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                                        Montant
                                    </p>

                                    <p className="mt-1.5 text-base font-bold text-gray-900">
                                        {formatPrice(
                                            activeDelivery.commande_total
                                        )}
                                    </p>

                                    {activeDelivery.status ===
                                        "in_transit" && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700">
                                            <Navigation className="h-3 w-3" />
                                            GPS actif
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                {/* STATS */}
                {onglet === "active" ? (
                    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard
                            label="En cours"
                            value={livraisons.length}
                            description="Total affecté"
                            icon={Truck}
                            className="bg-gray-100 text-gray-700"
                        />

                        <StatCard
                            label="À récupérer"
                            value={activeAssigned}
                            description="QR à scanner"
                            icon={QrCode}
                            className="bg-blue-50 text-blue-600"
                        />

                        <StatCard
                            label="En livraison"
                            value={activeInTransit}
                            description="GPS actif"
                            icon={Navigation}
                            className="bg-purple-50 text-purple-600"
                        />

                        <StatCard
                            label="À confirmer"
                            value={pendingConfirmation}
                            description="Remise déclarée"
                            icon={AlertCircle}
                            className="bg-orange-50 text-orange-600"
                        />
                    </section>
                ) : (
                    <section className="mb-6 grid grid-cols-3 gap-3">
                        <StatCard
                            label="Total"
                            value={historique.length}
                            description="Historique"
                            icon={CalendarDays}
                            className="bg-gray-100 text-gray-700"
                        />

                        <StatCard
                            label="Livrées"
                            value={deliveredCount}
                            description="Confirmées"
                            icon={CheckCircle2}
                            className="bg-emerald-50 text-emerald-600"
                        />

                        <StatCard
                            label="Annulées"
                            value={cancelledCount}
                            description="Annulations"
                            icon={XCircle}
                            className="bg-red-50 text-red-600"
                        />
                    </section>
                )}

                {/* ONGLETS */}
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                setOnglet("active")
                            }
                            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${onglet === "active"
                                ? "bg-gray-900 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Truck className="h-4 w-4" />

                                En cours

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] ${onglet === "active"
                                        ? "bg-white/15 text-white"
                                        : "bg-gray-100 text-gray-500"
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
                            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${onglet === "historique"
                                ? "bg-gray-900 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />

                                Historique

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] ${onglet === "historique"
                                        ? "bg-white/15 text-white"
                                        : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {historique.length}
                                </span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* CHARGEMENT */}
                {currentLoading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-gray-400" />

                        <p className="mt-3 text-sm text-gray-500">
                            Chargement...
                        </p>
                    </div>
                ) : displayedLivraisons.length === 0 ? (
                    <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            {onglet === "active" ? (
                                <Truck className="h-6 w-6" />
                            ) : (
                                <CalendarDays className="h-6 w-6" />
                            )}
                        </div>

                        <h2 className="mt-4 text-base font-bold text-gray-900">
                            {onglet === "active"
                                ? "Aucune livraison en cours"
                                : "Aucun historique"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            {onglet === "active"
                                ? "Vous n'avez actuellement aucune livraison affectée."
                                : "Vous n'avez encore aucune livraison terminée ou annulée."}
                        </p>
                    </section>
                ) : (
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

                                const isUpdating =
                                    updating ===
                                    livraison.uuid;

                                const isGpsActive =
                                    livraison.status ===
                                    "in_transit";

                                const statusMessage =
                                    getStatusMessage(
                                        livraison.status
                                    );

                                return (
                                    <article
                                        key={
                                            livraison.uuid
                                        }
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        {/* CARD HEADER */}
                                        <div className="border-b border-gray-100 p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${livraison.status ===
                                                            "delivery_pending_confirmation"
                                                            ? "bg-orange-50 text-orange-600"
                                                            : livraison.status ===
                                                                "in_transit"
                                                                ? "bg-purple-50 text-purple-600"
                                                                : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        <StatusIcon className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h2 className="font-bold text-gray-900">
                                                                Commande #
                                                                {
                                                                    livraison.commande_id
                                                                }
                                                            </h2>

                                                            {isGpsActive && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700">
                                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
                                                                    GPS actif
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 truncate text-xs text-gray-400">
                                                            {
                                                                livraison.commande_uuid
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:text-xs ${statusClasses[
                                                        livraison.status
                                                    ]}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${statusDotClasses[
                                                            livraison.status
                                                        ]}`}
                                                    />

                                                    {
                                                        statusLabels[
                                                        livraison.status
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* STATUS BANNER */}
                                        {livraison.status !==
                                            "delivered" &&
                                            livraison.status !==
                                            "cancelled" && (
                                                <div
                                                    className={`border-b px-4 py-3.5 sm:px-5 ${statusMessage.className}`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <statusMessage.icon className="mt-0.5 h-4 w-4 shrink-0" />

                                                        <div>
                                                            <p className="text-xs font-bold">
                                                                {
                                                                    statusMessage.title
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] leading-5 opacity-80">
                                                                {
                                                                    statusMessage.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        {/* BODY */}
                                        <div className="space-y-5 p-4 sm:p-5">
                                            <div className="grid gap-4 lg:grid-cols-3">

                                                {/* CLIENT */}
                                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                                                            <User className="h-4 w-4" />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                            Client
                                                        </span>
                                                    </div>

                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            livraison.client_prenom
                                                        }{" "}
                                                        {
                                                            livraison.client_nom
                                                        }
                                                    </p>

                                                    <a
                                                        href={`tel:${livraison.client_telephone}`}
                                                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-gray-100 transition hover:bg-blue-50"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />

                                                        {
                                                            livraison.client_telephone
                                                        }
                                                    </a>
                                                </div>

                                                {/* DESTINATION */}
                                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                                                            <MapPin className="h-4 w-4" />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                            Destination
                                                        </span>
                                                    </div>

                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            livraison.zone_livraison
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                                        {livraison.adresse_livraison ||
                                                            "Adresse non renseignée"}
                                                    </p>
                                                </div>

                                                {/* LIVRAISON */}
                                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                                                            <CalendarDays className="h-4 w-4" />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                            Livraison
                                                        </span>
                                                    </div>

                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(
                                                            livraison.commande_total
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Assignée le{" "}
                                                        {formatDate(
                                                            livraison.assigned_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* GPS */}
                                            {(isGpsActive ||
                                                (livraison.latitude !==
                                                    null &&
                                                    livraison.longitude !==
                                                    null)) && (
                                                    <div
                                                        className={`rounded-xl border p-4 ${isGpsActive
                                                            ? "border-purple-100 bg-purple-50/70"
                                                            : "border-emerald-100 bg-emerald-50/70"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isGpsActive
                                                                        ? "bg-purple-100 text-purple-600"
                                                                        : "bg-emerald-100 text-emerald-600"
                                                                        }`}
                                                                >
                                                                    <Navigation className="h-4 w-4" />
                                                                </div>

                                                                <div>
                                                                    <p
                                                                        className={`text-xs font-bold ${isGpsActive
                                                                            ? "text-purple-800"
                                                                            : "text-emerald-800"
                                                                            }`}
                                                                    >
                                                                        {isGpsActive
                                                                            ? "Suivi GPS actif"
                                                                            : "Dernière position disponible"}
                                                                    </p>

                                                                    <p
                                                                        className={`mt-1 text-[11px] ${isGpsActive
                                                                            ? "text-purple-600"
                                                                            : "text-emerald-600"
                                                                            }`}
                                                                    >
                                                                        {isGpsActive
                                                                            ? "Votre position est transmise pendant le trajet."
                                                                            : "Une position GPS est enregistrée pour cette livraison."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {livraison.latitude !==
                                                                null &&
                                                                livraison.longitude !==
                                                                null && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${livraison.latitude},${livraison.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                                                                    >
                                                                        <MapPin className="h-3.5 w-3.5" />
                                                                        Voir la position
                                                                    </a>
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* DATES */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-400">
                                                {livraison.picked_up_at && (
                                                    <span>
                                                        Récupérée :{" "}
                                                        <strong className="font-medium text-gray-600">
                                                            {formatDate(
                                                                livraison.picked_up_at
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {livraison.in_transit_at && (
                                                    <span>
                                                        Départ :{" "}
                                                        <strong className="font-medium text-gray-600">
                                                            {formatDate(
                                                                livraison.in_transit_at
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {livraison.delivery_pending_confirmation_at && (
                                                    <span className="text-orange-600">
                                                        Remise déclarée :{" "}
                                                        <strong className="font-semibold">
                                                            {formatDate(
                                                                livraison.delivery_pending_confirmation_at
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {livraison.delivered_at && (
                                                    <span className="text-emerald-600">
                                                        Confirmée :{" "}
                                                        <strong className="font-semibold">
                                                            {formatDate(
                                                                livraison.delivered_at
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {livraison.cancelled_at && (
                                                    <span className="text-red-600">
                                                        Annulée :{" "}
                                                        <strong className="font-semibold">
                                                            {formatDate(
                                                                livraison.cancelled_at
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}
                                            </div>

                                            {/* COMMENTAIRE */}
                                            {livraison.commentaire && (
                                                <div
                                                    className={`rounded-xl border p-3.5 text-xs leading-5 ${livraison.status ===
                                                        "cancelled"
                                                        ? "border-red-100 bg-red-50 text-red-700"
                                                        : "border-gray-100 bg-gray-50 text-gray-600"
                                                        }`}
                                                >
                                                    <p className="mb-1 font-semibold">
                                                        Note
                                                    </p>

                                                    {
                                                        livraison.commentaire
                                                    }
                                                </div>
                                            )}

                                            {/* ACTIONS */}
                                            {onglet === "active" &&
                                                livraison.status !==
                                                "delivered" &&
                                                livraison.status !==
                                                "cancelled" && (
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {action &&
                                                            ActionIcon && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            livraison.status ===
                                                                            "assigned"
                                                                        ) {
                                                                            setQrScannerLivraison(
                                                                                livraison
                                                                            );
                                                                            return;
                                                                        }

                                                                        updateStatus(
                                                                            livraison,
                                                                            action.status
                                                                        );
                                                                    }}
                                                                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${livraison.status ===
                                                                        "delivery_pending_confirmation"
                                                                        ? "bg-orange-500 hover:bg-orange-600"
                                                                        : "bg-gray-900 hover:bg-gray-800"
                                                                        }`}
                                                                >
                                                                    {isUpdating ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <ActionIcon className="h-4 w-4" />
                                                                    )}

                                                                    {isUpdating
                                                                        ? "Mise à jour..."
                                                                        : action.label}
                                                                </button>
                                                            )}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            onClick={() => {
                                                                setCancelModal(
                                                                    livraison
                                                                );
                                                                setCancelReason(
                                                                    ""
                                                                );
                                                            }}
                                                            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <XCircle className="h-4 w-4" />

                                                            Annuler
                                                        </button>
                                                    </div>
                                                )}

                                            {/* FINAL STATUS */}
                                            {livraison.status ===
                                                "delivered" && (
                                                    <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                                        <CheckCircle2 className="h-5 w-5" />

                                                        Livraison terminée et confirmée
                                                    </div>
                                                )}

                                            {livraison.status ===
                                                "cancelled" && (
                                                    <div className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                                        <XCircle className="h-5 w-5" />

                                                        Livraison annulée
                                                    </div>
                                                )}

                                            {onglet ===
                                                "historique" && (
                                                    <p className="text-center text-[11px] text-gray-400">
                                                        {livraison.status ===
                                                            "delivered"
                                                            ? "Confirmée le "
                                                            : "Annulée le "}
                                                        {formatShortDate(
                                                            livraison.delivered_at ??
                                                            livraison.cancelled_at
                                                        )}
                                                    </p>
                                                )}

                                            <LivraisonTimeline
                                                livraison={
                                                    livraison
                                                }
                                            />
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

                {/* MODAL ANNULATION */}
                {cancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="border-b border-gray-100 p-5 sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                            <XCircle className="h-5 w-5" />
                                        </div>

                                        <h2 className="text-lg font-bold text-gray-900">
                                            Annuler la livraison
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Commande #
                                            {
                                                cancelModal.commande_id
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCancelModal(
                                                null
                                            );
                                            setCancelReason(
                                                ""
                                            );
                                        }}
                                        disabled={
                                            updating ===
                                            cancelModal.uuid
                                        }
                                        className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
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
                                        updating ===
                                        cancelModal.uuid
                                    }
                                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50 disabled:bg-gray-100"
                                />

                                <div className="mt-1 flex justify-end">
                                    <span className="text-[11px] text-gray-400">
                                        {
                                            cancelReason.length
                                        }
                                        /500
                                    </span>
                                </div>

                                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3.5">
                                    <p className="text-xs leading-5 text-red-700">
                                        Cette action annulera la livraison.
                                        Veuillez vérifier le motif avant de
                                        confirmer.
                                    </p>
                                </div>

                                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCancelModal(
                                                null
                                            );
                                            setCancelReason(
                                                ""
                                            );
                                        }}
                                        disabled={
                                            updating ===
                                            cancelModal.uuid
                                        }
                                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Retour
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            cancelLivraison
                                        }
                                        disabled={
                                            updating ===
                                            cancelModal.uuid ||
                                            !cancelReason.trim()
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updating ===
                                            cancelModal.uuid ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}

                                        {updating ===
                                            cancelModal.uuid
                                            ? "Annulation..."
                                            : "Confirmer l'annulation"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR SCANNER */}
                {qrScannerLivraison && (
                    <LivreurQrScanner
                        livraisonUuid={
                            qrScannerLivraison.uuid
                        }
                        onSuccess={async () => {
                            setQrScannerLivraison(
                                null
                            );

                            await Promise.all([
                                loadLivraisons(false),
                                loadHistorique(false),
                            ]);

                            toast.success(
                                "Colis récupéré. La livraison peut maintenant être démarrée."
                            );
                        }}
                        onClose={() => {
                            setQrScannerLivraison(
                                null
                            );
                        }}
                    />
                )}
            </div>
        </main>
    );
}

