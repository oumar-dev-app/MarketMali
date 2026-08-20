"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Categorie {
    id?: number;
    uuid: string;
    boutique_id: number;
    nom: string;
}

export interface ProductFormData {
    categorie_id: number;
    nom: string;
    description: string;
    prix: number;
    stock: number;
    image: string;
}

interface Props {
    initialData?: ProductFormData;
    loading?: boolean;
    onSubmit: (data: ProductFormData) => Promise<void>;
}

export default function ProductForm({
    initialData,
    loading = false,
    onSubmit,
}: Props) {
    const [categories, setCategories] = useState<Categorie[]>([]);

    const [form, setForm] = useState<ProductFormData>({
        categorie_id: initialData?.categorie_id ?? 0,
        nom: initialData?.nom ?? "",
        description: initialData?.description ?? "",
        prix: initialData?.prix ?? 0,
        stock: initialData?.stock ?? 0,
        image: initialData?.image ?? "",
    });

    const [error, setError] = useState("");
    const { token } = useAuth();

    useEffect(() => {

        if (!token) return;
        async function loadCategories() {
            try {
                const response = await fetch(
                    "/api/dashboard/categories",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                console.log("CATÉGORIES API :", data.data);
                if (data.success) {

                    console.log(
                        "REPONSE COMPLETE CATEGORIES :",
                        JSON.stringify(data, null, 2)
                    );

                    setCategories(data.data);
                }
            } catch {
                setError(
                    "Impossible de charger les catégories."
                );
            }
        }

        loadCategories();

    }, [token]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;

        setForm((old) => ({
            ...old,
            [name]:
                name === "prix" ||
                    name === "stock" ||
                    name === "categorie_id"
                    ? Number(value)
                    : value,
        }));
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (!form.nom.trim()) {
            setError("Le nom est obligatoire.");
            return;
        }

        if (!form.categorie_id) {
            setError("Choisissez une catégorie.");
            return;
        }

        setError("");

        if (!form.nom.trim()) {
            setError("Le nom est obligatoire.");
            return;
        }

        if (!form.categorie_id) {
            setError("Choisissez une catégorie.");
            return;
        }

        if (form.prix <= 0) {
            setError("Le prix doit être supérieur à 0.");
            return;
        }

        if (form.stock < 0) {
            setError("Le stock est invalide.");
            return;
        }
        setError("");
        await onSubmit(form);
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-5"
        >
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block mb-2 font-medium">
                    Nom du produit
                </label>

                <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                />
            </div>

            <div>
                <label className="block mb-2 font-medium">
                    Catégorie
                </label>

                <select
                    name="categorie_id"
                    value={form.categorie_id}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                >
                    <option value={0}>
                        Sélectionner une catégorie
                    </option>

                    {categories.map((categorie) => (
                        <option
                            key={categorie.uuid}
                            value={categorie.id ?? ""}
                        >
                            {categorie.nom}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block mb-2 font-medium">
                    Description
                </label>

                <textarea
                    rows={4}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2 font-medium">
                        Prix
                    </label>

                    <input
                        type="number"
                        name="prix"
                        value={form.prix}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Stock
                    </label>

                    <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>
            </div>

            <div>
                <label className="block mb-2 font-medium">
                    Image
                </label>

                <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border rounded-lg px-4 py-2"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
        </form>
    );
}