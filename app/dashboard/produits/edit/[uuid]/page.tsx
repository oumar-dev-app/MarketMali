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

                <div className="h-[600px] animate-pulse rounded-2xl bg-gray-100" />
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
            {/* En-tête */}
            <div>
                <Link
                    href="/dashboard/produits"
                    className="
                        mb-4 inline-flex items-center
                        gap-2 text-sm font-medium
                        text-gray-500 transition
                        hover:text-gray-900
                    "
                >
                    <ArrowLeft size={16} />
                    Retour aux produits
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                        <Package size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Modifier le produit
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Modifiez les informations et les paramètres du produit.
                        </p>
                    </div>
                </div>
            </div>

            <ProductForm
                initialData={produit}
                loading={loading}
                onSubmit={modifierProduit}
            />
        </div>
    );
}