"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Eye,
    MapPin,
    MoreVertical,
    Navigation,
    Package,
    RefreshCw,
    Search,
    Settings2,
    Truck,
    User,
    X,
    XCircle,
} from "lucide-react";

type LivraisonStatus =
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivery_pending_confirmation"
    | "delivered"
    | "cancelled";

type StatutFiltre = LivraisonStatus | "all";

type ActionType = "details" | "gps" | "manage" | null;

interface Livraison {
    id: number;
    uuid: string;

    commande_uuid: string;
    commande_total: number | string;
    frais_livraison: number | string;
    commande_status: string;

    client_nom?: string | null;
    client_prenom?: string | null;
    client_telephone?: string | null;

    livreur_uuid?: string | null;
    livreur_nom?: string | null;
    livreur_prenom?: string | null;
    livreur_telephone?: string | null;

    zone_livraison?: string | null;
    adresse_livraison?: string | null;

    status: LivraisonStatus;

    latitude?: number | string | null;
    longitude?: number | string | null;
    precision_gps?: number | string | null;

    created_at?: string;
    updated_at?: string;
}

const STATUS_LABELS: Record<LivraisonStatus, string> = {
    assigned: "Assignée",
    picked_up: "Récupérée",
    in_transit: "En transit",
    delivery_pending_confirmation: "À confirmer",
    delivered: "Livrée",
    cancelled: "Annulée",
};

function formatPrice(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);

    return (
        new Intl.NumberFormat("fr-FR", {
            maximumFractionDigits: 0,
        }).format(amount) + " FCFA"
    );
}

