"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    FaBoxOpen,
    FaClock,
    FaTruck,
    FaCheckCircle,
    FaChevronRight,
    FaStore,
    FaCalendarAlt,
    FaShoppingBag,
    FaTimesCircle,
} from "react-icons/fa";

import { useAuth } from "@/contexts/AuthContext";
import CommandeStatusBadge from "@/components/CommandeStatusBadge";
import Navbar from "@/components/Navbar";

interface Boutique {
    nom: string;
    slug: string;
}

interface Commande {
    uuid: string;
    total: string;
    frais_livraison?: string;
    status: string;
    created_at: string;
    updated_at: string;
    nombre_articles: number;
    boutique: Boutique;
}

interface Statistics {
    total: number;
    pending: number;
    in_progress: number;
    delivered: number;
    cancelled: number;
}

type Filter =
    | "all"
    | "pending"
    | "in_progress"
    | "delivered"
    | "cancelled";

export default function CommandesPage() {
    const { token, loading } = useAuth();

    const [commandes, setCommandes] =
        useState<Commande[]>([]);

    const [statistics, setStatistics] =
        useState<Statistics>({
            total: 0,
            pending: 0,
            in_progress: 0,
            delivered: 0,
            cancelled: 0,
        });

    const [activeFilter, setActiveFilter] =
        useState<Filter>("all");

    const [loadingCommandes, setLoadingCommandes] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadCommandes() {
            try {
                setLoadingCommandes(true);
                setError(null);

                const response = await fetch(
                    "/api/commandes",
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

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Impossible de récupérer vos commandes."
                    );
                }

                if (data.data) {
                    setCommandes(
                        Array.isArray(
                            data.data.data
                        )
                            ? data.data.data
                            : []
                    );

                    if (data.data.statistics) {
                        setStatistics(
                            data.data.statistics
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Erreur chargement commandes :",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Une erreur est survenue lors du chargement de vos commandes."
                );
            } finally {
                setLoadingCommandes(false);
            }
        }

        if (!loading && token) {
            loadCommandes();
        }
    }, [token, loading]);

    const commandesFiltrees =
        useMemo(() => {
            switch (activeFilter) {
                case "pending":
                    return commandes.filter(
                        (commande) =>
                            commande.status ===
                            "pending"
                    );

                case "in_progress":
                    return commandes.filter(
                        (commande) =>
                            [
                                "confirmed",
                                "preparing",
                                "shipped",
                            ].includes(
                                commande.status
                            )
                    );

                case "delivered":
                    return commandes.filter(
                        (commande) =>
                            commande.status ===
                            "delivered"
                    );

                case "cancelled":
                    return commandes.filter(
                        (commande) =>
                            commande.status ===
                            "cancelled"
                    );

                case "all":
                default:
                    return commandes;
            }
        }, [
            commandes,
            activeFilter,
        ]);

    if (
        loading ||
        loadingCommandes
    ) {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 w-56 rounded-xl bg-gray-200" />

                        <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-gray-200" />

                        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                1,
                                2,
                                3,
                                4,
                            ].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-28 rounded-2xl bg-gray-200"
                                    />
                                )
                            )}
                        </div>

                        <div className="mt-6 space-y-4">
                            {[1, 2, 3].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-40 rounded-2xl bg-white"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
                    <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <FaTimesCircle size={28} />
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-gray-950">
                            Impossible de charger vos commandes
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (

        <main className="min-h-screen bg-[#f7f8fa]">
            <Navbar />

            {/* =====================================================
            PAGE HEADER
        ===================================================== */}
            <header className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-[150px] flex-col justify-center gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm">
                                <FaShoppingBag size={23} />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <Link
                                        href="/"
                                        className="transition hover:text-green-600"
                                    >
                                        Accueil
                                    </Link>

                                    <FaChevronRight size={9} />

                                    <span className="text-gray-500">
                                        Mes commandes
                                    </span>
                                </div>

                                <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                                    Mes commandes
                                </h1>

                                <p className="mt-1 text-sm leading-6 text-gray-500 sm:text-base">
                                    Retrouvez, suivez et gérez toutes vos commandes.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/produits"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
                        >
                            <FaShoppingBag size={14} />
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </header>

            {/* =====================================================
            CONTENT
        ===================================================== */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                {/* STATISTIQUES */}
                <section className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-950">
                                Vue d’ensemble
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500">
                                État actuel de vos commandes
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

                        <StatCard
                            value={statistics.total}
                            label="Commandes"
                            icon={<FaBoxOpen />}
                            active={activeFilter === "all"}
                            onClick={() =>
                                setActiveFilter("all")
                            }
                        />

                        <StatCard
                            value={statistics.pending}
                            label="En attente"
                            icon={<FaClock />}
                            active={
                                activeFilter === "pending"
                            }
                            onClick={() =>
                                setActiveFilter("pending")
                            }
                        />

                        <StatCard
                            value={statistics.in_progress}
                            label="En cours"
                            icon={<FaTruck />}
                            active={
                                activeFilter === "in_progress"
                            }
                            onClick={() =>
                                setActiveFilter("in_progress")
                            }
                        />

                        <StatCard
                            value={statistics.delivered}
                            label="Livrées"
                            icon={<FaCheckCircle />}
                            active={
                                activeFilter === "delivered"
                            }
                            onClick={() =>
                                setActiveFilter("delivered")
                            }
                        />
                    </div>
                </section>

                {/* =================================================
                FILTRES
            ================================================= */}
                <section className="mb-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                        <div className="flex gap-2 overflow-x-auto">

                            <FilterButton
                                active={activeFilter === "all"}
                                onClick={() =>
                                    setActiveFilter("all")
                                }
                            >
                                Toutes
                            </FilterButton>

                            <FilterButton
                                active={
                                    activeFilter === "pending"
                                }
                                onClick={() =>
                                    setActiveFilter("pending")
                                }
                            >
                                En attente
                            </FilterButton>

                            <FilterButton
                                active={
                                    activeFilter === "in_progress"
                                }
                                onClick={() =>
                                    setActiveFilter("in_progress")
                                }
                            >
                                En cours
                            </FilterButton>

                            <FilterButton
                                active={
                                    activeFilter === "delivered"
                                }
                                onClick={() =>
                                    setActiveFilter("delivered")
                                }
                            >
                                Livrées
                            </FilterButton>

                            <FilterButton
                                active={
                                    activeFilter === "cancelled"
                                }
                                onClick={() =>
                                    setActiveFilter("cancelled")
                                }
                            >
                                Annulées
                            </FilterButton>

                        </div>
                    </div>
                </section>

                {/* =================================================
                TITRE LISTE
            ================================================= */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-950">
                            {activeFilter === "all"
                                ? "Toutes vos commandes"
                                : "Commandes filtrées"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {commandesFiltrees.length}{" "}
                            {commandesFiltrees.length > 1
                                ? "commandes"
                                : "commande"}
                        </p>
                    </div>
                </div>

                {/* =================================================
                LISTE
            ================================================= */}
                {commandesFiltrees.length === 0 ? (
                    <EmptyState filter={activeFilter} />
                ) : (
                    <div className="space-y-4">
                        {commandesFiltrees.map((commande) => (
                            <CommandeCard
                                key={commande.uuid}
                                commande={commande}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>

    );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    value,
    label,
    icon,
    active,
    onClick,
}: {
    value: number;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                "sm:p-5",
                active
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-gray-200",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                        {value}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-gray-500 sm:text-sm">
                        {label}
                    </p>
                </div>

                <div
                    className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        "transition-all duration-200",
                        active
                            ? "bg-green-600 text-white"
                            : "bg-green-50 text-green-600 group-hover:bg-green-100",
                    ].join(" ")}
                >
                    {icon}
                </div>
            </div>

            {active && (
                <div className="absolute bottom-0 left-0 h-1 w-full bg-green-600" />
            )}
        </button>
    );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1",
                active
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-green-50 hover:text-green-700",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    filter,
}: {
    filter: Filter;
}) {
    const messages: Record<
        Filter,
        {
            title: string;
            description: string;
        }
    > = {
        all: {
            title: "Aucune commande",
            description:
                "Vous n'avez pas encore passé de commande.",
        },
        pending: {
            title: "Aucune commande en attente",
            description:
                "Vous n'avez aucune commande en attente pour le moment.",
        },
        in_progress: {
            title: "Aucune commande en cours",
            description:
                "Vous n'avez aucune commande actuellement en préparation ou en livraison.",
        },
        delivered: {
            title: "Aucune commande livrée",
            description:
                "Vous n'avez pas encore de commande livrée.",
        },
        cancelled: {
            title: "Aucune commande annulée",
            description:
                "Vous n'avez aucune commande annulée.",
        },
    };

    const message = messages[filter];

    return (
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FaBoxOpen size={26} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-950">
                {message.title}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {message.description}
            </p>

            {filter === "all" && (
                <Link
                    href="/produits"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                    Découvrir les produits
                    <FaChevronRight size={11} />
                </Link>
            )}
        </div>
    );
}

/* =========================================================
   COMMANDE CARD
========================================================= */

function CommandeCard({
    commande,
}: {
    commande: Commande;
}) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg">

            <div className="p-5 sm:p-6">

                {/* TOP */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex min-w-0 items-center gap-3">


                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FaStore size={16} />
                        </div>


                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-950 sm:text-base">
                                {commande.boutique.nom}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                                Commande #
                                <span className="font-semibold text-gray-600">
                                    {commande.uuid.slice(0, 8)}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <p className="text-lg font-black tracking-tight text-green-700 sm:text-xl">
                            {Number(
                                commande.total
                            ).toLocaleString("fr-FR")}{" "}
                            FCFA
                        </p>

                        <CommandeStatusBadge
                            status={commande.status}
                        />
                    </div>
                </div>

                {/* DETAILS */}
                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-3">

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                            <FaCalendarAlt size={13} />
                        </div>

                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                Date
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-gray-700 sm:text-sm">
                                {new Date(
                                    commande.created_at
                                ).toLocaleDateString(
                                    "fr-FR",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                            <FaShoppingBag size={13} />
                        </div>

                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                Articles
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-gray-700 sm:text-sm">
                                {commande.nombre_articles}{" "}
                                {commande.nombre_articles > 1
                                    ? "articles"
                                    : "article"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                            <FaClock size={13} />
                        </div>

                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                Mise à jour
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-gray-700 sm:text-sm">
                                {new Date(
                                    commande.updated_at
                                ).toLocaleDateString("fr-FR")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FaStore size={11} />

                        <span>
                            Boutique :{" "}
                            <span className="font-semibold text-gray-500">
                                {commande.boutique.nom}
                            </span>
                        </span>
                    </div>

                    <Link
                        href={`/commandes/${commande.uuid}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Voir le détail
                        <FaChevronRight size={11} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

