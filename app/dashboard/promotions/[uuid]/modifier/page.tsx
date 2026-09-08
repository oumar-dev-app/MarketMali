"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    Package,
    Save,
    Tag,
    Percent,
    Store,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface Produit {
    id: number;
    uuid: string;
    nom: string;
    prix: number;
    stock: number;
}

type PromotionType = "percentage" | "special_price";

interface Promotion {
    id: number;
    uuid: string;
    boutique_id: number;
    produit_id: number;
    nom: string;
    type: PromotionType;
    reduction_pourcentage: number | null;
    prix_promotionnel: number | null;
    date_debut: string;
    date_fin: string;
    quantite_limite: number | null;
    created_at: string;
    updated_at: string;

    produit_uuid: string;
    produit_nom: string;
    produit_slug: string;
    produit_prix: number;
    produit_stock: number;

    boutique_uuid: string;
    boutique_nom: string;
    boutique_slug: string;
}

interface PromotionResponse {
    success?: boolean;
    data?: Promotion;
    promotion?: Promotion;
    message?: string;
}

interface ProduitsResponse {
    success?: boolean;
    data?: Produit[];
    produits?: Produit[];
    message?: string;
}

interface FormState {
    produit_id: string;
    nom: string;
    type: PromotionType;
    reduction_pourcentage: string;
    prix_promotionnel: string;
    date_debut: string;
    date_fin: string;
    quantite_limite: string;
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDateTimeLocal(value: string | Date) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ModifierPromotionPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const uuid =
        typeof params.uuid === "string"
            ? params.uuid
            : Array.isArray(params.uuid)
                ? params.uuid[0]
                : "";

    const [promotion, setPromotion] =
        useState<Promotion | null>(null);

    const [produits, setProduits] =
        useState<Produit[]>([]);

