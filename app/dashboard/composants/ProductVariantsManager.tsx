"use client";

import { useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    ImagePlus,
    Loader2,
    Palette,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

interface VarianteImage {
    id: number;
    uuid: string;
    variante_id: number;
    image_url: string;
    ordre: number;
    created_at?: string;
    updated_at?: string;
}

interface Variante {
    id: number;
    uuid: string;
    produit_id: number;
    nom: string;
    image_url?: string | null;
    stock: number;
    ordre: number;
    images: VarianteImage[];
    created_at?: string;
    updated_at?: string;
}

interface Props {
    productUuid: string;
}

export default function ProductVariantsManager({
    productUuid,
}: Props) {
    const { token } = useAuth();

    const [variantes, setVariantes] = useState<Variante[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [newNom, setNewNom] = useState("");
    const [newStock, setNewStock] = useState(0);

    const [editingUuid, setEditingUuid] = useState<string | null>(
        null
    );

    const [editNom, setEditNom] = useState("");
    const [editStock, setEditStock] = useState(0);

    const [uploadingVariantUuid, setUploadingVariantUuid] =
        useState<string | null>(null);

    const fileInputRefs = useRef<
        Record<string, HTMLInputElement | null>
    >({});

    async function loadVariantes() {
        if (!token || !productUuid) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de charger les variantes."
                );
            }

            setVariantes(result.data ?? []);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Impossible de charger les variantes.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVariantes();
    }, [token, productUuid]);

    async function ajouterVariante() {
        if (!token) {
            toast.error("Vous devez être connecté.");
            return;
        }

        const nom = newNom.trim();

        if (!nom) {
            toast.error("Veuillez saisir un nom de variante.");
            return;
        }

        if (nom.length > 80) {
            toast.error(
                "Le nom de la variante ne doit pas dépasser 80 caractères."
            );
            return;
        }

        if (!Number.isInteger(newStock) || newStock < 0) {
            toast.error("Le stock doit être un nombre entier positif.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nom,
                        stock: newStock,
                        ordre: variantes.length,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de créer la variante."
                );
            }

            setNewNom("");
            setNewStock(0);

            toast.success("Variante ajoutée avec succès.");

            await loadVariantes();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Impossible de créer la variante."
            );
        } finally {
            setSaving(false);
        }
    }

    function commencerModification(variante: Variante) {
        setEditingUuid(variante.uuid);
        setEditNom(variante.nom);
        setEditStock(variante.stock);
    }

    function annulerModification() {
        setEditingUuid(null);
        setEditNom("");
        setEditStock(0);
    }

    async function modifierVariante() {
        if (!token || !editingUuid) return;

        const nom = editNom.trim();

        if (!nom) {
            toast.error("Veuillez saisir un nom de variante.");
            return;
        }

        if (nom.length > 80) {
            toast.error(
                "Le nom de la variante ne doit pas dépasser 80 caractères."
            );
            return;
        }

        if (!Number.isInteger(editStock) || editStock < 0) {
            toast.error("Le stock doit être un nombre entier positif.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes/${editingUuid}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nom,
                        stock: editStock,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de modifier la variante."
                );
            }

            toast.success("Variante modifiée avec succès.");

            annulerModification();

            await loadVariantes();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Impossible de modifier la variante."
            );
        } finally {
            setSaving(false);
        }
    }

    async function supprimerVariante(variante: Variante) {
        if (!token) return;

        const confirme = window.confirm(
            `Supprimer la variante « ${variante.nom} » ?\n\nSes photos seront également supprimées.`
        );

        if (!confirme) return;

        try {
            setSaving(true);

            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes/${variante.uuid}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de supprimer la variante."
                );
            }

            toast.success("Variante supprimée avec succès.");

            if (editingUuid === variante.uuid) {
                annulerModification();
            }

            await loadVariantes();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer la variante."
            );
        } finally {
            setSaving(false);
        }
    }

    function ouvrirSelectionImages(varianteUuid: string) {
        fileInputRefs.current[varianteUuid]?.click();
    }

    async function handleImagesChange(
        variante: Variante,
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(event.target.files ?? []);

        event.target.value = "";

        if (!files.length || !token) return;

        const images = files.filter((file) => {
            if (!file.type.startsWith("image/")) {
                toast.error(
                    `${file.name} n'est pas une image valide.`
                );
                return false;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error(
                    `${file.name} dépasse la limite de 5 Mo.`
                );
                return false;
            }

            return true;
        });

        if (!images.length) return;

        setUploadingVariantUuid(variante.uuid);

        try {
            const uploadedUrls: string[] = [];

            for (const file of images) {
                const formData = new FormData();

                formData.append("file", file);
                formData.append("type", "produit");

                const uploadResponse = await fetch(
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

                const uploadResult =
                    await uploadResponse.json();

                if (
                    !uploadResponse.ok ||
                    !uploadResult.success ||
                    !uploadResult.url
                ) {
                    throw new Error(
                        uploadResult.message ||
                            `Impossible d'envoyer ${file.name}.`
                    );
                }

                uploadedUrls.push(uploadResult.url);
            }

            const startOrder = variante.images.length;

            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes/${variante.uuid}/images`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        images: uploadedUrls.map(
                            (image_url, index) => ({
                                image_url,
                                ordre: startOrder + index,
                            })
                        ),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible d'associer les photos à la variante."
                );
            }

            toast.success(
                `${uploadedUrls.length} photo${
                    uploadedUrls.length > 1 ? "s" : ""
                } ajoutée${
                    uploadedUrls.length > 1 ? "s" : ""
                } avec succès.`
            );

            await loadVariantes();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Impossible d'ajouter les photos."
            );
        } finally {
            setUploadingVariantUuid(null);
        }
    }

    async function supprimerImage(
        variante: Variante,
        image: VarianteImage
    ) {
        if (!token) return;

        const confirme = window.confirm(
            "Supprimer cette photo ?"
        );

        if (!confirme) return;

        try {
            const response = await fetch(
                `/api/dashboard/produit/uuid/${productUuid}/variantes/${variante.uuid}/images/${image.uuid}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de supprimer la photo."
                );
            }

            toast.success("Photo supprimée avec succès.");

            await loadVariantes();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer la photo."
            );
        }
    }

    if (loading) {
        return (
            <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-[#14a800]" />
                    <span className="text-sm font-medium text-gray-600">
                        Chargement des variantes...
                    </span>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                        <Palette className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-950">
                            Variantes et couleurs
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            Ajoutez les couleurs disponibles et leurs
                            photos. Une couleur peut être disponible
                            même sans photo spécifique.
                        </p>
                    </div>
                </div>
            </div>

            {/* Erreur globale */}
            {error && (
                <div className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:mx-7">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <p className="text-sm leading-6 text-red-700">
                        {error}
                    </p>
                </div>
            )}

            {/* Ajout variante */}
            <div className="border-b border-gray-100 bg-slate-50/70 px-5 py-5 sm:px-7">
                <div className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
                    <div>
                        <label
                            htmlFor="nouvelle-variante"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Couleur / variante
                        </label>

                        <input
                            id="nouvelle-variante"
                            type="text"
                            value={newNom}
                            onChange={(e) =>
                                setNewNom(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    ajouterVariante();
                                }
                            }}
                            placeholder="Ex. Rouge, Bleu, Noir..."
                            maxLength={80}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#14a800] focus:ring-4 focus:ring-[#14a800]/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="nouveau-stock-variante"
                            className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                            Stock
                        </label>

                        <input
                            id="nouveau-stock-variante"
                            type="number"
                            min={0}
                            step={1}
                            value={newStock}
                            onChange={(e) =>
                                setNewStock(
                                    Math.max(
                                        0,
                                        Number(e.target.value)
                                    )
                                )
                            }
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-[#14a800]/10"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={ajouterVariante}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#14a800] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#119000] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}

                        Ajouter
                    </button>
                </div>
            </div>

            {/* Liste */}
            <div className="p-5 sm:p-7">
                {!variantes.length ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50/60 px-5 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Palette className="h-5 w-5 text-gray-400" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-gray-900">
                            Aucune variante
                        </h3>

                        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                            Ajoutez une couleur ou une autre variante
                            pour permettre au client de faire son choix.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {variantes.map((variante) => {
                            const isEditing =
                                editingUuid === variante.uuid;

                            const isUploading =
                                uploadingVariantUuid ===
                                variante.uuid;

                            return (
                                <div
                                    key={variante.uuid}
                                    className="rounded-2xl border border-gray-200 bg-white"
                                >
                                    {/* Informations variante */}
                                    <div className="p-4 sm:p-5">
                                        {isEditing ? (
                                            <div className="grid gap-4 md:grid-cols-[1fr_180px_auto_auto] md:items-end">
                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Variante
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={editNom}
                                                        onChange={(e) =>
                                                            setEditNom(
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={80}
                                                        className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#14a800] focus:ring-4 focus:ring-[#14a800]/10"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Stock
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        value={editStock}
                                                        onChange={(e) =>
                                                            setEditStock(
                                                                Math.max(
                                                                    0,
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                )
                                                            )
                                                        }
                                                        className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#14a800] focus:ring-4 focus:ring-[#14a800]/10"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        modifierVariante
                                                    }
                                                    disabled={saving}
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#14a800] px-4 text-sm font-semibold text-white disabled:opacity-60"
                                                >
                                                    {saving ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}

                                                    Enregistrer
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        annulerModification
                                                    }
                                                    disabled={saving}
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14a800]/10 text-sm font-bold text-[#14a800]">
                                                        {variante.nom
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-gray-950">
                                                            {variante.nom}
                                                        </h3>

                                                        <p className="mt-0.5 text-sm text-gray-500">
                                                            Stock :{" "}
                                                            <span className="font-semibold text-gray-700">
                                                                {
                                                                    variante.stock
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                                        <ImagePlus className="h-3.5 w-3.5" />
                                                        {variante.images
                                                            .length}{" "}
                                                        photo
                                                        {variante.images
                                                            .length >
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            commencerModification(
                                                                variante
                                                            )
                                                        }
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            supprimerVariante(
                                                                variante
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Photos */}
                                    <div className="border-t border-gray-100 bg-slate-50/50 p-4 sm:p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    Photos de{" "}
                                                    {variante.nom}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                                    Vous pouvez ajouter
                                                    plusieurs photos.
                                                    Cette variante reste
                                                    disponible même sans
                                                    photo.
                                                </p>
                                            </div>

                                            <div>
                                                <input
                                                    ref={(element) => {
                                                        fileInputRefs.current[
                                                            variante.uuid
                                                        ] =
                                                            element;
                                                    }}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(event) =>
                                                        handleImagesChange(
                                                            variante,
                                                            event
                                                        )
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        ouvrirSelectionImages(
                                                            variante.uuid
                                                        )
                                                    }
                                                    disabled={isUploading}
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#14a800]/20 bg-[#14a800]/10 px-4 text-sm font-semibold text-[#119000] transition hover:bg-[#14a800]/15 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isUploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}

                                                    {isUploading
                                                        ? "Upload..."
                                                        : "Ajouter des photos"}
                                                </button>
                                            </div>
                                        </div>

                                        {variante.images.length > 0 ? (
                                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                {variante.images.map(
                                                    (image) => (
                                                        <div
                                                            key={
                                                                image.uuid
                                                            }
                                                            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white"
                                                        >
                                                            <img
                                                                src={
                                                                    image.image_url
                                                                }
                                                                alt={`${variante.nom} - photo`}
                                                                className="h-full w-full object-cover"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    supprimerImage(
                                                                        variante,
                                                                        image
                                                                    )
                                                                }
                                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 opacity-100 shadow-sm transition hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                                                                aria-label="Supprimer cette photo"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>

                                                            {image.ordre ===
                                                                0 && (
                                                                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
                                                                    <CheckCircle2 className="h-3 w-3 text-[#14a800]" />
                                                                    Principale
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center">
                                                <ImagePlus className="mx-auto h-6 w-6 text-gray-300" />

                                                <p className="mt-2 text-xs font-medium text-gray-500">
                                                    Aucune photo spécifique
                                                    pour cette variante.
                                                </p>

                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    Le client pourra quand même
                                                    sélectionner cette couleur.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
