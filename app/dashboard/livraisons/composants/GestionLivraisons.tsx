"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle,
    Clock,
    MapPin,
    Package,
    RefreshCw,
    Search,
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
    | "delivered"
    | "cancelled"
    | "delivery_pending_confirmation";

    commentaire: string | null;

    assigned_at: string | null;
    picked_up_at: string | null;
    in_transit_at: string | null;
    delivery_pending_confirmation_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;

    commande_uuid: string;
    commande_total: string;
    commande_status: string;

    zone_livraison: string;
    adresse_livraison: string | null;

    latitude: number | null;
    longitude: number | null;

    client_nom: string;
    client_prenom: string;
    client_telephone: string;

    livreur_uuid: string;
    livreur_nom: string;
    livreur_prenom: string;
    livreur_telephone: string;
    livreur_vehicule: string | null;
}

type StatutFiltre =
    | "all"
    | Livraison["status"];

const livraisonLabels: Record<
    Livraison["status"],
    string
> = {
    assigned: "Assignée",
    picked_up: "Récupérée",
    in_transit: "En livraison",
    delivered: "Livrée",
    cancelled: "Annulée",
    delivery_pending_confirmation:
        "En attente de confirmation",
};

const commandeLabels: Record<
    string,
    string
> = {
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
};

const livraisonColors: Record<
    Livraison["status"],
    string
> = {
    assigned:
        "bg-yellow-50 text-yellow-700 border-yellow-200",

    picked_up:
        "bg-blue-50 text-blue-700 border-blue-200",

    in_transit:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

    delivered:
        "bg-green-50 text-green-700 border-green-200",

    cancelled:
        "bg-red-50 text-red-700 border-red-200",

    delivery_pending_confirmation:
        "bg-orange-50 text-orange-700 border-orange-200",
};

function formatPrice(
    value: string | number
) {
    return `${Number(value).toLocaleString(
        "fr-FR"
    )} FCFA`;
}

function formatDate(
    value: string | null
) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function getCommandeLabel(
    status: string
) {
    return (
        commandeLabels[status] ??
        status
    );
}

function StatusIcon({
    status,
    size = 15,
}: {
    status: Livraison["status"];
    size?: number;
}) {
    if (status === "delivered") {
        return <CheckCircle size={size} />;
    }

    if (status === "cancelled") {
        return <XCircle size={size} />;
    }

    if (status === "in_transit") {
        return <Truck size={size} />;
    }

    if (status === "picked_up") {
        return <Package size={size} />;
    }

    if (
        status === "delivery_pending_confirmation"
    ) {
        return <Clock size={size} />;
    }

    return <Clock size={size} />;
}

