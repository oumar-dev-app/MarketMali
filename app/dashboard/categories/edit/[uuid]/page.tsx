"use client";

import {
    useEffect,
    useState,
    use,
    type ChangeEvent,
    type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    Check,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Save,
    Upload,
    X,
} from "lucide-react";

import { toast } from "sonner";

interface Categorie {
    uuid: string;
    nom: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    status: string;
    created_at: string;
}

interface EditCategoriePageProps {
    params: Promise<{
        uuid: string;
    }>;
}

export default function EditCategoriePage({
    params,
}: EditCategoriePageProps) {
    const { uuid } = use(params);

    const router = useRouter();

    const [categorie, setCategorie] =
        useState<Categorie | null>(null);

    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [imageError, setImageError] =
        useState(false);

    /**
     * Charger la catégorie
     */
    useEffect(() => {
        const loadCategorie = async () => {
            try {
                setLoading(true);

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    toast.error(
                        "Session expirée. Veuillez vous reconnecter."
                    );
                    return;
                }

                const response = await fetch(
                    `/api/dashboard/categories/uuid/${uuid}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const result =
                    await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                        "Impossible de récupérer la catégorie."
                    );
                }

                const data: Categorie =
                    result.data;

                setCategorie(data);
                setNom(data.nom ?? "");
                setDescription(
                    data.description ?? ""
                );
                setImage(data.image ?? "");

                setImagePreview(
                    data.image ?? ""
                );

            } catch (error) {
                console.error(error);

                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Une erreur est survenue."
                );
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            loadCategorie();
        }
    }, [uuid]);

    /**
     * Sélection d'une nouvelle image
     */
    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        /**
         * Vérification du type
         */
        if (!file.type.startsWith("image/")) {
            toast.error(
                "Veuillez sélectionner une image valide."
            );

            event.target.value = "";
            return;
        }

        /**
         * Taille maximale : 5 Mo
         */
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error(
                "L'image ne doit pas dépasser 5 Mo."
            );

            event.target.value = "";
            return;
        }

        /**
         * Nettoyer l'ancien aperçu
         */
        if (
            imagePreview &&
            imagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                imagePreview
            );
        }

        /**
         * Créer le nouvel aperçu
         */
        const previewUrl =
            URL.createObjectURL(file);

        setImageFile(file);
        setImagePreview(previewUrl);
        setImageError(false);

        toast.success(
            "Nouvelle image sélectionnée."
        );
    };

    /**
     * Supprimer la nouvelle image sélectionnée
     * et revenir à l'image actuelle
     */
    const handleRemoveNewImage = () => {
        if (
            imagePreview &&
            imagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                imagePreview
            );
        }

        setImageFile(null);
        setImagePreview(image);
        setImageError(false);
    };

    /**
     * Upload de l'image vers Vercel Blob
     */
    const uploadImage = async (
        token: string
    ): Promise<string> => {
        if (!imageFile) {
            return image;
        }

        setUploadingImage(true);

        try {
            const formData =
                new FormData();

            formData.append(
                "file",
                imageFile
            );

            formData.append(
                "type",
                "categorie"
            );

            const response =
                await fetch(
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

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success ||
                !result.url
            ) {
                throw new Error(
                    result.message ||
                    "Impossible de télécharger l'image."
                );
            }

            return result.url;

        } finally {
            setUploadingImage(false);
        }
    };

    /**
     * Enregistrer la catégorie
     */
    const updateCategorie = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!nom.trim()) {
            toast.error(
                "Le nom de la catégorie est obligatoire."
            );
            return;
        }

        try {
            setSaving(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "Session expirée. Veuillez vous reconnecter."
                );
                return;
            }

            /**
             * Si une nouvelle image a été choisie,
             * on l'upload d'abord.
             */
            let imageUrl = image;

            if (imageFile) {
                toast.info(
                    "Téléchargement de la nouvelle image..."
                );

                imageUrl =
                    await uploadImage(
                        token
                    );
            }

            /**
             * Mise à jour de la catégorie
             */
            const response =
                await fetch(
                    `/api/dashboard/categories/uuid/${uuid}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            nom: nom.trim(),
                            description:
                                description.trim(),
                            image: imageUrl,
                        }),
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    "Impossible de modifier la catégorie."
                );
            }

            toast.success(
                "Catégorie modifiée avec succès."
            );

            /**
             * Petite pause pour laisser
             * apparaître le toast.
             */
            setTimeout(() => {
                router.push(
                    "/dashboard/categories"
                );
            }, 500);

        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setSaving(false);
        }
    };

    /**
     * Nettoyage des Object URLs
     */
    useEffect(() => {
        return () => {
            if (
                imagePreview &&
                imagePreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(
                    imagePreview
                );
            }
        };
    }, [imagePreview]);

    /**
     * Chargement
     */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-700" />

                            <p className="text-sm text-gray-500">
                                Chargement de la catégorie...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Catégorie introuvable
     */
    if (!categorie) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                            <X className="h-7 w-7 text-red-500" />
                        </div>

                        <h1 className="mt-4 text-lg font-semibold text-gray-900">
                            Catégorie introuvable
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Cette catégorie n'existe pas ou
                            vous n'avez pas l'autorisation
                            de la modifier.
                        </p>

                        <Link
                            href="/dashboard/categories"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux catégories
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusIsActive =
        categorie.status === "active";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">

                {/* HEADER */}
                <div className="mb-6">
                    <Link
                        href="/dashboard/categories"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux catégories
                    </Link>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                                    <FolderOpen className="h-5 w-5" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                        Modifier la catégorie
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Modifiez les informations
                                        et l'image de votre catégorie.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                statusIsActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    statusIsActive
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            />

                            {statusIsActive
                                ? "Active"
                                : "Bloquée"}
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={updateCategorie}
                    className="space-y-6"
                >

                    {/* INFORMATIONS */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-gray-900">
                                Informations générales
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Modifiez le nom et la description
                                de la catégorie.
                            </p>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">

                            {/* NOM */}
                            <div>
                                <label
                                    htmlFor="nom"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Nom de la catégorie
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="nom"
                                    type="text"
                                    value={nom}
                                    onChange={(event) =>
                                        setNom(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex : Électronique"
                                    disabled={saving}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Décrivez cette catégorie..."
                                    rows={5}
                                    disabled={saving}
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                                />
                            </div>

                        </div>
                    </div>

                    {/* IMAGE */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-gray-900">
                                Image de la catégorie
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Vous pouvez conserver l'image actuelle
                                ou en sélectionner une nouvelle.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">

                            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">

                                {/* APERÇU */}
                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Aperçu
                                    </p>

                                    <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                                        {imagePreview &&
                                        !imageError ? (
                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt={
                                                    nom ||
                                                    "Image de catégorie"
                                                }
                                                className="h-full w-full object-cover"
                                                onError={() =>
                                                    setImageError(
                                                        true
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                                <ImageIcon className="h-12 w-12" />

                                                <span className="mt-2 text-xs">
                                                    Aucune image
                                                </span>
                                            </div>
                                        )}

                                        {/* NOUVELLE IMAGE */}
                                        {imageFile && (
                                            <div className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                                                Nouvelle image
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* UPLOAD */}
                                <div className="flex flex-col justify-center">

                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 sm:p-6">

                                        <div className="flex flex-col items-center text-center">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                                                <Upload className="h-5 w-5 text-gray-600" />
                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                                Modifier l'image
                                            </h3>

                                            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                                Sélectionnez une nouvelle
                                                image depuis votre appareil.
                                                JPG, PNG ou WEBP, 5 Mo maximum.
                                            </p>

                                            <label
                                                htmlFor="image"
                                                className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 ${
                                                    saving
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }`}
                                            >
                                                <Upload className="h-4 w-4" />

                                                Choisir une image

                                                <input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleImageChange
                                                    }
                                                    disabled={saving}
                                                    className="hidden"
                                                />
                                            </label>

                                            {/* NOM DU FICHIER */}
                                            {imageFile && (
                                                <div className="mt-4 flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200">
                                                    <ImageIcon className="h-4 w-4 shrink-0 text-gray-500" />

                                                    <span className="max-w-[250px] truncate text-xs text-gray-600">
                                                        {
                                                            imageFile.name
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* ANNULER NOUVELLE IMAGE */}
                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveNewImage
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Annuler la nouvelle image
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            href="/dashboard/categories"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                uploadingImage
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uploadingImage ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Téléchargement...
                                </>
                            ) : saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}   