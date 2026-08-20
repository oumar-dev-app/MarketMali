"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    Clock,
    MapPin,
    Package,
    Store,
    Truck,
    User,
    XCircle,
} from "lucide-react";

import { toast } from "sonner";

interface Produit {
    id: number;
    nom: string;
    quantite: number;
    prix: string;
    sous_total: string;
    image: string | null;
}

interface Client {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
}

interface Boutique {
    nom: string;
    slug: string;
}

interface HistoriqueStatut {
    id: number;
    status: string;
    commentaire: string | null;
    created_at: string;
}

interface Commande {
    uuid: string;
    total: string;
    frais_livraison: string | number;
    status: string;
    created_at: string;
    updated_at: string;

    adresse_livraison?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    gps_precision?: number | null;

    boutique: Boutique;
    client?: Client;
    livreur?: Livreur | null;
    produits: Produit[];
}

interface Livreur {
    uuid: string;
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string | null;
    status: string;
    disponibilite: string;
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
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    preparing: "bg-indigo-100 text-indigo-800 border-indigo-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusSteps = [
    {
        key: "pending",
        label: "En attente",
        icon: Clock,
    },
    {
        key: "confirmed",
        label: "Confirmée",
        icon: Check,
    },
    {
        key: "preparing",
        label: "Préparation",
        icon: Package,
    },
    {
        key: "shipped",
        label: "Expédiée",
        icon: Truck,
    },
    {
        key: "delivered",
        label: "Livrée",
        icon: Check,
    },
];


