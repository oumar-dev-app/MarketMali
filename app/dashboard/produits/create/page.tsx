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

                {/* En-tête */}
                <div className="mb-6">
                    <Link
                        href="/dashboard/produits"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux produits
                    </Link>

                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <PackagePlus className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                Nouveau produit
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                Ajoutez un nouveau produit à votre catalogue.
                            </p>
                        </div>
                    </div>
                </div>

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