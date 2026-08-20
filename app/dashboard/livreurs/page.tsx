"use client";

import { useEffect, useMemo, useState } from "react";

interface Livreur {
    id: number;
    uuid: string;
    boutique_id: number;
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string | null;
    status: "active" | "inactive" | "suspended";
    disponibilite: "available" | "unavailable";
    created_at: string;
    updated_at: string;
}

interface LivreurForm {
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string;
}

const statusLabels: Record<string, string> = {
    active: "Actif",
    inactive: "Inactif",
    suspended: "Suspendu",
};

const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-gray-50 text-gray-700 border-gray-200",
    suspended: "bg-red-50 text-red-700 border-red-200",
};

export default function LivreursPage() {
    const [livreurs, setLivreurs] = useState<Livreur[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] =
        useState("all");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingLivreur, setEditingLivreur] =
        useState<Livreur | null>(null);

    const [form, setForm] = useState<LivreurForm>({
        nom: "",
        prenom: "",
        telephone: "",
        vehicule: "",
    });

    const [actionLoading, setActionLoading] =
        useState<string | null>(null);

    const [saving, setSaving] = useState(false);

    /*
     * Charger les livreurs
     */
    const fetchLivreurs = async () => {
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

            const response = await fetch(
                "/api/dashboard/livreurs",
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
                    "Impossible de récupérer les livreurs."
                );
                return;
            }

            setLivreurs(
                result.data ?? []
            );
        } catch (error) {
            console.error(
                "Erreur chargement livreurs :",
                error
            );

            setError(
                "Une erreur est survenue lors du chargement des livreurs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLivreurs();
    }, []);

    /*
     * Filtrage
     */
    const filteredLivreurs =
        useMemo(() => {
            const value =
                search
                    .toLowerCase()
                    .trim();

            return livreurs.filter(
                (livreur) => {
                    const matchesSearch =
                        !value ||
                        livreur.nom
                            .toLowerCase()
                            .includes(value) ||
                        livreur.prenom
                            .toLowerCase()
                            .includes(value) ||
                        livreur.telephone
                            .toLowerCase()
                            .includes(value) ||
                        (
                            livreur.vehicule ??
                            ""
                        )
                            .toLowerCase()
                            .includes(value);

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        livreur.status ===
                            statusFilter;

                    const matchesAvailability =
                        availabilityFilter ===
                            "all" ||
                        livreur.disponibilite ===
                            availabilityFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesAvailability
                    );
                }
            );
        }, [
            livreurs,
            search,
            statusFilter,
            availabilityFilter,
        ]);

    /*
     * Statistiques
     */
    const totalLivreurs =
        livreurs.length;

    const availableCount =
        livreurs.filter(
            (livreur) =>
                livreur.status ===
                    "active" &&
                livreur.disponibilite ===
                    "available"
        ).length;

    const unavailableCount =
        livreurs.filter(
            (livreur) =>
                livreur.disponibilite ===
                "unavailable"
        ).length;

    const inactiveCount =
        livreurs.filter(
            (livreur) =>
                livreur.status !==
                "active"
        ).length;

    /*
     * Ouvrir le formulaire de création
     */
    const openCreateModal = () => {
        setEditingLivreur(null);

        setForm({
            nom: "",
            prenom: "",
            telephone: "",
            vehicule: "",
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    /*
     * Ouvrir le formulaire de modification
     */
    const openEditModal = (
        livreur: Livreur
    ) => {
        setEditingLivreur(
            livreur
        );

        setForm({
            nom: livreur.nom,
            prenom: livreur.prenom,
            telephone:
                livreur.telephone,
            vehicule:
                livreur.vehicule ?? "",
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    /*
     * Fermer modal
     */
    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingLivreur(null);
    };

    /*
     * Enregistrer
     */
    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Vous devez être connecté."
                );
                return;
            }

            const payload = {
                nom: form.nom.trim(),
                prenom:
                    form.prenom.trim(),
                telephone:
                    form.telephone.trim(),
                vehicule:
                    form.vehicule.trim() ||
                    null,
            };

            if (
                !payload.nom ||
                !payload.prenom ||
                !payload.telephone
            ) {
                setError(
                    "Le nom, le prénom et le téléphone sont obligatoires."
                );
                return;
            }

            let response: Response;

            if (editingLivreur) {
                response = await fetch(
                    `/api/dashboard/livreurs/${editingLivreur.uuid}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );
            } else {
                /*
                 * Le backend détermine déjà
                 * la boutique de l'utilisateur.
                 *
                 * Mais l'API POST actuelle attend
                 * boutique_id.
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
                    setError(
                        boutiqueResult.message ||
                        "Impossible de récupérer votre boutique."
                    );
                    return;
                }

                const boutique =
                    boutiqueResult.data;

                response = await fetch(
                    "/api/dashboard/livreurs",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                boutique_id:
                                    boutique.id,
                                ...payload,
                            }),
                    }
                );
            }

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                setError(
                    result.message ||
                    "Impossible d'enregistrer le livreur."
                );
                return;
            }

            setShowModal(false);
            setEditingLivreur(null);

            setSuccess(
                editingLivreur
                    ? "Livreur modifié avec succès."
                    : "Livreur créé avec succès."
            );

            await fetchLivreurs();

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur enregistrement livreur :",
                error
            );

            setError(
                "Une erreur est survenue lors de l'enregistrement."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * Modifier disponibilité
     */
    const toggleAvailability = async (
        livreur: Livreur
    ) => {
        const next =
            livreur.disponibilite ===
                "available"
                ? "unavailable"
                : "available";

        if (
            next === "available" &&
            livreur.status !== "active"
        ) {
            setError(
                "Un livreur inactif ou suspendu ne peut pas être disponible."
            );
            return;
        }

        try {
            setActionLoading(
                livreur.uuid
            );

            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response =
                await fetch(
                    `/api/dashboard/livreurs/${livreur.uuid}/disponibilite`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                disponibilite:
                                    next,
                            }),
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
                    "Impossible de modifier la disponibilité."
                );
                return;
            }

            setLivreurs(
                (prev) =>
                    prev.map(
                        (item) =>
                            item.uuid ===
                            livreur.uuid
                                ? {
                                      ...item,
                                      disponibilite:
                                          next,
                                  }
                                : item
                    )
            );

            setSuccess(
                next === "available"
                    ? "Livreur rendu disponible."
                    : "Livreur rendu indisponible."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur disponibilité :",
                error
            );

            setError(
                "Une erreur est survenue lors de la modification de la disponibilité."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /*
     * Modifier statut
     *
     * Nous utilisons PUT afin de centraliser
     * la règle métier dans LivreurService.
     */
    const updateStatus = async (
        livreur: Livreur,
        status:
            | "active"
            | "inactive"
            | "suspended"
    ) => {
        try {
            setActionLoading(
                livreur.uuid
            );

            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response =
                await fetch(
                    `/api/dashboard/livreurs/${livreur.uuid}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                status,
                            }),
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
                    "Impossible de modifier le statut."
                );
                return;
            }

            await fetchLivreurs();

            setSuccess(
                "Statut du livreur mis à jour."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur statut livreur :",
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
     * Supprimer
     */
    const deleteLivreur = async (
        livreur: Livreur
    ) => {
        const confirmation =
            window.confirm(
                `Voulez-vous vraiment supprimer le livreur ${livreur.prenom} ${livreur.nom} ?`
            );

        if (!confirmation) {
            return;
        }

        try {
            setActionLoading(
                livreur.uuid
            );

            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response =
                await fetch(
                    `/api/dashboard/livreurs/${livreur.uuid}`,
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
                setError(
                    result.message ||
                    "Impossible de supprimer le livreur."
                );
                return;
            }

            setLivreurs(
                (prev) =>
                    prev.filter(
                        (item) =>
                            item.uuid !==
                            livreur.uuid
                    )
            );

            setSuccess(
                "Livreur supprimé avec succès."
            );

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(
                "Erreur suppression livreur :",
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
     * Loading
     */
    if (loading) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
                    <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({
                        length: 4,
                    }).map(
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestion des livreurs
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Gérez les livreurs de votre boutique.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    + Ajouter un livreur
                </button>

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
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total livreurs
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {totalLivreurs}
                    </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm">
                    <p className="text-sm text-green-700">
                        Disponibles
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-800">
                        {availableCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 shadow-sm">
                    <p className="text-sm text-yellow-700">
                        Indisponibles
                    </p>

                    <p className="mt-2 text-2xl font-bold text-yellow-800">
                        {unavailableCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
                    <p className="text-sm text-red-700">
                        Inactifs / suspendus
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-800">
                        {inactiveCount}
                    </p>
                </div>

            </div>

            {/* Filtres */}
            <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">

                <div className="grid gap-4 lg:grid-cols-3">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Rechercher
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Nom, prénom, téléphone ou véhicule..."
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
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

                            <option value="active">
                                Actifs
                            </option>

                            <option value="inactive">
                                Inactifs
                            </option>

                            <option value="suspended">
                                Suspendus
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Disponibilité
                        </label>

                        <select
                            value={
                                availabilityFilter
                            }
                            onChange={(e) =>
                                setAvailabilityFilter(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">
                                Toutes
                            </option>

                            <option value="available">
                                Disponibles
                            </option>

                            <option value="unavailable">
                                Indisponibles
                            </option>
                        </select>
                    </div>

                </div>

                <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    {filteredLivreurs.length} livreur
                    {filteredLivreurs.length >
                    1
                        ? "s"
                        : ""}{" "}
                    affiché
                    {filteredLivreurs.length >
                    1
                        ? "s"
                        : ""}
                </div>

            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-225 text-left">

                        <thead className="border-b border-gray-100 bg-gray-50">
                            <tr>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Livreur
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Téléphone
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Véhicule
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Statut
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Disponibilité
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {filteredLivreurs.length ===
                            0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <p className="text-sm font-medium text-gray-700">
                                            Aucun livreur trouvé.
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Ajoutez un livreur ou modifiez vos filtres.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLivreurs.map(
                                    (livreur) => (
                                        <tr
                                            key={
                                                livreur.uuid
                                            }
                                            className="transition hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            livreur.prenom
                                                        }{" "}
                                                        {
                                                            livreur.nom
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {
                                                            livreur.uuid
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {
                                                    livreur.telephone
                                                }
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {
                                                    livreur.vehicule ||
                                                    "—"
                                                }
                                            </td>

                                            <td className="px-5 py-4">

                                                <select
                                                    value={
                                                        livreur.status
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        livreur.uuid
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateStatus(
                                                            livreur,
                                                            e
                                                                .target
                                                                .value as
                                                                | "active"
                                                                | "inactive"
                                                                | "suspended"
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none ${statusColors[
                                                        livreur.status
                                                    ]}`}
                                                >

                                                    {Object.entries(
                                                        statusLabels
                                                    ).map(
                                                        ([
                                                            value,
                                                            label,
                                                        ]) => (
                                                            <option
                                                                key={
                                                                    value
                                                                }
                                                                value={
                                                                    value
                                                                }
                                                            >
                                                                {
                                                                    label
                                                                }
                                                            </option>
                                                        )
                                                    )}

                                                </select>

                                            </td>

                                            <td className="px-5 py-4">

                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading ===
                                                        livreur.uuid
                                                    }
                                                    onClick={() =>
                                                        toggleAvailability(
                                                            livreur
                                                        )
                                                    }
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        livreur.disponibilite ===
                                                        "available"
                                                            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {livreur.disponibilite ===
                                                    "available"
                                                        ? "Disponible"
                                                        : "Indisponible"}
                                                </button>

                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                livreur
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionLoading ===
                                                            livreur.uuid
                                                        }
                                                        onClick={() =>
                                                            deleteLivreur(
                                                                livreur
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Supprimer
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingLivreur
                                        ? "Modifier le livreur"
                                        : "Ajouter un livreur"}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Renseignez les informations du livreur.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="p-5"
                        >

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Nom *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.nom
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    nom: e
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Prénom *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.prenom
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    prenom: e
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Téléphone *
                                    </label>

                                    <input
                                        type="tel"
                                        value={
                                            form.telephone
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    telephone:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Véhicule
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.vehicule
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    vehicule:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Ex : Moto"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                            </div>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Enregistrement..."
                                        : editingLivreur
                                        ? "Enregistrer"
                                        : "Créer le livreur"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* Action en cours */}
            {actionLoading && (
                <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
                    Traitement en cours...
                </div>
            )}

        </div>
    );
}