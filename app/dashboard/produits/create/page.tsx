"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    PackagePlus,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import ProductForm, {
    ProductFormData,
} from "../../composants/ProductForm";

export default function CreateProduitPage() {
    const router = useRouter();
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(data: ProductFormData) {
        if (!token) {
            const message =
                "Vous devez être connecté pour créer un produit.";

            setError(message);
            toast.error(message);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "/api/dashboard/produit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        categorie_id: data.categorie_id,
                        nom: data.nom,
                        description: data.description,
                        prix: data.prix,
                        stock: data.stock,
                        image: data.image,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                const message =
                    result.message ||
                    "Impossible de créer le produit.";

                setError(message);
                toast.error(message);
                return;
            }

            toast.success("Produit créé avec succès.");

            router.push("/dashboard/produits");
        } catch (error) {
            console.error(
                "Erreur création produit :",
                error
            );

            const message =
                "Une erreur serveur est survenue. Veuillez réessayer.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

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
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>

                                <div className="min-w-0">

                                    <div className="mb-3 flex items-center gap-2">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                                            <PackagePlus
                                                className="h-[18px] w-[18px]"
                                                strokeWidth={2.2}
                                            />
                                        </div>

                                        <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                                            Catalogue produits
                                        </span>

                                    </div>

                                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                        Nouveau produit
                                    </h1>

                                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                                        Ajoutez un nouveau produit à votre catalogue
                                        et rendez-le disponible sur MarketMali.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* Erreur globale */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Impossible de créer le produit
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <ProductForm
                    loading={loading}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}