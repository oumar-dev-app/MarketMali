"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    BadgePercent,
    CalendarClock,
    CheckCircle2,
    Clock3,
    DollarSign,
    Package,
    Percent,
    RefreshCw,
    Search,
    Tag,
    TrendingUp,
    AlertTriangle,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

interface Promotion {
    id: number;
    uuid: string;

    boutique_id: number;
    produit_id: number;

    nom: string;

    type: "percentage" | "special_price";

    reduction_pourcentage: number | null;
    prix_promotionnel: number | null;

    date_debut: string;
    date_fin: string;

    quantite_limite: number | null;

    created_at: string;
    updated_at: string;

    produit_uuid: string;
    produit_nom: string;
    produit_slug: string;
    produit_prix: number | string;
    produit_stock: number;

    boutique_uuid: string;
    boutique_nom: string;
    boutique_slug: string;
}

interface PromotionStats {
    quantite_vendue: number;
    chiffre_affaires: number;
    quantite_limite: number | null;
    quantite_restante: number | null;
}

type PromotionStatus =
    | "active"
    | "upcoming"
    | "expired";

function getPromotionStatus(
    promotion: Promotion
): PromotionStatus {
    const now = new Date();

    const debut = new Date(promotion.date_debut);
    const fin = new Date(promotion.date_fin);

    if (now < debut) {
        return "upcoming";
    }

    if (now > fin) {
        return "expired";
    }

    return "active";
}

function getPromotionPrice(
    promotion: Promotion
): number {
    const prixNormal = Number(
        promotion.produit_prix
    );

    if (promotion.type === "special_price") {
        return Number(
            promotion.prix_promotionnel ?? prixNormal
        );
    }

    const reduction = Number(
        promotion.reduction_pourcentage ?? 0
    );

    return Number(
        (
            prixNormal *
            (1 - reduction / 100)
        ).toFixed(2)
    );
}

function formatPrice(
    value: number | string
): string {
    return `${Number(value).toLocaleString(
        "fr-FR"
    )} FCFA`;
}

function formatDate(
    value: string
): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date invalide";
    }

    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function formatDateTime(
    value: string
): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date invalide";
    }

    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