function formatPrice(value: string | number) {
    return `${Number(value).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusLabel(status: string) {
    return statusLabels[status] ?? status;
}

function getStatusColor(status: string) {
    return (
        statusColors[status] ??
        "bg-gray-100 text-gray-700 border-gray-200"
    );
}

function getNextStatuses(status: string) {
    const transitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["preparing", "cancelled"],
        preparing: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
    };

    return transitions[status] ?? [];
}

export default function CommandeDetailPage() {
    const params = useParams();
    const router = useRouter();

    const uuid = params.uuid as string;

    const [commande, setCommande] =
        useState<Commande | null>(null);

    const [historique, setHistorique] =
        useState<HistoriqueStatut[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [newStatus, setNewStatus] =
        useState("");

    const [commentaire, setCommentaire] =
        useState("");

    const [updating, setUpdating] =
        useState(false);

    const [livreurs, setLivreurs] =
        useState<Livreur[]>([]);

    const [selectedLivreur, setSelectedLivreur] =
        useState("");

    const [loadingLivreurs, setLoadingLivreurs] =
        useState(false);

    const [assigningLivreur, setAssigningLivreur] =
        useState(false);

    const [confirmAction, setConfirmAction] =
        useState<"cancelled" | "delivered" | null>(null);

    const fetchCommande = async () => {
        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const [
                commandeResponse,
                historiqueResponse
            ] = await Promise.all([
                fetch(
                    `/api/dashboard/commandes/uuid/${uuid}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                ),

                fetch(
                    `/api/dashboard/commandes/uuid/${uuid}/historique`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                ),
            ]);

            const commandeData =
                await commandeResponse.json();

            const historiqueData =
                await historiqueResponse.json();

            if (
                !commandeResponse.ok ||
                !commandeData.success
            ) {
                toast.error(
                    commandeData.message ??
                    "Impossible de récupérer la commande."
                );

                return;
            }

            setCommande(
                commandeData.data
            );

            setNewStatus(
                commandeData.data.status
            );

            if (historiqueData.success) {
                setHistorique(
                    historiqueData.data
                );
            }

        } catch (error) {

            console.error(
                "Erreur chargement commande :",
                error
            );

            toast.error(
                "Une erreur est survenue lors du chargement."
            );

        } finally {
            setLoading(false);
        }
    };

    const fetchLivreurs = async () => {
        try {
            setLoadingLivreurs(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "/api/dashboard/livreurs",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                toast.error(
                    data.message ??
                    "Impossible de récupérer les livreurs."
                );

                return;
            }

            setLivreurs(data.data ?? []);

        } catch (error) {

            console.error(
                "Erreur chargement livreurs :",
                error
            );

            toast.error(
                "Impossible de charger les livreurs."
            );

        } finally {
            setLoadingLivreurs(false);
        }
    };

    const assignLivreur = async () => {

        if (!commande || !selectedLivreur) {
            return;
        }

        try {

            setAssigningLivreur(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `/api/dashboard/commandes/uuid/${uuid}/livreur`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        livreur_uuid:
                            selectedLivreur,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                toast.error(
                    data.message ??
                    "Impossible d'affecter le livreur."
                );

                return;
            }

            toast.success(
                data.message ??
                "Livreur affecté à la commande."
            );

            await fetchCommande();

            setSelectedLivreur("");

            await fetchLivreurs();

        } catch (error) {

            console.error(
                "Erreur affectation livreur :",
                error
            );

            toast.error(
                "Une erreur est survenue lors de l'affectation."
            );

        } finally {
            setAssigningLivreur(false);
        }
    };



    const unassignLivreur = async () => {

        if (!commande?.livreur) {
            return;
        }

        try {

            setAssigningLivreur(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `/api/dashboard/commandes/uuid/${uuid}/livreur`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                toast.error(
                    data.message ??
                    "Impossible de retirer le livreur."
                );

                return;
            }

            toast.success(
                data.message ??
                "Livreur retiré de la commande."
            );

            await fetchCommande();

            await fetchLivreurs();

        } catch (error) {

            console.error(
                "Erreur retrait livreur :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );

        } finally {
            setAssigningLivreur(false);
        }
    };



    useEffect(() => {
        const fetchCommande = async () => {
            try {
                setLoading(true);

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const [commandeResponse, historiqueResponse] =
                    await Promise.all([
                        fetch(
                            `/api/dashboard/commandes/uuid/${uuid}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        ),

                        fetch(
                            `/api/dashboard/commandes/uuid/${uuid}/historique`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        ),
                    ]);

                const commandeData =
                    await commandeResponse.json();

                const historiqueData =
                    await historiqueResponse.json();

                if (
                    !commandeResponse.ok ||
                    !commandeData.success
                ) {
                    toast.error(
                        commandeData.message ??
                        "Impossible de récupérer la commande."
                    );

                    return;
                }

                setCommande(
                    commandeData.data
                );

                setNewStatus(
                    commandeData.data.status
                );

                if (historiqueData.success) {
                    setHistorique(
                        historiqueData.data
                    );
                }
            } catch (error) {
                console.error(
                    "Erreur chargement commande :",
                    error
                );

                toast.error(
                    "Une erreur est survenue lors du chargement."
                );
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            fetchCommande();
        }
    }, [uuid, router]);

    const updateStatus = async () => {
        if (!commande) {
            return;
        }

        if (newStatus === commande.status) {
            toast.info(
                "La commande possède déjà ce statut."
            );

            return;
        }

        if (
            newStatus === "cancelled" ||
            newStatus === "delivered"
        ) {
            setConfirmAction(newStatus);
            return;
        }

        await executeStatusUpdate();
    };



    const executeStatusUpdate = async () => {
        if (!commande) {
            return;
        }

        try {
            setUpdating(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `/api/dashboard/commandes/uuid/${uuid}/status`,
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        status: newStatus,
                        commentaire:
                            commentaire.trim() ||
                            null,
                    }),
                }
            );

            const data =
                await response.json();

            console.log(
                "DETAIL COMMANDE API :",
                data.data
            );

            if (!response.ok || !data.success) {
                toast.error(
                    data.message ??
                    "Impossible de modifier le statut."
                );

                return;
            }

            setCommande((prev) =>
                prev
                    ? {
                        ...prev,
                        status: newStatus,
                    }
                    : prev
            );

            setHistorique((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    status: newStatus,
                    commentaire:
                        commentaire.trim() ||
                        null,
                    created_at:
                        new Date().toISOString(),
                },
            ]);

            setCommentaire("");

            setConfirmAction(null);

            toast.success(
                "Statut de la commande mis à jour."
            );

        } catch (error) {

            console.error(
                "Erreur mise à jour statut :",
                error
            );

            toast.error(
                "Une erreur est survenue."
            );

        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (uuid) {
            fetchCommande();
        }
    }, [uuid]);

    useEffect(() => {
        if (uuid) {
            fetchCommande();
        }
    }, [uuid]);

    useEffect(() => {
        fetchLivreurs();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

                    <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm lg:col-span-2" />

                        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
                    </div>
                </div>
            </main>
        );
    }

    if (!commande) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <XCircle
                            size={48}
                            className="mx-auto mb-4 text-red-500"
                        />

                        <h1 className="text-xl font-bold text-gray-900">
                            Commande introuvable
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Cette commande n'existe pas
                            ou vous n'avez pas accès à
                            cette commande.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/dashboard/commandes"
                                )
                            }
                            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Retour aux commandes
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const isCancelled =
        commande.status === "cancelled";

    const currentStepIndex =
        statusSteps.findIndex(
            (step) =>
                step.key === commande.status
        );

    const nextStatuses = getNextStatuses(
        commande.status
    );
    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Retour */}
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/dashboard/commandes"
                        )
                    }
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <ArrowLeft size={18} />
                    Retour aux commandes
                </button>

                {/* En-tête */}
                <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Commande
                                </h1>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                                        commande.status
                                    )}`}
                                >
                                    {getStatusLabel(
                                        commande.status
                                    )}
                                </span>
                            </div>

                            <p className="mt-2 break-all text-sm text-gray-500">
                                #{commande.uuid}
                            </p>

                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays size={16} />

                                Créée le{" "}
                                {formatDate(
                                    commande.created_at
                                )}
                            </div>
                        </div>

                        <div className="text-left lg:text-right">
                            <p className="text-sm text-gray-500">
                                Total de la commande
                            </p>

                            <p className="mt-1 text-2xl font-bold text-blue-600">
                                {formatPrice(
                                    commande.total
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                {confirmAction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                            <div className="flex items-start gap-4">

                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${confirmAction === "cancelled"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                        }`}
                                >
                                    {confirmAction === "cancelled" ? (
                                        <XCircle size={22} />
                                    ) : (
                                        <Check size={22} />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {confirmAction === "cancelled"
                                            ? "Annuler cette commande ?"
                                            : "Marquer la commande comme livrée ?"}
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        {confirmAction === "cancelled"
                                            ? "Cette action annulera la commande, restaurera automatiquement le stock des produits et notifiera le client."
                                            : "Cette action marquera définitivement la commande comme livrée et notifiera le client."}
                                    </p>
                                </div>

                            </div>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setConfirmAction(null)
                                    }
                                    disabled={updating}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Retour
                                </button>

                                <button
                                    type="button"
                                    onClick={executeStatusUpdate}
                                    disabled={updating}
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmAction === "cancelled"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {updating
                                        ? "Traitement..."
                                        : confirmAction === "cancelled"
                                            ? "Confirmer l'annulation"
                                            : "Confirmer la livraison"}
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {/* Progression */}
                {!isCancelled && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="mb-6 text-lg font-bold text-gray-900">
                            Suivi de la commande
                        </h2>

                        <div className="overflow-x-auto">
                            <div className="flex min-w-162.5">
                                {statusSteps.map(
                                    (
                                        step,
                                        index
                                    ) => {
                                        const Icon =
                                            step.icon;

                                        const active =
                                            currentStepIndex >=
                                            0 &&
                                            index <=
                                            currentStepIndex;

                                        const current =
                                            index ===
                                            currentStepIndex;

                                        return (
                                            <div
                                                key={
                                                    step.key
                                                }
                                                className="flex flex-1 items-start"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${active
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-gray-200 bg-white text-gray-400"
                                                            } ${current
                                                                ? "ring-4 ring-blue-100"
                                                                : ""
                                                            }`}
                                                    >
                                                        <Icon
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </div>

                                                    <span
                                                        className={`mt-2 text-center text-xs font-medium ${active
                                                            ? "text-gray-900"
                                                            : "text-gray-400"
                                                            }`}
                                                    >
                                                        {
                                                            step.label
                                                        }
                                                    </span>
                                                </div>

                                                {index <
                                                    statusSteps.length -
                                                    1 && (
                                                        <div
                                                            className={`mt-5 h-0.5 flex-1 ${index <
                                                                currentStepIndex
                                                                ? "bg-blue-600"
                                                                : "bg-gray-200"
                                                                }`}
                                                        />
                                                    )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Annulation */}
                {isCancelled && (
                    <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <XCircle
                            size={22}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <h2 className="font-semibold text-red-800">
                                Commande annulée
                            </h2>

                            <p className="mt-1 text-sm text-red-700">
                                Cette commande a été
                                annulée.
                            </p>
                        </div>
                    </section>
                )}

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Colonne principale */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Modification statut */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Gestion du statut
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Modifiez l'état de la commande
                                et ajoutez éventuellement un
                                commentaire.
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr_auto]">
                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value={commande.status}>
                                        {getStatusLabel(commande.status)}
                                    </option>

                                    {nextStatuses.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {getStatusLabel(status)}
                                        </option>
                                    ))}
                                </select>

                                <textarea
                                    value={
                                        commentaire
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCommentaire(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Commentaire optionnel..."
                                    rows={1}
                                    className="min-h-10.5 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        updateStatus
                                    }
                                    disabled={
                                        updating ||
                                        newStatus ===
                                        commande.status
                                    }
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating
                                        ? "Mise à jour..."
                                        : "Mettre à jour"}
                                </button>
                            </div>
                        </section>

                        {/* Produits */}
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 p-5 sm:p-6">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Produits commandés
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {
                                        commande
                                            .produits
                                            .length
                                    }{" "}
                                    produit
                                    {commande.produits
                                        .length >
                                        1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {commande.produits.map(
                                    (
                                        produit
                                    ) => (
                                        <div
                                            key={
                                                produit.id
                                            }
                                            className="flex gap-4 p-5 sm:p-6"
                                        >
                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                                                {produit.image ? (
                                                    <img
                                                        src={
                                                            produit.image
                                                        }
                                                        alt={
                                                            produit.nom
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={
                                                            30
                                                        }
                                                        className="text-gray-400"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {
                                                        produit.nom
                                                    }
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Quantité :
                                                    {" "}
                                                    {
                                                        produit.quantite
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Prix unitaire :
                                                    {" "}
                                                    {formatPrice(
                                                        produit.prix
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {formatPrice(
                                                        produit.sous_total
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        {/* Historique */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="mb-6 text-lg font-bold text-gray-900">
                                Historique des statuts
                            </h2>

                            {historique.length >
                                0 ? (
                                <div className="space-y-6">
                                    {historique.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="relative flex gap-4"
                                            >
                                                <div className="relative flex flex-col items-center">
                                                    <div
                                                        className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ${item.status ===
                                                            "cancelled"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-blue-100 text-blue-600"
                                                            }`}
                                                    >
                                                        {item.status ===
                                                            "cancelled" ? (
                                                            <XCircle
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        ) : (
                                                            <Check
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    {index <
                                                        historique.length -
                                                        1 && (
                                                            <div className="absolute top-9 h-full w-px bg-gray-200" />
                                                        )}
                                                </div>

                                                <div className="pb-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {getStatusLabel(
                                                                item.status
                                                            )}
                                                        </h3>

                                                        <span className="text-xs text-gray-400">
                                                            {formatDateTime(
                                                                item.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    {item.commentaire && (
                                                        <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                                            {
                                                                item.commentaire
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Aucun historique
                                    disponible.
                                </p>
                            )}
                        </section>
                    </div>

                    {/* Colonne droite */}
                    <aside className="space-y-6">

                        {/* Client */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <User size={20} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Client
                                    </p>

                                    <h2 className="font-bold text-gray-900">
                                        {commande.client
                                            ? `${commande.client.prenom} ${commande.client.nom}`
                                            : "Client supprimé"}
                                    </h2>
                                </div>

                            </div>

                            {commande.client && (
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        {commande.client.telephone}
                                    </p>

                                    <p className="break-all">
                                        {commande.client.email}
                                    </p>
                                </div>
                            )}
                        </section>


                        {/* Localisation de livraison */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <MapPin size={20} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Livraison
                                    </p>

                                    <h2 className="font-bold text-gray-900">
                                        Localisation
                                    </h2>
                                </div>
                            </div>

                            {commande.adresse_livraison && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500">
                                        Adresse
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {commande.adresse_livraison}
                                    </p>
                                </div>
                            )}

                            {commande.latitude !== null &&
                                commande.longitude !== null ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">
                                                Latitude
                                            </p>

                                            <p className="mt-1 break-all text-sm font-medium text-gray-900">
                                                {commande.latitude}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">
                                                Longitude
                                            </p>

                                            <p className="mt-1 break-all text-sm font-medium text-gray-900">
                                                {commande.longitude}
                                            </p>
                                        </div>
                                    </div>

                                    {commande.gps_precision !== null && (
                                        <p className="mt-3 text-xs text-gray-500">
                                            Précision GPS :{" "}
                                            <span className="font-medium text-gray-700">
                                                {commande.gps_precision} m
                                            </span>
                                        </p>
                                    )}

                                    <a
                                        href={`https://www.google.com/maps?q=${commande.latitude},${commande.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                                    >
                                        <MapPin size={17} />
                                        Voir la localisation
                                    </a>
                                </>
                            ) : (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        Localisation GPS non disponible
                                        pour cette commande.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Livreur */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                    <Truck size={20} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Livraison
                                    </p>

                                    <h2 className="font-bold text-gray-900">
                                        Livreur
                                    </h2>
                                </div>
                            </div>

                            {commande.livreur ? (
                                <>
                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <div className="flex items-start justify-between gap-3">

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {commande.livreur.prenom}{" "}
                                                    {commande.livreur.nom}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {commande.livreur.telephone}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                                Affecté
                                            </span>
                                        </div>

                                        {commande.livreur.vehicule && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                                <Truck size={16} />

                                                <span>
                                                    {commande.livreur.vehicule}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                                            <span className="text-xs text-gray-500">
                                                Disponibilité
                                            </span>

                                            <span className="text-xs font-semibold text-gray-700">
                                                Indisponible
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={unassignLivreur}
                                        disabled={assigningLivreur}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <XCircle size={17} />

                                        {assigningLivreur
                                            ? "Traitement..."
                                            : "Retirer le livreur"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                                        <div className="flex items-center gap-3">

                                            <Truck
                                                size={20}
                                                className="text-gray-400"
                                            />

                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Aucun livreur affecté
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Sélectionnez un livreur disponible.
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="mt-4">

                                        <label
                                            htmlFor="livreur"
                                            className="mb-2 block text-xs font-medium text-gray-600"
                                        >
                                            Livreur disponible
                                        </label>

                                        <select
                                            id="livreur"
                                            value={selectedLivreur}
                                            onChange={(e) =>
                                                setSelectedLivreur(
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                loadingLivreurs ||
                                                assigningLivreur
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                        >
                                            <option value="">
                                                {loadingLivreurs
                                                    ? "Chargement..."
                                                    : "Sélectionner un livreur"}
                                            </option>

                                            {livreurs
                                                .filter(
                                                    (livreur) =>
                                                        livreur.status ===
                                                        "active" &&
                                                        livreur.disponibilite ===
                                                        "available"
                                                )
                                                .map((livreur) => (
                                                    <option
                                                        key={
                                                            livreur.uuid
                                                        }
                                                        value={
                                                            livreur.uuid
                                                        }
                                                    >
                                                        {livreur.prenom}{" "}
                                                        {livreur.nom}
                                                        {" — "}
                                                        {livreur.telephone}
                                                    </option>
                                                ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={assignLivreur}
                                            disabled={
                                                !selectedLivreur ||
                                                assigningLivreur ||
                                                loadingLivreurs
                                            }
                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Truck size={17} />

                                            {assigningLivreur
                                                ? "Affectation..."
                                                : "Affecter le livreur"}
                                        </button>

                                        {!loadingLivreurs &&
                                            livreurs.filter(
                                                (livreur) =>
                                                    livreur.status ===
                                                    "active" &&
                                                    livreur.disponibilite ===
                                                    "available"
                                            ).length === 0 && (
                                                <p className="mt-3 text-center text-xs text-gray-500">
                                                    Aucun livreur disponible
                                                    actuellement.
                                                </p>
                                            )}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Boutique */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <Store size={20} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Boutique
                                    </p>

                                    <h2 className="font-bold text-gray-900">
                                        {
                                            commande
                                                .boutique
                                                .nom
                                        }
                                    </h2>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">
                                /{commande.boutique.slug}
                            </p>
                        </section>

                        {/* Résumé */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="mb-5 text-lg font-bold text-gray-900">
                                Résumé
                            </h2>

                            <div className="space-y-3 text-sm">

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Sous-total
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {formatPrice(
                                            Number(commande.total) -
                                            Number(commande.frais_livraison ?? 0)
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Livraison
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {formatPrice(
                                            commande.frais_livraison ?? 0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="my-5 border-t border-gray-100" />

                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-gray-900">
                                    Total
                                </span>

                                <span className="text-xl font-bold text-blue-600">
                                    {formatPrice(
                                        commande.total
                                    )}
                                </span>
                            </div>
                        </section>

                        {/* Informations */}
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">
                                Informations
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">
                                        Créée le
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {formatDateTime(
                                            commande.created_at
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        Dernière modification
                                    </p>

                                    <p className="font-medium text-gray-900">
                                        {formatDateTime(
                                            commande.updated_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

