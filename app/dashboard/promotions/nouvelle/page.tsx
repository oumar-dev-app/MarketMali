"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    BadgePercent,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    Package,
    Save,
    Tag,
    TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

interface Produit {
    id: number;
    uuid: string;
    nom: string;
    prix: number | string;
    stock: number;
    image?: string | null;
    status?: "active" | "pending" | "blocked";
    boutique?: {
        uuid: string;
        nom: string;
        slug: string;
    };
    categorie?: {
        uuid: string;
        nom: string;
    };
}

type PromotionType =
    | "percentage"
    | "special_price";

interface FormData {
    produit_id: number;
    nom: string;
    type: PromotionType;
    reduction_pourcentage: number;
    prix_promotionnel: number;
    date_debut: string;
    date_fin: string;
    quantite_limite: string;
}

function getDateTimeLocal(
    date: Date
): string {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");
    const hours = String(
        date.getHours()
    ).padStart(2, "0");
    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatPrice(
    value: number
): string {
    return `${Number(value).toLocaleString(
        "fr-FR"
    )} FCFA`;
}

export default function NouvellePromotionPage() {
    const router = useRouter();
    const { token } = useAuth();

    const [produits, setProduits] =
        useState<Produit[]>([]);

    const [produitsLoading, setProduitsLoading] =
        useState(true);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const now = new Date();

    const debutParDefaut =
        getDateTimeLocal(now);

    const finParDefaut = getDateTimeLocal(
        new Date(
            now.getTime() +
            7 * 24 * 60 * 60 * 1000
        )
    );

    const [form, setForm] =
        useState<FormData>({
            produit_id: 0,
            nom: "",
            type: "percentage",
            reduction_pourcentage: 10,
            prix_promotionnel: 0,
            date_debut:
                debutParDefaut,
            date_fin:
                finParDefaut,
            quantite_limite: "",
        });

    /*
     * =========================
     * CHARGEMENT PRODUITS
     * =========================
     */

    useEffect(() => {
        if (!token) {
            setProduitsLoading(false);
            return;
        }

        async function loadProduits() {
            try {
                setProduitsLoading(true);
                setError("");

                const response = await fetch(
                    "/api/dashboard/produit",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Impossible de charger les produits."
                    );
                }

                const liste =
                    data.data ?? [];

                setProduits(liste);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les produits."
                );
            } finally {
                setProduitsLoading(false);
            }
        }

        loadProduits();
    }, [token]);

    /*
     * =========================
     * PRODUIT SÉLECTIONNÉ
     * =========================
     */

    const produitSelectionne =
        useMemo(() => {
            return produits.find(
                (produit) =>
                    produit.id ===
                    form.produit_id
            );
        }, [
            produits,
            form.produit_id,
        ]);

    const prixProduit =
        Number(
            produitSelectionne?.prix ?? 0
        );

    /*
     * =========================
     * CALCUL PRIX PROMOTION
     * =========================
     */

    const prixFinal = useMemo(() => {
        if (!prixProduit) {
            return 0;
        }

        if (
            form.type ===
            "special_price"
        ) {
            return Number(
                form.prix_promotionnel || 0
            );
        }

        const reduction =
            Number(
                form.reduction_pourcentage ||
                0
            );

        return Number(
            (
                prixProduit *
                (1 - reduction / 100)
            ).toFixed(2)
        );
    }, [
        prixProduit,
        form.type,
        form.reduction_pourcentage,
        form.prix_promotionnel,
    ]);

    const economie =
        prixProduit > 0 &&
            prixFinal > 0
            ? Number(
                (
                    prixProduit -
                    prixFinal
                ).toFixed(2)
            )
            : 0;

    const reductionEffective =
        prixProduit > 0 &&
            prixFinal > 0
            ? Number(
                (
                    (1 -
                        prixFinal /
                        prixProduit) *
                    100
                ).toFixed(2)
            )
            : 0;

    /*
     * =========================
     * CHANGEMENT PRODUIT
     * =========================
     */

    function handleProduitChange(
        value: string
    ) {
        const produitId =
            Number(value);

        setForm((old) => ({
            ...old,
            produit_id: produitId,
            prix_promotionnel: 0,
        }));

        setError("");
    }

    /*
     * =========================
     * CHANGEMENT CHAMP
     * =========================
     */

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement |
            HTMLTextAreaElement
        >
    ) {
        const {
            name,
            value,
        } = e.target;

        setForm((old) => ({
            ...old,
            [name]:
                name ===
                    "reduction_pourcentage" ||
                    name ===
                    "prix_promotionnel"
                    ? Number(value)
                    : value,
        }));

        if (error) {
            setError("");
        }
    }

    /*
     * =========================
     * SOUMISSION
     * =========================
     */

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");

        const nom =
            form.nom.trim();

        if (!form.produit_id) {
            setError(
                "Veuillez sélectionner un produit."
            );
            return;
        }

        if (!produitSelectionne) {
            setError(
                "Le produit sélectionné est introuvable."
            );
            return;
        }

        if (!nom) {
            setError(
                "Le nom de la promotion est obligatoire."
            );
            return;
        }

        if (
            form.type ===
            "percentage"
        ) {
            const reduction =
                Number(
                    form.reduction_pourcentage
                );

            if (
                !Number.isFinite(
                    reduction
                ) ||
                reduction <= 0 ||
                reduction >= 100
            ) {
                setError(
                    "La réduction doit être comprise entre 0 et 100 %."
                );
                return;
            }
        }

        if (
            form.type ===
            "special_price"
        ) {
            const prixPromotionnel =
                Number(
                    form.prix_promotionnel
                );

            if (
                !Number.isFinite(
                    prixPromotionnel
                ) ||
                prixPromotionnel <= 0
            ) {
                setError(
                    "Le prix promotionnel doit être supérieur à 0."
                );
                return;
            }

            if (
                prixPromotionnel >=
                prixProduit
            ) {
                setError(
                    "Le prix promotionnel doit être inférieur au prix normal."
                );
                return;
            }
        }

        if (
            !form.date_debut ||
            !form.date_fin
        ) {
            setError(
                "Les dates de début et de fin sont obligatoires."
            );
            return;
        }

        const debut = new Date(
            form.date_debut
        );

        const fin = new Date(
            form.date_fin
        );

        if (
            Number.isNaN(
                debut.getTime()
            ) ||
            Number.isNaN(
                fin.getTime()
            )
        ) {
            setError(
                "Les dates renseignées sont invalides."
            );
            return;
        }

        if (debut >= fin) {
            setError(
                "La date de fin doit être postérieure à la date de début."
            );
            return;
        }

        if (
            form.quantite_limite !==
            ""
        ) {
            const quantite =
                Number(
                    form.quantite_limite
                );

            if (
                !Number.isInteger(
                    quantite
                ) ||
                quantite <= 0
            ) {
                setError(
                    "La quantité limite doit être un nombre entier supérieur à 0."
                );
                return;
            }
        }

        if (!token) {
            setError(
                "Votre session a expiré. Veuillez vous reconnecter."
            );
            return;
        }

        try {
            setLoading(true);

            const body = {
                produit_id:
                    form.produit_id,
                nom,
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
                        reduction_pourcentage:
                            undefined,
                        prix_promotionnel:
                            Number(
                                form.prix_promotionnel
                            ),
                    }),
                date_debut:
                    form.date_debut,
                date_fin:
                    form.date_fin,
                quantite_limite:
                    form.quantite_limite ===
                        ""
                        ? null
                        : Number(
                            form.quantite_limite
                        ),
            };

            const response =
                await fetch(
                    "/api/promotions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: JSON.stringify(
                            body
                        ),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Impossible de créer la promotion."
                );
            }

            toast.success(
                "Promotion créée avec succès."
            );

            router.push(
                "/dashboard/promotions"
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Impossible de créer la promotion.";

            setError(message);

            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const disabled =
        loading ||
        produitsLoading;

    /*
     * =========================
     * AFFICHAGE
     * =========================
     */

    return (
        <div className="space-y-6">

            {/* =========================
                EN-TÊTE
            ========================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="
                            flex h-10 w-10
                            shrink-0 items-center
                            justify-center
                            rounded-xl border
                            border-gray-200
                            bg-white text-gray-600
                            shadow-sm
                            transition
                            hover:bg-gray-50
                        "
                        aria-label="Retour"
                    >
                        <ArrowLeft
                            size={19}
                        />
                    </button>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                        <BadgePercent
                            size={22}
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Nouvelle promotion
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Créez une offre spéciale pour l'un de vos produits.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* =========================
                    ERREUR
                ========================== */}

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
                                    Sélectionnez le produit que vous souhaitez mettre en promotion.
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
                            value={
                                form.produit_id
                            }
                            onChange={(e) =>
                                handleProduitChange(
                                    e.target.value
                                )
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
                        >
                            <option value={0}>
                                {produitsLoading
                                    ? "Chargement des produits..."
                                    : "Sélectionner un produit"}
                            </option>

                            {produits.map(
                                (
                                    produit
                                ) => (
                                    <option
                                        key={
                                            produit.uuid
                                        }
                                        value={
                                            produit.id
                                        }
                                    >
                                        {
                                            produit.nom
                                        }{" "}
                                        —{" "}
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
                            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {
                                                produitSelectionne.nom
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Stock disponible :{" "}
                                            <strong className="text-gray-700">
                                                {produitSelectionne.stock}
                                            </strong>{" "}
                                            unité
                                            {produitSelectionne.stock > 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Prix actuel
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-gray-900">
                                            {formatPrice(
                                                prixProduit
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* =========================
                    INFORMATIONS PROMOTION
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
                                    Définissez le nom et le type de votre promotion.
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
                                Nom de la promotion
                            </label>

                            <input
                                id="nom"
                                type="text"
                                name="nom"
                                value={
                                    form.nom
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Ex : Offre spéciale rentrée"
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
                        </div>

                        {/* Type */}

                        <div>
                            <label
                                className="mb-3 block text-sm font-semibold text-gray-700"
                            >
                                Type de promotion
                            </label>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                type: "percentage",
                                            })
                                        )
                                    }
                                    disabled={
                                        disabled
                                    }
                                    className={`
                                        rounded-xl
                                        border p-4
                                        text-left
                                        transition
                                        ${form.type ===
                                            "percentage"
                                            ? "border-black bg-gray-50 ring-1 ring-black"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                            <TrendingDown
                                                size={
                                                    19
                                                }
                                                className="text-gray-700"
                                            />
                                        </div>

                                        {form.type ===
                                            "percentage" && (
                                                <CheckCircle2
                                                    size={
                                                        19
                                                    }
                                                    className="text-black"
                                                />
                                            )}
                                    </div>

                                    <p className="mt-3 font-semibold text-gray-900">
                                        Réduction en pourcentage
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Exemple : -20 % sur le prix actuel.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm(
                                            (
                                                old
                                            ) => ({
                                                ...old,
                                                type: "special_price",
                                            })
                                        )
                                    }
                                    disabled={
                                        disabled
                                    }
                                    className={`
                                        rounded-xl
                                        border p-4
                                        text-left
                                        transition
                                        ${form.type ===
                                            "special_price"
                                            ? "border-black bg-gray-50 ring-1 ring-black"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                            <BadgePercent
                                                size={
                                                    19
                                                }
                                                className="text-gray-700"
                                            />
                                        </div>

                                        {form.type ===
                                            "special_price" && (
                                                <CheckCircle2
                                                    size={
                                                        19
                                                    }
                                                    className="text-black"
                                                />
                                            )}
                                    </div>

                                    <p className="mt-3 font-semibold text-gray-900">
                                        Prix spécial
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Définissez directement le nouveau prix.
                                    </p>
                                </button>

                            </div>
                        </div>

                        {/* Réduction */}

                        {form.type ===
                            "percentage" && (
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
                                            min="1"
                                            max="99"
                                            step="1"
                                            disabled={
                                                disabled
                                            }
                                            className="
                                            w-full rounded-xl
                                            border border-gray-200
                                            bg-white px-4 py-3
                                            pr-12 text-sm
                                            outline-none transition
                                            focus:border-gray-400
                                            focus:ring-2
                                            focus:ring-gray-100
                                            disabled:cursor-not-allowed
                                            disabled:bg-gray-50
                                        "
                                        />

                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                            )}

                        {/* Prix spécial */}

                        {form.type ===
                            "special_price" && (
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
                                            min="1"
                                            step="1"
                                            disabled={
                                                disabled
                                            }
                                            placeholder="Ex : 75000"
                                            className="
                                            w-full rounded-xl
                                            border border-gray-200
                                            bg-white px-4 py-3
                                            pr-16 text-sm
                                            outline-none transition
                                            focus:border-gray-400
                                            focus:ring-2
                                            focus:ring-gray-100
                                            disabled:cursor-not-allowed
                                            disabled:bg-gray-50
                                        "
                                        />

                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                                            FCFA
                                        </span>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {/* =========================
                    APERÇU PRIX
                ========================== */}

                {produitSelectionne && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <TrendingDown
                                        size={19}
                                        className="text-gray-700"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Aperçu de l'offre
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Vérifiez le prix final avant de publier la promotion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Prix normal
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-gray-500 line-through">
                                        {formatPrice(
                                            prixProduit
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                                        Prix promotion
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-green-700">
                                        {prixFinal >
                                            0
                                            ? formatPrice(
                                                prixFinal
                                            )
                                            : "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Économie
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {economie >
                                            0
                                            ? formatPrice(
                                                economie
                                            )
                                            : "—"}
                                    </p>

                                    {reductionEffective >
                                        0 && (
                                            <p className="mt-1 text-xs font-semibold text-green-600">
                                                -
                                                {
                                                    reductionEffective
                                                }
                                                %
                                            </p>
                                        )}
                                </div>

                            </div>

                            {prixFinal >=
                                prixProduit &&
                                prixProduit >
                                0 && (
                                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                                        <AlertCircle
                                            size={
                                                18
                                            }
                                            className="mt-0.5 shrink-0"
                                        />

                                        <p>
                                            Le prix promotionnel doit être inférieur au prix normal.
                                        </p>
                                    </div>
                                )}
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
                                        {produitSelectionne.nom}
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
                                                ? `-${reductionEffective}%`
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
                    ACTIONS
                ========================== */}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        disabled={loading}
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
                        disabled={
                            disabled
                        }
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
                        {loading ? (
                            <>
                                <Loader2
                                    size={
                                        17
                                    }
                                    className="animate-spin"
                                />

                                Création...
                            </>
                        ) : (
                            <>
                                <Save
                                    size={
                                        17
                                    }
                                />

                                Créer la promotion
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
