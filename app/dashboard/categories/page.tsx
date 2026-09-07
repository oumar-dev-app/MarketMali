"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    AlertCircle,
    Check,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    MoreVertical,
    Plus,
    RefreshCw,
    RotateCcw,
    Search,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface Categorie {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
    image?: string | null;
    status: string;
    created_at: string;
}

type StatusFilter = "all" | "active" | "blocked";

const statusLabels: Record<
    "active" | "blocked",
    string
> = {
    active: "Active",
    blocked: "Bloquée",
};

const statusClasses: Record<
    "active" | "blocked",
    string
> = {
    active:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    blocked:
        "border-red-200 bg-red-50 text-red-700",
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");

    const fetchCategories = useCallback(async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Session expirée.");
            }

            const response = await fetch(
                "/api/dashboard/categories",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ??
                    "Impossible de récupérer les catégories."
                );
            }

            setCategories(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const blockCategorie = async (
        uuid: string
    ) => {
        if (processing) return;

        const confirmation = window.confirm(
            "Voulez-vous désactiver cette catégorie ?"
        );

        if (!confirmation) return;

        setProcessing(uuid);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Session expirée.");
            }

            const response = await fetch(
                `/api/dashboard/categories/uuid/${uuid}`,
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
                    result.message ??
                    "Impossible de bloquer la catégorie."
                );
            }

            toast.success(
                "Catégorie bloquée avec succès."
            );

            await fetchCategories();
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setProcessing(null);
        }
    };

    const unblockCategorie = async (
        uuid: string
    ) => {
        if (processing) return;

        const confirmation = window.confirm(
            "Voulez-vous réactiver cette catégorie ?"
        );

        if (!confirmation) return;

        setProcessing(uuid);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Session expirée.");
            }

            const response = await fetch(
                `/api/dashboard/categories/uuid/${uuid}/unblock`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ??
                    "Impossible de réactiver la catégorie."
                );
            }

            toast.success(
                "Catégorie réactivée avec succès."
            );

            await fetchCategories();
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setProcessing(null);
        }
    };

    const filteredCategories = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return categories.filter((categorie) => {
            const matchesSearch =
                !normalizedSearch ||
                categorie.nom
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                categorie.slug
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                (
                    categorie.description ?? ""
                )
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                categorie.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [categories, search, statusFilter]);

    const totalCount = categories.length;

    const activeCount = categories.filter(
        (categorie) =>
            categorie.status === "active"
    ).length;

    const blockedCount = categories.filter(
        (categorie) =>
            categorie.status === "blocked"
    ).length;

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
    };

    const hasFilters =
        search.trim() !== "" ||
        statusFilter !== "all";

    const formatDate = (date: string) => {
        try {
            return new Intl.DateTimeFormat(
                "fr-FR",
                {
                    dateStyle: "medium",
                }
            ).format(new Date(date));
        } catch {
            return date;
        }
    };

    return (
        <div className="min-h-full space-y-6">
            {/* =====================================================
          EN-TÊTE
      ====================================================== */}

            <section
                className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-5
          shadow-sm
          sm:p-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
            >
                <div className="flex items-start gap-4">
                    <div
                        className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-blue-600
            "
                    >
                        <FolderOpen size={23} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1
                                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-gray-900
                  sm:text-2xl
                "
                            >
                                Catégories
                            </h1>

                            {!loading && (
                                <span
                                    className="
                    rounded-full
                    bg-gray-100
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-gray-600
                  "
                                >
                                    {totalCount}
                                </span>
                            )}
                        </div>

                        <p
                            className="
                mt-1
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
              "
                        >
                            Organisez les produits de votre
                            boutique grâce à des catégories
                            claires et faciles à gérer.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={fetchCategories}
                        disabled={loading}
                        className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:border-gray-300
              hover:bg-gray-50
              focus:outline-none
              focus:ring-4
              focus:ring-blue-500/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Actualiser
                    </button>

                    <Link
                        href="/dashboard/categories/create"
                        className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gray-900
              px-4
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-gray-800
              hover:shadow
              focus:outline-none
              focus:ring-4
              focus:ring-gray-900/10
            "
                    >
                        <Plus size={17} />

                        Nouvelle catégorie
                    </Link>
                </div>
            </section>

            {/* =====================================================
          STATISTIQUES
      ====================================================== */}

            <div
                className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
            >
                <CategoryStatCard
                    label="Total"
                    value={totalCount}
                    icon={<FolderOpen size={20} />}
                    active={statusFilter === "all"}
                    onClick={() =>
                        setStatusFilter("all")
                    }
                    color="blue"
                />

                <CategoryStatCard
                    label="Actives"
                    value={activeCount}
                    icon={<Check size={20} />}
                    active={statusFilter === "active"}
                    onClick={() =>
                        setStatusFilter("active")
                    }
                    color="green"
                />

                <CategoryStatCard
                    label="Bloquées"
                    value={blockedCount}
                    icon={<AlertCircle size={20} />}
                    active={statusFilter === "blocked"}
                    onClick={() =>
                        setStatusFilter("blocked")
                    }
                    color="red"
                />
            </div>

            {/* =====================================================
          FILTRES
      ====================================================== */}

            <section
                className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-4
          shadow-sm
          sm:p-5
        "
            >
                <div
                    className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-end
            xl:justify-between
          "
                >
                    <div className="min-w-0">
                        <div
                            className="
                flex
                items-center
                gap-2
                text-sm
                font-bold
                text-gray-900
              "
                        >
                            <Search
                                size={16}
                                className="text-gray-400"
                            />

                            Rechercher une catégorie
                        </div>

                        <p
                            className="
                mt-1
                text-xs
                text-gray-400
              "
                        >
                            Recherchez par nom, slug ou
                            description.
                        </p>
                    </div>

                    <div
                        className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
            "
                    >
                        <div className="relative">
                            <Search
                                size={17}
                                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Nom, slug..."
                                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  pl-10
                  pr-10
                  text-sm
                  font-medium
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  hover:border-gray-300
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  sm:w-[260px]
                "
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                    absolute
                    right-2.5
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    p-1.5
                    text-gray-400
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                                    aria-label="Effacer la recherche"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as StatusFilter
                                )
                            }
                            className="
                h-11
                min-w-[170px]
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-medium
                text-gray-700
                outline-none
                transition
                hover:border-gray-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
                        >
                            <option value="all">
                                Tous les statuts
                            </option>

                            <option value="active">
                                Actives
                            </option>

                            <option value="blocked">
                                Bloquées
                            </option>
                        </select>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-gray-600
                  transition
                  hover:bg-gray-50
                  hover:text-gray-900
                "
                            >
                                <RotateCcw size={15} />

                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
          RÉSULTATS
      ====================================================== */}

            <div
                className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
            >
                <div>
                    <h2
                        className="
              text-base
              font-bold
              text-gray-900
            "
                    >
                        Liste des catégories
                    </h2>

                    <p
                        className="
              mt-0.5
              text-xs
              text-gray-500
            "
                    >
                        {loading
                            ? "Chargement..."
                            : `${filteredCategories.length} résultat${filteredCategories.length > 1
                                ? "s"
                                : ""
                            } affiché${filteredCategories.length > 1
                                ? "s"
                                : ""
                            }`}
                    </p>
                </div>
            </div>

            {/* =====================================================
          CONTENU
      ====================================================== */}

            <section
                className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
        "
            >
                {loading ? (
                    <LoadingState />
                ) : filteredCategories.length === 0 ? (
                    <EmptyState
                        hasFilters={hasFilters}
                        onReset={resetFilters}
                    />
                ) : (
                    <>
                        {/* =================================================
                DESKTOP
            ================================================== */}

                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[950px]">
                                <thead>
                                    <tr
                                        className="
                      border-b
                      border-gray-200
                      bg-gray-50/80
                    "
                                    >
                                        <th
                                            className="
                        px-5
                        py-4
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Catégorie
                                        </th>

                                        <th
                                            className="
                        px-5
                        py-4
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Slug
                                        </th>

                                        <th
                                            className="
                        px-5
                        py-4
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Description
                                        </th>

                                        <th
                                            className="
                        px-5
                        py-4
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Statut
                                        </th>

                                        <th
                                            className="
                        px-5
                        py-4
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Créée le
                                        </th>

                                        <th
                                            className="
                        px-5
                        py-4
                        text-right
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                      "
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredCategories.map(
                                        (categorie) => {
                                            const isProcessing =
                                                processing ===
                                                categorie.uuid;

                                            return (
                                                <tr
                                                    key={categorie.uuid}
                                                    className="
                            group
                            transition-colors
                            hover:bg-gray-50/70
                          "
                                                >
                                                    {/* Catégorie */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <CategoryImage
                                                                image={categorie.image}
                                                                name={categorie.nom}
                                                            />

                                                            <div className="min-w-0">
                                                                <p
                                                                    className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                  "
                                                                >
                                                                    {categorie.nom}
                                                                </p>

                                                                <p
                                                                    className="
                                    mt-0.5
                                    text-xs
                                    text-gray-400
                                  "
                                                                >
                                                                    Catégorie
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Slug */}

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className="
                                rounded-lg
                                bg-gray-50
                                px-2.5
                                py-1.5
                                font-mono
                                text-xs
                                text-gray-600
                              "
                                                        >
                                                            {categorie.slug}
                                                        </span>
                                                    </td>

                                                    {/* Description */}

                                                    <td className="max-w-[300px] px-5 py-4">
                                                        <p
                                                            className="
                                truncate
                                text-sm
                                text-gray-600
                              "
                                                            title={
                                                                categorie.description ??
                                                                ""
                                                            }
                                                        >
                                                            {categorie.description ||
                                                                "Aucune description"}
                                                        </p>
                                                    </td>

                                                    {/* Statut */}

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                categorie.status
                                                            }
                                                        />
                                                    </td>

                                                    {/* Date */}

                                                    <td
                                                        className="
                              whitespace-nowrap
                              px-5
                              py-4
                              text-sm
                              text-gray-500
                            "
                                                    >
                                                        {formatDate(
                                                            categorie.created_at
                                                        )}
                                                    </td>

                                                    {/* Actions */}

                                                    <td className="px-5 py-4">
                                                        <div className="relative flex justify-end">
                                                            <details className="group relative">
                                                                <summary
                                                                    className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg
        border border-gray-200 bg-white text-gray-600 transition
        hover:bg-gray-50 hover:text-gray-900
        [&::-webkit-details-marker]:hidden"
                                                                    title="Actions"
                                                                >
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </summary>

                                                                <div
                                                                    className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border
        border-gray-200 bg-white py-1 shadow-xl"
                                                                >
                                                                    <Link
                                                                        href={`/dashboard/categories/edit/${categorie.uuid}`}
                                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
          hover:bg-gray-50"
                                                                    >
                                                                        <FolderOpen className="h-4 w-4" />
                                                                        Modifier
                                                                    </Link>

                                                                    {categorie.status === "active" ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => blockCategorie(categorie.uuid)}
                                                                            disabled={processing === categorie.uuid}
                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm
            text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                        >
                                                                            {processing === categorie.uuid? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <X className="h-4 w-4" />
                                                                            )}
                                                                            Désactiver
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => unblockCategorie(categorie.uuid)}
                                                                            disabled={processing === categorie.uuid}
                                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm
            text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                                        >
                                                                            {processing === categorie.uuid? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <Check className="h-4 w-4" />
                                                                            )}
                                                                            Réactiver
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </details>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
    MOBILE / TABLET
================================================== */}
                        <div className="divide-y divide-gray-100 lg:hidden">
                            {filteredCategories.map((categorie) => {
                                const isProcessing =
                                    processing === categorie.uuid;

                                return (
                                    <div
                                        key={categorie.uuid}
                                        className="
                    relative
                    p-4
                    transition-colors
                    hover:bg-gray-50/70
                    sm:p-5
                "
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Image */}
                                            <CategoryImage
                                                image={categorie.image}
                                                name={categorie.nom}
                                            />

                                            {/* Informations */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3
                                                            className="
                                        truncate
                                        text-sm
                                        font-bold
                                        text-gray-900
                                    "
                                                        >
                                                            {categorie.nom}
                                                        </h3>

                                                        <p
                                                            className="
                                        mt-1
                                        truncate
                                        font-mono
                                        text-xs
                                        text-gray-400
                                    "
                                                        >
                                                            {categorie.slug}
                                                        </p>
                                                    </div>

                                                    {/* Menu actions */}
                                                    <div className="relative shrink-0">
                                                        <details className="group relative">
                                                            <summary
                                                                className="
                                            flex
                                            h-9
                                            w-9
                                            cursor-pointer
                                            list-none
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            text-gray-600
                                            transition
                                            hover:bg-gray-50
                                            hover:text-gray-900
                                            [&::-webkit-details-marker]:hidden
                                        "
                                                                title="Actions"
                                                            >
                                                                <MoreVertical className="h-5 w-5" />
                                                            </summary>

                                                            <div
                                                                className="
                                            absolute
                                            right-0
                                            z-30
                                            mt-2
                                            w-48
                                            overflow-hidden
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-white
                                            py-1
                                            shadow-xl
                                        "
                                                            >
                                                                <Link
                                                                    href={`/dashboard/categories/edit/${categorie.uuid}`}
                                                                    className="
                                                flex
                                                items-center
                                                gap-3
                                                px-4
                                                py-2.5
                                                text-sm
                                                text-gray-700
                                                transition
                                                hover:bg-gray-50
                                            "
                                                                >
                                                                    <FolderOpen className="h-4 w-4" />
                                                                    Modifier
                                                                </Link>

                                                                {categorie.status === "active" ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            blockCategorie(
                                                                                categorie.uuid
                                                                            )
                                                                        }
                                                                        disabled={isProcessing}
                                                                        className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    px-4
                                                    py-2.5
                                                    text-sm
                                                    text-red-600
                                                    transition
                                                    hover:bg-red-50
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                                                    >
                                                                        {isProcessing ? (
                                                                            <Loader2
                                                                                className="h-4 w-4 animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <X className="h-4 w-4" />
                                                                        )}

                                                                        Désactiver
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            unblockCategorie(
                                                                                categorie.uuid
                                                                            )
                                                                        }
                                                                        disabled={isProcessing}
                                                                        className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    px-4
                                                    py-2.5
                                                    text-sm
                                                    text-emerald-600
                                                    transition
                                                    hover:bg-emerald-50
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                                                    >
                                                                        {isProcessing ? (
                                                                            <Loader2
                                                                                className="h-4 w-4 animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <Check className="h-4 w-4" />
                                                                        )}

                                                                        Réactiver
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </details>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p
                                                    className="
                                mt-3
                                line-clamp-2
                                text-sm
                                leading-5
                                text-gray-500
                            "
                                                >
                                                    {categorie.description ||
                                                        "Aucune description"}
                                                </p>

                                                {/* Statut + date */}
                                                <div
                                                    className="
                                mt-3
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                                                >
                                                    <StatusBadge
                                                        status={categorie.status}
                                                    />

                                                    <span className="text-xs text-gray-400">
                                                        •
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(
                                                            categorie.created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

/*
 * =========================================================
 * IMAGE CATÉGORIE
 * =========================================================
 */

function CategoryImage({
    image,
    name,
    large = false,
}: {
    image?: string | null;
    name: string;
    large?: boolean;
}) {
    const initials = name
        .trim()
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={`
        relative
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-gray-100
        bg-gray-50
        text-gray-400
        ${large
                    ? "h-14 w-14"
                    : "h-11 w-11"
                }
      `}
        >
            {image ? (
                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display =
                            "none";
                    }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <ImageIcon
                        size={large ? 19 : 16}
                    />

                    <span
                        className="
              mt-0.5
              text-[9px]
              font-bold
              text-gray-400
            "
                    >
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
}

/*
 * =========================================================
 * BADGE STATUT
 * =========================================================
 */

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const normalizedStatus =
        status === "active" ||
            status === "blocked"
            ? status
            : null;

    if (!normalizedStatus) {
        return (
            <span
                className="
          inline-flex
          items-center
          rounded-full
          border
          border-gray-200
          bg-gray-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-gray-600
        "
            >
                <span
                    className="
            mr-1.5
            h-1.5
            w-1.5
            rounded-full
            bg-current
          "
                />

                {status}
            </span>
        );
    }

    return (
        <span
            className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        ${statusClasses[normalizedStatus]}
      `}
        >
            <span
                className="
          mr-1.5
          h-1.5
          w-1.5
          rounded-full
          bg-current
        "
            />

            {statusLabels[normalizedStatus]}
        </span>
    );
}

/*
 * =========================================================
 * CARTE STATISTIQUE
 * =========================================================
 */

function CategoryStatCard({
    label,
    value,
    icon,
    color,
    active,
    onClick,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "green" | "red";
    active: boolean;
    onClick: () => void;
}) {
    const colors = {
        blue: {
            icon: "bg-blue-50 text-blue-600",
            border: "border-blue-200",
            active:
                "border-blue-400 ring-2 ring-blue-500/15",
            value: "text-blue-700",
        },

        green: {
            icon: "bg-emerald-50 text-emerald-600",
            border: "border-emerald-200",
            active:
                "border-emerald-400 ring-2 ring-emerald-500/15",
            value: "text-emerald-700",
        },

        red: {
            icon: "bg-red-50 text-red-600",
            border: "border-red-200",
            active:
                "border-red-400 ring-2 ring-red-500/15",
            value: "text-red-700",
        },
    };

    const styles = colors[color];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        bg-white
        p-4
        text-left
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/20
        sm:p-5
        ${styles.border}
        ${active ? styles.active : ""}
      `}
        >
            <span
                className={`
          absolute
          left-0
          top-0
          h-1
          w-full
          origin-left
          transition-transform
          duration-200
          ${active
                        ? "scale-x-100 bg-current"
                        : "scale-x-0"
                    }
        `}
            />

            <div
                className="
          flex
          items-start
          justify-between
          gap-3
        "
            >
                <div>
                    <p
                        className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-gray-500
            "
                    >
                        {label}
                    </p>

                    <p
                        className={`
              mt-2
              text-3xl
              font-bold
              tracking-tight
              ${styles.value}
            `}
                    >
                        {value}
                    </p>

                    <p
                        className="
              mt-1
              text-xs
              text-gray-400
            "
                    >
                        catégories
                    </p>
                </div>

                <div
                    className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            transition-transform
            duration-200
            group-hover:scale-105
            ${styles.icon}
          `}
                >
                    {icon}
                </div>
            </div>
        </button>
    );
}

/*
 * =========================================================
 * LOADING
 * =========================================================
 */

function LoadingState() {
    return (
        <div
            className="
        flex
        min-h-[360px]
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
        >
            <div
                className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-blue-600
        "
            >
                <Loader2
                    size={23}
                    className="animate-spin"
                />
            </div>

            <p
                className="
          mt-4
          text-sm
          font-semibold
          text-gray-700
        "
            >
                Chargement des catégories...
            </p>

            <p
                className="
          mt-1
          text-xs
          text-gray-400
        "
            >
                Veuillez patienter quelques instants.
            </p>
        </div>
    );
}

/*
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div
            className="
        flex
        min-h-[360px]
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
        >
            <div
                className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
          text-gray-400
        "
            >
                <FolderOpen size={28} />
            </div>

            <h3
                className="
          mt-5
          text-base
          font-bold
          text-gray-900
        "
            >
                {hasFilters
                    ? "Aucune catégorie trouvée"
                    : "Aucune catégorie"}
            </h3>

            <p
                className="
          mt-1
          max-w-md
          text-sm
          leading-6
          text-gray-500
        "
            >
                {hasFilters
                    ? "Aucune catégorie ne correspond aux filtres ou à la recherche sélectionnée."
                    : "Commencez par créer votre première catégorie pour organiser vos produits."}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {hasFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-50
            "
                    >
                        <RotateCcw size={15} />

                        Réinitialiser
                    </button>
                )}

                <Link
                    href="/dashboard/categories/create"
                    className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gray-900
            px-4
            py-2.5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-gray-800
          "
                >
                    <Plus size={15} />

                    Ajouter une catégorie
                </Link>
            </div>
        </div>
    );
}