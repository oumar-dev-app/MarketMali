"use client";

import { useEffect, useState } from "react";

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
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const produitsFiltres = produits.filter((produit) =>
        produit.nom
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    useEffect(() => {

        async function loadProduits() {

            try {

                const response =
                    await fetch(
                        "/api/dashboard/produit",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!data.success) {

                    setError(
                        data.message ||
                        "Impossible de charger les produits."
                    );

                    return;

                }

                setProduits(data.data);

            } catch {

                setError(
                    "Erreur serveur."
                );

            } finally {

                setLoading(false);

            }

        }

        if (token) {
            loadProduits();
        }

    }, [token]);

    if (loading) {

        return (
            <p>Chargement des produits...</p>
        );

    }

    if (error) {

        return (
            <p className="text-red-600">
                {error}
            </p>
        );

    }

    async function supprimerProduit(uuid: string) {

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

        if (!data.success) {
            alert(data.message);
            return;
        }

        setProduits((ancien) =>
            ancien.filter(
                (produit) => produit.uuid !== uuid
            )
        );
    }

    return (

        <div>

            <h1 className="text-3xl font-bold mb-6">
                Gestion des produits
            </h1>
            <ProductToolbar
                search={search}
                setSearch={setSearch}
            />
            <ProductTable
                produits={produitsFiltres}
                onDelete={supprimerProduit}
                onToggleStatus={changerStatutProduit}
            />

        </div>

    );

    async function changerStatutProduit(
        uuid: string,
        status: string
    ) {

        const endpoint =
            status === "active"
                ? `/api/dashboard/produit/uuid/${uuid}/block`
                : `/api/dashboard/produit/uuid/${uuid}/unblock`;


        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "Erreur"
            );

            return;
        }


        setProduits((ancien) =>
            ancien.map((produit) =>
                produit.uuid === uuid
                    ? {
                        ...produit,
                        status:
                            status === "active"
                                ? "blocked"
                                : "active"
                    }
                    : produit
            )
        );

    }


}