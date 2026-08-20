"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: string | number;
  created_at: string;
  updated_at: string;
}

export default function TarifsLivraisonPage() {
  const [tarifs, setTarifs] =
    useState<TarifLivraison[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const fetchTarifs = async () => {
    try {
      const token =
        localStorage.getItem("token");

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

      if (result.success) {
        setTarifs(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarifs();
  }, []);

  const deleteTarif = async (
    id: number
  ) => {
    const confirmation =
      confirm(
        "Voulez-vous supprimer ce tarif de livraison ?"
      );

    if (!confirmation)
      return;

    try {
      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `/api/dashboard/tarifs-livraison/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        await response.json();

      if (result.success) {
        fetchTarifs();
      } else {
        alert(
          result.message ||
          "Impossible de supprimer le tarif."
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Une erreur est survenue."
      );
    }
  };

  const filteredTarifs =
    tarifs.filter((tarif) =>
      tarif.zone
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Gestion des tarifs de livraison
        </h1>

        <Link
          href="/dashboard/tarifs-livraison/create"
          className="bg-black text-white rounded-xl px-5 py-2.5 text-sm font-medium transition hover:bg-gray-800"
        >
          Ajouter
        </Link>

      </div>

      <input
        type="text"
        placeholder="Rechercher une zone..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="px-4 py-2 mb-6 w-full md:w-1/2 rounded-xl border border-gray-300  text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="overflow-x-auto border rounded-2xl border-gray-100 bg-white p-4 shadow-sm">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left k text-sm">
                Zone
              </th>

              <th className="px-4 py-3 text-left k text-sm">
                Frais de livraison
              </th>

              <th className="px-4 py-3 text-left k text-sm">
                Date
              </th>

              <th className="px-4 py-3 text-left k text-sm">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredTarifs.length > 0 ? (

              filteredTarifs.map(
                (tarif) => (

                  <tr
                    key={tarif.id}
                    className="border-t "
                  >

                    <td className="px-4 py-3">
                      {tarif.zone}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {Number(
                        tarif.frais
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        tarif.created_at
                      ).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>

                    <td className="px-4 py-3 flex gap-2">

                      <Link
                        href={`/dashboard/tarifs-livraison/edit/${tarif.id}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Modifier
                      </Link>

                      <button
                        onClick={() =>
                          deleteTarif(
                            tarif.id
                          )
                        }
                        className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        Supprimer
                      </button>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Aucun tarif de livraison configuré.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

