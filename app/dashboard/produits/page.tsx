"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Package,
    CheckCircle2,
    Ban,
    AlertTriangle,
    RefreshCw,
    SearchX,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import ProductTable from "../composants/ProductTable";
import ProductToolbar from "../composants/ProductToolbar";

interface Produit {
    uuid: string;
    nom: string;
    prix: string;
    stock: number;
    image: string | null;
    status: string;

    boutique: {
        uuid: string;
        nom: string;
        slug: string;
    } | null;

    categorie: {
        uuid: string;
        nom: string;
        slug: string;
    } | null;
}

export default function ProduitsPage() {
    const { token } = useAuth();

    const [produits, setProduits] = useState<Produit[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadProduits = useCallback(
        async (showRefresh = false) => {
            if (!token) {
                return;
            }

            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await fetch(
                    "/api/dashboard/produit",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Impossible de charger les produits."
                    );
                }

                setProduits(data.data ?? []);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Erreur serveur.";

                setError(message);

                toast.error(message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [token]
    );

    useEffect(() => {
        loadProduits();
    }, [loadProduits]);

    const produitsFiltres = useMemo(() => {
        const terme = search.trim().toLowerCase();

        if (!terme) {
            return produits;
        }

        return produits.filter((produit) => {
            return (
                produit.nom
                    .toLowerCase()
                    .includes(terme) ||
                produit.boutique?.nom
                    ?.toLowerCase()
                    .includes(terme) ||
                produit.categorie?.nom
                    ?.toLowerCase()
                    .includes(terme)
            );
        });
    }, [produits, search]);

    const totalProduits = produits.length;

    const produitsActifs = produits.filter(
        (produit) => produit.status === "active"
    ).length;

    const produitsBloques = produits.filter(
        (produit) => produit.status !== "active"
    ).length;

    const produitsRupture = produits.filter(
        (produit) => produit.stock <= 0
    ).length;

    async function supprimerProduit(uuid: string) {
        try {
            const response = await fetch(
                `/api/dashboard/produit/uuid/${uuid}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(
                    data.message ||
                    "Impossible de supprimer le produit."
                );
                return;
            }

            setProduits((ancien) =>
                ancien.filter(
                    (produit) => produit.uuid !== uuid
                )
            );

            toast.success("Produit supprimé avec succès.");
        } catch {
            toast.error(
                "Une erreur est survenue lors de la suppression."
            );
        }
    }

    async function changerStatutProduit(
        uuid: string,
        status: string
    ) {
        const action =
            status === "active"
                ? "bloquer"
                : "débloquer";

        const endpoint =
            status === "active"
                ? `/api/dashboard/produit/uuid/${uuid}/block`
                : `/api/dashboard/produit/uuid/${uuid}/unblock`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(
                    data.message ||
                    `Impossible de ${action} le produit.`
                );
                return;
            }

            const nouveauStatus =
                status === "active"
                    ? "blocked"
                    : "active";

            setProduits((ancien) =>
                ancien.map((produit) =>
                    produit.uuid === uuid
                        ? {
                            ...produit,
                            status: nouveauStatus,
                        }
                        : produit
                )
            );

            toast.success(
                nouveauStatus === "active"
                    ? "Produit débloqué avec succès."
                    : "Produit bloqué avec succès."
            );
        } catch {
            toast.error(
                `Une erreur est survenue lors de l'action.`
            );
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-gray-100"
                        />
                    ))}
                </div>

                <div className="h-14 animate-pulse rounded-xl bg-gray-100" />

                <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        className="mt-0.5 shrink-0 text-red-600"
                        size={22}
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold text-red-800">
                            Impossible de charger les produits
                        </h2>

                        <p className="mt-1 text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => loadProduits()}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            <RefreshCw size={16} />
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ============================================================
    HEADER MARKETMALI
============================================================ */}

            <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                {/* Décorations discrètes */}
                <div
                    className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-[#14a800]/5
        "
                />

                <div
                    className="
            pointer-events-none
            absolute
            -bottom-40
            -left-32
            h-80
            w-80
            rounded-full
            bg-[#fcd116]/5
        "
                />

                <div
                    className="
            pointer-events-none
            absolute
            right-[12%]
            top-[42%]
            h-40
            w-40
            rounded-full
            bg-[#ce1126]/[0.025]
        "
                />

                <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-8">

                    {/* Bande Mali */}
                    <div className="mb-5 flex items-center gap-1">
                        <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                        <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                        <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                    </div>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                        {/* TITRE */}
                        <div className="max-w-2xl">

                            <div className="mb-3 flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                                    <Package
                                        size={18}
                                        strokeWidth={2.2}
                                    />
                                </div>

                                <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                                    Catalogue produits
                                </span>

                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                Produits
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                                Gérez les produits disponibles dans votre boutique
                                sur MarketMali.
                            </p>

                        </div>

                        {/* ACTION */}
                        <button
                            type="button"
                            onClick={() => loadProduits(true)}
                            disabled={refreshing}
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
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
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

                </div>

            </section>

            {/* =========================
                    STATISTIQUES
                ========================== */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {/* Total */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {totalProduits}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <Package
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Actifs */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Actifs
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {produitsActifs}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                            <CheckCircle2
                                size={19}
                                className="text-green-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Bloqués */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Bloqués
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {produitsBloques}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                            <Ban
                                size={19}
                                className="text-red-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Rupture */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Rupture
                            </p>

                            <p className="mt-2 text-2xl font-bold text-orange-600">
                                {produitsRupture}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                            <AlertTriangle
                                size={19}
                                className="text-orange-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                    OUTILS
                ========================== */}
            <ProductToolbar
                search={search}
                setSearch={setSearch}
            />

            {/* Résultat recherche */}
            {search && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <SearchX size={16} />

                    <span>
                        {produitsFiltres.length} résultat
                        {produitsFiltres.length > 1 ? "s" : ""} pour{" "}
                        <strong className="font-semibold text-gray-700">
                            « {search} »
                        </strong>
                    </span>
                </div>
            )}

            {/* =========================
                    TABLE / CARTES
                ========================== */}
            <ProductTable
                produits={produitsFiltres}
                onDelete={supprimerProduit}
                onToggleStatus={changerStatutProduit}
            />
        </div>
    );
}