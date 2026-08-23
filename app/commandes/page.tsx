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
} from "react-icons/fa";

import { useAuth } from "@/contexts/AuthContext";
import CommandeStatusBadge from "@/components/CommandeStatusBadge";

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
    | "delivered";

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

    useEffect(() => {

        async function loadCommandes() {

            try {

                setLoadingCommandes(true);

                const response =
                    await fetch(
                        "/api/commandes",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "Réponse commandes :",
                    data
                );

                if (
                    data.success &&
                    data.data
                ) {

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

            if (activeFilter === "all") {
                return commandes;
            }

            if (activeFilter === "pending") {

                return commandes.filter(
                    (commande) =>
                        commande.status ===
                        "pending"
                );

            }

            if (activeFilter === "in_progress") {

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

            }

            if (activeFilter === "delivered") {

                return commandes.filter(
                    (commande) =>
                        commande.status ===
                        "delivered"
                );

            }

            return commandes;

        }, [
            commandes,
            activeFilter,
        ]);


    if (
        loading ||
        loadingCommandes
    ) {

        return (
            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <div className="animate-pulse">

                        <div className="h-8 w-56 rounded bg-gray-200" />

                        <div className="mt-3 h-4 w-80 rounded bg-gray-200" />

                        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-28 rounded-2xl bg-gray-200"
                                    />
                                )
                            )}

                        </div>

                    </div>

                </div>

            </main>
        );

    }


    return (

        <main className="min-h-screen bg-gray-50">

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-green-100
                                text-green-700
                            "
                        >
                            <FaShoppingBag size={20} />
                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Mes commandes
                            </h1>

                            <p className="mt-1 text-sm text-gray-500 sm:text-base">
                                Retrouvez et suivez toutes vos commandes
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

                    <StatCard
                        value={statistics.total}
                        label="Commandes"
                        icon={<FaBoxOpen />}
                        active={
                            activeFilter === "all"
                        }
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
                        value={
                            statistics.in_progress
                        }
                        label="En cours"
                        icon={<FaTruck />}
                        active={
                            activeFilter ===
                            "in_progress"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "in_progress"
                            )
                        }
                    />

                    <StatCard
                        value={
                            statistics.delivered
                        }
                        label="Livrées"
                        icon={<FaCheckCircle />}
                        active={
                            activeFilter ===
                            "delivered"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "delivered"
                            )
                        }
                    />

                </div>


                {/* =================================================
                    FILTRES
                ================================================= */}

                <div
                    className="
                        mb-6
                        flex
                        gap-2
                        overflow-x-auto
                        pb-1
                    "
                >

                    <FilterButton
                        active={
                            activeFilter === "all"
                        }
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
                            activeFilter ===
                            "in_progress"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "in_progress"
                            )
                        }
                    >
                        En cours
                    </FilterButton>

                    <FilterButton
                        active={
                            activeFilter ===
                            "delivered"
                        }
                        onClick={() =>
                            setActiveFilter(
                                "delivered"
                            )
                        }
                    >
                        Livrées
                    </FilterButton>

                </div>


                {/* =================================================
                    COMMANDES
                ================================================= */}

                {commandesFiltrees.length === 0 ? (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            px-6
                            py-14
                            text-center
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-gray-100
                                text-gray-400
                            "
                        >
                            <FaBoxOpen size={26} />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-gray-900">
                            Aucune commande
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Aucune commande ne correspond à ce filtre.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {commandesFiltrees.map(
                            (commande) => (

                                <CommandeCard
                                    key={
                                        commande.uuid
                                    }
                                    commande={
                                        commande
                                    }
                                />

                            )
                        )}

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
            className={`
                group
                rounded-2xl
                border
                bg-white
                p-4
                text-left
                shadow-sm
                transition
                duration-200
                hover:-translate-y-0.5
                hover:shadow-md
                sm:p-5
                ${
                    active
                        ? "border-green-500 ring-2 ring-green-100"
                        : "border-gray-200"
                }
            `}
        >

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
                        {label}
                    </p>

                </div>

                <div
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-green-50
                        text-green-600
                        transition
                        group-hover:bg-green-100
                    "
                >
                    {icon}
                </div>

            </div>

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
            className={`
                shrink-0
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-semibold
                transition
                ${
                    active
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-green-50 hover:text-green-700"
                }
            `}
        >
            {children}
        </button>
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

        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-sm
                transition
                duration-200
                hover:shadow-md
            "
        >

            <div className="p-5 sm:p-6">

                {/* TOP */}

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >

                    <div className="min-w-0">

                        <div className="flex items-center gap-2">

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-green-50
                                    text-green-600
                                "
                            >
                                <FaStore size={15} />
                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-gray-900">
                                    {commande.boutique.nom}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Commande #
                                    {commande.uuid.slice(
                                        0,
                                        8
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="text-left sm:text-right">

                        <p className="text-lg font-bold text-green-700">
                            {Number(
                                commande.total
                            ).toLocaleString(
                                "fr-FR"
                            )}{" "}
                            FCFA
                        </p>

                        <div className="mt-2">

                            <CommandeStatusBadge
                                status={
                                    commande.status
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* DETAILS */}

                <div
                    className="
                        mt-5
                        flex
                        flex-wrap
                        items-center
                        gap-x-5
                        gap-y-2
                        border-t
                        border-gray-100
                        pt-4
                        text-xs
                        text-gray-500
                        sm:text-sm
                    "
                >

                    <span className="flex items-center gap-2">

                        <FaCalendarAlt
                            className="text-gray-400"
                        />

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

                    </span>


                    <span className="flex items-center gap-2">

                        <FaShoppingBag
                            className="text-gray-400"
                        />

                        {commande.nombre_articles}{" "}
                        {commande.nombre_articles > 1
                            ? "articles"
                            : "article"}

                    </span>

                </div>


                {/* FOOTER */}

                <div
                    className="
                        mt-5
                        flex
                        justify-end
                    "
                >

                    <Link
                        href={`/commandes/${commande.uuid}`}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-green-600
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            duration-200
                            hover:bg-green-700
                            hover:shadow
                        "
                    >

                        Voir le détail

                        <FaChevronRight
                            size={11}
                        />

                    </Link>

                </div>

            </div>

        </div>
    );
}