function formatDate(value?: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value?: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getCommandeLabel(livraison: Livraison) {
    if (!livraison.commande_uuid) {
        return "Commande";
    }

    return `#${livraison.commande_uuid
        .slice(0, 8)
        .toUpperCase()}`;
}

function getClientName(livraison: Livraison) {
    const name = [
        livraison.client_prenom,
        livraison.client_nom,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Client";
}

function getLivreurName(livraison: Livraison) {
    const name = [
        livraison.livreur_prenom,
        livraison.livreur_nom,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Non assigné";
}

function getStatusClasses(status: LivraisonStatus) {
    switch (status) {
        case "assigned":
            return "bg-blue-50 text-blue-700 ring-blue-200";

        case "picked_up":
            return "bg-indigo-50 text-indigo-700 ring-indigo-200";

        case "in_transit":
            return "bg-purple-50 text-purple-700 ring-purple-200";

        case "delivery_pending_confirmation":
            return "bg-orange-50 text-orange-700 ring-orange-200";

        case "delivered":
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";

        case "cancelled":
            return "bg-red-50 text-red-700 ring-red-200";

        default:
            return "bg-gray-50 text-gray-700 ring-gray-200";
    }
}

function StatusIcon({
    status,
    className = "h-4 w-4",
}: {
    status: LivraisonStatus;
    className?: string;
}) {
    switch (status) {
        case "assigned":
            return <Clock className={className} />;

        case "picked_up":
            return <Package className={className} />;

        case "in_transit":
            return <Truck className={className} />;

        case "delivery_pending_confirmation":
            return <AlertCircle className={className} />;

        case "delivered":
            return <CheckCircle className={className} />;

        case "cancelled":
            return <XCircle className={className} />;

        default:
            return <Clock className={className} />;
    }
}

function StatCard({
    label,
    value,
    icon,
    description,
    variant = "gray",
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    variant?: "gray" | "blue" | "orange" | "green";
}) {
    const variants = {
        gray: {
            card: "border-gray-200",
            icon: "bg-gray-100 text-gray-700",
            value: "text-gray-900",
        },
        blue: {
            card: "border-blue-200",
            icon: "bg-blue-50 text-blue-600",
            value: "text-blue-700",
        },
        orange: {
            card: "border-orange-200",
            icon: "bg-orange-50 text-orange-600",
            value: "text-orange-700",
        },
        green: {
            card: "border-emerald-200",
            icon: "bg-emerald-50 text-emerald-600",
            value: "text-emerald-700",
        },
    };

    const current = variants[variant];

    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${current.card}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {label}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold tracking-tight ${current.value}`}
                    >
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function EmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <Truck className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900">
                Aucune livraison trouvée
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {hasFilters
                    ? "Aucune livraison ne correspond aux critères de recherche sélectionnés."
                    : "Les livraisons apparaîtront ici dès qu'elles seront créées."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                    Réinitialiser les filtres
                </button>
            )}
        </div>
    );
}

export default function GestionLivraisons() {
    const [livraisons, setLivraisons] = useState<
        Livraison[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statut, setStatut] =
        useState<StatutFiltre>("all");

    const [openMenuUuid, setOpenMenuUuid] =
        useState<string | null>(null);

    const [selectedLivraison, setSelectedLivraison] =
        useState<Livraison | null>(null);

    const [activeAction, setActiveAction] =
        useState<ActionType>(null);

    const loadLivraisons = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "/api/dashboard/livraisons",
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de récupérer les livraisons."
                );
            }

            const result = await response.json();

            const data = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.livraisons)
                        ? result.livraisons
                        : [];

            setLivraisons(data);
        } catch (error) {
            console.error(
                "Erreur chargement livraisons:",
                error
            );

            setLivraisons([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadLivraisons();
    }, []);

    const stats = useMemo(() => {
        const total = livraisons.length;

        const enCours = livraisons.filter((item) =>
            [
                "assigned",
                "picked_up",
                "in_transit",
            ].includes(item.status)
        ).length;

        const aConfirmer = livraisons.filter(
            (item) =>
                item.status ===
                "delivery_pending_confirmation"
        ).length;

        const livrees = livraisons.filter(
            (item) => item.status === "delivered"
        ).length;

        return {
            total,
            enCours,
            aConfirmer,
            livrees,
        };
    }, [livraisons]);

    const filteredLivraisons = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return livraisons.filter((livraison) => {
            const matchesStatus =
                statut === "all" ||
                livraison.status === statut;

            if (!matchesStatus) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                livraison.uuid,
                livraison.commande_uuid,
                getCommandeLabel(livraison),
                getClientName(livraison),
                getLivreurName(livraison),
                livraison.client_telephone,
                livraison.livreur_telephone,
                livraison.zone_livraison,
                livraison.adresse_livraison,
                STATUS_LABELS[livraison.status],
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );
        });
    }, [livraisons, search, statut]);

    const hasFilters =
        search.trim().length > 0 || statut !== "all";

    const resetFilters = () => {
        setSearch("");
        setStatut("all");
    };

    const openAction = (
        livraison: Livraison,
        action: Exclude<ActionType, null>
    ) => {
        setSelectedLivraison(livraison);
        setActiveAction(action);
        setOpenMenuUuid(null);
    };

    const closeAction = () => {
        setSelectedLivraison(null);
        setActiveAction(null);
    };

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                setOpenMenuUuid(null);

                if (activeAction) {
                    closeAction();
                }
            }
        };

        const handleClickOutside = (
            event: MouseEvent
        ) => {
            const target =
                event.target as HTMLElement;

            if (
                !target.closest(
                    "[data-livraison-menu]"
                )
            ) {
                setOpenMenuUuid(null);
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [activeAction]);

    const hasGps = (livraison: Livraison) => {
        return (
            livraison.latitude !== null &&
            livraison.latitude !== undefined &&
            livraison.longitude !== null &&
            livraison.longitude !== undefined
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/70">
            <div className="mx-auto w-full max-w-375 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER */}
                <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="relative p-5 sm:p-6 lg:p-7">
                        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-50 blur-3xl" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                    <Truck className="h-3.5 w-3.5" />
                                    Gestion logistique
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    Livraisons
                                </h1>

                                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
                                    Suivez les livraisons,
                                    consultez leur statut et
                                    gérez leur progression.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    loadLivraisons(true)
                                }
                                disabled={refreshing}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${refreshing
                                        ? "animate-spin"
                                        : ""
                                        }`}
                                />
                                Actualiser
                            </button>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={stats.total}
                        description="Toutes les livraisons"
                        icon={
                            <Package className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="En cours"
                        value={stats.enCours}
                        description="Livraisons actives"
                        icon={
                            <Truck className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="À confirmer"
                        value={stats.aConfirmer}
                        description="En attente du client"
                        variant="orange"
                        icon={
                            <AlertCircle className="h-5 w-5" />
                        }
                    />

                    <StatCard
                        label="Livrées"
                        value={stats.livrees}
                        description="Livraisons terminées"
                        icon={
                            <CheckCircle className="h-5 w-5" />
                        }
                    />
                </section>

                {/* FILTERS */}
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Rechercher une commande, un client, un livreur..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                            />
                        </div>

                        <select
                            value={statut}
                            onChange={(event) =>
                                setStatut(
                                    event.target
                                        .value as StatutFiltre
                                )
                            }
                            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                        >
                            <option value="all">
                                Tous les statuts
                            </option>

                            <option value="assigned">
                                Assignées
                            </option>

                            <option value="picked_up">
                                Récupérées
                            </option>

                            <option value="in_transit">
                                En transit
                            </option>

                            <option value="delivery_pending_confirmation">
                                À confirmer
                            </option>

                            <option value="delivered">
                                Livrées
                            </option>

                            <option value="cancelled">
                                Annulées
                            </option>
                        </select>

                        <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-2.5 lg:justify-center">
                            <span className="text-xs font-medium text-gray-500">
                                Résultats
                            </span>

                            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm ring-1 ring-gray-200">
                                {
                                    filteredLivraisons.length
                                }
                            </span>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="h-11 rounded-xl px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                Effacer
                            </button>
                        )}
                    </div>
                </section>

                {/* TABLE / CARDS */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="space-y-3 p-4">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-20 animate-pulse rounded-xl bg-gray-100"
                                    />
                                )
                            )}
                        </div>
                    ) : filteredLivraisons.length ===
                        0 ? (
                        <EmptyState
                            hasFilters={hasFilters}
                            onReset={resetFilters}
                        />
                    ) : (
                        <>
                            {/* DESKTOP */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full min-w-225 table-fixed">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/80">
                                            <th className="w-[22%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Commande
                                            </th>

                                            <th className="w-[23%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Client
                                            </th>

                                            <th className="w-[23%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Livreur
                                            </th>

                                            <th className="w-[22%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Statut
                                            </th>

                                            <th className="w-[10%] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLivraisons.map(
                                            (
                                                livraison
                                            ) => (
                                                <tr
                                                    key={
                                                        livraison.uuid
                                                    }
                                                    className="group transition hover:bg-gray-50/70"
                                                >
                                                    {/* COMMANDE */}
                                                    <td className="px-6 py-5 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition group-hover:bg-white group-hover:shadow-sm">
                                                                <Package className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-900">
                                                                    {getCommandeLabel(
                                                                        livraison
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {formatDateTime(
                                                                        livraison.created_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* CLIENT */}
                                                    <td className="px-6 py-5 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                                <User className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                                    {getClientName(
                                                                        livraison
                                                                    )}
                                                                </p>

                                                                {livraison.client_telephone && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {
                                                                            livraison.client_telephone
                                                                        }
                                                                    </p>
                                                                )}

                                                                {!livraison.client_telephone && (
                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        Téléphone
                                                                        non
                                                                        renseigné
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* LIVREUR */}
                                                    <td className="px-6 py-5 align-top">
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${livraison.livreur_uuid
                                                                    ? "bg-blue-50 text-blue-600"
                                                                    : "bg-gray-100 text-gray-400"
                                                                    }`}
                                                            >
                                                                <Truck className="h-4 w-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                                    {getLivreurName(
                                                                        livraison
                                                                    )}
                                                                </p>

                                                                {livraison.livreur_telephone && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {
                                                                            livraison.livreur_telephone
                                                                        }
                                                                    </p>
                                                                )}

                                                                {!livraison.livreur_uuid && (
                                                                    <p className="mt-1 text-xs text-orange-600">
                                                                        En attente
                                                                        d'affectation
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* STATUT */}
                                                    <td className="px-6 py-5 align-top">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusClasses(
                                                                livraison.status
                                                            )}`}
                                                        >
                                                            <StatusIcon
                                                                status={
                                                                    livraison.status
                                                                }
                                                                className="h-3.5 w-3.5"
                                                            />

                                                            {
                                                                STATUS_LABELS[
                                                                livraison
                                                                    .status
                                                                ]
                                                            }
                                                        </span>

                                                        {livraison.status ===
                                                            "delivery_pending_confirmation" && (
                                                                <p className="mt-2 max-w-45 text-[11px] leading-4 text-orange-600">
                                                                    Confirmation
                                                                    client
                                                                    requise
                                                                </p>
                                                            )}
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="relative px-6 py-5 text-right align-top">
                                                        <div
                                                            className="relative inline-block"
                                                            data-livraison-menu
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setOpenMenuUuid(
                                                                        openMenuUuid ===
                                                                            livraison.uuid
                                                                            ? null
                                                                            : livraison.uuid
                                                                    )
                                                                }
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                                                aria-label="Ouvrir le menu"
                                                                title="Actions"
                                                            >
                                                                <MoreVertical className="h-5 w-5" />
                                                            </button>

                                                            {openMenuUuid ===
                                                                livraison.uuid && (
                                                                    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 text-left shadow-xl ring-1 ring-black/5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openAction(
                                                                                    livraison,
                                                                                    "details"
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                                                        >
                                                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                                                <Eye className="h-4 w-4" />
                                                                            </span>

                                                                            <span>
                                                                                Voir
                                                                                les
                                                                                détails
                                                                            </span>
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openAction(
                                                                                    livraison,
                                                                                    "gps"
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !hasGps(
                                                                                    livraison
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                                                                        >
                                                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                                                <Navigation className="h-4 w-4" />
                                                                            </span>

                                                                            <span>
                                                                                Suivi
                                                                                GPS
                                                                            </span>
                                                                        </button>

                                                                        <div className="my-1.5 border-t border-gray-100" />

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openAction(
                                                                                    livraison,
                                                                                    "manage"
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                                                        >
                                                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                                                                <Settings2 className="h-4 w-4" />
                                                                            </span>

                                                                            <span>
                                                                                Gérer
                                                                                la
                                                                                livraison
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE / TABLET */}
                            <div className="divide-y divide-gray-100 lg:hidden">
                                {filteredLivraisons.map(
                                    (
                                        livraison
                                    ) => (
                                        <article
                                            key={
                                                livraison.uuid
                                            }
                                            className="p-4 sm:p-5"
                                        >
                                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                                {/* HEADER */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                                            <Package className="h-5 w-5" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-gray-900">
                                                                {getCommandeLabel(
                                                                    livraison
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {formatDateTime(
                                                                    livraison.created_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* MENU MOBILE */}
                                                    <div
                                                        className="relative shrink-0"
                                                        data-livraison-menu
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenMenuUuid(
                                                                    openMenuUuid ===
                                                                        livraison.uuid
                                                                        ? null
                                                                        : livraison.uuid
                                                                )
                                                            }
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                                                            aria-label="Ouvrir le menu"
                                                            title="Actions"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>

                                                        {openMenuUuid ===
                                                            livraison.uuid && (
                                                                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openAction(
                                                                                livraison,
                                                                                "details"
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                                            <Eye className="h-4 w-4" />
                                                                        </span>

                                                                        Voir les
                                                                        détails
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openAction(
                                                                                livraison,
                                                                                "gps"
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !hasGps(
                                                                                livraison
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                                            <Navigation className="h-4 w-4" />
                                                                        </span>

                                                                        Suivi GPS
                                                                    </button>

                                                                    <div className="my-1.5 border-t border-gray-100" />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openAction(
                                                                                livraison,
                                                                                "manage"
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                                                            <Settings2 className="h-4 w-4" />
                                                                        </span>

                                                                        Gérer la
                                                                        livraison
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>

                                                {/* STATUS */}
                                                <div className="mt-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset 
                                                            ${getStatusClasses(
                                                            livraison.status
                                                        )}`}
                                                    >
                                                        <StatusIcon
                                                            status={
                                                                livraison.status
                                                            }
                                                            className="h-3.5 w-3.5"
                                                        />

                                                        {
                                                            STATUS_LABELS[
                                                            livraison
                                                                .status
                                                            ]
                                                        }
                                                    </span>
                                                </div>

                                                {/* CLIENT */}
                                                <div className="mt-4 rounded-xl bg-gray-50 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />

                                                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                            Client
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-sm font-semibold text-gray-900">
                                                        {getClientName(
                                                            livraison
                                                        )}
                                                    </p>

                                                    {livraison.client_telephone && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                livraison.client_telephone
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* LIVREUR */}
                                                <div className="mt-3 rounded-xl bg-gray-50 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Truck
                                                            className={`h-4 w-4 ${livraison.livreur_uuid
                                                                ? "text-blue-500"
                                                                : "text-gray-400"
                                                                }`}
                                                        />

                                                        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                            Livreur
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-sm font-semibold text-gray-900">
                                                        {getLivreurName(
                                                            livraison
                                                        )}
                                                    </p>

                                                    {livraison.livreur_telephone && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                livraison.livreur_telephone
                                                            }
                                                        </p>
                                                    )}

                                                    {!livraison.livreur_uuid && (
                                                        <p className="mt-1 text-xs text-orange-600">
                                                            En attente
                                                            d'affectation
                                                        </p>
                                                    )}
                                                </div>

                                                {/* INFO MESSAGE */}
                                                {livraison.status ===
                                                    "delivery_pending_confirmation" && (
                                                        <div className="mt-3 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
                                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />

                                                            <div>
                                                                <p className="text-xs font-bold text-orange-800">
                                                                    Confirmation
                                                                    client
                                                                    requise
                                                                </p>

                                                                <p className="mt-1 text-xs leading-5 text-orange-700">
                                                                    Le livreur a
                                                                    déclaré la
                                                                    livraison.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                {livraison.status ===
                                                    "delivered" && (
                                                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Livraison confirmée
                                                        </div>
                                                    )}

                                                {livraison.status ===
                                                    "cancelled" && (
                                                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                                                            <XCircle className="h-4 w-4" />
                                                            Livraison annulée
                                                        </div>
                                                    )}
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* MODAL */}
            {selectedLivraison &&
                activeAction && (
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeAction();
                            }
                        }}
                    >
                        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                            {/* MODAL HEADER */}
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeAction ===
                                            "details"
                                            ? "bg-gray-100 text-gray-700"
                                            : activeAction ===
                                                "gps"
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-orange-50 text-orange-600"
                                            }`}
                                    >
                                        {activeAction ===
                                            "details" ? (
                                            <Eye className="h-5 w-5" />
                                        ) : activeAction ===
                                            "gps" ? (
                                            <Navigation className="h-5 w-5" />
                                        ) : (
                                            <Settings2 className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-bold text-gray-900">
                                            {activeAction ===
                                                "details"
                                                ? "Détails de la livraison"
                                                : activeAction ===
                                                    "gps"
                                                    ? "Suivi GPS"
                                                    : "Gérer la livraison"}
                                        </h2>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            {getCommandeLabel(
                                                selectedLivraison
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeAction
                                    }
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="Fermer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* MODAL CONTENT */}
                            <div className="overflow-y-auto p-5 sm:p-6">
                                {/* DETAILS */}
                                {activeAction ===
                                    "details" && (
                                        <div className="space-y-5">
                                            {/* STATUS */}
                                            <div
                                                className={`rounded-2xl p-4 ring-1 ring-inset ${getStatusClasses(
                                                    selectedLivraison.status
                                                )}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <StatusIcon
                                                        status={
                                                            selectedLivraison.status
                                                        }
                                                        className="h-5 w-5"
                                                    />

                                                    <div>
                                                        <p className="text-sm font-bold">
                                                            {
                                                                STATUS_LABELS[
                                                                selectedLivraison
                                                                    .status
                                                                ]
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs opacity-80">
                                                            Mise à jour :{" "}
                                                            {formatDateTime(
                                                                selectedLivraison.updated_at
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* COMMANDE + MONTANT */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-gray-200 p-4">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                        Commande
                                                    </p>

                                                    <p className="mt-2 text-sm font-bold text-gray-900">
                                                        {getCommandeLabel(
                                                            selectedLivraison
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Créée le{" "}
                                                        {formatDateTime(
                                                            selectedLivraison.created_at
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-gray-200 p-4">
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                        Montant
                                                    </p>

                                                    <p className="mt-2 text-base font-bold text-gray-900">
                                                        {formatPrice(
                                                            selectedLivraison.commande_total
                                                        )}
                                                    </p>

                                                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                                        <span className="text-gray-500">
                                                            Frais de livraison
                                                        </span>

                                                        <span className="font-semibold text-gray-700">
                                                            {formatPrice(
                                                                selectedLivraison.frais_livraison
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CLIENT */}
                                            <div className="rounded-2xl border border-gray-200 p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />

                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        Client
                                                    </h3>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {getClientName(
                                                            selectedLivraison
                                                        )}
                                                    </p>

                                                    {selectedLivraison.client_telephone && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                selectedLivraison.client_telephone
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* LIVREUR */}
                                            <div className="rounded-2xl border border-gray-200 p-4">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-gray-400" />

                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        Livreur
                                                    </h3>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {getLivreurName(
                                                            selectedLivraison
                                                        )}
                                                    </p>

                                                    {selectedLivraison.livreur_telephone && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                selectedLivraison.livreur_telephone
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* DESTINATION */}
                                            <div className="rounded-2xl border border-gray-200 p-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />

                                                    <h3 className="text-sm font-bold text-gray-900">
                                                        Destination
                                                    </h3>
                                                </div>

                                                <p className="mt-3 text-sm font-semibold text-gray-900">
                                                    {selectedLivraison.zone_livraison ||
                                                        "Zone non définie"}
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-gray-500">
                                                    {selectedLivraison.adresse_livraison ||
                                                        "Adresse non renseignée"}
                                                </p>

                                                {hasGps(
                                                    selectedLivraison
                                                ) && (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                                                            <Navigation className="h-3 w-3" />
                                                            Position GPS disponible
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    )}

                                {/* GPS */}
                                {activeAction ===
                                    "gps" && (
                                        <div className="space-y-5">
                                            {hasGps(
                                                selectedLivraison
                                            ) ? (
                                                <>
                                                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                                                <Navigation className="h-5 w-5" />
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-bold text-blue-900">
                                                                    Position du
                                                                    livreur
                                                                </p>

                                                                <p className="mt-1 text-xs leading-5 text-blue-700">
                                                                    Dernières
                                                                    coordonnées
                                                                    GPS enregistrées
                                                                    pour cette
                                                                    livraison.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        <div className="rounded-2xl border border-gray-200 p-4">
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                                Latitude
                                                            </p>

                                                            <p className="mt-2 break-all text-sm font-bold text-gray-900">
                                                                {
                                                                    selectedLivraison.latitude
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl border border-gray-200 p-4">
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                                Longitude
                                                            </p>

                                                            <p className="mt-2 break-all text-sm font-bold text-gray-900">
                                                                {
                                                                    selectedLivraison.longitude
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl border border-gray-200 p-4">
                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                                Précision
                                                            </p>

                                                            <p className="mt-2 text-sm font-bold text-gray-900">
                                                                {selectedLivraison.precision_gps
                                                                    ? `${selectedLivraison.precision_gps} m`
                                                                    : "—"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex min-h-70 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                                                        <div className="text-center">
                                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                                                                <MapPin className="h-6 w-6" />
                                                            </div>

                                                            <p className="mt-3 text-sm font-bold text-gray-900">
                                                                Carte GPS
                                                            </p>

                                                            <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
                                                                Les coordonnées
                                                                actuelles du livreur
                                                                sont enregistrées
                                                                pour cette
                                                                livraison.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 py-14 text-center">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                                                        <Navigation className="h-6 w-6" />
                                                    </div>

                                                    <h3 className="mt-4 text-sm font-bold text-gray-900">
                                                        Position GPS indisponible
                                                    </h3>

                                                    <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                                                        Aucune position GPS n'a
                                                        encore été enregistrée pour
                                                        cette livraison.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {/* MANAGE */}
                                {activeAction ===
                                    "manage" && (
                                        <div className="space-y-5">
                                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                                                        <Settings2 className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-bold text-orange-900">
                                                            Gestion de la livraison
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-orange-700">
                                                            Cette section centralisera
                                                            les opérations liées à
                                                            cette livraison.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-gray-200 p-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            Statut actuel
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            État actuel de la
                                                            livraison
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusClasses(
                                                            selectedLivraison.status
                                                        )}`}
                                                    >
                                                        <StatusIcon
                                                            status={
                                                                selectedLivraison.status
                                                            }
                                                            className="h-3.5 w-3.5"
                                                        />

                                                        {
                                                            STATUS_LABELS[
                                                            selectedLivraison
                                                                .status
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                                <Settings2 className="mx-auto h-7 w-7 text-gray-400" />

                                                <p className="mt-3 text-sm font-bold text-gray-900">
                                                    Gestion avancée
                                                </p>

                                                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
                                                    Les actions de modification,
                                                    réaffectation du livreur et
                                                    changement de statut pourront
                                                    être connectées ici.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* FOOTER */}
                            <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
                                <button
                                    type="button"
                                    onClick={
                                        closeAction
                                    }
                                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}