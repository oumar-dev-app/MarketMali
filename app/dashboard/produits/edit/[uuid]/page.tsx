"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    AlertTriangle,
    Package,
} from "lucide-react";
import { toast } from "sonner";

import ProductForm, {
    ProductFormData,
} from "../../../composants/ProductForm";

import { useAuth } from "@/contexts/AuthContext";
import ProductVariantsManager from "@/app/dashboard/composants/ProductVariantsManager";

export default function EditProduitPage() {
    const params = useParams();
    const router = useRouter();

    const uuid = params.uuid as string;

    const { token } = useAuth();

    const [produit, setProduit] =
        useState<ProductFormData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadProduit = useCallback(
        async () => {
            if (!token || !uuid) {
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/dashboard/produit/uuid/${uuid}`,
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
                        "Impossible de charger le produit."
                    );
                }

                setProduit({
                    categorie_id:
                        data.data.categorie_id,

                    nom:
                        data.data.nom,

                    description:
                        data.data.description ?? "",

                    prix:
                        Number(data.data.prix),

                    stock:
                        Number(data.data.stock),

                    image:
                        data.data.image ?? "",
                });
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger le produit.";

                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        },
        [token, uuid]
    );

    useEffect(() => {
        loadProduit();
    }, [loadProduit]);

    async function modifierProduit(
        form: ProductFormData
    ) {
        try {
            setLoading(true);

            const response =
                await fetch(
                    `/api/dashboard/produit/uuid/${uuid}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify(form),
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
                    "Impossible de modifier le produit."
                );
            }

            toast.success(
                "Produit modifié avec succès."
            );

            router.push(
                "/dashboard/produits"
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Impossible de modifier le produit.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    if (loading && !produit) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="h-150 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }

    if (error || !produit) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle
                        size={22}
                        className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div className="flex-1">
                        <h2 className="font-semibold text-red-800">
                            Produit introuvable
                        </h2>

                        <p className="mt-1 text-sm text-red-700">
                            {error ||
                                "Impossible de charger les informations du produit."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={loadProduit}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Réessayer
                            </button>

                            <Link
                                href="/dashboard/produits"
                                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            >
                                Retour aux produits
                            </Link>
                        </div>
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

                {/* Décoration verte */}
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

                {/* Décoration jaune */}
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

                {/* Décoration rouge */}
                <div
                    className="
            pointer-events-none
            absolute
            right-[12%]
            top-[42%]
            h-40
            w-40
            rounded-full
            bg-[#ce1126]/2.5
        "
                />

                <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-8">

                    {/* Bande Mali */}
                    <div className="mb-5 flex items-center gap-1">
                        <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                        <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                        <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                    </div>

                    <div className="flex flex-col gap-5">

                        {/* TITRE */}
                        <div className="flex items-start gap-4">

                            {/* Retour */}
                            <Link
                                href="/dashboard/produits"
                                aria-label="Retour aux produits"
                                className="
                        mt-0.5
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-600
                        shadow-sm
                        transition
                        hover:border-[#14a800]/30
                        hover:bg-[#14a800]/5
                        hover:text-[#14a800]
                        focus:outline-none
                        focus:ring-4
                        focus:ring-[#14a800]/10
                    "
                            >
                                <ArrowLeft size={18} />
                            </Link>

                            <div className="min-w-0">

                                {/* Section */}
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

                                {/* Titre */}
                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                    Modifier le produit
                                </h1>

                                {/* Description */}
                                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                                    Modifiez les informations et les paramètres
                                    de votre produit.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <ProductForm
                initialData={produit}
                loading={loading}
                onSubmit={modifierProduit}
            />

            {produit && (
                <ProductVariantsManager
                    productUuid={uuid}
                />
            )}
        </div>
    );
}