export default function GestionLivraisons() {
    const [livraisons, setLivraisons] =
        useState<Livraison[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statutFiltre, setStatutFiltre] =
        useState<StatutFiltre>("all");

    const loadLivraisons = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Session utilisateur introuvable."
                );
                return;
            }

            const response =
                await fetch(
                    "/api/dashboard/livraisons",
                    {
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
                toast.error(
                    data.message ??
                    "Impossible de récupérer les livraisons."
                );
                return;
            }

            setLivraisons(
                data.data ?? []
            );

            if (isRefresh) {
                toast.success(
                    "Livraisons actualisées."
                );
            }
        } catch (error) {
            console.error(
                "Erreur chargement livraisons :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadLivraisons();
    }, []);

    const livraisonsFiltrees =
        useMemo(() => {
            const recherche =
                search
                    .trim()
                    .toLowerCase();

            return livraisons.filter(
                (livraison) => {
                    const correspondStatut =
                        statutFiltre ===
                        "all" ||
                        livraison.status ===
                        statutFiltre;

                    if (
                        !correspondStatut
                    ) {
                        return false;
                    }

                    if (!recherche) {
                        return true;
                    }

                    const texte = [
                        livraison.commande_id,
                        livraison.commande_uuid,
                        livraison.client_nom,
                        livraison.client_prenom,
                        livraison.client_telephone,
                        livraison.livreur_nom,
                        livraison.livreur_prenom,
                        livraison.livreur_telephone,
                        livraison.adresse_livraison,
                        livraison.zone_livraison,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return texte.includes(
                        recherche
                    );
                }
            );
        }, [
            livraisons,
            search,
            statutFiltre,
        ]);

    const statistiques = {
        total: livraisons.length,

        assigned: livraisons.filter(
            (item) =>
                item.status ===
                "assigned"
        ).length,

        picked_up: livraisons.filter(
            (item) =>
                item.status ===
                "picked_up"
        ).length,

        in_transit: livraisons.filter(
            (item) =>
                item.status ===
                "in_transit"
        ).length,

        delivered: livraisons.filter(
            (item) =>
                item.status ===
                "delivered"
        ).length,

        cancelled: livraisons.filter(
            (item) =>
                item.status ===
                "cancelled"
        ).length,

        pending_confirmation: livraisons.filter(
            (item) =>
                item.status ===
                "delivery_pending_confirmation"
        ).length,
    };

    if (loading) {
        return (
            <main className="min-h-full bg-gray-50 p-4 sm:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-200" />

                    <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({
                            length: 4,
                        }).map(
                            (_, index) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                                />
                            )
                        )}
                    </div>

                    <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-full bg-gray-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                                <Truck
                                    size={21}
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Gestion des livraisons
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Suivez les commandes, les livreurs et les livraisons.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadLivraisons(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Actualisation..."
                            : "Actualiser"}
                    </button>
                </div>

                {/* =====================================================
                    STATISTIQUES
                ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Total
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {
                                statistiques.total
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Toutes les livraisons
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            En cours
                        </p>

                        <p className="mt-2 text-2xl font-bold text-indigo-600">
                            {statistiques.assigned +
                                statistiques.picked_up +
                                statistiques.in_transit +
                                statistiques.pending_confirmation}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            À traiter ou en livraison
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Livrées
                        </p>

                        <option value="delivery_pending_confirmation">
                            En attente de confirmation
                        </option>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {
                                statistiques.delivered
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Livraisons terminées
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Annulées
                        </p>

                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {
                                statistiques.cancelled
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Livraisons annulées
                        </p>
                    </div>

                </div>

                {/* =====================================================
                    FILTRES
                ====================================================== */}

                <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* Recherche */}

                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Rechercher une commande, un client, un livreur..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                        </div>

                        {/* Statut */}

                        <select
                            value={
                                statutFiltre
                            }
                            onChange={(
                                event
                            ) =>
                                setStatutFiltre(
                                    event.target
                                        .value as StatutFiltre
                                )
                            }
                            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
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
                                En livraison
                            </option>

                            <option value="delivered">
                                Livrées
                            </option>

                            <option value="cancelled">
                                Annulées
                            </option>
                        </select>

                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-gray-400">
                            {
                                livraisonsFiltrees.length
                            }{" "}
                            livraison
                            {livraisonsFiltrees.length >
                                1
                                ? "s"
                                : ""}{" "}
                            affichée
                            {livraisonsFiltrees.length >
                                1
                                ? "s"
                                : ""}
                        </p>

                        {(search ||
                            statutFiltre !==
                            "all") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch(
                                            ""
                                        );
                                        setStatutFiltre(
                                            "all"
                                        );
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                    </div>
                </section>

                {/* =====================================================
                    AUCUN RÉSULTAT
                ====================================================== */}

                {livraisonsFiltrees.length ===
                    0 && (
                        <section className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                <Package
                                    size={25}
                                    className="text-gray-400"
                                />
                            </div>

                            <h2 className="mt-4 text-lg font-bold text-gray-900">
                                {livraisons.length ===
                                    0
                                    ? "Aucune livraison"
                                    : "Aucun résultat"}
                            </h2>

                            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                                {livraisons.length ===
                                    0
                                    ? "Aucune livraison n'est actuellement enregistrée."
                                    : "Aucune livraison ne correspond aux critères de recherche sélectionnés."}
                            </p>

                        </section>
                    )}

                {/* =====================================================
                    DESKTOP
                ====================================================== */}

                {livraisonsFiltrees.length >
                    0 && (
                        <section className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1100px]">

                                    <thead className="border-b bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Commande
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Client
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Livreur
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Statut
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Montant
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Livraison
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {livraisonsFiltrees.map(
                                            (
                                                livraison
                                            ) => (
                                                <tr
                                                    key={
                                                        livraison.uuid
                                                    }
                                                    className="transition hover:bg-gray-50"
                                                >

                                                    {/* Commande */}

                                                    <td className="px-5 py-5 align-top">

                                                        <p className="font-bold text-gray-900">
                                                            #
                                                            {
                                                                livraison.commande_id
                                                            }
                                                        </p>

                                                        <p className="mt-1 max-w-48 truncate text-xs text-gray-400">
                                                            {
                                                                livraison.commande_uuid
                                                            }
                                                        </p>

                                                        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                                            {
                                                                getCommandeLabel(
                                                                    livraison.commande_status
                                                                )
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Client */}

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-start gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                                                <User
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="text-gray-500"
                                                                />
                                                            </div>

                                                            <div>
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
                                                                    className="mt-1 block text-xs text-blue-600 hover:text-blue-700"
                                                                >
                                                                    {
                                                                        livraison.client_telephone
                                                                    }
                                                                </a>
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Livreur */}

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-start gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                                                <Truck
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="text-gray-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {
                                                                        livraison.livreur_prenom
                                                                    }{" "}
                                                                    {
                                                                        livraison.livreur_nom
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {
                                                                        livraison.livreur_telephone
                                                                    }
                                                                </p>

                                                                {livraison.livreur_vehicule && (
                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        {
                                                                            livraison.livreur_vehicule
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Statut */}

                                                    <td className="px-5 py-5 align-top">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${livraisonColors[
                                                                livraison.status
                                                            ]}`}
                                                        >
                                                            <StatusIcon
                                                                status={
                                                                    livraison.status
                                                                }
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            {
                                                                livraisonLabels[
                                                                livraison
                                                                    .status
                                                                ]
                                                            }
                                                        </span>

                                                        {livraison.commentaire && (
                                                            <p className="mt-2 max-w-52 text-xs leading-5 text-gray-500">
                                                                {
                                                                    livraison.commentaire
                                                                }
                                                            </p>
                                                        )}

                                                    </td>

                                                    {/* Montant */}

                                                    <td className="px-5 py-5 align-top">

                                                        <p className="font-bold text-gray-900">
                                                            {formatPrice(
                                                                livraison.commande_total
                                                            )}
                                                        </p>

                                                    </td>

                                                    {/* Livraison */}

                                                    <td className="px-5 py-5 align-top">

                                                        <div className="flex items-start gap-2">

                                                            <MapPin
                                                                size={
                                                                    16
                                                                }
                                                                className="mt-0.5 shrink-0 text-gray-400"
                                                            />

                                                            <div>
                                                                <p className="max-w-56 text-sm font-medium text-gray-800">
                                                                    {
                                                                        livraison.adresse_livraison
                                                                    }
                                                                </p>

                                                                {livraison.zone_livraison && (
                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        Zone :{" "}
                                                                        {
                                                                            livraison.zone_livraison
                                                                        }
                                                                    </p>
                                                                )}

                                                                <p className="mt-2 text-[11px] text-gray-400">
                                                                    {
                                                                        formatDate(
                                                                            livraison.assigned_at
                                                                        )
                                                                    }
                                                                </p>

                                                                {livraison.latitude !==
                                                                    null &&
                                                                    livraison.longitude !==
                                                                    null && (
                                                                        <a
                                                                            href={`https://www.google.com/maps?q=${livraison.latitude},${livraison.longitude}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
                                                                        >
                                                                            <MapPin
                                                                                size={
                                                                                    13
                                                                                }
                                                                            />
                                                                            Voir GPS
                                                                        </a>
                                                                    )}
                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>
                                </table>

                            </div>
                        </section>
                    )}

                {/* =====================================================
                    MOBILE / TABLET
                ====================================================== */}

                {livraisonsFiltrees.length >
                    0 && (
                        <div className="space-y-4 lg:hidden">

                            {livraisonsFiltrees.map(
                                (
                                    livraison
                                ) => (
                                    <article
                                        key={
                                            livraison.uuid
                                        }
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                                    >

                                        {/* Card header */}

                                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4">

                                            <div>
                                                <p className="text-lg font-bold text-gray-900">
                                                    #
                                                    {
                                                        livraison.commande_id
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {
                                                        getCommandeLabel(
                                                            livraison.commande_status
                                                        )
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${livraisonColors[
                                                    livraison.status
                                                ]}`}
                                            >
                                                <StatusIcon
                                                    status={
                                                        livraison.status
                                                    }
                                                    size={
                                                        13
                                                    }
                                                />

                                                {
                                                    livraisonLabels[
                                                    livraison
                                                        .status
                                                    ]
                                                }
                                            </span>

                                        </div>

                                        <div className="space-y-5 p-4">

                                            {/* Client */}

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                                    <User
                                                        size={
                                                            16
                                                        }
                                                        className="text-gray-500"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                        Client
                                                    </p>

                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {
                                                            livraison.client_prenom
                                                        }{" "}
                                                        {
                                                            livraison.client_nom
                                                        }
                                                    </p>

                                                    <a
                                                        href={`tel:${livraison.client_telephone}`}
                                                        className="mt-1 block text-sm text-blue-600"
                                                    >
                                                        {
                                                            livraison.client_telephone
                                                        }
                                                    </a>
                                                </div>

                                            </div>

                                            {/* Livreur */}

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                                    <Truck
                                                        size={
                                                            16
                                                        }
                                                        className="text-gray-500"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                        Livreur
                                                    </p>

                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {
                                                            livraison.livreur_prenom
                                                        }{" "}
                                                        {
                                                            livraison.livreur_nom
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            livraison.livreur_telephone
                                                        }
                                                    </p>

                                                    {livraison.livreur_vehicule && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {
                                                                livraison.livreur_vehicule
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Adresse */}

                                            <div className="rounded-xl bg-gray-50 p-3">

                                                <div className="flex items-start gap-2">

                                                    <MapPin
                                                        size={
                                                            16
                                                        }
                                                        className="mt-0.5 shrink-0 text-gray-500"
                                                    />

                                                    <div>
                                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                            Adresse de livraison
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-800">
                                                            {
                                                                livraison.adresse_livraison ||
                                                                "Adresse non renseignée"
                                                            }
                                                        </p>

                                                        {livraison.zone_livraison && (
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {
                                                                    livraison.zone_livraison
                                                                }
                                                            </p>
                                                        )}
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
                                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-600"
                                                        >
                                                            <MapPin
                                                                size={
                                                                    13
                                                                }
                                                            />
                                                            Voir la localisation
                                                        </a>
                                                    )}

                                            </div>

                                            {/* Montant + date */}

                                            <div className="flex items-end justify-between gap-4">

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Montant
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-gray-900">
                                                        {formatPrice(
                                                            livraison.commande_total
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400">
                                                        Assignée
                                                    </p>

                                                    <p className="mt-1 text-xs font-medium text-gray-600">
                                                        {formatDate(
                                                            livraison.assigned_at
                                                        )}
                                                    </p>
                                                </div>

                                            </div>

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
                                    </article>
                                )
                            )}

                        </div>
                    )}

            </div>
        </main>
    );
}