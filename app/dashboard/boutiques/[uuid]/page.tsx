"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaArrowLeft,
    FaEdit,
    FaEye,
    FaStore,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaGlobe,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle,
    FaBan,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

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
        description: "La boutique est actuellement opérationnelle.",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        icon: FaCheckCircle,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
    },

    pending: {
        label: "En attente",
        description:
            "La boutique est en attente de validation ou d'activation.",
        className:
            "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        icon: FaClock,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
    },

    blocked: {
        label: "Bloquée",
        description:
            "La boutique est actuellement bloquée sur la plateforme.",
        className:
            "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
        icon: FaBan,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
    },
};

function formatDate(date?: string | null) {
    if (!date) {
        return "Non renseignée";
    }

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

function formatDateTime(date?: string | null) {
    if (!date) {
        return "Non renseignée";
    }

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

    const [boutique, setBoutique] =
        useState<Boutique | null>(null);

    const [loading, setLoading] =
        useState(true);

    const { user, loading: authLoading } = useAuth();

    const backPath =
        user?.role === "vendeur"
            ? "/dashboard/ma-boutique"
            : "/dashboard/boutiques";

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function fetchBoutique() {
            try {
                setLoading(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response =
                    await fetch(
                        `/api/dashboard/boutiques/${uuid}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                            cache: "no-store",
                        }
                    );

                const data: ApiResponse =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success ||
                    !data.data
                ) {
                    throw new Error(
                        data.message ||
                        "Impossible de récupérer les informations de la boutique."
                    );
                }

                setBoutique(data.data);
            } catch (err) {
                console.error(
                    "Erreur récupération boutique :",
                    err
                );

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

    /*
     * ============================
     * LOADING
     * ============================
     */

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl animate-pulse space-y-6">

                    {/* Navigation */}

                    <div className="h-5 w-44 rounded bg-slate-200" />

                    {/* Hero */}

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <div className="p-5 sm:p-6 lg:p-8">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                                <div className="h-24 w-24 shrink-0 rounded-2xl bg-slate-200" />

                                <div className="flex-1 space-y-3">
                                    <div className="h-8 w-64 rounded-lg bg-slate-200" />
                                    <div className="h-4 w-40 rounded bg-slate-200" />
                                    <div className="h-4 w-72 rounded bg-slate-200" />
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Cards */}

                    <div className="grid gap-5 sm:grid-cols-2">
                        {Array.from({ length: 4 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="h-64 rounded-3xl border border-slate-200 bg-white"
                                />
                            )
                        )}
                    </div>

                </div>
            </div>
        );
    }

    /*
     * ============================
     * ERROR
     * ============================
     */

    if (error || !boutique) {
        return (
            <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">

                    <Link
                        href={backPath}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        <FaArrowLeft />
                        {user?.role === "vendeur"
                            ? "Retour à ma boutique"
                            : "Retour aux boutiques"}
                    </Link>

                    <div className="rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-10">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <FaExclamationTriangle className="text-2xl" />
                        </div>

                        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Boutique introuvable
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            {error ||
                                "Cette boutique n'existe pas ou vous n'avez pas les droits nécessaires pour la consulter."}
                        </p>

                        <Link
                            href={backPath}
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <FaArrowLeft />
                            {user?.role === "vendeur"
                                ? "Retour à ma boutique"
                                : "Retour aux boutiques"}
                        </Link>

                    </div>

                </div>
            </div>
        );
    }

    const status =
        statusConfig[boutique.status] ||
        statusConfig.pending;

    const StatusIcon = status.icon;

    return (
        <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-6xl space-y-6">

                {/* ================================= */}
                {/* NAVIGATION + ACTIONS */}
                {/* ================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={backPath}
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                        <FaArrowLeft className="text-xs" />
                        {user?.role === "vendeur"
                            ? "Retour à ma boutique"
                            : "Retour aux boutiques"}
                    </Link>

                    <div className="grid grid-cols-1 gap-2 sm:flex">

                        {boutique.status === "active" &&
                            boutique.slug && (
                                <Link
                                    href={`/boutiques/${boutique.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                                >
                                    <FaEye className="text-sm" />
                                    Voir la boutique
                                </Link>
                            )}

                        <Link
                            href={`/dashboard/boutiques/${boutique.uuid}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <FaEdit className="text-sm" />
                            Modifier
                        </Link>

                    </div>

                </div>

                {/* ================================= */}
                {/* HERO */}
                {/* ================================= */}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    <div className="p-5 sm:p-6 lg:p-8">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            {/* Boutique principale */}

                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

                                {/* Logo */}

                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:h-28 sm:w-28">

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

                                {/* Infos */}

                                <div className="min-w-0">

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                                        <h1 className="wrap-break-word text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                            {boutique.nom}
                                        </h1>

                                        <span
                                            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${status.dot}`}
                                            />

                                            {status.label}
                                        </span>

                                    </div>

                                    {boutique.slug && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                            <FaGlobe className="shrink-0 text-slate-400" />

                                            <span className="truncate">
                                                /{boutique.slug}
                                            </span>
                                        </div>
                                    )}

                                    <p className="mt-3 break-all text-xs text-slate-400">
                                        UUID :{" "}
                                        <span className="font-mono text-slate-600">
                                            {boutique.uuid}
                                        </span>
                                    </p>

                                </div>

                            </div>

                            {/* Bloc statut */}

                            <div
                                className={`rounded-2xl border p-4 ${status.className}`}
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.iconBg}`}
                                    >
                                        <StatusIcon
                                            className={status.iconColor}
                                        />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-sm font-bold">
                                            {status.label}
                                        </p>

                                        <p className="mt-1 max-w-xs text-xs leading-5 opacity-80">
                                            {status.description}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ================================= */}
                {/* INFORMATIONS RAPIDES */}
                {/* ================================= */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Téléphone */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FaPhone />
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium text-slate-400">
                                    Téléphone
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {boutique.telephone ||
                                        "Non renseigné"}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Email */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <FaEnvelope />
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium text-slate-400">
                                    Email
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {boutique.email ||
                                        "Non renseigné"}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Ville */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FaMapMarkerAlt />
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium text-slate-400">
                                    Ville
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {boutique.ville ||
                                        "Non renseignée"}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Création */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <FaCalendarAlt />
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-medium text-slate-400">
                                    Créée le
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        boutique.created_at
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================= */}
                {/* INFORMATIONS */}
                {/* ================================= */}

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* ================================= */}
                    {/* COORDONNÉES */}
                    {/* ================================= */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FaPhone />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Coordonnées
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Informations de contact
                                </p>
                            </div>

                        </div>

                        <div className="space-y-3">

                            <div className="rounded-2xl bg-slate-50 p-4">

                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Téléphone
                                </p>

                                <p className="break-all text-sm font-semibold text-slate-800">
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

                    {/* ================================= */}
                    {/* LOCALISATION */}
                    {/* ================================= */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FaMapMarkerAlt />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Localisation
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Emplacement de la boutique
                                </p>
                            </div>

                        </div>

                        <div className="space-y-3">

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

                                <p className="wrap-break-word text-sm font-semibold leading-6 text-slate-800">
                                    {boutique.adresse ||
                                        "Non renseignée"}
                                </p>

                            </div>

                        </div>

                    </section>

                    {/* ================================= */}
                    {/* DESCRIPTION */}
                    {/* ================================= */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <FaStore />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    À propos de la boutique
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Présentation
                                </p>
                            </div>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">

                            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-600">
                                {boutique.description ||
                                    "Aucune description n'a été renseignée pour cette boutique."}
                            </p>

                        </div>

                    </section>

                    {/* ================================= */}
                    {/* INFORMATIONS SYSTÈME */}
                    {/* ================================= */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-6 flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <FaClock />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Informations système
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Historique de la boutique
                                </p>
                            </div>

                        </div>

                        <div className="space-y-4">

                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">

                                <div className="flex min-w-0 items-center gap-3">

                                    <FaCalendarAlt className="shrink-0 text-slate-400" />

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

                            <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 items-center gap-3">

                                    <FaClock className="shrink-0 text-slate-400" />

                                    <span className="text-sm text-slate-500">
                                        Dernière modification
                                    </span>

                                </div>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {formatDateTime(
                                        boutique.updated_at
                                    )}
                                </span>

                            </div>

                            {boutique.activation_expires_at && (
                                <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <FaClock className="shrink-0 text-slate-400" />

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

                {/* ================================= */}
                {/* IDENTIFIANT TECHNIQUE */}
                {/* ================================= */}

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Identifiant technique
                            </p>

                            <p className="mt-2 break-all font-mono text-xs text-slate-600 sm:text-sm">
                                {boutique.uuid}
                            </p>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <FaStore />
                            <span>
                                MarketMali
                            </span>
                        </div>

                    </div>

                </section>

            </div>
        </div>
    );
}