"use client";

import { useEffect, useState } from "react";
import {
    FaStore,
    FaImage,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaAlignLeft,
    FaSave,
    FaTimes,
} from "react-icons/fa";

export interface BoutiqueFormData {
    nom: string;
    description: string;
    logo: string;
    telephone: string;
    email: string;
    adresse: string;
    ville: string;
}

interface Props {
    initialData?: Partial<BoutiqueFormData>;
    loading?: boolean;
    onSubmit: (data: BoutiqueFormData) => Promise<void>;
    onCancel?: () => void;
}

export default function BoutiqueForm({
    initialData,
    loading = false,
    onSubmit,
    onCancel,
}: Props) {
    const [form, setForm] = useState<BoutiqueFormData>({
        nom: initialData?.nom ?? "",
        description: initialData?.description ?? "",
        logo: initialData?.logo ?? "",
        telephone: initialData?.telephone ?? "",
        email: initialData?.email ?? "",
        adresse: initialData?.adresse ?? "",
        ville: initialData?.ville ?? "",
    });

    const [error, setError] = useState("");

    const [logoPreview, setLogoPreview] = useState(
        initialData?.logo ?? ""
    );

    useEffect(() => {
        setLogoPreview(form.logo.trim());
    }, [form.logo]);

    function handleChange(
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    }

    async function handleSubmit(
        event: React.FormEvent
    ) {
        event.preventDefault();

        const nom = form.nom.trim();
        const description = form.description.trim();
        const logo = form.logo.trim();
        const telephone = form.telephone.trim();
        const email = form.email.trim();
        const adresse = form.adresse.trim();
        const ville = form.ville.trim();

        if (nom.length < 3) {
            setError(
                "Le nom de la boutique doit contenir au moins 3 caractères."
            );
            return;
        }

        if (nom.length > 100) {
            setError(
                "Le nom de la boutique ne peut pas dépasser 100 caractères."
            );
            return;
        }

        if (description.length > 1000) {
            setError(
                "La description ne peut pas dépasser 1000 caractères."
            );
            return;
        }

        if (telephone && telephone.length < 8) {
            setError(
                "Le numéro de téléphone doit contenir au moins 8 caractères."
            );
            return;
        }

        if (telephone.length > 30) {
            setError(
                "Le numéro de téléphone ne peut pas dépasser 30 caractères."
            );
            return;
        }

        if (email) {
            const emailIsValid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!emailIsValid) {
                setError(
                    "Veuillez saisir une adresse email valide."
                );
                return;
            }
        }

        if (adresse.length > 255) {
            setError(
                "L'adresse ne peut pas dépasser 255 caractères."
            );
            return;
        }

        if (ville.length > 100) {
            setError(
                "La ville ne peut pas dépasser 100 caractères."
            );
            return;
        }

        if (logo.length > 255) {
            setError(
                "L'URL du logo ne peut pas dépasser 255 caractères."
            );
            return;
        }

        setError("");

        await onSubmit({
            nom,
            description,
            logo,
            telephone,
            email,
            adresse,
            ville,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
            {/* HEADER */}

            <div className="px-5 sm:px-7 py-5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                        <FaStore />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Informations de la boutique
                        </h2>

                        <p className="text-sm text-gray-500 mt-0.5">
                            Présentez votre boutique aux clients de MarketMali.
                        </p>
                    </div>
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="mx-5 sm:mx-7 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="p-5 sm:p-7 space-y-7">
                {/* IDENTITÉ */}

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <FaStore className="text-gray-400 text-sm" />

                        <h3 className="font-semibold text-gray-900">
                            Identité
                        </h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="nom"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nom de la boutique{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="nom"
                                type="text"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Ex. Boutique Oumar"
                                maxLength={100}
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />

                            <p className="text-xs text-gray-400 mt-1.5">
                                Entre 3 et 100 caractères.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                            >
                                <FaAlignLeft className="text-gray-400 text-xs" />
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows={5}
                                maxLength={1000}
                                placeholder="Décrivez votre boutique, vos produits et ce qui vous distingue..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none resize-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />

                            <div className="flex justify-end mt-1">
                                <span className="text-xs text-gray-400">
                                    {form.description.length}/1000
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGO */}

                <section className="border-t border-gray-100 pt-7">
                    <div className="flex items-center gap-2 mb-4">
                        <FaImage className="text-gray-400 text-sm" />

                        <h3 className="font-semibold text-gray-900">
                            Logo
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-[1fr_auto] gap-5 items-start">
                        <div>
                            <label
                                htmlFor="logo"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                URL du logo
                            </label>

                            <input
                                id="logo"
                                type="url"
                                name="logo"
                                value={form.logo}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength={255}
                                placeholder="https://exemple.com/logo.png"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />

                            <p className="text-xs text-gray-400 mt-1.5">
                                Vous pouvez ajouter l'URL publique de votre logo.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Aperçu du logo"
                                    className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-sm"
                                    onError={() =>
                                        setLogoPreview("")
                                    }
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <FaStore className="text-2xl text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTACT */}

                <section className="border-t border-gray-100 pt-7">
                    <div className="flex items-center gap-2 mb-4">
                        <FaPhone className="text-gray-400 text-sm" />

                        <h3 className="font-semibold text-gray-900">
                            Coordonnées
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="telephone"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                            >
                                <FaPhone className="text-gray-400 text-xs" />
                                Téléphone
                            </label>

                            <input
                                id="telephone"
                                type="tel"
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength={30}
                                placeholder="Ex. 75 40 21 50"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                            >
                                <FaEnvelope className="text-gray-400 text-xs" />
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="contact@boutique.com"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>

                {/* LOCALISATION */}

                <section className="border-t border-gray-100 pt-7">
                    <div className="flex items-center gap-2 mb-4">
                        <FaMapMarkerAlt className="text-gray-400 text-sm" />

                        <h3 className="font-semibold text-gray-900">
                            Localisation
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="ville"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Ville
                            </label>

                            <input
                                id="ville"
                                type="text"
                                name="ville"
                                value={form.ville}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength={100}
                                placeholder="Ex. Bamako"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="adresse"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Adresse
                            </label>

                            <input
                                id="adresse"
                                type="text"
                                name="adresse"
                                value={form.adresse}
                                onChange={handleChange}
                                disabled={loading}
                                maxLength={255}
                                placeholder="Ex. ACI 2000, Rue 245"
                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* ACTIONS */}

            <div className="px-5 sm:px-7 py-5 border-t border-gray-100 bg-gray-50/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <FaTimes />
                        Annuler
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                    <FaSave />

                    {loading
                        ? "Création en cours..."
                        : "Créer ma boutique"}
                </button>
            </div>
        </form>
    );
}

