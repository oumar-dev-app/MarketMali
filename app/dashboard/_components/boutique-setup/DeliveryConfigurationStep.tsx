"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  RefreshCw,
  Settings2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

interface DeliveryConfigurationStepProps {
  onCompleted: () => void;
}

export default function DeliveryConfigurationStep({
  onCompleted,
}: DeliveryConfigurationStepProps) {
  const { token } = useAuth();

  const [livraisonConfiguree, setLivraisonConfiguree] =
    useState(false);

  const [configurationLoading, setConfigurationLoading] =
    useState(true);

  const [configurationSaving, setConfigurationSaving] =
    useState(false);

  const [error, setError] = useState("");

  const loadConfigurationLivraison = async () => {
    try {
      setConfigurationLoading(true);
      setError("");

      const authToken =
        token || localStorage.getItem("token");

      const response = await fetch(
        "/api/dashboard/boutiques",
        {
          headers: authToken
            ? {
                Authorization: `Bearer ${authToken}`,
              }
            : {},
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer la configuration de la boutique."
        );
      }

      const result = await response.json();

      const configured = Boolean(
        result?.data?.livraison_configuree
      );

      setLivraisonConfiguree(configured);

      /*
       * Si la configuration est déjà terminée en base,
       * on informe immédiatement le parent.
       *
       * Cela permet d'éviter de bloquer le vendeur
       * sur cette étape si elle a déjà été validée.
       */
      if (configured) {
        onCompleted();
      }
    } catch (error) {
      console.error(
        "Erreur configuration livraison:",
        error
      );

      setLivraisonConfiguree(false);
      setError(
        "Impossible de récupérer la configuration des livraisons."
      );
    } finally {
      setConfigurationLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurationLivraison();
  }, [token]);

  const markLivraisonConfiguree = async () => {
    try {
      setConfigurationSaving(true);
      setError("");

      const authToken =
        token || localStorage.getItem("token");

      if (!authToken) {
        setError("Vous devez être connecté.");
        return;
      }

      const response = await fetch(
        "/api/dashboard/boutiques/livraison-configuree",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ??
            "Impossible d'enregistrer la configuration."
        );
      }

      setLivraisonConfiguree(true);

      /*
       * Le parent recharge l'état complet de la boutique.
       * Il déterminera alors automatiquement que l'étape 3
       * est terminée et affichera l'étape 4.
       */
      onCompleted();
    } catch (error) {
      console.error(
        "Erreur validation configuration livraison:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la configuration."
      );
    } finally {
      setConfigurationSaving(false);
    }
  };

  if (configurationLoading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-72 rounded-lg bg-gray-200" />
        <div className="h-4 w-full max-w-2xl rounded bg-gray-200" />

        <div className="h-40 rounded-2xl border border-gray-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* EN-TÊTE */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <Settings2 className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Organisez vos livraisons
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500 sm:text-base">
            Préparez votre organisation logistique pour pouvoir
            gérer les commandes, les livreurs et le suivi des
            livraisons depuis MarketMali.
          </p>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CONFIGURATION */}
      <section
        className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
          livraisonConfiguree
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-orange-200 bg-orange-50/60"
        }`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                livraisonConfiguree
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {livraisonConfiguree ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <Settings2 className="h-6 w-6" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                {livraisonConfiguree
                  ? "Organisation des livraisons terminée"
                  : "Organisez vos livraisons"}
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                {livraisonConfiguree
                  ? "Cette étape de configuration est terminée. Vous pouvez maintenant continuer les autres étapes de préparation de votre boutique."
                  : "Préparez votre organisation logistique pour pouvoir gérer les commandes, les livreurs et le suivi des livraisons depuis MarketMali."}
              </p>
            </div>
          </div>

          {!livraisonConfiguree && (
            <button
              type="button"
              onClick={markLivraisonConfiguree}
              disabled={configurationSaving}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {configurationSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Terminer cette étape
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
