"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import {
  FaStore,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaArrowUp,
  FaFilter,
} from "react-icons/fa";

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  ville?: string | null;
  status: string;
  activation_expires_at?: string | null;
  created_at: string;
}

type StatusFilter =
  | "all"
  | "active"
  | "pending"
  | "blocked";

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Active";

    case "pending":
      return "En attente";

    case "blocked":
      return "Bloquée";

    default:
      return status;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "active":
      return {
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };

    case "pending":
      return {
        badge:
          "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };

    case "blocked":
      return {
        badge:
          "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
      };

    default:
      return {
        badge:
          "bg-gray-50 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
      };
  }
};

export default function BoutiquesPage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [deletingUuid, setDeletingUuid] =
    useState<string | null>(null);

  const [actionUuid, setActionUuid] =
    useState<string | null>(null);

  const activateBoutique = async (
    boutique: Boutique
  ) => {
    const confirmation =
      window.confirm(
        `Voulez-vous activer la boutique "${boutique.nom}" ?`
      );

    if (!confirmation) {
      return;
    }

    try {
      setActionUuid(boutique.uuid);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Vous devez être connecté."
        );
      }

      const response =
        await fetch(
          `/api/dashboard/boutiques/${boutique.uuid}/activate`,
          {
            method: "PATCH",
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
          "Impossible d'activer la boutique."
        );
      }

      setBoutiques((current) =>
        current.map((item) =>
          item.uuid === boutique.uuid
            ? {
              ...item,
              status: "active",
              activation_expires_at: null,
            }
            : item
        )
      );

    } catch (error) {

      console.error(
        "Erreur activation boutique:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );

    } finally {
      setActionUuid(null);
    }
  };


  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Vous devez être connecté."
        );
      }

      const response =
        await fetch(
          "/api/dashboard/boutiques",
          {
            method: "GET",
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
          "Impossible de récupérer les boutiques."
        );
      }

      setBoutiques(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement boutiques:",
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
    fetchBoutiques();
  }, []);

  const filteredBoutiques =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return boutiques.filter(
        (boutique) => {
          const matchesSearch =
            !value ||
            boutique.nom
              .toLowerCase()
              .includes(value) ||
            boutique.slug
              .toLowerCase()
              .includes(value) ||
            boutique.email
              ?.toLowerCase()
              .includes(value) ||
            boutique.telephone
              ?.toLowerCase()
              .includes(value) ||
            boutique.ville
              ?.toLowerCase()
              .includes(value);

          const matchesStatus =
            statusFilter === "all" ||
            boutique.status ===
            statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      boutiques,
      search,
      statusFilter,
    ]);

  const deleteBoutique = async (
    boutique: Boutique
  ) => {
    const confirmation =
      window.confirm(
        `Voulez-vous vraiment supprimer la boutique "${boutique.nom}" ?\n\nCette action est définitive.`
      );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingUuid(
        boutique.uuid
      );

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `/api/dashboard/boutiques/${boutique.uuid}`,
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

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Impossible de supprimer la boutique."
        );
      }

      setBoutiques(
        (current) =>
          current.filter(
            (item) =>
              item.uuid !==
              boutique.uuid
          )
      );
    } catch (error) {
      console.error(
        "Erreur suppression boutique:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setDeletingUuid(null);
    }
  };

  const total =
    boutiques.length;

  const active =
    boutiques.filter(
      (item) =>
        item.status === "active"
    ).length;

  const pending =
    boutiques.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const blocked =
    boutiques.filter(
      (item) =>
        item.status === "blocked"
    ).length;

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">

          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg" />
            <div className="h-4 w-72 bg-gray-200 rounded mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 bg-white border border-gray-200 rounded-2xl"
              />
            ))}
          </div>

          <div className="h-96 bg-white border border-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
              <FaStore />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Boutiques
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Gérez les boutiques de la plateforme.
              </p>
            </div>

          </div>
        </div>

        <Link
          href="/dashboard/boutiques/create"
          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-5 py-3 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <FaPlus className="text-sm" />
          Nouvelle boutique
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        {/* TOTAL */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total boutiques
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {total}
              </p>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                <FaArrowUp className="text-emerald-500" />
                <span>
                  Boutiques enregistrées
                </span>
              </div>
            </div>

            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
              <FaStore className="text-gray-700" />
            </div>

          </div>

        </div>

        {/* ACTIVE */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Boutiques actives
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {active}
              </p>

              <p className="text-xs text-emerald-600 mt-3 font-medium">
                Opérationnelles
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FaCheckCircle className="text-emerald-600" />
            </div>

          </div>

        </div>

        {/* PENDING */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                En attente
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {pending}
              </p>

              <p className="text-xs text-amber-600 mt-3 font-medium">
                À vérifier
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <FaClock className="text-amber-600" />
            </div>

          </div>

        </div>

        {/* BLOCKED */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Bloquées
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-2">
                {blocked}
              </p>

              <p className="text-xs text-red-600 mt-3 font-medium">
                Nécessitent une action
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <FaBan className="text-red-600" />
            </div>

          </div>

        </div>

      </div>

      {/* MAIN CARD */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* TOOLBAR */}

        <div className="p-5 sm:p-6 border-b border-gray-100">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-md">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Rechercher une boutique..."
                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition"
              />

            </div>

            {/* FILTER */}

            <div className="flex items-center gap-2 overflow-x-auto pb-1">

              <div className="flex items-center gap-2 mr-2 text-sm text-gray-500 whitespace-nowrap">
                <FaFilter className="text-xs" />
                Filtrer :
              </div>

              <button
                onClick={() =>
                  setStatusFilter("all")
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Toutes
              </button>

              <button
                onClick={() =>
                  setStatusFilter(
                    "active"
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter ===
                  "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Actives
              </button>

              <button
                onClick={() =>
                  setStatusFilter(
                    "pending"
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter ===
                  "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                En attente
              </button>

              <button
                onClick={() =>
                  setStatusFilter(
                    "blocked"
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${statusFilter ===
                  "blocked"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Bloquées
              </button>

            </div>

          </div>

        </div>

        {/* TABLE HEADER */}

        <div className="px-5 sm:px-6 py-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Liste des boutiques
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {filteredBoutiques.length} résultat
              {filteredBoutiques.length !==
                1
                ? "s"
                : ""}
            </p>
          </div>

        </div>

        {/* EMPTY */}

        {filteredBoutiques.length ===
          0 ? (
          <div className="py-20 px-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FaStore className="text-2xl text-gray-400" />
            </div>

            <h3 className="font-semibold text-gray-900">
              Aucune boutique trouvée
            </h3>

            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Aucune boutique ne correspond
              à votre recherche ou à votre
              filtre actuel.
            </p>

            {(search ||
              statusFilter !==
              "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "all"
                    );
                  }}
                  className="mt-5 text-sm font-medium text-gray-900 underline underline-offset-4"
                >
                  Réinitialiser les filtres
                </button>
              )}

          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden lg:block overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-gray-100">

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Boutique
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Contact
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Localisation
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Statut
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Création
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredBoutiques.map(
                    (boutique) => {
                      const statusStyle =
                        getStatusStyle(
                          boutique.status
                        );

                      return (
                        <tr
                          key={
                            boutique.uuid
                          }
                          className="group hover:bg-gray-50/80 transition-colors"
                        >

                          {/* BOUTIQUE */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3.5">

                              {boutique.logo ? (
                                <img
                                  src={
                                    boutique.logo
                                  }
                                  alt={
                                    boutique.nom
                                  }
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                  <FaStore className="text-gray-500" />
                                </div>
                              )}

                              <div className="min-w-0">

                                <p className="font-semibold text-gray-900 truncate max-w-[220px]">
                                  {
                                    boutique.nom
                                  }
                                </p>

                                <p className="text-xs text-gray-400 mt-1 truncate max-w-[220px]">
                                  /{
                                    boutique.slug
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-5">

                            <div className="space-y-1">

                              <p className="text-sm text-gray-700 max-w-[220px] truncate">
                                {
                                  boutique.email ||
                                  "-"
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                {
                                  boutique.telephone ||
                                  "-"
                                }
                              </p>

                            </div>

                          </td>

                          {/* LOCATION */}

                          <td className="px-6 py-5">

                            <p className="text-sm text-gray-700">
                              {
                                boutique.ville ||
                                "-"
                              }
                            </p>

                            {boutique.adresse && (
                              <p className="text-xs text-gray-400 mt-1 max-w-[180px] truncate">
                                {
                                  boutique.adresse
                                }
                              </p>
                            )}

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusStyle.badge}`}
                            >

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {
                                getStatusLabel(
                                  boutique.status
                                )
                              }

                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">

                            <p className="text-sm text-gray-600">
                              {new Date(
                                boutique.created_at
                              ).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>

                          </td>

                          {/* ACTIONS */}

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex justify-end items-center gap-1.5 opacity-80 group-hover:opacity-100">

                              <Link
                                href={`/dashboard/boutiques/${boutique.uuid}`}
                                title="Voir"
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                              >
                                <FaEye className="text-sm" />
                              </Link>

                              <Link
                                href={`/dashboard/boutique/edit/${boutique.uuid}`}
                                title="Modifier"
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition"
                              >
                                <FaEdit className="text-sm" />
                              </Link>

                              {boutique.status === "pending" && (
                                <button
                                  type="button"
                                  title="Activer la boutique"
                                  disabled={actionUuid === boutique.uuid}
                                  onClick={() =>
                                    activateBoutique(boutique)
                                  }
                                  className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-40"
                                >
                                  {actionUuid === boutique.uuid ? (
                                    <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <FaCheckCircle className="text-sm" />
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                title="Supprimer"
                                disabled={
                                  deletingUuid === boutique.uuid
                                }
                                onClick={() =>
                                  deleteBoutique(boutique)
                                }
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition disabled:opacity-40"
                              >
                                <FaTrash className="text-sm" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* MOBILE */}

            <div className="lg:hidden divide-y divide-gray-100">

              {filteredBoutiques.map(
                (boutique) => {
                  const statusStyle =
                    getStatusStyle(
                      boutique.status
                    );

                  return (
                    <div
                      key={
                        boutique.uuid
                      }
                      className="p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3">

                          {boutique.logo ? (
                            <img
                              src={
                                boutique.logo
                              }
                              alt={
                                boutique.nom
                              }
                              className="w-12 h-12 rounded-xl object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                              <FaStore className="text-gray-500" />
                            </div>
                          )}

                          <div className="min-w-0">

                            <h3 className="font-semibold text-gray-900 truncate">
                              {
                                boutique.nom
                              }
                            </h3>

                            <p className="text-xs text-gray-400 mt-1">
                              /{
                                boutique.slug
                              }
                            </p>

                          </div>

                        </div>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusStyle.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {
                            getStatusLabel(
                              boutique.status
                            )
                          }
                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-5">

                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Téléphone
                          </p>

                          <p className="text-sm text-gray-700 truncate">
                            {
                              boutique.telephone ||
                              "-"
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Ville
                          </p>

                          <p className="text-sm text-gray-700 truncate">
                            {
                              boutique.ville ||
                              "-"
                            }
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-1">
                            Email
                          </p>

                          <p className="text-sm text-gray-700 truncate">
                            {
                              boutique.email ||
                              "-"
                            }
                          </p>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">

                        <Link
                          href={`/dashboard/boutiques/${boutique.uuid}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium"
                        >
                          <FaEye />
                          Voir
                        </Link>

                        <Link
                          href={`/dashboard/boutique/edit/${boutique.uuid}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium"
                        >
                          <FaEdit />
                          Modifier
                        </Link>

                        {boutique.status === "pending" && (
                          <button
                            type="button"
                            disabled={actionUuid === boutique.uuid}
                            onClick={() =>
                              activateBoutique(boutique)
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium disabled:opacity-40"
                          >
                            {actionUuid === boutique.uuid ? (
                              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaCheckCircle />
                            )}

                            Activer
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={
                            deletingUuid ===
                            boutique.uuid
                          }
                          onClick={() =>
                            deleteBoutique(
                              boutique
                            )
                          }
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 disabled:opacity-40"
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </>
        )}

      </div>

    </div>
  );
}