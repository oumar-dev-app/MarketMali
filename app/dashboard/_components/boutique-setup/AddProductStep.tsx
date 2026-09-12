"use client";

import { useState } from "react";
import {
  AlertTriangle,
  PackagePlus,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import ProductForm, {
  ProductFormData,
} from "../../composants/ProductForm";

interface AddProductStepProps {
  onCompleted: () => void;
}

export default function AddProductStep({
  onCompleted,
}: AddProductStepProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: ProductFormData) {
    if (!token) {
      const message =
        "Vous devez être connecté pour créer un produit.";

      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/dashboard/produit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categorie_id: data.categorie_id,
            nom: data.nom,
            description: data.description,
            prix: data.prix,
            stock: data.stock,
            image: data.image,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message =
          result.message ||
          "Impossible de créer le produit.";

        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Produit créé avec succès.");

      /*
       * Pas de redirection.
       * Le parent recharge l'état de la boutique
       * et passe automatiquement à l'étape suivante.
       */
      onCompleted();
    } catch (error) {
      console.error(
        "Erreur création produit :",
        error
      );

      const message =
        "Une erreur serveur est survenue. Veuillez réessayer.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête de l'étape */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <PackagePlus className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Ajoutez votre premier produit
          </h2>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Ajoutez un produit à votre catalogue pour commencer
            à vendre sur MarketMali.
          </p>
        </div>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Impossible de créer le produit
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Formulaire existant */}
      <ProductForm
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
