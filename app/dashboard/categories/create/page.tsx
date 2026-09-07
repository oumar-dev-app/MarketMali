"use client";

import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Save,
    Upload,
    X,
} from "lucide-react";

import { toast } from "sonner";

export default function CreateCategoriePage() {
    const router = useRouter();

    const [boutiqueId, setBoutiqueId] =
        useState<number | null>(null);

    const [nom, setNom] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [image, setImage] =
        useState("");

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [loadingBoutique, setLoadingBoutique] =
        useState(true);

    const [imageError, setImageError] =
        useState(false);

    /**
     * Récupérer la boutique du vendeur
     */
    useEffect(() => {
        const loadBoutique = async () => {
            try {
                setLoadingBoutique(true);

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    toast.error(
                        "Session expirée. Veuillez vous reconnecter."
                    );
                    return;
                }

                const response =
                    await fetch(
                        "/api/dashboard/boutiques",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
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
                        "Impossible de récupérer la boutique."
                    );
                }

                if (!result.data?.id) {
                    throw new Error(
                        "Aucune boutique trouvée."
                    );
                }

                setBoutiqueId(
                    result.data.id
                );

            } catch (error) {
                console.error(error);

                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Impossible de récupérer la boutique."
                );
            } finally {
                setLoadingBoutique(false);
            }
        };

        loadBoutique();
    }, []);

    /**
     * Sélectionner une image
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
         * Vérifier que c'est une image
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

        const previewUrl =
            URL.createObjectURL(file);

        setImageFile(file);
        setImagePreview(previewUrl);
        setImageError(false);

        toast.success(
            "Image sélectionnée."
        );
    };

    /**
     * Supprimer l'image sélectionnée
     */
    const handleRemoveImage = () => {
        if (
            imagePreview &&
            imagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                imagePreview
            );
        }

        setImageFile(null);
        setImagePreview("");
        setImage("");
        setImageError(false);
    };

    /**
     * Upload de l'image vers Vercel Blob
     */
    const uploadImage = async (
        token: string
    ): Promise<string> => {
        if (!imageFile) {
            return "";
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
     * Créer la catégorie
     */
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!boutiqueId) {
            toast.error(
                "Boutique introuvable."
            );
            return;
        }

        if (!nom.trim()) {
            toast.error(
                "Le nom de la catégorie est obligatoire."
            );
            return;
        }

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

            /**
             * Upload de l'image avant
             * la création de la catégorie
             */
            let imageUrl = "";

            if (imageFile) {
                toast.info(
                    "Téléchargement de l'image..."
                );

                imageUrl =
                    await uploadImage(
                        token
                    );
            }

            /**
             * Création de la catégorie
             */
            const response =
                await fetch(
                    "/api/dashboard/categories",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            boutique_id:
                                boutiqueId,
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
                    "Erreur lors de la création de la catégorie."
                );
            }

            toast.success(
                "Catégorie créée avec succès."
            );

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
            setLoading(false);
        }
    };

    /**
     * Nettoyage des URLs temporaires
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

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                            <FolderOpen className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                Ajouter une catégorie
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Créez une nouvelle catégorie
                                pour votre boutique.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORMULAIRE */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* INFORMATIONS */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-gray-900">
                                Informations générales
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Renseignez les informations
                                principales de la catégorie.
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
                                    placeholder="Ex : Smartphones"
                                    disabled={
                                        loading ||
                                        loadingBoutique
                                    }
                                    required
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
                                    disabled={loading}
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
                                Ajoutez une image représentative
                                de votre catégorie.
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
                                                    "Aperçu de la catégorie"
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

                                    </div>
                                </div>

                                {/* ZONE UPLOAD */}
                                <div className="flex flex-col justify-center">

                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 sm:p-6">

                                        <div className="flex flex-col items-center text-center">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                                                <Upload className="h-5 w-5 text-gray-600" />
                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                                Ajouter une image
                                            </h3>

                                            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                                Sélectionnez une image
                                                depuis votre ordinateur
                                                ou votre téléphone.
                                                JPG, PNG ou WEBP,
                                                5 Mo maximum.
                                            </p>

                                            <label
                                                htmlFor="image"
                                                className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 ${
                                                    loading ||
                                                    loadingBoutique
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
                                                    disabled={
                                                        loading ||
                                                        loadingBoutique
                                                    }
                                                    className="hidden"
                                                />
                                            </label>

                                            {/* FICHIER SÉLECTIONNÉ */}
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

                                            {/* SUPPRIMER */}
                                            {imageFile && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveImage
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Supprimer l'image
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
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                loadingBoutique ||
                                uploadingImage
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uploadingImage ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Téléchargement...
                                </>
                            ) : loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Créer la catégorie
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}