"use client";

import {
  ArrowLeft,
  Loader2,
  Save,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTarifLivraisonPage() {
  const router = useRouter();

  const [zone, setZone] = useState("");
  const [frais, setFrais] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    const zoneValue = zone.trim();
    const fraisValue = Number(frais);

    if (!zoneValue) {
      setError(
        "La zone de livraison est obligatoire."
      );
      return;
    }

    if (
      !Number.isFinite(fraisValue) ||
      fraisValue < 0
    ) {
      setError(
        "Les frais de livraison sont invalides."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Vous devez être connecté."
        );
        return;
      }

      /*
       * Récupérer automatiquement
       * la boutique du vendeur.
       */
      const boutiqueResponse =
        await fetch(
          "/api/dashboard/boutiques",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const boutiqueResult =
        await boutiqueResponse.json();

      if (
        !boutiqueResponse.ok ||
        !boutiqueResult.success
      ) {
        throw new Error(
          boutiqueResult.message ||
            "Impossible de récupérer votre boutique."
        );
      }

      const boutique =
        boutiqueResult.data;

      if (!boutique?.id) {
        throw new Error(
          "Aucune boutique associée à votre compte."
        );
      }

      /*
       * Créer le tarif.
       */
      const response =
        await fetch(
          "/api/dashboard/tarifs-livraison",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              boutique_id:
                boutique.id,
              zone: zoneValue,
              frais: fraisValue,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Impossible de créer le tarif."
        );
      }

      router.push(
        "/dashboard/tarifs-livraison"
      );
    } catch (error) {
      console.error(
        "Erreur création tarif :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Truck size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Ajouter un tarif
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Configurez les frais de livraison pour une zone.
            </p>
          </div>

        </div>

        <Link
          href="/dashboard/tarifs-livraison"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-gray-700
            shadow-sm
            transition
            hover:bg-gray-50
          "
        >
          <ArrowLeft size={17} />
          Retour
        </Link>

      </div>

      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
        "
      >

        <div className="space-y-6 p-6">

          {/* ZONE */}

          <div>
            <label
              htmlFor="zone"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Zone de livraison
            </label>

            <input
              id="zone"
              type="text"
              value={zone}
              onChange={(event) =>
                setZone(event.target.value)
              }
              placeholder="Ex. Bamako, Kalaban-Coura..."
              disabled={loading}
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-3
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
                disabled:cursor-not-allowed
                disabled:bg-gray-50
              "
            />

            <p className="mt-2 text-xs text-gray-400">
              Indiquez le nom de la zone concernée.
            </p>
          </div>

          {/* FRAIS */}

          <div>
            <label
              htmlFor="frais"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Frais de livraison
            </label>

            <div className="relative">

              <input
                id="frais"
                type="number"
                min="0"
                step="1"
                value={frais}
                onChange={(event) =>
                  setFrais(event.target.value)
                }
                placeholder="Ex. 1500"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-3
                  pr-20
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:cursor-not-allowed
                  disabled:bg-gray-50
                "
              />

              <span className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-xs
                font-semibold
                text-gray-400
              ">
                FCFA
              </span>

            </div>

            <p className="mt-2 text-xs text-gray-400">
              Montant facturé au client pour cette zone.
            </p>
          </div>

          {/* ERREUR */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                leading-5
                text-red-700
              "
            >
              {error}
            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="
          flex
          flex-col-reverse
          gap-2
          border-t
          border-gray-100
          bg-gray-50/70
          px-6
          py-4
          sm:flex-row
          sm:justify-end
        ">

          <Link
            href="/dashboard/tarifs-livraison"
            className="
              inline-flex
              items-center
              justify-center
              rounded-lg
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
            "
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={17} />
                Enregistrer le tarif
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}
