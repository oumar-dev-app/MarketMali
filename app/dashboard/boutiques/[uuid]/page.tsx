"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaArrowLeft,
    FaEdit,
    FaStore,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaGlobe,
    FaClock,
    FaExclamationTriangle,
} from "react-icons/fa";

interface Boutique {
    uuid: string;
    nom: string;
    slug?: string | null;
    description?: string | null;
    logo?: string | null;
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
    ville?: string | null;
    status: "active" | "pending" | "blocked";
    activation_expires_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: Boutique;
}

const statusConfig = {
    active: {
        label: "Active",
        className:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
    },
    pending: {
        label: "En attente",
        className:
            "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-500",
    },
    blocked: {
        label: "Bloquée",
        className:
            "bg-red-50 text-red-700 border border-red-200",
        dot: "bg-red-500",
    },
};

function formatDate(date?: string | null) {
    if (!date) return "Non renseignée";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Non renseignée";
    }

    return parsed.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function BoutiqueDetailsPage() {
    const params = useParams<{ uuid: string }>();
    const router = useRouter();

    const uuid = params.uuid;

    const [boutique, setBoutique] = useState<Boutique | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBoutique() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(
                    `/api/dashboard/boutiques/${uuid}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const data: ApiResponse = await response.json();

                if (!response.ok || !data.success || !data.data) {
                    throw new Error(
                        data.message ||
                            "Impossible de récupérer les informations de la boutique."
                    );
                }

                setBoutique(data.data);
            } catch (err) {
                console.error("Erreur récupération boutique :", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Une erreur est survenue."
                );
            } finally {
                setLoading(false);
            }
        }

        if (uuid) {
            fetchBoutique();
        }
    }, [uuid, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6">
                <div className="mx-auto max-w-6xl animate-pulse space-y-6">
                    <div className="h-8 w-40 rounded-lg bg-slate-200" />

                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                            <div className="h-24 w-24 rounded-2xl bg-slate-200" />

                            <div className="flex-1 space-y-3">
                                <div className="h-7 w-64 rounded bg-slate-200" />
                                <div className="h-4 w-40 rounded bg-slate-200" />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="h-64 rounded-3xl bg-slate-200" />
                        <div className="h-64 rounded-3xl bg-slate-200" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !boutique) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/dashboard/boutiques"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        <FaArrowLeft />
                        Retour aux boutiques
                    </Link>

                    <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <FaExclamationTriangle className="text-2xl" />
                        </div>

                        <h1 className="text-xl font-bold text-slate-900">
                            Boutique introuvable
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {error ||
                                "Cette boutique n'existe pas ou vous n'avez pas les droits nécessaires pour la consulter."}
                        </p>

                        <Link
                            href="/dashboard/boutiques"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <FaArrowLeft />
                            Retour aux boutiques
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const status =
        statusConfig[boutique.status] || statusConfig.pending;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/dashboard/boutiques"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        <FaArrowLeft />
                        Retour aux boutiques
                    </Link>

                    <Link
                        href={`/dashboard/boutiques/${boutique.uuid}/edit`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <FaEdit />
                        Modifier la boutique
                    </Link>
                </div>

                {/* Hero */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-5 md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">

                            {/* Logo */}
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                {boutique.logo ? (
                                    <img
                                        src={boutique.logo}
                                        alt={`Logo ${boutique.nom}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FaStore className="text-3xl text-slate-400" />
                                )}
                            </div>

                            {/* Informations principales */}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                        {boutique.nom}
                                    </h1>

                                    <span
                                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${status.dot}`}
                                        />
                                        {status.label}
                                    </span>
                                </div>

                                {boutique.slug && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                        <FaGlobe className="text-slate-400" />
                                        <span>
                                            /{boutique.slug}
                                        </span>
                                    </div>
                                )}

                                <p className="mt-3 text-sm text-slate-500">
                                    Identifiant :{" "}
                                    <span className="font-mono text-xs text-slate-700">
                                        {boutique.uuid}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Informations */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Coordonnées */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FaPhone />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Coordonnées
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Informations de contact
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Téléphone
                                </p>

                                <p className="text-sm font-semibold text-slate-800">
                                    {boutique.telephone ||
                                        "Non renseigné"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Adresse email
                                </p>

                                <p className="break-all text-sm font-semibold text-slate-800">
                                    {boutique.email ||
                                        "Non renseignée"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Localisation */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FaMapMarkerAlt />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Localisation
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Emplacement de la boutique
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Ville
                                </p>

                                <p className="text-sm font-semibold text-slate-800">
                                    {boutique.ville ||
                                        "Non renseignée"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Adresse
                                </p>

                                <p className="text-sm font-semibold text-slate-800">
                                    {boutique.adresse ||
                                        "Non renseignée"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <FaStore />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    À propos de la boutique
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Présentation
                                </p>
                            </div>
                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                            {boutique.description ||
                                "Aucune description n'a été renseignée pour cette boutique."}
                        </p>
                    </section>

                    {/* Informations système */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <FaClock />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Informations
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Historique de la boutique
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-slate-400" />
                                    <span className="text-sm text-slate-500">
                                        Créée le
                                    </span>
                                </div>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        boutique.created_at
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <FaClock className="text-slate-400" />
                                    <span className="text-sm text-slate-500">
                                        Dernière modification
                                    </span>
                                </div>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        boutique.updated_at
                                    )}
                                </span>
                            </div>

                            {boutique.activation_expires_at && (
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-3">
                                        <FaClock className="text-slate-400" />
                                        <span className="text-sm text-slate-500">
                                            Activation jusqu'au
                                        </span>
                                    </div>

                                    <span className="text-right text-sm font-semibold text-slate-800">
                                        {formatDate(
                                            boutique.activation_expires_at
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}