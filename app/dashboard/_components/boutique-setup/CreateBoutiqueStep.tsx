"use client";

import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import BoutiqueForm, {
  BoutiqueFormData,
} from "../../composants/BoutiqueForm";

interface CreateBoutiqueStepProps {
  onCompleted: () => void;
}

export default function CreateBoutiqueStep({
  onCompleted,
}: CreateBoutiqueStepProps) {
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

      /*
       * Important :
       * On ne redirige plus vers une autre page.
       *
       * Le composant parent (ma-boutique/page.tsx)
       * va recharger l'état depuis le serveur et passer
       * automatiquement à l'étape 2.
       */
      onCompleted();
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
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-gray-200 rounded" />
        <div className="h-125 bg-white border border-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Créez votre boutique
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Commencez par renseigner les informations de votre
          boutique. Vous pourrez ensuite ajouter vos produits.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <BoutiqueForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => {
          setError("");
        }}
      />
    </div>
  );
}
