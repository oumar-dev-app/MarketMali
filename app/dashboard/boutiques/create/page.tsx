"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import BoutiqueForm, {
  BoutiqueFormData,
} from "../../composants/BoutiqueForm";

export default function CreateBoutiquePage() {
  const router = useRouter();

  const { token, user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: BoutiqueFormData) {
    if (!token) {
      setError("Vous devez être connecté.");
      return;
    }

    if (!user) {
      setError("Utilisateur introuvable.");
      return;
    }

    if (
      user.role !== "vendeur" &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      setError(
        "Vous n'avez pas l'autorisation de créer une boutique."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/dashboard/boutiques",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.message ||
            "Impossible de créer la boutique."
        );
        return;
      }

      router.push("/dashboard/boutiques");
      router.refresh();
    } catch (error) {
      console.error(
        "Erreur création boutique :",
        error
      );

      setError(
        "Une erreur est survenue lors de la création de la boutique."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="h-4 w-96 max-w-full bg-gray-200 rounded" />
            <div className="h-[600px] bg-white border border-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Créer ma boutique
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Créez votre boutique pour commencer à vendre
            sur MarketMali.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <BoutiqueForm
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() =>
            router.push("/dashboard/boutiques")
          }
        />

      </div>
    </div>
  );
}