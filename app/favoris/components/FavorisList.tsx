"use client";

import {
    Heart,
    Loader2,
    Package,
    ShoppingBag,
    Store,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Favori {
    id: number;
    uuid: string;
    user_id: number;
    produit_id: number;
    created_at: string;

    produit_uuid: string;
    produit_nom: string;
    produit_slug: string;
    produit_prix: string;
    produit_image: string | null;
    produit_stock: number;
    produit_status: string;

    boutique_id: number;
    boutique_nom: string;
    boutique_slug: string;
}

export default function FavorisList() {
    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();

    const [favoris, setFavoris] = useState<Favori[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] =
        useState<number | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (
            !user ||
            user.role !== "client" ||
            !token
        ) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadFavoris() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    "/api/favoris",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer vos favoris."
                    );
                }

                const data = await response.json();

                if (!cancelled) {
                    setFavoris(
                        Array.isArray(data?.data)
                            ? data.data
                            : []
                    );
                }
            } catch (err) {
                console.error(
                    "Erreur chargement favoris :",
                    err
                );

                if (!cancelled) {
                    setError(
                        "Impossible de charger vos favoris."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadFavoris();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        token,
        user,
    ]);

    async function handleRemove(
        favori: Favori
    ) {
        if (!token) {
            return;
        }

        setRemovingId(favori.id);

        try {
            const response = await fetch(
                `/api/favoris/${encodeURIComponent(
                    favori.produit_uuid
                )}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de retirer le produit des favoris."
                );
            }

            setFavoris((current) =>
                current.filter(
                    (item) =>
                        item.id !== favori.id
                )
            );

            toast.success("Favori retiré", {
                description: `« ${favori.produit_nom} » a été retiré de vos favoris.`,
            });
        } catch (err) {
            console.error(
                "Erreur suppression favori :",
                err
            );

            toast.error("Erreur", {
                description:
                    "Impossible de retirer ce produit des favoris.",
            });
        } finally {
            setRemovingId(null);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex min-h-75 items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />

                    <span>
                        Chargement de vos favoris...
                    </span>
                </div>
            </div>
        );
    }

    if (
        !user ||
        user.role !== "client" ||
        !token
    ) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <Heart
                    size={42}
                    className="mx-auto text-gray-300"
                />

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    Connectez-vous pour voir vos favoris
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Ajoutez des produits à vos favoris
                    et retrouvez-les facilement ici.
                </p>

                <Link
                    href="/login"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                    Se connecter
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-700">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        window.location.reload()
                    }
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (favoris.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <Heart
                        size={30}
                        className="text-green-600"
                    />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                    Aucun favori pour le moment
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Lorsque vous trouverez un produit
                    qui vous plaît, ajoutez-le à vos
                    favoris pour le retrouver facilement.
                </p>

                <Link
                    href="/produits"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                    <ShoppingBag size={17} />
                    Découvrir les produits
                </Link>
            </div>
        );
    }

return (
    <div>
        {/* EN-TÊTE FAVORIS */}
        <section className="relative mb-8 overflow-hidden border-b border-gray-100 bg-white">
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

            <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 rounded-2xl">
                {/* Bande Mali */}

                <div className="mb-6 flex items-center gap-1">
                    <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                    <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                    <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                </div>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    {/* TITRE */}

                    <div className="max-w-2xl">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                                <Heart
                                    size={18}
                                    strokeWidth={2.2}
                                />
                            </div>

                            <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                                Votre sélection
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Mes favoris
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                            Retrouvez facilement les produits que vous aimez
                            et conservez vos coups de cœur pour les consulter
                            ou les acheter plus tard sur MarketMali.
                        </p>
                    </div>

                    {/* STATISTIQUE */}

                    <div
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-4
                            rounded-2xl
                            border
                            border-gray-100
                            bg-gray-50
                            px-5
                            py-4
                        "
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ce1126]/10 text-[#ce1126]">
                            <Heart
                                size={23}
                                strokeWidth={1.9}
                                fill="currentColor"
                            />
                        </div>

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Ma sélection
                            </p>

                            <p className="mt-0.5 text-2xl font-extrabold text-gray-950">
                                {favoris.length}
                            </p>

                            <p className="text-xs text-gray-500">
                                produit
                                {favoris.length > 1
                                    ? "s"
                                    : ""}{" "}
                                enregistré
                                {favoris.length > 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* COMPTEUR */}
        <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                    {favoris.length}
                </span>{" "}
                {favoris.length > 1
                    ? "produits enregistrés"
                    : "produit enregistré"}
            </p>
        </div>

        {/* GRILLE */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favoris.map((favori) => (
                    <article
                        key={favori.id}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <Link
                            href={`/produits/${favori.produit_uuid}`}
                            className="block"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {favori.produit_image ? (
                                    <img
                                        src={favori.produit_image}
                                        alt={favori.produit_nom}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package
                                            size={46}
                                            className="text-gray-300"
                                        />
                                    </div>
                                )}

                                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                    {favori.boutique_nom}
                                </div>

                                {favori.produit_stock <= 0 && (
                                    <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-xs font-semibold text-white">
                                        Produit indisponible
                                    </div>
                                )}
                            </div>
                        </Link>

                        <div className="p-4">
                            <Link
                                href={`/produits/${favori.produit_uuid}`}
                                className="block"
                            >
                                <h2 className="line-clamp-2 min-h-12 text-base font-semibold text-gray-900 transition hover:text-green-700">
                                    {favori.produit_nom}
                                </h2>

                                <p className="mt-2 text-lg font-bold text-green-700">
                                    {Number(
                                        favori.produit_prix
                                    ).toLocaleString("fr-FR")}{" "}
                                    FCFA
                                </p>
                            </Link>

                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                                <Store size={14} />

                                <span className="truncate">
                                    {favori.boutique_nom}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <Link
                                    href={`/produits/${favori.produit_uuid}`}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                                >
                                    <ShoppingBag size={16} />
                                    Voir le produit
                                </Link>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemove(favori)
                                    }
                                    disabled={
                                        removingId === favori.id
                                    }
                                    title="Retirer des favoris"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {removingId ===
                                        favori.id ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Trash2 size={17} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}