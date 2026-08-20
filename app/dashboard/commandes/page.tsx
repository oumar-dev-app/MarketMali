"use client";

import { useEffect, useState } from "react";
import CommandesTable from "../composants/CommandesTable";

interface Commande {
    uuid: string;
    total: string;
    frais_livraison: string;
    status: string;

    adresse_livraison: string | null;
    latitude: string | null;
    longitude: string | null;
    gps_precision: string | null;

    created_at: string;
    updated_at: string;

    boutique: {
        nom: string;
        slug: string;
    };

    client: {
        nom: string;
        prenom: string;
        telephone: string;
        email: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const statusLabels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    preparing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
};

const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    preparing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function CommandesPage() {
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [commentaires, setCommentaires] = useState<
        Record<string, string>
    >({});
    const [page, setPage] = useState(1);

    interface CommandeStatistics {
        total: number;
        pending: number;
        confirmed: number;
        preparing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    }

    const [statistics, setStatistics] =
        useState<CommandeStatistics>({
            total: 0,
            pending: 0,
            confirmed: 0,
            preparing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        });

    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const totalCommandes = pagination.total;

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    /*
    * Chargement des commandes
    */
    useEffect(() => {
        const timeout = setTimeout(() => {
            const fetchCommandes = async () => {
                try {
                    setError("");

                    setRefreshing(true);

                    const token =
                        localStorage.getItem("token");

                    if (!token) {
                        setError(
                            "Vous devez être connecté."
                        );
                        return;
                    }

                    const params =
                        new URLSearchParams();

                    params.set(
                        "page",
                        String(page)
                    );

                    params.set(
                        "limit",
                        "10"
                    );

                    if (search.trim()) {
                        params.set(
                            "search",
                            search.trim()
                        );
                    }

                    if (
                        statusFilter !== "all"
                    ) {
                        params.set(
                            "status",
                            statusFilter
                        );
                    }

                    const response =
                        await fetch(
                            `/api/dashboard/commandes?${params.toString()}`,
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
                        setError(
                            result.message ||
                            "Impossible de récupérer les commandes."
                        );
                        return;
                    }

                    setCommandes(
                        result.data ?? []
                    );

                    if (
                        result.pagination
                    ) {
                        setPagination(
                            result.pagination
                        );
                    }

                    if (
                        result.statistics
                    ) {
                        setStatistics(
                            result.statistics
                        );
                    }

                } catch (error) {

                    console.error(
                        "Erreur chargement commandes :",
                        error
                    );

                    setError(
                        "Une erreur est survenue lors du chargement des commandes."
                    );

                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            };

            fetchCommandes();

        }, 400);

        return () => {
            clearTimeout(timeout);
        };

    }, [
        page,
        search,
        statusFilter
    ]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    /*
    * Recherche + filtre
    */
    const filteredCommandes = commandes.filter((commande) => {
        const client = commande.client;

        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            commande.uuid
                .toLowerCase()
                .includes(searchValue) ||
            (client?.nom ?? "")
                .toLowerCase()
                .includes(searchValue) ||
            (client?.prenom ?? "")
                .toLowerCase()
                .includes(searchValue) ||
            (client?.telephone ?? "").includes(searchValue) ||
            (client?.email ?? "")
                .toLowerCase()
                .includes(searchValue);

        const matchesStatus =
            statusFilter === "all" ||
            commande.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    /*
    * Statistiques
    */
    const pendingCount = statistics.pending;
    const confirmedCount = statistics.confirmed;
    const preparingCount = statistics.preparing;
    const shippedCount = statistics.shipped;
    const deliveredCount = statistics.delivered;
    const cancelledCount = statistics.cancelled;

    /*
    * Modifier le statut
    */
    const updateStatus = async (
        uuid: string,
        status: string
    ) => {
        try {
            setActionLoading(uuid);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const commentaire =
                commentaires[uuid]?.trim() || null;

            const response = await fetch(
                `/api/dashboard/commandes/uuid/${uuid}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                        commentaire,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                    "Impossible de modifier le statut."
                );
                return;
            }

            setCommandes((prev) =>
                prev.map((commande) =>
                    commande.uuid === uuid
                        ? {
                            ...commande,
                            status,
                        }
                        : commande
                )
            );

            setCommentaires((prev) => ({
                ...prev,
                [uuid]: "",
            }));

            setSuccess(
                "Le statut de la commande a été mis à jour."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur modification statut :",
                error
            );

            setError(
                "Une erreur est survenue lors de la modification du statut."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /*
    * Supprimer une commande
    */
    const deleteCommande = async (
        uuid: string
    ) => {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cette commande ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            setActionLoading(uuid);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `/api/dashboard/commandes/uuid/${uuid}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                    "Impossible de supprimer la commande."
                );
                return;
            }

            setCommandes((prev) =>
                prev.filter(
                    (commande) =>
                        commande.uuid !== uuid
                )
            );

            setSuccess(
                "La commande a été supprimée avec succès."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur suppression commande :",
                error
            );

            setError(
                "Une erreur est survenue lors de la suppression."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /*
    * Réinitialiser les filtres
    */
    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setPage(1);
    };

    /*
    * Chargement
    */
    if (loading) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-2xl bg-gray-100"
                            />
                        )
                    )}
                </div>

                <div className="mt-6 h-96 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        );
    }



    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Gestion des commandes
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Consultez et gérez les commandes de votre
                    boutique.
                </p>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Statistiques */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalCommandes}
                    </p>
                </div>

                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 shadow-sm">
                    <p className="text-sm text-yellow-700">
                        En attente
                    </p>

                    <p className="mt-2 text-2xl font-bold text-yellow-800">
                        {pendingCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
                    <p className="text-sm text-blue-700">
                        Confirmées
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-800">
                        {confirmedCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
                    <p className="text-sm text-indigo-700">
                        Préparation
                    </p>

                    <p className="mt-2 text-2xl font-bold text-indigo-800">
                        {preparingCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 shadow-sm">
                    <p className="text-sm text-purple-700">
                        Expédiées
                    </p>

                    <p className="mt-2 text-2xl font-bold text-purple-800">
                        {shippedCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm">
                    <p className="text-sm text-green-700">
                        Livrées
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-800">
                        {deliveredCount}
                    </p>
                </div>
            </div>

            {/* Commandes annulées */}
            {cancelledCount > 0 && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {cancelledCount} commande
                    {cancelledCount > 1 ? "s" : ""} annulée
                    {cancelledCount > 1 ? "s" : ""}.
                </div>
            )}

            {/* Recherche et filtre */}
            <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Rechercher
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="UUID, nom, prénom, téléphone ou email..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="w-full lg:w-56">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Statut
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">
                                Tous les statuts
                            </option>

                            {Object.entries(
                                statusLabels
                            ).map(
                                ([value, label]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Réinitialiser
                    </button>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {filteredCommandes.length} commande
                        {filteredCommandes.length > 1
                            ? "s"
                            : ""}{" "}
                        affichée
                        {filteredCommandes.length > 1
                            ? "s"
                            : ""}
                    </span>

                    {statusFilter !== "all" && (
                        <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusColors[
                                statusFilter
                            ] ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                                }`}
                        >
                            {statusLabels[
                                statusFilter
                            ] || statusFilter}
                        </span>
                    )}
                </div>
            </div>

            {refreshing && (
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    Actualisation...
                </div>
            )}

            {/* Tableau */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <CommandesTable
                        commandes={filteredCommandes}
                        commentaires={commentaires}
                        setCommentaires={
                            setCommentaires
                        }
                        updateStatus={
                            updateStatus
                        }
                        deleteCommande={
                            deleteCommande
                        }
                    />
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                    {pagination.total > 0
                        ? `Total : ${pagination.total} commande${pagination.total > 1
                            ? "s"
                            : ""
                        }`
                        : "Aucune commande"}
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                            setPage(
                                (prev) =>
                                    prev - 1
                            )
                        }
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Précédent
                    </button>

                    <span className="min-w-20 text-center text-sm font-semibold text-gray-700">
                        Page{" "}
                        {pagination.page} /{" "}
                        {pagination.totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={
                            pagination.totalPages ===
                            0 ||
                            page >=
                            pagination.totalPages
                        }
                        onClick={() =>
                            setPage(
                                (prev) =>
                                    prev + 1
                            )
                        }
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Suivant
                    </button>
                </div>
            </div>

            {/* Indication action en cours */}
            {actionLoading && (
                <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
                    Traitement en cours...
                </div>
            )}
        </div>
    );
}

