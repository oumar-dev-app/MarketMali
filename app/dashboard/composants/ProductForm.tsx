"use client";

import { useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ImagePlus,
    Loader2,
    Package,
    Save,
    Trash2,
    Upload,
} from "lucide-react";

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
    const { token } = useAuth();

    const [categories, setCategories] = useState<Categorie[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [form, setForm] = useState<ProductFormData>({
        categorie_id: initialData?.categorie_id ?? 0,
        nom: initialData?.nom ?? "",
        description: initialData?.description ?? "",
        prix: initialData?.prix ?? 0,
        stock: initialData?.stock ?? 0,
        image: initialData?.image ?? "",
    });

    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string>(
        initialData?.image ?? ""
    );

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!initialData) return;

        setForm({
            categorie_id: initialData.categorie_id ?? 0,
            nom: initialData.nom ?? "",
            description: initialData.description ?? "",
            prix: initialData.prix ?? 0,
            stock: initialData.stock ?? 0,
            image: initialData.image ?? "",
        });

        setPreview(initialData.image ?? "");
    }, [initialData]);

    useEffect(() => {
        if (!token) {
            setCategoriesLoading(false);
            return;
        }

        async function loadCategories() {
            try {
                setCategoriesLoading(true);

                const response = await fetch(
                    "/api/dashboard/categories",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                            "Impossible de charger les catégories."
                    );
                }

                setCategories(data.data ?? []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les catégories."
                );
            } finally {
                setCategoriesLoading(false);
            }
        }

        loadCategories();
    }, [token]);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
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

        if (error) {
            setError("");
        }
    }

    async function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = e.target.files?.[0];

        if (!file) return;

        setError("");

        if (!file.type.startsWith("image/")) {
            setError(
                "Veuillez sélectionner une image valide."
            );

            e.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "L'image ne doit pas dépasser 5 Mo."
            );

            e.target.value = "";
            return;
        }

        const localPreview =
            URL.createObjectURL(file);

        setPreview(localPreview);
        setUploading(true);

        try {
            const formData = new FormData();

            formData.append("file", file);
            formData.append("type", "produit");

            const response = await fetch(
                "/api/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Impossible de télécharger l'image."
                );
            }

            setForm((old) => ({
                ...old,
                image: data.url,
            }));

            setPreview(data.url);
        } catch (err) {
            console.error(
                "Erreur upload image :",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Impossible de télécharger l'image."
            );

            setPreview(initialData?.image ?? "");

            setForm((old) => ({
                ...old,
                image: initialData?.image ?? "",
            }));
        } finally {
            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            URL.revokeObjectURL(localPreview);
        }
    }

    function supprimerImage() {
        setForm((old) => ({
            ...old,
            image: "",
        }));

        setPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");

        const nom = form.nom.trim();

        if (!nom) {
            setError(
                "Le nom du produit est obligatoire."
            );
            return;
        }

        if (!form.categorie_id) {
            setError(
                "Veuillez choisir une catégorie."
            );
            return;
        }

        if (!Number.isFinite(form.prix) || form.prix <= 0) {
            setError(
                "Le prix doit être supérieur à 0."
            );
            return;
        }

        if (!Number.isInteger(form.stock) || form.stock < 0) {
            setError(
                "Le stock doit être un nombre entier positif ou nul."
            );
            return;
        }

        if (uploading) {
            setError(
                "Veuillez attendre la fin du téléchargement de l'image."
            );
            return;
        }

        await onSubmit({
            ...form,
            nom,
        });
    }

    const disabled =
        loading ||
        uploading;

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Erreur */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <div>
                        <p className="font-semibold">
                            Une erreur est survenue
                        </p>

                        <p className="mt-1 text-sm">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Informations générales */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <Package
                                size={19}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Informations du produit
                            </h2>

                            <p className="text-sm text-gray-500">
                                Renseignez les informations principales.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    {/* Nom */}
                    <div>
                        <label
                            htmlFor="nom"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Nom du produit
                        </label>

                        <input
                            id="nom"
                            type="text"
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            placeholder="Ex : iPhone 16 Pro"
                            disabled={disabled}
                            className="
                                w-full rounded-xl border
                                border-gray-200 bg-white
                                px-4 py-3 text-sm
                                outline-none transition
                                placeholder:text-gray-400
                                focus:border-gray-400
                                focus:ring-2 focus:ring-gray-100
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            "
                        />
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label
                            htmlFor="categorie_id"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Catégorie
                        </label>

                        <select
                            id="categorie_id"
                            name="categorie_id"
                            value={form.categorie_id}
                            onChange={handleChange}
                            disabled={
                                disabled ||
                                categoriesLoading
                            }
                            className="
                                w-full rounded-xl border
                                border-gray-200 bg-white
                                px-4 py-3 text-sm
                                outline-none transition
                                focus:border-gray-400
                                focus:ring-2 focus:ring-gray-100
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            "
                        >
                            <option value={0}>
                                {categoriesLoading
                                    ? "Chargement des catégories..."
                                    : "Sélectionner une catégorie"}
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

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            rows={5}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Décrivez le produit..."
                            disabled={disabled}
                            className="
                                w-full resize-y rounded-xl border
                                border-gray-200 bg-white
                                px-4 py-3 text-sm
                                outline-none transition
                                placeholder:text-gray-400
                                focus:border-gray-400
                                focus:ring-2 focus:ring-gray-100
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            "
                        />
                    </div>
                </div>
            </div>

            {/* Prix et stock */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <h2 className="font-semibold text-gray-900">
                        Prix et stock
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Définissez le prix de vente et la quantité disponible.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                        <label
                            htmlFor="prix"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Prix
                        </label>

                        <div className="relative">
                            <input
                                id="prix"
                                type="number"
                                name="prix"
                                value={form.prix}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                disabled={disabled}
                                className="
                                    w-full rounded-xl border
                                    border-gray-200 bg-white
                                    px-4 py-3 pr-16 text-sm
                                    outline-none transition
                                    focus:border-gray-400
                                    focus:ring-2 focus:ring-gray-100
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-50
                                "
                            />

                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                FCFA
                            </span>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="stock"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Stock
                        </label>

                        <input
                            id="stock"
                            type="number"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            disabled={disabled}
                            className="
                                w-full rounded-xl border
                                border-gray-200 bg-white
                                px-4 py-3 text-sm
                                outline-none transition
                                focus:border-gray-400
                                focus:ring-2 focus:ring-gray-100
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            "
                        />
                    </div>
                </div>
            </div>

            {/* Image */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <ImagePlus
                                size={19}
                                className="text-gray-700"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Image du produit
                            </h2>

                            <p className="text-sm text-gray-500">
                                PNG, JPG, JPEG ou WEBP — 5 Mo maximum.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    {preview ? (
                        <div className="space-y-4">
                            <div className="mx-auto flex min-h-[260px] max-w-xl items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                <img
                                    src={preview}
                                    alt="Aperçu du produit"
                                    className="max-h-[360px] w-full object-contain"
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <label
                                    className={`
                                        inline-flex cursor-pointer
                                        items-center justify-center
                                        gap-2 rounded-xl px-5 py-3
                                        text-sm font-semibold
                                        transition
                                        ${
                                            disabled
                                                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                                : "bg-black text-white hover:bg-gray-800"
                                        }
                                    `}
                                >
                                    <Upload size={17} />
                                    Changer l'image

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="hidden"
                                        disabled={disabled}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={supprimerImage}
                                    disabled={disabled}
                                    className="
                                        inline-flex items-center
                                        justify-center gap-2
                                        rounded-xl border
                                        border-red-200
                                        px-5 py-3 text-sm
                                        font-semibold text-red-600
                                        transition hover:bg-red-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <Trash2 size={17} />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label
                            className={`
                                flex cursor-pointer flex-col
                                items-center justify-center
                                rounded-2xl border-2
                                border-dashed border-gray-300
                                px-6 py-12 text-center
                                transition
                                ${
                                    disabled
                                        ? "cursor-not-allowed bg-gray-50 opacity-60"
                                        : "hover:border-gray-400 hover:bg-gray-50"
                                }
                            `}
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                <ImagePlus
                                    size={25}
                                    className="text-gray-500"
                                />
                            </div>

                            <p className="font-semibold text-gray-800">
                                Cliquez pour choisir une image
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                PNG, JPG, JPEG ou WEBP — 5 Mo maximum
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                                className="hidden"
                                disabled={disabled}
                            />
                        </label>
                    )}

                    {uploading && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                            Téléchargement de l'image...
                        </div>
                    )}

                    {form.image && !uploading && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                            <CheckCircle2 size={17} />
                            Image prête
                        </div>
                    )}
                </div>
            </div>

            {/* Enregistrement */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    disabled={disabled}
                    className="
                        rounded-xl border border-gray-200
                        bg-white px-6 py-3 text-sm
                        font-semibold text-gray-700
                        transition hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    disabled={disabled}
                    className="
                        inline-flex items-center
                        justify-center gap-2
                        rounded-xl bg-black
                        px-6 py-3 text-sm
                        font-semibold text-white
                        shadow-sm transition
                        hover:bg-gray-800
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {uploading ? (
                        <>
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                            Téléchargement...
                        </>
                    ) : loading ? (
                        <>
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save size={17} />
                            Enregistrer
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}