    const [form, setForm] = useState<FormState>({
        produit_id: "",
        nom: "",
        type: "percentage",
        reduction_pourcentage: "",
        prix_promotionnel: "",
        date_debut: "",
        date_fin: "",
        quantite_limite: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const disabled = loading || saving;

    const produitSelectionne = useMemo(() => {
        if (!form.produit_id) {
            return null;
        }

        return (
            produits.find(
                (produit) =>
                    String(produit.id) ===
                    String(form.produit_id)
            ) || null
        );
    }, [produits, form.produit_id]);

    const prixNormal = useMemo(() => {
        if (produitSelectionne) {
            return Number(produitSelectionne.prix) || 0;
        }

        if (promotion) {
            return Number(promotion.produit_prix) || 0;
        }

        return 0;
    }, [produitSelectionne, promotion]);

    const prixFinal = useMemo(() => {
        if (prixNormal <= 0) {
            return 0;
        }

        if (form.type === "percentage") {
            const reduction =
                Number(form.reduction_pourcentage) || 0;

            if (reduction <= 0 || reduction >= 100) {
                return 0;
            }

            return prixNormal * (1 - reduction / 100);
        }

        const prixPromo =
            Number(form.prix_promotionnel) || 0;

        if (prixPromo <= 0 || prixPromo >= prixNormal) {
            return 0;
        }

        return prixPromo;
    }, [
        prixNormal,
        form.type,
        form.reduction_pourcentage,
        form.prix_promotionnel,
    ]);

    const economie = useMemo(() => {
        if (prixNormal <= 0 || prixFinal <= 0) {
            return 0;
        }

        return prixNormal - prixFinal;
    }, [prixNormal, prixFinal]);

    const reductionEffective = useMemo(() => {
        if (prixNormal <= 0 || prixFinal <= 0) {
            return 0;
        }

        return ((prixNormal - prixFinal) / prixNormal) * 100;
    }, [prixNormal, prixFinal]);

    useEffect(() => {
        if (!uuid) {
            setError("Identifiant de promotion invalide.");
            setLoading(false);
            return;
        }

        loadData();
    }, [uuid]);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("token")
                    : null;

            const headers: HeadersInit = token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {};

            const [promotionResponse, produitsResponse] =
                await Promise.all([
                    fetch(`/api/promotions/${uuid}`, {
                        headers,
                    }),
                    fetch("/api/produits", {
                        headers,
                    }),
                ]);

            const promotionJson: PromotionResponse =
                await promotionResponse.json();

            const produitsJson: ProduitsResponse =
                await produitsResponse.json();

            if (!promotionResponse.ok) {
                throw new Error(
                    promotionJson.message ||
                    "Impossible de récupérer la promotion."
                );
            }

            const promotionData =
                promotionJson.data ||
                promotionJson.promotion;

            if (!promotionData) {
                throw new Error(
                    "Promotion introuvable."
                );
            }

            const produitsData =
                produitsJson.data ||
                produitsJson.produits ||
                [];

            setPromotion(promotionData);
            setProduits(produitsData);

            setForm({
                produit_id: String(
                    promotionData.produit_id
                ),
                nom: promotionData.nom || "",
                type:
                    promotionData.type ||
                    "percentage",
                reduction_pourcentage:
                    promotionData.reduction_pourcentage !==
                        null &&
                        promotionData.reduction_pourcentage !==
                        undefined
                        ? String(
                            promotionData.reduction_pourcentage
                        )
                        : "",
                prix_promotionnel:
                    promotionData.prix_promotionnel !==
                        null &&
                        promotionData.prix_promotionnel !==
                        undefined
                        ? String(
                            promotionData.prix_promotionnel
                        )
                        : "",
                date_debut:
                    formatDateTimeLocal(
                        promotionData.date_debut
                    ),
                date_fin:
                    formatDateTimeLocal(
                        promotionData.date_fin
                    ),
                quantite_limite:
                    promotionData.quantite_limite !==
                        null &&
                        promotionData.quantite_limite !==
                        undefined
                        ? String(
                            promotionData.quantite_limite
                        )
                        : "",
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) {
        const {
            name,
            value,
        } = event.target;

        setError("");
        setSuccess("");

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function validateForm() {
        if (!form.produit_id) {
            return "Veuillez sélectionner un produit.";
        }

        if (!form.nom.trim()) {
            return "Veuillez saisir le nom de la promotion.";
        }

        if (!form.date_debut) {
            return "Veuillez définir une date de début.";
        }

        if (!form.date_fin) {
            return "Veuillez définir une date de fin.";
        }

        const debut = new Date(form.date_debut);
        const fin = new Date(form.date_fin);

        if (
            Number.isNaN(debut.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            return "Les dates saisies sont invalides.";
        }

        if (debut >= fin) {
            return "La date de début doit être antérieure à la date de fin.";
        }

        if (form.type === "percentage") {
            const reduction =
                Number(form.reduction_pourcentage);

            if (
                !Number.isFinite(reduction) ||
                reduction <= 0 ||
                reduction >= 100
            ) {
                return "La réduction doit être comprise entre 0 et 100%.";
            }
        }

        if (form.type === "special_price") {
            const prixPromo =
                Number(form.prix_promotionnel);

            if (
                !Number.isFinite(prixPromo) ||
                prixPromo <= 0
            ) {
                return "Veuillez saisir un prix promotionnel valide.";
            }

            if (
                prixNormal > 0 &&
                prixPromo >= prixNormal
            ) {
                return "Le prix promotionnel doit être inférieur au prix normal.";
            }
        }

        if (form.quantite_limite.trim() !== "") {
            const quantite =
                Number(form.quantite_limite);

            if (
                !Number.isInteger(quantite) ||
                quantite <= 0
            ) {
                return "La quantité maximale doit être un entier positif.";
            }
        }

        return null;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("token")
                    : null;

            const response = await fetch(
                `/api/promotions/${uuid}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify({
                        nom: form.nom.trim(),
                        type: form.type,
                        ...(form.type ===
                            "percentage"
                            ? {
                                reduction_pourcentage:
                                    Number(
                                        form.reduction_pourcentage
                                    ),
                                prix_promotionnel:
                                    undefined,
                            }
                            : {
                                prix_promotionnel:
                                    Number(
                                        form.prix_promotionnel
                                    ),
                                reduction_pourcentage:
                                    undefined,
                            }),
                        date_debut:
                            form.date_debut,
                        date_fin:
                            form.date_fin,
                        quantite_limite:
                            form.quantite_limite.trim() ===
                                ""
                                ? null
                                : Number(
                                    form.quantite_limite
                                ),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible de modifier la promotion."
                );
            }

            setSuccess(
                "La promotion a été modifiée avec succès."
            );

            setTimeout(() => {
                router.push(
                    `/dashboard/promotions/${uuid}`
                );
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue lors de la modification."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Loader2
                            size={32}
                            className="animate-spin text-gray-700"
                        />

                        <p className="text-sm text-gray-500">
                            Chargement de la promotion...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!promotion) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href="/dashboard/promotions"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={17} />
                        Retour aux promotions
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <AlertCircle
                            size={40}
                            className="mx-auto text-red-500"
                        />

                        <h1 className="mt-4 text-xl font-bold text-gray-900">
                            Promotion introuvable
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            {error ||
                                "Cette promotion n'existe pas ou n'est plus disponible."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                {/* =========================
                    HEADER
                ========================== */}

                <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href={`/dashboard/promotions/${uuid}`}
                            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                        >
                            <ArrowLeft size={16} />
                            Retour à la promotion
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                                <Tag size={20} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                                    Modifier la promotion
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Modifiez les paramètres de votre offre.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================
                    MESSAGES
                ========================== */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-red-800">
                                Impossible de modifier la promotion
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                        <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-green-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-green-800">
                                Modification enregistrée
                            </p>

                            <p className="mt-1 text-sm text-green-700">
                                {success}
                            </p>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* =========================
                        PRODUIT
                    ========================== */}

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
                                        Produit concerné
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Le produit associé à cette promotion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <label
                                htmlFor="produit_id"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Produit
                            </label>

                            <select
                                id="produit_id"
                                name="produit_id"
                                value={form.produit_id}
                                disabled
                                className="
                                    w-full rounded-xl
                                    border border-gray-200
                                    bg-gray-50 px-4 py-3
                                    text-sm text-gray-600
                                    outline-none
                                    disabled:cursor-not-allowed
                                "
                            >
                                <option value="">
                                    Sélectionnez un produit
                                </option>

                                {produits.map(
                                    (produit) => (
                                        <option
                                            key={
                                                produit.id
                                            }
                                            value={
                                                produit.id
                                            }
                                        >
                                            {produit.nom} —{" "}
                                            {formatPrice(
                                                Number(
                                                    produit.prix
                                                )
                                            )}
                                        </option>
                                    )
                                )}
                            </select>

                            {produitSelectionne && (
                                <div className="mt-3 rounded-xl bg-gray-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                                            <Package
                                                size={17}
                                                className="text-gray-600"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900">
                                                {
                                                    produitSelectionne.nom
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Prix normal :{" "}
                                                <strong className="text-gray-700">
                                                    {formatPrice(
                                                        prixNormal
                                                    )}
                                                </strong>
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Stock actuel :{" "}
                                                <strong className="text-gray-700">
                                                    {
                                                        produitSelectionne.stock
                                                    }
                                                </strong>{" "}
                                                unité
                                                {produitSelectionne.stock >
                                                    1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =========================
                        INFORMATIONS
                    ========================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <Tag
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Informations de l'offre
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Définissez les paramètres de votre promotion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">

                            <div>
                                <label
                                    htmlFor="nom"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Nom de la promotion
                                </label>

                                <input
                                    id="nom"
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        disabled
                                    }
                                    placeholder="Ex. Promotion spéciale Ramadan"
                                    className="
                                        w-full rounded-xl
                                        border border-gray-200
                                        bg-white px-4 py-3
                                        text-sm outline-none
                                        transition
                                        focus:border-gray-400
                                        focus:ring-2
                                        focus:ring-gray-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-gray-50
                                    "
                                />
                            </div>

                            <div>
                                <label
                                    className="mb-3 block text-sm font-semibold text-gray-700"
                                >
                                    Type de promotion
                                </label>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    <button
                                        type="button"
                                        disabled={
                                            disabled
                                        }
                                        onClick={() =>
                                            setForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    type: "percentage",
                                                    prix_promotionnel:
                                                        "",
                                                })
                                            )
                                        }
                                        className={`
                                            rounded-xl border p-4 text-left transition
                                            ${
                                                form.type ===
                                                "percentage"
                                                    ? "border-black bg-gray-50 ring-1 ring-black"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                <Percent
                                                    size={18}
                                                    className="text-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Réduction en %
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Appliquez un pourcentage de réduction.
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            disabled
                                        }
                                        onClick={() =>
                                            setForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    type: "special_price",
                                                    reduction_pourcentage:
                                                        "",
                                                })
                                            )
                                        }
                                        className={`
                                            rounded-xl border p-4 text-left transition
                                            ${
                                                form.type ===
                                                "special_price"
                                                    ? "border-black bg-gray-50 ring-1 ring-black"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                <Tag
                                                    size={18}
                                                    className="text-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Prix spécial
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Définissez directement le prix promotionnel.
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                </div>
                            </div>

                            {form.type ===
                                "percentage" ? (
                                <div>
                                    <label
                                        htmlFor="reduction_pourcentage"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Réduction
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="reduction_pourcentage"
                                            type="number"
                                            name="reduction_pourcentage"
                                            value={
                                                form.reduction_pourcentage
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0.01"
                                            max="99.99"
                                            step="0.01"
                                            disabled={
                                                disabled
                                            }
                                            placeholder="Ex. 20"
                                            className="
                                                w-full rounded-xl
                                                border border-gray-200
                                                bg-white px-4 py-3 pr-12
                                                text-sm outline-none
                                                transition
                                                focus:border-gray-400
                                                focus:ring-2
                                                focus:ring-gray-100
                                                disabled:cursor-not-allowed
                                                disabled:bg-gray-50
                                            "
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label
                                        htmlFor="prix_promotionnel"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Prix promotionnel
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="prix_promotionnel"
                                            type="number"
                                            name="prix_promotionnel"
                                            value={
                                                form.prix_promotionnel
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0.01"
                                            step="1"
                                            disabled={
                                                disabled
                                            }
                                            placeholder="Ex. 45000"
                                            className="
                                                w-full rounded-xl
                                                border border-gray-200
                                                bg-white px-4 py-3 pr-16
                                                text-sm outline-none
                                                transition
                                                focus:border-gray-400
                                                focus:ring-2
                                                focus:ring-gray-100
                                                disabled:cursor-not-allowed
                                                disabled:bg-gray-50
                                            "
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                            FCFA
                                        </span>
                                    </div>

                                    {prixNormal > 0 && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Prix normal :{" "}
                                            <strong>
                                                {formatPrice(
                                                    prixNormal
                                                )}
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =========================
                        APERÇU
                    ========================== */}

                    {produitSelectionne && (
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                        <Percent
                                            size={19}
                                            className="text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            Aperçu de l'offre
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Vérifiez le résultat avant d'enregistrer.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="rounded-2xl bg-gray-50 p-5">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Prix normal
                                            </p>

                                            <p className="mt-1 text-lg font-semibold text-gray-400 line-through">
                                                {formatPrice(
                                                    prixNormal
                                                )}
                                            </p>
                                        </div>

                                        <div className="hidden text-gray-300 sm:block">
                                            →
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Prix promotionnel
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-green-600">
                                                {prixFinal >
                                                    0
                                                    ? formatPrice(
                                                        prixFinal
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                                            <p className="text-xs text-gray-400">
                                                Économie
                                            </p>

                                            <p className="mt-1 font-bold text-gray-900">
                                                {economie >
                                                    0
                                                    ? formatPrice(
                                                        economie
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <p className="text-sm text-gray-500">
                                            Réduction effective
                                        </p>

                                        <p className="mt-1 font-bold text-gray-900">
                                            {reductionEffective >
                                                0
                                                ? `-${reductionEffective.toFixed(2)}%`
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========================
                        PÉRIODE
                    ========================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <CalendarDays
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Période de promotion
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Définissez quand votre offre sera active.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                            <div>
                                <label
                                    htmlFor="date_debut"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Date de début
                                </label>

                                <input
                                    id="date_debut"
                                    type="datetime-local"
                                    name="date_debut"
                                    value={
                                        form.date_debut
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        disabled
                                    }
                                    className="
                                        w-full rounded-xl
                                        border border-gray-200
                                        bg-white px-4 py-3
                                        text-sm outline-none
                                        transition
                                        focus:border-gray-400
                                        focus:ring-2
                                        focus:ring-gray-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-gray-50
                                    "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="date_fin"
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                >
                                    Date de fin
                                </label>

                                <input
                                    id="date_fin"
                                    type="datetime-local"
                                    name="date_fin"
                                    value={
                                        form.date_fin
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        disabled
                                    }
                                    className="
                                        w-full rounded-xl
                                        border border-gray-200
                                        bg-white px-4 py-3
                                        text-sm outline-none
                                        transition
                                        focus:border-gray-400
                                        focus:ring-2
                                        focus:ring-gray-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-gray-50
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    {/* =========================
                        QUANTITÉ
                    ========================== */}

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <Clock3
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Quantité promotionnelle
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Limitez éventuellement le nombre d'unités vendues avec cette offre.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <label
                                htmlFor="quantite_limite"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Quantité maximale
                            </label>

                            <input
                                id="quantite_limite"
                                type="number"
                                name="quantite_limite"
                                value={
                                    form.quantite_limite
                                }
                                onChange={
                                    handleChange
                                }
                                min="1"
                                step="1"
                                placeholder="Laisser vide pour une quantité illimitée"
                                disabled={
                                    disabled
                                }
                                className="
                                    w-full rounded-xl
                                    border border-gray-200
                                    bg-white px-4 py-3
                                    text-sm outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-gray-400
                                    focus:ring-2
                                    focus:ring-gray-100
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-50
                                "
                            />

                            {produitSelectionne && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Stock actuel du produit :{" "}
                                    <strong>
                                        {
                                            produitSelectionne.stock
                                        }
                                    </strong>{" "}
                                    unité
                                    {produitSelectionne.stock >
                                        1
                                        ? "s"
                                        : ""}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* =========================
                        RÉSUMÉ FINAL
                    ========================== */}

                    {produitSelectionne && (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <CheckCircle2
                                        size={19}
                                        className="text-green-600"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="font-semibold text-gray-900">
                                        Résumé
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {form.nom.trim() ||
                                            "Votre promotion"}{" "}
                                        sera appliquée à{" "}
                                        <strong className="text-gray-700">
                                            {
                                                produitSelectionne.nom
                                            }
                                        </strong>
                                        .
                                    </p>

                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs text-gray-400">
                                                Prix final
                                            </p>

                                            <p className="mt-1 font-bold text-green-600">
                                                {prixFinal >
                                                    0
                                                    ? formatPrice(
                                                        prixFinal
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs text-gray-400">
                                                Réduction
                                            </p>

                                            <p className="mt-1 font-bold text-gray-900">
                                                {reductionEffective >
                                                    0
                                                    ? `-${reductionEffective.toFixed(2)}%`
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white p-3">
                                            <p className="text-xs text-gray-400">
                                                Quantité
                                            </p>

                                            <p className="mt-1 font-bold text-gray-900">
                                                {form.quantite_limite ||
                                                    "Illimitée"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========================
                        BOUTIQUE
                    ========================== */}

                    {promotion.boutique_nom && (
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 p-5 sm:p-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                    <Store
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Boutique
                                    </p>

                                    <p className="mt-1 truncate font-semibold text-gray-900">
                                        {
                                            promotion.boutique_nom
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========================
                        ACTIONS
                    ========================== */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/dashboard/promotions/${uuid}`
                                )
                            }
                            disabled={saving}
                            className="
                                rounded-xl border
                                border-gray-200
                                bg-white px-6 py-3
                                text-sm font-semibold
                                text-gray-700
                                transition
                                hover:bg-gray-50
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
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-black
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-gray-800
                                active:scale-[0.98]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save
                                        size={17}
                                    />

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

