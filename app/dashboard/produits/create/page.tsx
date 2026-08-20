"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import ProductForm, {
    ProductFormData,
} from "../../composants/ProductForm";

export default function CreateProduitPage() {

    const router = useRouter();

    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        data: ProductFormData
    ) {

        if (!token) {
            setError("Vous devez être connecté.");
            return;
        }

        setLoading(true);
        setError("");

        try {

            const response =
                await fetch(
                    "/api/dashboard/produit",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            categorie_id:
                                data.categorie_id,

                            nom:
                                data.nom,

                            description:
                                data.description,

                            prix:
                                data.prix,

                            stock:
                                data.stock,

                            image:
                                data.image,
                        }),
                    }
                );
            const result =
                await response.json();
            if (!result.success) {
                setError(
                    result.message ||
                    "Impossible de créer le produit."
                );
                return;
            }
            router.push(
                "/dashboard/produits"
            );
        } catch {
            setError(
                "Erreur serveur."
            );
        } finally {
            setLoading(false);
        }

    }

    return (

        <div className="max-w-4xl mx-auto">

            <h1 className="text-3xl font-bold mb-6">
                Nouveau produit
            </h1>

            {error && (

                <div className="mb-4 rounded bg-red-100 text-red-700 p-4">
                    {error}
                </div>

            )}

            <ProductForm
                loading={loading}
                onSubmit={handleSubmit}
            />

        </div>

    );

}