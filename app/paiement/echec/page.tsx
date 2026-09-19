"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FaTimesCircle,
    FaClock,
    FaShoppingBag,
    FaReceipt,
} from "react-icons/fa";

import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

interface Paiement {
    uuid: string;
    commande_id: number;
    statut: "pending" | "paid" | "failed" | "cancelled" | "refunded";
    montant: number;
    devise: string;
    methode: string;
}

export default function PaiementEchecPage() {
    const { token, loading: authLoading } = useAuth();

    const [paiement, setPaiement] =
        useState<Paiement | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (
            authLoading ||
            !token
        ) {
            return;
        }

        const paiementUuid =
            new URLSearchParams(
                window.location.search
            ).get("paiement");

        if (!paiementUuid) {
            setError(
                "Référence de paiement introuvable."
            );
            setLoading(false);
            return;
        }

        async function loadPaiement() {
            if (!paiementUuid) {
                return;
            }

            try {
                const response =
                    await fetch(
                        `/api/paiements/${encodeURIComponent(
                            paiementUuid
                        )}`,
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

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Impossible de vérifier le paiement."
                    );
                }

                setPaiement(data.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de vérifier le paiement."
                );
            } finally {
                setLoading(false);
            }
        }

        loadPaiement();
    }, [authLoading, token]);

    if (
        authLoading ||
        loading
    ) {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <Navbar />

                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
                    <div className="w-full animate-pulse rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-200" />
                        <div className="mx-auto mt-6 h-6 w-64 rounded-lg bg-gray-200" />
                        <div className="mx-auto mt-3 h-4 w-80 max-w-full rounded-lg bg-gray-200" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !paiement) {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <Navbar />

                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
                    <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <FaTimesCircle size={30} />
                        </div>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-gray-950">
                            Paiement non confirmé
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            {error ||
                                "Le paiement n'a pas pu être vérifié."}
                        </p>

                        <Link
                            href="/commandes"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <FaReceipt size={14} />
                            Voir mes commandes
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (paiement.statut === "paid") {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <Navbar />

                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
                    <div className="w-full rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                            <FaReceipt size={30} />
                        </div>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-gray-950">
                            Paiement confirmé
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Le paiement a finalement été confirmé.
                        </p>

                        <Link
                            href="/commandes"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Voir ma commande
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (paiement.statut === "pending") {
        return (
            <main className="min-h-screen bg-[#f7f8fa]">
                <Navbar />

                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
                    <div className="w-full rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                            <FaClock size={30} />
                        </div>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-gray-950">
                            Paiement en cours
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Le fournisseur de paiement n'a pas encore confirmé définitivement cette transaction.
                        </p>

                        <Link
                            href="/commandes"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <FaReceipt size={14} />
                            Voir mes commandes
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f8fa]">
            <Navbar />

            <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
                <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <FaTimesCircle size={30} />
                    </div>

                    <h1 className="mt-6 text-2xl font-black tracking-tight text-gray-950">
                        Paiement non effectué
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Le paiement n'a pas été confirmé. Vous pouvez consulter votre commande pour connaître son état.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/commandes"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <FaReceipt size={14} />
                            Voir mes commandes
                        </Link>

                        <Link
                            href="/produits"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <FaShoppingBag size={14} />
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
