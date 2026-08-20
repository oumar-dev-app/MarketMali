"use client";

import { useAuth } from "@/contexts/AuthContext";

import LivreurLivraisons from "./composants/LivreurLivraisons";
import GestionLivraisons from "./composants/GestionLivraisons";

export default function LivraisonsPage() {

    const { user, loading } =
        useAuth();

    if (loading || !user) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Chargement...
                </p>
            </main>
        );
    }

    if (user.role === "livreur") {
        return <LivreurLivraisons />;
    }

    if (
        user.role === "vendeur" ||
        user.role === "admin" ||
        user.role === "super_admin"
    ) {
        return <GestionLivraisons />;
    }

    return (
        <main className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <h1 className="font-bold text-gray-900">
                    Accès refusé
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Vous n'avez pas accès à cet espace.
                </p>
            </div>
        </main>
    );
}