export default function PromotionsPage() {
    const { token } = useAuth();

    const [promotions, setPromotions] =
        useState<Promotion[]>([]);

    const [stats, setStats] = useState<
        Record<string, PromotionStats>
    >({});

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            "all" | PromotionStatus
        >("all");

    const loadPromotions = useCallback(
        async (
            showRefresh = false
        ) => {
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
                    "/api/promotions",
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
                    throw new Error(
                        data.message ||
                            "Impossible de charger les promotions."
                    );
                }

                const promotionList =
                    data.data ?? [];

                setPromotions(
                    promotionList
                );

                /*
                 * Chargement des statistiques
                 * de chaque promotion.
                 *
                 * On les charge séparément pour
                 * garder l'API principale simple.
                 */
                const statsEntries =
                    await Promise.all(
                        promotionList.map(
                            async (
                                promotion: Promotion
                            ) => {
                                try {
                                    const statsResponse =
                                        await fetch(
                                            `/api/promotions/${promotion.uuid}/stats`,
                                            {
                                                headers: {
                                                    Authorization:
                                                        `Bearer ${token}`,
                                                },
                                                cache:
                                                    "no-store",
                                            }
                                        );

                                    const statsData =
                                        await statsResponse.json();

                                    if (
                                        !statsResponse.ok ||
                                        !statsData.success
                                    ) {
                                        return [
                                            promotion.uuid,
                                            {
                                                quantite_vendue:
                                                    0,
                                                chiffre_affaires:
                                                    0,
                                                quantite_limite:
                                                    promotion.quantite_limite,
                                                quantite_restante:
                                                    promotion.quantite_limite,
                                            },
                                        ] as const;
                                    }

                                    return [
                                        promotion.uuid,
                                        statsData.data,
                                    ] as const;
                                } catch {
                                    return [
                                        promotion.uuid,
                                        {
                                            quantite_vendue:
                                                0,
                                            chiffre_affaires:
                                                0,
                                            quantite_limite:
                                                promotion.quantite_limite,
                                            quantite_restante:
                                                promotion.quantite_limite,
                                        },
                                    ] as const;
                                }
                            }
                        )
                    );

                setStats(
                    Object.fromEntries(
                        statsEntries
                    )
                );
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
        loadPromotions();
    }, [loadPromotions]);

    /*
     * =========================
     * STATISTIQUES LOCALES
     * =========================
     */

    const promotionsActives =
        promotions.filter(
            (promotion) =>
                getPromotionStatus(
                    promotion
                ) === "active"
        );

    const promotionsAVenir =
        promotions.filter(
            (promotion) =>
                getPromotionStatus(
                    promotion
                ) === "upcoming"
        );

    const promotionsTerminees =
        promotions.filter(
            (promotion) =>
                getPromotionStatus(
                    promotion
                ) === "expired"
        );

    const produitsEnPromotion =
        new Set(
            promotionsActives.map(
                (promotion) =>
                    promotion.produit_id
            )
        ).size;

    const chiffreAffaires =
        promotions.reduce(
            (total, promotion) => {
                return (
                    total +
                    Number(
                        stats[
                            promotion.uuid
                        ]?.chiffre_affaires ??
                            0
                    )
                );
            },
            0
        );

    const quantiteVendue =
        promotions.reduce(
            (total, promotion) => {
                return (
                    total +
                    Number(
                        stats[
                            promotion.uuid
                        ]?.quantite_vendue ??
                            0
                    )
                );
            },
            0
        );

    /*
     * =========================
     * RECHERCHE / FILTRES
     * =========================
     */

    const promotionsFiltrees =
        useMemo(() => {
            const terme =
                search
                    .trim()
                    .toLowerCase();

            return promotions.filter(
                (promotion) => {
                    const status =
                        getPromotionStatus(
                            promotion
                        );

                    const correspondStatus =
                        statusFilter ===
                            "all" ||
                        status ===
                            statusFilter;

                    if (
                        !correspondStatus
                    ) {
                        return false;
                    }

                    if (!terme) {
                        return true;
                    }

                    return (
                        promotion.nom
                            .toLowerCase()
                            .includes(
                                terme
                            ) ||
                        promotion.produit_nom
                            .toLowerCase()
                            .includes(
                                terme
                            ) ||
                        promotion.boutique_nom
                            .toLowerCase()
                            .includes(
                                terme
                            )
                    );
                }
            );
        }, [
            promotions,
            search,
            statusFilter,
        ]);

    /*
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />

                    <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-28 animate-pulse rounded-2xl bg-gray-100"
                            />
                        )
                    )}
                </div>

                <div className="h-14 animate-pulse rounded-xl bg-gray-100" />

                <div className="grid gap-4 lg:grid-cols-2">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-72 animate-pulse rounded-2xl bg-gray-100"
                            />
                        )
                    )}
                </div>
            </div>
        );
    }

    /*
     * =========================
     * ERREUR
     * =========================
     */

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
                            Impossible de charger les promotions
                        </h2>

                        <p className="mt-1 text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                loadPromotions()
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            <RefreshCw
                                size={16}
                            />
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =========================
                EN-TÊTE
            ========================== */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                            <BadgePercent
                                size={22}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Promotions
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Créez et gérez les offres promotionnelles de vos produits.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() =>
                            loadPromotions(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-gray-700
                            shadow-sm
                            transition
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-60
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

                    <Link
                        href="/dashboard/promotions/nouvelle"
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-black
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-gray-800
                        "
                    >
                        <Tag
                            size={17}
                        />

                        Nouvelle promotion
                    </Link>
                </div>
            </div>

            {/* =========================
                STATISTIQUES
            ========================== */}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                {/* Promotions actives */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Actives
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {
                                    promotionsActives.length
                                }
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

                {/* À venir */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                À venir
                            </p>

                            <p className="mt-2 text-2xl font-bold text-blue-600">
                                {
                                    promotionsAVenir.length
                                }
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                            <Clock3
                                size={19}
                                className="text-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Produits */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Produits en promotion
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {
                                    produitsEnPromotion
                                }
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

                {/* CA */}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                CA promotions
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                {formatPrice(
                                    chiffreAffaires
                                )}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <TrendingUp
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                RÉSUMÉ VENTES
            ========================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Ventes générées par les promotions
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {quantiteVendue}{" "}
                            <span className="text-sm font-medium text-gray-500">
                                unité
                                {quantiteVendue >
                                1
                                    ? "s"
                                    : ""}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign
                            size={17}
                        />

                        <span>
                            Chiffre d'affaires :
                        </span>

                        <strong className="text-gray-900">
                            {formatPrice(
                                chiffreAffaires
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =========================
                OUTILS
            ========================== */}

            <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Rechercher une promotion ou un produit..."
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            py-3
                            pl-10
                            pr-4
                            text-sm
                            text-gray-900
                            outline-none
                            transition
                            placeholder:text-gray-400
                            focus:border-gray-400
                            focus:ring-2
                            focus:ring-gray-100
                        "
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value as
                                | "all"
                                | PromotionStatus
                        )
                    }
                    className="
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-gray-700
                        outline-none
                        focus:border-gray-400
                        focus:ring-2
                        focus:ring-gray-100
                    "
                >
                    <option value="all">
                        Toutes les promotions
                    </option>

                    <option value="active">
                        Actives
                    </option>

                    <option value="upcoming">
                        À venir
                    </option>

                    <option value="expired">
                        Terminées
                    </option>
                </select>
            </div>

            {/* =========================
                COMPTEUR
            ========================== */}

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                    {promotionsFiltrees.length} promotion
                    {promotionsFiltrees.length >
                    1
                        ? "s"
                        : ""}
                </span>

                {search && (
                    <span>
                        Recherche :
                        <strong className="ml-1 text-gray-700">
                            « {search} »
                        </strong>
                    </span>
                )}
            </div>

            {/* =========================
                LISTE VIDE
            ========================== */}

            {promotionsFiltrees.length ===
                0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        <BadgePercent
                            size={25}
                            className="text-gray-500"
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        Aucune promotion trouvée
                    </h2>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        {search
                            ? "Aucune promotion ne correspond à votre recherche."
                            : "Créez votre première promotion pour mettre vos produits en avant."}
                    </p>

                    {!search && (
                        <Link
                            href="/dashboard/promotions/nouvelle"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Tag
                                size={17}
                            />

                            Créer une promotion
                        </Link>
                    )}
                </div>
            )}

            {/* =========================
                CARTES PROMOTIONS
            ========================== */}

            {promotionsFiltrees.length >
                0 && (
                <div className="grid gap-4 xl:grid-cols-2">
                    {promotionsFiltrees.map(
                        (
                            promotion
                        ) => {
                            const status =
                                getPromotionStatus(
                                    promotion
                                );

                            const promotionPrice =
                                getPromotionPrice(
                                    promotion
                                );

                            const normalPrice =
                                Number(
                                    promotion.produit_prix
                                );

                            const promotionStats =
                                stats[
                                    promotion
                                        .uuid
                                ];

                            const quantiteVendue =
                                Number(
                                    promotionStats?.quantite_vendue ??
                                        0
                                );

                            const quantiteRestante =
                                promotionStats?.quantite_restante ??
                                promotion.quantite_limite;

                            const reduction =
                                promotion.type ===
                                "percentage"
                                    ? Number(
                                          promotion.reduction_pourcentage ??
                                              0
                                      )
                                    : Number(
                                          (
                                              (
                                                  1 -
                                                  promotionPrice /
                                                      normalPrice
                                              ) *
                                              100
                                          ).toFixed(
                                              0
                                          )
                                      );

                            return (
                                <div
                                    key={
                                        promotion.uuid
                                    }
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    {/* En-tête carte */}

                                    <div className="border-b border-gray-100 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            bg-gray-100
                                                            text-gray-700
                                                        "
                                                    >
                                                        <Percent
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        -
                                                        {
                                                            reduction
                                                        }
                                                        %
                                                    </span>

                                                    {status ===
                                                        "active" && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                            <CheckCircle2
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            Active
                                                        </span>
                                                    )}

                                                    {status ===
                                                        "upcoming" && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                            <Clock3
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            À venir
                                                        </span>
                                                    )}

                                                    {status ===
                                                        "expired" && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                            <XCircle
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            Terminée
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="mt-3 truncate text-lg font-bold text-gray-900">
                                                    {
                                                        promotion.nom
                                                    }
                                                </h2>

                                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Package
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    {
                                                        promotion.produit_nom
                                                    }
                                                </p>
                                            </div>

                                            <div className="shrink-0 rounded-xl bg-gray-50 p-3">
                                                <BadgePercent
                                                    size={
                                                        22
                                                    }
                                                    className="text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix */}

                                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 p-5">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Prix normal
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-500 line-through">
                                                {formatPrice(
                                                    normalPrice
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Prix promotion
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-green-600">
                                                {formatPrice(
                                                    promotionPrice
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Période */}

                                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 p-5">
                                        <div className="flex gap-2">
                                            <CalendarClock
                                                size={
                                                    17
                                                }
                                                className="mt-0.5 shrink-0 text-gray-400"
                                            />

                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Début
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-700">
                                                    {formatDate(
                                                        promotion.date_debut
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <CalendarClock
                                                size={
                                                    17
                                                }
                                                className="mt-0.5 shrink-0 text-gray-400"
                                            />

                                            <div>
                                                <p className="text-xs font-medium text-gray-400">
                                                    Fin
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-700">
                                                    {formatDate(
                                                        promotion.date_fin
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performances */}

                                    <div className="grid grid-cols-2 gap-4 p-5">
                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                Ventes
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-gray-900">
                                                {
                                                    quantiteVendue
                                                }
                                            </p>

                                            {promotion.quantite_limite !==
                                                null && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    sur{" "}
                                                    {
                                                        promotion.quantite_limite
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-400">
                                                CA généré
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-gray-900">
                                                {formatPrice(
                                                    promotionStats?.chiffre_affaires ??
                                                        0
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantité restante */}

                                    {promotion.quantite_limite !==
                                        null && (
                                        <div className="px-5 pb-5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-gray-500">
                                                    Quantité restante
                                                </span>

                                                <span className="font-semibold text-gray-700">
                                                    {
                                                        quantiteRestante
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full rounded-full bg-black transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            promotion.quantite_limite >
                                                                0
                                                                ? (quantiteVendue /
                                                                      promotion.quantite_limite) *
                                                                      100
                                                                : 0
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}

                                    <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-xs text-gray-400">
                                            Créée le{" "}
                                            {formatDateTime(
                                                promotion.created_at
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={`/dashboard/promotions/${promotion.uuid}`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 sm:flex-none"
                                            >
                                                Voir
                                            </Link>

                                            <Link
                                                href={`/dashboard/promotions/${promotion.uuid}/modifier`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 sm:flex-none"
                                            >
                                                Modifier
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}
