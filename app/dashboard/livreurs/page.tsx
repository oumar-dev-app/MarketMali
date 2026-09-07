"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Ban,
  CheckCircle,
  CircleOff,
  Search,
  Plus,
  RefreshCw,
  Truck,
  Users,
  UserCheck,
  UserX,
  X,
  Phone,
  Car,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

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
  email: string;
  password: string;
  vehicule: string;
}

type StatusFilter = "all" | "active" | "inactive" | "suspended";
type AvailabilityFilter = "all" | "available" | "unavailable";

const statusLabels: Record<Livreur["status"], string> = {
  active: "Actif",
  inactive: "Inactif",
  suspended: "Suspendu",
};

const statusColors: Record<Livreur["status"], string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
};

const initialForm: LivreurForm = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
  password: "",
  vehicule: "",
};

export default function LivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingLivreur, setEditingLivreur] =
    useState<Livreur | null>(null);

  const [form, setForm] = useState<LivreurForm>(initialForm);
  const [saving, setSaving] = useState(false);

  const [boutiques, setBoutiques] = useState<
    { id: number; nom: string }[]

  >([]);

  const [selectedBoutiqueId, setSelectedBoutiqueId] =
    useState<string>("");

  const getToken = () => {
    if (typeof window === "undefined") return null;


    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token")
    );


  };

  function StatCard({
    label,
    value,
    icon,
    iconClassName = "bg-gray-100 text-gray-600",
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    iconClassName?: string;
  }) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>

          <span className="text-2xl font-bold text-gray-900">
            {value}
          </span>
        </div>

        <p className="mt-3 text-xs font-semibold text-gray-500">
          {label}
        </p>
      </div>
    );
  }

  const fetchLivreurs = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();

      if (!token) {
        throw new Error("Session expirée.");
      }

      const response = await fetch("/api/dashboard/livreurs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token} `,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Impossible de récupérer les livreurs."
        );
      }

      setLivreurs(result.data ?? []);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }


  };

  const fetchBoutiques = async () => {
    try {
      const token = getToken();


      if (!token) return;

      const response = await fetch("/api/dashboard/boutiques", {
        headers: {
          Authorization: `Bearer ${token} `,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBoutiques(result.data ?? []);
      }
    } catch (error) {
      console.error("Erreur récupération boutiques:", error);
    }


  };

  useEffect(() => {
    fetchLivreurs();
    fetchBoutiques();
  }, []);

  const filteredLivreurs = useMemo(() => {
    const value = search.trim().toLowerCase();


    return livreurs.filter((livreur) => {
      const fullName =
        `${livreur.prenom} ${livreur.nom} `.toLowerCase();

      const matchesSearch =
        !value ||
        fullName.includes(value) ||
        livreur.nom.toLowerCase().includes(value) ||
        livreur.prenom.toLowerCase().includes(value) ||
        livreur.telephone.toLowerCase().includes(value) ||
        (livreur.vehicule ?? "").toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        livreur.status === statusFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        livreur.disponibilite === availabilityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAvailability
      );
    });


  }, [
    livreurs,
    search,
    statusFilter,
    availabilityFilter,
  ]);

  const statistics = useMemo(() => {
    return {
      total: livreurs.length,


      active: livreurs.filter(
        (livreur) => livreur.status === "active"
      ).length,

      available: livreurs.filter(
        (livreur) =>
          livreur.status === "active" &&
          livreur.disponibilite === "available"
      ).length,

      unavailable: livreurs.filter(
        (livreur) =>
          livreur.disponibilite === "unavailable"
      ).length,

      inactive: livreurs.filter(
        (livreur) => livreur.status === "inactive"
      ).length,

      suspended: livreurs.filter(
        (livreur) => livreur.status === "suspended"
      ).length,
    };


  }, [livreurs]);

  const openCreateModal = () => {
    setEditingLivreur(null);
    setForm(initialForm);
    setSelectedBoutiqueId("");
    setShowModal(true);
  };

  const openEditModal = (livreur: Livreur) => {
    setEditingLivreur(livreur);


    setForm({
      nom: livreur.nom,
      prenom: livreur.prenom,
      telephone: livreur.telephone,
      email: "",
      password: "",
      vehicule: livreur.vehicule ?? "",
    });

    setSelectedBoutiqueId(String(livreur.boutique_id));
    setShowModal(true);


  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingLivreur(null);
    setForm(initialForm);
    setSelectedBoutiqueId("");

  };

  const handleInputChange = (
    field: keyof LivreurForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveLivreur = async () => {
    if (!form.nom.trim()) {
      toast.error("Le nom est obligatoire.");
      return;
    }


    if (!form.prenom.trim()) {
      toast.error("Le prénom est obligatoire.");
      return;
    }

    if (!form.telephone.trim()) {
      toast.error("Le numéro de téléphone est obligatoire.");
      return;
    }

    if (!editingLivreur) {
      if (!selectedBoutiqueId) {
        toast.error("Veuillez sélectionner une boutique.");
        return;
      }

      if (!form.email.trim()) {
        toast.error("L'adresse email est obligatoire.");
        return;
      }

      if (!form.password.trim()) {
        toast.error("Le mot de passe est obligatoire.");
        return;
      }

      if (form.password.length < 6) {
        toast.error(
          "Le mot de passe doit contenir au moins 6 caractères."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error("Session expirée.");
      }

      const url = editingLivreur
        ? `/api/dashboard/livreurs/${editingLivreur.uuid}`
        : "/api/dashboard/livreurs";

      const method = editingLivreur ? "PUT" : "POST";

      const body = editingLivreur
        ? {
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          telephone: form.telephone.trim(),
          vehicule: form.vehicule.trim() || null,
        }
        : {
          boutique_id: Number(selectedBoutiqueId),
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          telephone: form.telephone.trim(),
          email: form.email.trim(),
          password: form.password,
          vehicule: form.vehicule.trim() || null,
        };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token} `,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible d'enregistrer le livreur."
        );
      }

      toast.success(
        editingLivreur
          ? "Livreur modifié avec succès."
          : "Livreur créé avec succès."
      );

      closeModal();
      await fetchLivreurs();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }


  };

  const toggleAvailability = async (livreur: Livreur) => {
    try {
      setActionLoading(livreur.uuid);


      const token = getToken();

      if (!token) {
        throw new Error("Session expirée.");
      }

      const newAvailability =
        livreur.disponibilite === "available"
          ? "unavailable"
          : "available";

      const response = await fetch(
        `/api/dashboard/livreurs/${livreur.uuid}/availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disponibilite: newAvailability,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de modifier la disponibilité."
        );
      }

      toast.success(
        newAvailability === "available"
          ? "Livreur rendu disponible."
          : "Livreur rendu indisponible."
      );

      await fetchLivreurs();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoading(null);
    }


  };

  const updateStatus = async (
    livreur: Livreur,
    status: Livreur["status"]
  ) => {
    try {
      setActionLoading(livreur.uuid);

      const token = getToken();

      if (!token) {
        throw new Error("Session expirée.");
      }

      const response = await fetch(
        `/api/dashboard/livreurs/${livreur.uuid}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de modifier le statut."
        );
      }

      const messages: Record<
        Livreur["status"],
        string
      > = {
        active: "Livreur activé.",
        inactive: "Livreur désactivé.",
        suspended: "Livreur suspendu.",
      };

      toast.success(messages[status]);

      await fetchLivreurs();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoading(null);
    }


  };

  const deleteLivreur = async (livreur: Livreur) => {
    const confirmed = window.confirm(
      `Voulez - vous vraiment supprimer le livreur ${livreur.prenom} ${livreur.nom} ?`
    );


    if (!confirmed) return;

    try {
      setActionLoading(livreur.uuid);

      const token = getToken();

      if (!token) {
        throw new Error("Session expirée.");
      }

      const response = await fetch(
        `/api/dashboard/livreurs/${livreur.uuid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Impossible de supprimer le livreur."
        );
      }

      toast.success("Livreur supprimé avec succès.");

      await fetchLivreurs();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoading(null);
    }


  };

  const getInitials = (livreur: Livreur) => {
    return `${livreur.prenom?.charAt(0) ?? ""}${livreur.nom?.charAt(0) ?? ""} `
      .toUpperCase();
  };

  return (<div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8"> <div className="mx-auto max-w-7xl space-y-6">
    {/* HEADER */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="flex items-center gap-3"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm"> <Truck size={22} /> </div>


      < div >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Livreurs
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gérez les livreurs et leur disponibilité.
        </p>
      </div >
    </div >
    </div >

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fetchLivreurs(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          <span className="hidden sm:inline">
            Actualiser
          </span>
        </button>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
        >
          <Plus size={18} />
          <span>Ajouter</span>
        </button>
      </div>
    </div >

    {/* STATISTICS */}
    < div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" >
      <StatCard
        label="Total"
        value={statistics.total}
        icon={<Users size={19} />}
        iconClassName="bg-blue-50 text-blue-600"
      />

      <StatCard
        label="Actifs"
        value={statistics.active}
        icon={<UserCheck size={19} />}
        iconClassName="bg-green-50 text-green-600"
      />

      <StatCard
        label="Disponibles"
        value={statistics.available}
        icon={<CheckCircle size={19} />}
        iconClassName="bg-emerald-50 text-emerald-600"
      />

      <StatCard
        label="Indisponibles"
        value={statistics.unavailable}
        icon={<CircleOff size={19} />}
        iconClassName="bg-gray-100 text-gray-500"
      />

      <StatCard
        label="Inactifs"
        value={statistics.inactive}
        icon={<UserX size={19} />}
        iconClassName="bg-yellow-50 text-yellow-600"
      />

      <StatCard
        label="Suspendus"
        value={statistics.suspended}
        icon={<Ban size={19} />}
        iconClassName="bg-red-50 text-red-600"
      />
    </div >

    {/* FILTERS */}
    < div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un livreur, téléphone, véhicule..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
          />
        </div>

        {/* STATUS */}
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as StatusFilter
            )
          }
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="suspended">Suspendus</option>
        </select>

        {/* AVAILABILITY */}
        <select
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(
              event.target.value as AvailabilityFilter
            )
          }
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
        >
          <option value="all">
            Toutes les disponibilités
          </option>
          <option value="available">
            Disponibles
          </option>
          <option value="unavailable">
            Indisponibles
          </option>
        </select>
      </div>
    </div >

    {/* ERROR / EMPTY */}
    {
      !loading && filteredLivreurs.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            {search ||
              statusFilter !== "all" ||
              availabilityFilter !== "all" ? (
              <Search
                size={24}
                className="text-gray-400"
              />
            ) : (
              <Truck
                size={24}
                className="text-gray-400"
              />
            )}
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            {search ||
              statusFilter !== "all" ||
              availabilityFilter !== "all"
              ? "Aucun résultat"
              : "Aucun livreur"}
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {search ||
              statusFilter !== "all" ||
              availabilityFilter !== "all"
              ? "Aucun livreur ne correspond aux filtres sélectionnés."
              : "Aucun livreur n'est actuellement enregistré."}
          </p>
        </div>
      )
    }

    {/* DESKTOP TABLE */}
    {
      !loading && filteredLivreurs.length > 0 && (
        <div className="hidden overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto overflow-visible">
            <table className="w-full min-w-225">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Livreur
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Téléphone
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Véhicule
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Disponibilité
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredLivreurs.map((livreur) => (
                  <tr
                    key={livreur.uuid}
                    className="transition hover:bg-gray-50/70"
                  >
                    {/* LIVREUR */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                          {getInitials(livreur)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {livreur.prenom}{" "}
                            {livreur.nom}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            ID #{livreur.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TELEPHONE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone
                          size={15}
                          className="text-gray-400"
                        />
                        {livreur.telephone}
                      </div>
                    </td>

                    {/* VEHICULE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Car
                          size={15}
                          className="text-gray-400"
                        />

                        {livreur.vehicule || (
                          <span className="text-gray-400">
                            Non renseigné
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUT */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusColors[livreur.status]}`}
                      >
                        {statusLabels[livreur.status]}
                      </span>
                    </td>

                    {/* DISPONIBILITE */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold 
                          ${livreur.disponibilite ===
                            "available"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                      >
                        <span
                          className={`mr-2 h-1.5 w-1.5 rounded-full 
                            ${livreur.disponibilite ===
                              "available"
                              ? "bg-green-500"
                              : "bg-gray-400"
                            }`}
                        />

                        {livreur.disponibilite ===
                          "available"
                          ? "Disponible"
                          : "Indisponible"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            livreur.uuid
                          }
                          onClick={() =>
                            setOpenMenu(
                              openMenu === livreur.uuid
                                ? null
                                : livreur.uuid
                            )
                          }
                          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Actions"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === livreur.uuid && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() =>
                                setOpenMenu(null)
                              }
                            />

                            <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                              {/* MODIFIER */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  openEditModal(
                                    livreur
                                  );
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                              >
                                <Pencil size={16} />
                                Modifier
                              </button>

                              {/* DISPONIBILITE */}
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  livreur.uuid
                                }
                                onClick={() => {
                                  setOpenMenu(null);
                                  toggleAvailability(
                                    livreur
                                  );
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                {livreur.disponibilite ===
                                  "available" ? (
                                  <>
                                    <CircleOff
                                      size={16}
                                      className="text-yellow-600"
                                    />
                                    Rendre indisponible
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle
                                      size={16}
                                      className="text-green-600"
                                    />
                                    Rendre disponible
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-gray-100" />

                              {/* ACTIVER */}
                              {livreur.status !==
                                "active" && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading ===
                                      livreur.uuid
                                    }
                                    onClick={() => {
                                      setOpenMenu(null);
                                      updateStatus(
                                        livreur,
                                        "active"
                                      );
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                                  >
                                    <Power size={16} />
                                    Activer
                                  </button>
                                )}

                              {/* DESACTIVER */}
                              {livreur.status ===
                                "active" && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading ===
                                      livreur.uuid
                                    }
                                    onClick={() => {
                                      setOpenMenu(null);
                                      updateStatus(
                                        livreur,
                                        "inactive"
                                      );
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <PowerOff size={16} />
                                    Désactiver
                                  </button>
                                )}

                              {/* SUSPENDRE */}
                              {livreur.status !==
                                "suspended" && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading ===
                                      livreur.uuid
                                    }
                                    onClick={() => {
                                      setOpenMenu(null);
                                      updateStatus(
                                        livreur,
                                        "suspended"
                                      );
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
                                  >
                                    <Ban size={16} />
                                    Suspendre
                                  </button>
                                )}

                              <div className="my-1 border-t border-gray-100" />

                              {/* SUPPRIMER */}
                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  livreur.uuid
                                }
                                onClick={() => {
                                  setOpenMenu(null);
                                  deleteLivreur(
                                    livreur
                                  );
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                                Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-500">
              {filteredLivreurs.length} livreur
              {filteredLivreurs.length > 1 ? "s" : ""} affiché
              {filteredLivreurs.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )
    }

    {/* MOBILE CARDS */}
    {
      !loading && filteredLivreurs.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {filteredLivreurs.map((livreur) => (
            <div
              key={livreur.uuid}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {getInitials(livreur)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-gray-900">
                      {livreur.prenom} {livreur.nom}
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-500">
                      ID #{livreur.id}
                    </p>
                  </div>
                </div>

                {/* MOBILE MENU */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    disabled={
                      actionLoading === livreur.uuid
                    }
                    onClick={() =>
                      setOpenMenu(
                        openMenu === livreur.uuid
                          ? null
                          : livreur.uuid
                      )
                    }
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                    aria-label="Actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === livreur.uuid && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() =>
                          setOpenMenu(null)
                        }
                      />

                      <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            openEditModal(livreur);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={16} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            livreur.uuid
                          }
                          onClick={() => {
                            setOpenMenu(null);
                            toggleAvailability(
                              livreur
                            );
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {livreur.disponibilite ===
                            "available" ? (
                            <>
                              <CircleOff
                                size={16}
                                className="text-yellow-600"
                              />
                              Rendre indisponible
                            </>
                          ) : (
                            <>
                              <CheckCircle
                                size={16}
                                className="text-green-600"
                              />
                              Rendre disponible
                            </>
                          )}
                        </button>

                        <div className="my-1 border-t border-gray-100" />

                        {livreur.status !==
                          "active" && (
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                livreur.uuid
                              }
                              onClick={() => {
                                setOpenMenu(null);
                                updateStatus(
                                  livreur,
                                  "active"
                                );
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              <Power size={16} />
                              Activer
                            </button>
                          )}

                        {livreur.status ===
                          "active" && (
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                livreur.uuid
                              }
                              onClick={() => {
                                setOpenMenu(null);
                                updateStatus(
                                  livreur,
                                  "inactive"
                                );
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <PowerOff size={16} />
                              Désactiver
                            </button>
                          )}

                        {livreur.status !==
                          "suspended" && (
                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                livreur.uuid
                              }
                              onClick={() => {
                                setOpenMenu(null);
                                updateStatus(
                                  livreur,
                                  "suspended"
                                );
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                            >
                              <Ban size={16} />
                              Suspendre
                            </button>
                          )}

                        <div className="my-1 border-t border-gray-100" />

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            livreur.uuid
                          }
                          onClick={() => {
                            setOpenMenu(null);
                            deleteLivreur(
                              livreur
                            );
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoRow
                  icon={<Phone size={15} />}
                  label="Téléphone"
                  value={livreur.telephone}
                />

                <InfoRow
                  icon={<Car size={15} />}
                  label="Véhicule"
                  value={
                    livreur.vehicule ||
                    "Non renseigné"
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold 
                    ${statusColors[livreur.status]}`}
                >
                  {statusLabels[livreur.status]}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold 
                    ${livreur.disponibilite ===
                      "available"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                >
                  <span
                    className={`mr-2 h-1.5 w-1.5 rounded-full 
                      ${livreur.disponibilite ===
                        "available"
                        ? "bg-green-500"
                        : "bg-gray-400"
                      }`}
                  />

                  {livreur.disponibilite ===
                    "available"
                    ? "Disponible"
                    : "Indisponible"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    }

    {/* LOADING */}
    {
      loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-gray-400"
            />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Chargement des livreurs...
            </p>
          </div>
        </div>
      )
    }
  </div >

    {/* MODAL CREATE / EDIT */}
    {
      showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingLivreur
                    ? "Modifier le livreur"
                    : "Ajouter un livreur"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {editingLivreur
                    ? "Modifiez les informations du livreur."
                    : "Créez un nouveau compte livreur."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-5 p-5">
              {/* BOUTIQUE */}
              {!editingLivreur && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Boutique
                  </label>

                  <select
                    value={selectedBoutiqueId}
                    onChange={(event) =>
                      setSelectedBoutiqueId(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400"
                  >
                    <option value="">
                      Sélectionner une boutique
                    </option>

                    {boutiques.map((boutique) => (
                      <option
                        key={boutique.id}
                        value={boutique.id}
                      >
                        {boutique.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* NOM / PRENOM */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Prénom
                  </label>

                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(event) =>
                      handleInputChange(
                        "prenom",
                        event.target.value
                      )
                    }
                    placeholder="Prénom"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nom
                  </label>

                  <input
                    type="text"
                    value={form.nom}
                    onChange={(event) =>
                      handleInputChange(
                        "nom",
                        event.target.value
                      )
                    }
                    placeholder="Nom"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* TELEPHONE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Téléphone
                </label>

                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(event) =>
                    handleInputChange(
                      "telephone",
                      event.target.value
                    )
                  }
                  placeholder="Ex : 70 00 00 00"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* VEHICULE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Véhicule
                </label>

                <input
                  type="text"
                  value={form.vehicule}
                  onChange={(event) =>
                    handleInputChange(
                      "vehicule",
                      event.target.value
                    )
                  }
                  placeholder="Ex : Moto, Toyota, Tricycle..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* ACCOUNT FIELDS */}
              {!editingLivreur && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className="text-gray-600"
                    />

                    <h3 className="text-sm font-bold text-gray-800">
                      Accès du livreur
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Email
                      </label>

                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          handleInputChange(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="livreur@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Mot de passe
                      </label>

                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                          handleInputChange(
                            "password",
                            event.target.value
                          )
                        }
                        placeholder="Minimum 6 caractères"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INFO */}
              <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-blue-700">
                  {editingLivreur
                    ? "Les changements seront appliqués immédiatement au profil du livreur."
                    : "Le livreur sera créé avec le statut actif. Vous pourrez ensuite modifier son statut et sa disponibilité depuis le menu d'actions."}
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={saveLivreur}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Enregistrement..."
                  : editingLivreur
                    ? "Enregistrer"
                    : "Créer le livreur"}
              </button>
            </div>
          </div>
        </div>
      )
    }
  </div >


  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"> <div className="flex items-center justify-between gap-2"> <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
    {icon} </div>


    <span className="text-2xl font-bold text-gray-900">
      {value}
    </span>
  </div>

    <p className="mt-3 text-xs font-semibold text-gray-500">
      {label}
    </p>
  </div>


  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (<div className="flex min-w-0 items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5"> <div className="shrink-0 text-gray-400">
    {icon} </div>

    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="truncate text-xs font-semibold text-gray-700">
        {value}
      </p>
    </div>
  </div>


  );
}
