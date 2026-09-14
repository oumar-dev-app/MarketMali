"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaStore,
} from "react-icons/fa";

import BoutiqueForm, {
    BoutiqueFormData,
} from "@/app/dashboard/composants/BoutiqueForm";

interface Boutique {
    uuid: string;
    nom: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
    ville?: string | null;
    status: string;
    activation_expires_at?: string | null;
    created_at: string;
    updated_at?: string | null;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: Boutique;
}

export default function EditBoutiquePage() {
    const params = useParams<{ uuid: string }>();
    const router = useRouter();

    const uuid = params.uuid;

    const [boutique, setBoutique] = useState<Boutique | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!uuid) return;

        async function loadBoutique() {
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
                    }
                );

                const result: ApiResponse = await response.json();

                if (!response.ok || !result.success || !result.data) {
                    throw new Error(
                        result.message ||
                        "Impossible de récupérer la boutique."
                    );
                }

                setBoutique(result.data);
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

        loadBoutique();
    }, [uuid, router]);

    async function handleSubmit(data: BoutiqueFormData) {
        try {
            setSaving(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(
                `/api/dashboard/boutiques/${uuid}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            const result: ApiResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Impossible de modifier la boutique."
                );
            }

            router.push(`/dashboard/boutiques/${uuid}`);
            router.refresh();
        } catch (err) {
            console.error(
                "Erreur modification boutique :",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue lors de la modification."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        router.push(`/dashboard/boutiques/${uuid}`);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl animate-pulse">
                    <div className="mb-6 h-8 w-64 rounded-lg bg-slate-200" />
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-6 h-6 w-48 rounded bg-slate-200" />
                        <div className="space-y-5">
                            <div className="h-12 rounded-lg bg-slate-100" />
                            <div className="h-12 rounded-lg bg-slate-100" />
                            <div className="h-28 rounded-lg bg-slate-100" />
                            <div className="h-12 rounded-lg bg-slate-100" />
                            <div className="h-12 rounded-lg bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !boutique) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/dashboard/boutiques"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <FaArrowLeft />
                        Retour aux boutiques
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <FaExclamationTriangle className="text-xl" />
                        </div>

                        <h1 className="text-xl font-bold text-slate-900">
                            Boutique introuvable
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            {error ||
                                "Cette boutique n'existe pas ou vous n'avez pas accès à cette boutique."}
                        </p>

                        <Link
                            href="/dashboard/boutiques"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <FaArrowLeft />
                            Retour aux boutiques
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
                {/* ============================================================
    HEADER MARKETMALI
============================================================ */}

                <section className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

                    {/* Décoration verte */}
                    <div
                        className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-[#14a800]/5
        "
                    />

                    {/* Décoration jaune */}
                    <div
                        className="
            pointer-events-none
            absolute
            -bottom-40
            -left-32
            h-80
            w-80
            rounded-full
            bg-[#fcd116]/5
        "
                    />

                    {/* Décoration rouge */}
                    <div
                        className="
            pointer-events-none
            absolute
            right-[12%]
            top-[42%]
            h-40
            w-40
            rounded-full
            bg-[#ce1126]/[0.025]
        "
                    />

                    <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-8">

                        {/* Bande Mali */}
                        <div className="mb-5 flex items-center gap-1">
                            <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
                            <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
                            <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
                        </div>

                        <div className="flex flex-col gap-5">

                            <div className="flex items-start gap-4">

                                {/* Retour */}
                                <Link
                                    href={`/dashboard/boutiques/${boutique.uuid}`}
                                    aria-label="Retour à la boutique"
                                    className="
                        mt-0.5
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-600
                        shadow-sm
                        transition
                        hover:border-[#14a800]/30
                        hover:bg-[#14a800]/5
                        hover:text-[#14a800]
                        focus:outline-none
                        focus:ring-4
                        focus:ring-[#14a800]/10
                    "
                                >
                                    <FaArrowLeft className="text-sm" />
                                </Link>

                                <div className="min-w-0">

                                    {/* Section */}
                                    <div className="mb-3 flex items-center gap-2">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                                            <FaStore className="text-base" />
                                        </div>

                                        <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                                            Gestion de la boutique
                                        </span>

                                    </div>

                                    {/* Titre */}
                                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                                        Modifier la boutique
                                    </h1>

                                    {/* Description */}
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                                        Modifiez les informations de{" "}
                                        <span className="font-semibold text-gray-700">
                                            {boutique.nom}
                                        </span>{" "}
                                        et personnalisez votre boutique sur MarketMali.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <FaExclamationTriangle className="mt-0.5 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Une erreur est survenue
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                    <BoutiqueForm
                        mode="edit"
                        initialData={{
                            nom: boutique.nom,
                            description: boutique.description ?? "",
                            logo: boutique.logo ?? "",
                            telephone: boutique.telephone ?? "",
                            email: boutique.email ?? "",
                            adresse: boutique.adresse ?? "",
                            ville: boutique.ville ?? "",
                        }}
                        loading={saving}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
}
