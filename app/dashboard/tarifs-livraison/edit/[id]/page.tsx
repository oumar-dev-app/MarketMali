"use client";

import {
  ArrowLeft,
  Loader2,
  Save,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: string | number;
  created_at: string;
  updated_at: string;
}

export default function EditTarifLivraisonPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [zone, setZone] = useState("");
  const [frais, setFrais] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Charger le tarif
   */
  const fetchTarif = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Vous devez être connecté."
        );
        return;
      }

      /*
       * L'API actuelle ne possède pas
       * de GET /tarifs-livraison/[id].
       *
       * On récupère donc la liste des tarifs
       * puis on recherche celui demandé.
       */
      const response =
        await fetch(
          "/api/dashboard/tarifs-livraison",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
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
            "Impossible de récupérer les tarifs."
        );
      }

      const tarifs =
        Array.isArray(result.data)
          ? result.data
          : [];

      const tarif =
        tarifs.find(
          (item: TarifLivraison) =>
            String(item.id) ===
            String(id)
        );

      if (!tarif) {
        setError(
          "Tarif de livraison introuvable."
        );
        return;
      }

      setZone(tarif.zone);
      setFrais(String(tarif.frais));
    } catch (error) {
      console.error(
        "Erreur chargement tarif :",
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

  useEffect(() => {
    if (id) {
      fetchTarif();
    }
  }, [id]);

  /*
   * Modifier le tarif
   */
  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    const zoneValue =
      zone.trim();

    const fraisValue =
      Number(frais);

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
      setSaving(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Vous devez être connecté."
        );
        return;
      }

      const response =
        await fetch(
          `/api/dashboard/tarifs-livraison/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
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
            "Impossible de modifier le tarif."
        );
      }

      router.push(
        "/dashboard/tarifs-livraison"
      );
    } catch (error) {
      console.error(
        "Erreur modification tarif :",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Chargement
   */
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Chargement du tarif...
        </div>
      </div>
    );
  }

  /*
   * Erreur de chargement
   */
  if (error && !zone && !frais) {
    return (
      <div className="mx-auto w-full max-w-3xl">

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

          <div className="text-sm font-semibold text-red-700">
            {error}
          </div>

          <Link
            href="/dashboard/tarifs-livraison"
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-red-200
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
            <ArrowLeft size={17} />
            Retour aux tarifs
          </Link>

        </div>

      </div>
    );
  }

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
              Modifier le tarif
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Modifiez la zone ou les frais de livraison.
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
                setZone(
                  event.target.value
                )
              }
              disabled={saving}
              placeholder="Ex. Bamako"
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
                  setFrais(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="Ex. 1500"
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

              <span
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  font-semibold
                  text-gray-400
                "
              >
                FCFA
              </span>

            </div>

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

        <div
          className="
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
          "
        >

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
            disabled={saving}
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
            {saving ? (
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
                Enregistrer les modifications
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}
