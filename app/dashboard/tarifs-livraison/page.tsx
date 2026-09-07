"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Truck,
  MapPin,
  Banknote,
  CalendarDays,
  Pencil,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";

interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: string | number;
  created_at: string;
  updated_at: string;
}

export default function TarifsLivraisonPage() {
  const [tarifs, setTarifs] = useState<TarifLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const router = useRouter();



  /*
   * Fermer le menu lorsqu'on clique ailleurs
   */


  /*
   * Récupérer les tarifs
   */
  const fetchTarifs = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setTarifs([]);
        return;
      }

      const response = await fetch(
        "/api/dashboard/tarifs-livraison",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de récupérer les tarifs."
        );
      }

      setTarifs(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement tarifs :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarifs();
  }, []);

  /*
   * Supprimer un tarif
   */
  const deleteTarif = async (id: number) => {
    const confirmation = confirm(
      "Voulez-vous vraiment supprimer ce tarif de livraison ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vous devez être connecté.");
        return;
      }

      const response = await fetch(
        `/api/dashboard/tarifs-livraison/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de supprimer le tarif."
        );
      }

      setTarifs((prev) =>
        prev.filter((tarif) => tarif.id !== id)
      );
    } catch (error) {
      console.error(
        "Erreur suppression tarif :",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * Recherche
   */
  const filteredTarifs = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return tarifs;
    }

    return tarifs.filter((tarif) =>
      tarif.zone.toLowerCase().includes(value)
    );
  }, [tarifs, search]);

  /*
   * Statistiques
   */
  const totalFrais = tarifs.reduce(
    (total, tarif) =>
      total + Number(tarif.frais),
    0
  );

  const averageFrais =
    tarifs.length > 0
      ? totalFrais / tarifs.length
      : 0;

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>

        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
            <Truck size={21} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Tarifs de livraison
            </h1>

            <p className="mt-0.5 text-sm text-gray-500">
              Configurez les frais de livraison par zone.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/tarifs-livraison/create"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={18} />
          Ajouter un tarif
        </Link>
      </div>

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* ZONES */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Zones configurées
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {tarifs.length}
              </p>

              <p className="mt-1 text-xs text-blue-600/70">
                zone{tarifs.length > 1 ? "s" : ""} de livraison
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MapPin size={20} />
            </div>
          </div>
        </div>

        {/* TARIF MOYEN */}
        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">
                Tarif moyen
              </p>

              <p className="mt-2 text-2xl font-bold text-violet-950">
                {Math.round(
                  averageFrais
                ).toLocaleString("fr-FR")}

                <span className="ml-1 text-sm font-semibold text-violet-600">
                  FCFA
                </span>
              </p>

              <p className="mt-1 text-xs text-violet-600/70">
                moyenne des frais configurés
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Banknote size={20} />
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">
                Total des tarifs
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-950">
                {Math.round(
                  totalFrais
                ).toLocaleString("fr-FR")}

                <span className="ml-1 text-sm font-semibold text-orange-600">
                  FCFA
                </span>
              </p>

              <p className="mt-1 text-xs text-orange-600/70">
                cumul des frais configurés
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Truck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* TOOLBAR */}

        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Tarifs configurés
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredTarifs.length} résultat
                {filteredTarifs.length > 1 ? "s" : ""}

                {search && (
                  <>
                    {" "}
                    pour « {search} »
                  </>
                )}
              </p>
            </div>

            {/* RECHERCHE */}

            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Effacer la recherche"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            DESKTOP
        ===================================================== */}

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Zone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Frais de livraison
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Créé le
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTarifs.length > 0 ? (
                  filteredTarifs.map((tarif) => (
                    <tr
                      key={tarif.id}
                      className="group border-b border-gray-100 transition last:border-0 hover:bg-gray-50/70"
                    >

                      {/* ZONE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <MapPin size={16} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {tarif.zone}
                            </p>

                            <p className="text-xs text-gray-400">
                              Zone de livraison
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* FRAIS */}

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                          {Number(
                            tarif.frais
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays
                            size={15}
                            className="text-gray-400"
                          />

                          {new Date(
                            tarif.created_at
                          ).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="relative flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === tarif.id
                                  ? null
                                  : tarif.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                            aria-label="Actions"
                            aria-expanded={
                              openMenuId === tarif.id
                            }
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === tarif.id && (
                            <div className="absolute right-0 top-11 z-9999 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  router.push(
                                    `/dashboard/tarifs-livraison/edit/${tarif.id}`
                                  );
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                              >
                                <Pencil size={15} />
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  deleteTarif(tarif.id);
                                }}
                                disabled={deletingId === tarif.id}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 size={15} />
                                {deletingId === tarif.id
                                  ? "Suppression..."
                                  : "Supprimer"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center"
                    >
                      <EmptyState
                        search={search}
                        onClear={() =>
                          setSearch("")
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
            MOBILE
        ===================================================== */}

        <div className="divide-y divide-gray-100 md:hidden">
          {filteredTarifs.length > 0 ? (
            filteredTarifs.map((tarif) => (
              <div
                key={tarif.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <MapPin size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {tarif.zone}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Zone de livraison
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="whitespace-nowrap text-sm font-bold text-emerald-700">
                      {Number(
                        tarif.frais
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Frais
                    </p>
                  </div>
                </div>

                {/* DATE */}

                <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays
                      size={14}
                      className="text-gray-400"
                    />

                    {new Date(
                      tarif.created_at
                    ).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>

                {/* MENU MOBILE */}

                <div className="mt-3 flex justify-end">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === tarif.id
                            ? null
                            : tarif.id
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                      aria-label="Actions"
                      aria-expanded={
                        openMenuId === tarif.id
                      }
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === tarif.id && (
                      <div className="absolute bottom-12 right-0 z-50 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                        <Link
                          href={`/dashboard/tarifs-livraison/edit/${tarif.id}`}
                          onClick={() => {
                          }}
                          className="flex items-center gap-2.5 rounded-lg bg-red-100 px-3 py-2.5 text-sm font-medium text-gray-700"
                        >
                          <Pencil size={15} />
                          Modifier
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            deleteTarif(
                              tarif.id
                            );
                          }}
                          disabled={
                            deletingId === tarif.id
                          }
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={15} />

                          {deletingId ===
                            tarif.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-16 text-center">
              <EmptyState
                search={search}
                onClear={() => setSearch("")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
 * État vide
 */
function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Truck size={24} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        Aucun tarif trouvé
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {search
          ? "Aucun tarif ne correspond à votre recherche."
          : "Aucun tarif de livraison n'est encore configuré."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm font-semibold text-gray-900 underline underline-offset-4"
        >
          Effacer la recherche
        </button>
      )}

      {!search && (
        <Link
          href="/dashboard/tarifs-livraison/create"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={16} />
          Ajouter un tarif
        </Link>
      )}
    </div>
  );
}