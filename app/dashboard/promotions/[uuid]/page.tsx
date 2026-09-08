"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BadgePercent,
    CalendarClock,
    CheckCircle2,
    Clock3,
    DollarSign,
    Edit3,
    Package,
    Percent,
    RefreshCw,
    ShoppingBag,
    Tag,
    TrendingUp,
    AlertTriangle,
    XCircle,
    Trash2,
    Boxes,
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
            month: "long",
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

function getDurationInDays(
    start: string,
    end: string
): number {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();

    if (
        Number.isNaN(startDate) ||
        Number.isNaN(endDate)
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.ceil(
            (endDate - startDate) /
                (1000 * 60 * 60 * 24)
        )
    );
}

export default function PromotionDetailPage() {
    const params = useParams();
    const router = useRouter();

    const { token } = useAuth();

    const uuid = Array.isArray(params.uuid)
        ? params.uuid[0]
        : params.uuid;

    const [promotion, setPromotion] =
        useState<Promotion | null>(null);

    const [stats, setStats] =
        useState<PromotionStats | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadPromotion =
        useCallback(
            async (
                showRefresh = false
            ) => {
                if (!token || !uuid) {
                    return;
                }

                try {
                    if (showRefresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");

                    const [
                        promotionResponse,
                        statsResponse,
                    ] = await Promise.all([
                        fetch(
                            `/api/promotions/${uuid}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                                cache: "no-store",
                            }
                        ),
                        fetch(
                            `/api/promotions/${uuid}/stats`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                                cache: "no-store",
                            }
                        ),
                    ]);

                    const promotionData =
                        await promotionResponse.json();

                    const statsData =
                        await statsResponse.json();

                    if (
                        !promotionResponse.ok ||
                        !promotionData.success
                    ) {
                        throw new Error(
                            promotionData.message ||
                                "Impossible de charger la promotion."
                        );
                    }

                    if (
                        !statsResponse.ok ||
                        !statsData.success
                    ) {
                        throw new Error(
                            statsData.message ||
                                "Impossible de charger les statistiques."
                        );
                    }

                    setPromotion(
                        promotionData.data
                    );

                    setStats(
                        statsData.data
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
            [token, uuid]
        );

    useEffect(() => {
        loadPromotion();
    }, [loadPromotion]);

    const computed = useMemo(() => {
        if (!promotion) {
            return null;
        }

        const prixNormal = Number(
            promotion.produit_prix
        );

        const prixPromotion =
            getPromotionPrice(
                promotion
            );

        const economie = Math.max(
            0,
            prixNormal - prixPromotion
        );

        const reduction =
            prixNormal > 0
                ? Number(
                      (
                          (1 -
                              prixPromotion /
                                  prixNormal) *
                          100
                      ).toFixed(0)
                  )
                : 0;

        const quantiteVendue =
            Number(
                stats?.quantite_vendue ?? 0
            );

        const quantiteRestante =
            stats?.quantite_restante ??
            promotion.quantite_limite;

        const progression =
            promotion.quantite_limite !==
                null &&
            promotion.quantite_limite > 0
                ? Math.min(
                      100,
                      (quantiteVendue /
                          promotion.quantite_limite) *
                          100
                  )
                : 0;

        return {
            prixNormal,
            prixPromotion,
            economie,
            reduction,
            quantiteVendue,
            quantiteRestante,
            progression,
            status:
                getPromotionStatus(
                    promotion
                ),
            duree:
                getDurationInDays(
                    promotion.date_debut,
                    promotion.date_fin
                ),
        };
    }, [promotion, stats]);

    const handleDelete =
        useCallback(async () => {
            if (!token || !uuid || !promotion) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Voulez-vous vraiment supprimer la promotion « ${promotion.nom} » ?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeleting(true);

                const response =
                    await fetch(
                        `/api/promotions/${uuid}`,
                        {
                            method: "DELETE",
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
                        data.message ||
                            "Impossible de supprimer la promotion."
                    );
                }

                toast.success(
                    "Promotion supprimée avec succès."
                );

                router.push(
                    "/dashboard/promotions"
                );
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Erreur lors de la suppression.";

                toast.error(message);
            } finally {
                setDeleting(false);
            }
        }, [
            token,
            uuid,
            promotion,
            router,
        ]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />

                <div className="grid gap-4 lg:grid-cols-3">
                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl bg-gray-100"
                            />
                        )
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="h-96 animate-pulse rounded-2xl bg-gray-100 lg:col-span-2" />

                    <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
                </div>
            </div>
        );
    }

    if (error || !promotion || !computed) {
        return (
            <div className="space-y-6">
                <Link
                    href="/dashboard/promotions"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft size={17} />
                    Retour aux promotions
                </Link>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="mt-0.5 shrink-0 text-red-600"
                            size={22}
                        />

                        <div>
                            <h2 className="font-semibold text-red-800">
                                Impossible de charger la promotion
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                {error ||
                                    "Promotion introuvable."}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    loadPromotion()
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
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =========================
                NAVIGATION
            ========================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href="/dashboard/promotions"
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft size={17} />
                    Retour aux promotions
                </Link>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() =>
                            loadPromotion(true)
                        }
                        disabled={refreshing}
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
                        href={`/dashboard/promotions/${promotion.uuid}/modifier`}
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
                        <Edit3 size={17} />
                        Modifier
                    </Link>
                </div>
            </div>

            {/* =========================
                EN-TÊTE
            ========================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                    <Percent size={13} />
                                    -{computed.reduction}%
                                </span>

                                {computed.status ===
                                    "active" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                        <CheckCircle2
                                            size={13}
                                        />
                                        Active
                                    </span>
                                )}

                                {computed.status ===
                                    "upcoming" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        <Clock3
                                            size={13}
                                        />
                                        À venir
                                    </span>
                                )}

                                {computed.status ===
                                    "expired" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                        <XCircle
                                            size={13}
                                        />
                                        Terminée
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                {promotion.nom}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                                <Package size={16} />

                                <span>
                                    {promotion.produit_nom}
                                </span>

                                <span className="hidden text-gray-300 sm:inline">
                                    •
                                </span>

                                <span>
                                    {promotion.boutique_nom}
                                </span>
                            </div>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
                            <BadgePercent
                                size={28}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Prix */}

                <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Prix normal
                        </p>

                        <p className="mt-2 text-lg font-semibold text-gray-500 line-through">
                            {formatPrice(
                                computed.prixNormal
                            )}
                        </p>
                    </div>

                    <div className="p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Prix promotionnel
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {formatPrice(
                                computed.prixPromotion
                            )}
                        </p>
                    </div>

                    <div className="p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Économie client
                        </p>

                        <p className="mt-2 text-lg font-bold text-gray-900">
                            {formatPrice(
                                computed.economie
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================
                STATISTIQUES
            ========================== */}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Ventes
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {
                                    computed.quantiteVendue
                                }
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <ShoppingBag
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500">
                                Chiffre d'affaires
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                                {formatPrice(
                                    stats?.chiffre_affaires ??
                                        0
                                )}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <TrendingUp
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Stock produit
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {
                                    promotion.produit_stock
                                }
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <Boxes
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Durée
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {computed.duree}
                                <span className="ml-1 text-sm font-medium text-gray-500">
                                    jour
                                    {computed.duree >
                                    1
                                        ? "s"
                                        : ""}
                                </span>
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <CalendarClock
                                size={19}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                CONTENU PRINCIPAL
            ========================== */}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* Informations */}

                <div className="space-y-6 lg:col-span-2">

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <CalendarClock
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Période de la promotion
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Dates et durée de l'offre
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Début
                                </p>

                                <p className="mt-2 font-semibold text-gray-900">
                                    {formatDate(
                                        promotion.date_debut
                                    )}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {formatDateTime(
                                        promotion.date_debut
                                    ).split(
                                        " à "
                                    )[1] || ""}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Fin
                                </p>

                                <p className="mt-2 font-semibold text-gray-900">
                                    {formatDate(
                                        promotion.date_fin
                                    )}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {formatDateTime(
                                        promotion.date_fin
                                    ).split(
                                        " à "
                                    )[1] || ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quantité */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <Package
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Quantité promotionnelle
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Suivi des ventes de l'offre
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            {promotion.quantite_limite !==
                            null ? (
                                <>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Quantité vendue
                                            </p>

                                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                                {
                                                    computed.quantiteVendue
                                                }
                                                <span className="ml-2 text-base font-medium text-gray-400">
                                                    /{" "}
                                                    {
                                                        promotion.quantite_limite
                                                    }
                                                </span>
                                            </p>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-700">
                                            {Math.round(
                                                computed.progression
                                            )}
                                            %
                                        </p>
                                    </div>

                                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-black transition-all"
                                            style={{
                                                width: `${computed.progression}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            Quantité restante
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            {
                                                computed.quantiteRestante
                                            }
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                                    <Boxes
                                        size={20}
                                        className="shrink-0 text-gray-500"
                                    />

                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Quantité illimitée
                                        </p>

                                        <p className="mt-0.5 text-sm text-gray-500">
                                            Cette promotion ne possède pas de limite de quantité.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Produit */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <Tag
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Produit concerné
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Produit associé à cette promotion
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                        <Package
                                            size={22}
                                            className="text-gray-600"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-gray-900">
                                            {
                                                promotion.produit_nom
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Prix actuel :{" "}
                                            {formatPrice(
                                                promotion.produit_prix
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/boutiques/${promotion.boutique_slug}`}
                                    target="_blank"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Voir la boutique
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne latérale */}

                <div className="space-y-6">

                    {/* Résumé */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5">
                            <h2 className="font-semibold text-gray-900">
                                Résumé
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Performance de la promotion
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            <div className="flex items-center justify-between gap-3 p-5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Percent size={16} />
                                    Réduction
                                </div>

                                <span className="font-semibold text-gray-900">
                                    -{computed.reduction}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 p-5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ShoppingBag
                                        size={16}
                                    />
                                    Ventes
                                </div>

                                <span className="font-semibold text-gray-900">
                                    {
                                        computed.quantiteVendue
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 p-5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <DollarSign
                                        size={16}
                                    />
                                    CA généré
                                </div>

                                <span className="text-right font-semibold text-gray-900">
                                    {formatPrice(
                                        stats?.chiffre_affaires ??
                                            0
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 p-5">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CalendarClock
                                        size={16}
                                    />
                                    Durée
                                </div>

                                <span className="font-semibold text-gray-900">
                                    {computed.duree}{" "}
                                    jour
                                    {computed.duree >
                                    1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Informations système */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-5">
                            <h2 className="font-semibold text-gray-900">
                                Informations
                            </h2>
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Type
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {promotion.type ===
                                    "percentage"
                                        ? "Réduction en pourcentage"
                                        : "Prix spécial"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Créée le
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {formatDateTime(
                                        promotion.created_at
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Dernière modification
                                </p>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                    {formatDateTime(
                                        promotion.updated_at
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Danger zone */}

                    <div className="rounded-2xl border border-red-200 bg-white shadow-sm">
                        <div className="border-b border-red-100 p-5">
                            <h2 className="font-semibold text-red-800">
                                Zone de danger
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                La suppression de cette promotion est définitive.
                            </p>
                        </div>

                        <div className="p-5">
                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="
                                    inline-flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-red-700
                                    transition
                                    hover:bg-red-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <Trash2
                                    size={17}
                                />

                                {deleting
                                    ? "Suppression..."
                                    : "Supprimer la promotion"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                FOOTER
            ========================== */}

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                    Promotion : {promotion.uuid}
                </span>

                <span>
                    Dernière mise à jour :{" "}
                    {formatDateTime(
                        promotion.updated_at
                    )}
                </span>
            </div>
        </div>
    );
}
