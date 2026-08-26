"use client";

import { toast } from "sonner";

import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaUser,
  FaUsers,
  FaStore,
  FaTruck,
  FaUserShield,
  FaCheckCircle,
  FaBan,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

type UserRole =
  | "super_admin"
  | "admin"
  | "vendeur"
  | "livreur"
  | "client";

type UserStatus =
  | "active"
  | "pending"
  | "blocked"
  | "deleted";

interface ManagedUser {
  id: number;
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super-admin",
  admin: "Admin",
  vendeur: "Vendeur",
  livreur: "Livreur",
  client: "Client",
};

const roleClasses: Record<UserRole, string> = {
  super_admin:
    "bg-purple-100 text-purple-800 border-purple-200",
  admin:
    "bg-blue-100 text-blue-800 border-blue-200",
  vendeur:
    "bg-emerald-100 text-emerald-800 border-emerald-200",
  livreur:
    "bg-orange-100 text-orange-800 border-orange-200",
  client:
    "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels: Record<UserStatus, string> = {
  active: "Actif",
  pending: "En attente",
  blocked: "Bloqué",
  deleted: "Supprimé",
};

const statusClasses: Record<UserStatus, string> = {
  active:
    "bg-green-100 text-green-800 border-green-200",
  pending:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  blocked:
    "bg-red-100 text-red-800 border-red-200",
  deleted:
    "bg-gray-100 text-gray-500 border-gray-200",
};

function formatDate(
  value: string
) {
  return new Date(value).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function roleIcon(
  role: UserRole
) {
  switch (role) {
    case "super_admin":
      return <FaUserShield />;

    case "admin":
      return <FaUserShield />;

    case "vendeur":
      return <FaStore />;

    case "livreur":
      return <FaTruck />;

    case "client":
      return <FaUser />;

    default:
      return <FaUser />;
  }
}

export default function UtilisateursPage() {

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [users, setUsers] =
    useState<ManagedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | UserRole>("all");

  const [statusFilter, setStatusFilter] =
    useState<"all" | UserStatus>("all");

  const [error, setError] =
    useState<string | null>(null);

  const [updatingUser, setUpdatingUser] =
    useState<string | null>(null);

  const [confirmUser, setConfirmUser] =
    useState<ManagedUser | null>(null);

  async function activateUser(
    item: ManagedUser
  ) {
    if (
      updatingUser ||
      item.status !== "pending" ||
      item.id === user?.id
    ) {
      return;
    }

    if (
      user?.role === "admin" &&
      (
        item.role === "admin" ||
        item.role === "super_admin"
      )
    ) {
      toast.error(
        "Vous ne pouvez pas modifier ce compte."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous activer le compte de ${item.prenom} ${item.nom} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUser(item.uuid);

      const response =
        await fetch(
          `/api/utilisateurs/uuid/${item.uuid}/activate`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        toast.error(
          data.message ??
          "Impossible d'activer le compte."
        );
        return;
      }

      toast.success(
        data.message ??
        "Utilisateur activé avec succès."
      );

      setUsers((current) =>
        current.map(
          (currentUser) =>
            currentUser.uuid === item.uuid
              ? {
                ...currentUser,
                status: "active",
              }
              : currentUser
        )
      );
    } catch (error) {
      console.error(
        "Erreur activation utilisateur :",
        error
      );

      toast.error(
        "Une erreur est survenue."
      );
    } finally {
      setUpdatingUser(null);
    }
  }

  async function toggleUserStatus(
    item: ManagedUser
  ) {

    if (
      updatingUser ||
      item.id === user?.id
    ) {
      return;
    }

    if (
      user?.role === "admin" &&
      (
        item.role === "admin" ||
        item.role === "super_admin"
      )
    ) {
      toast.error(
        "Vous ne pouvez pas modifier ce compte."
      );
      return;
    }

    const action =
      item.status === "blocked"
        ? "unblock"
        : "block";

    try {

      setUpdatingUser(
        item.uuid
      );

      const response =
        await fetch(
          `/api/utilisateurs/uuid/${item.uuid}/${action}`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        toast.error(
          data.message ??
          "Impossible de modifier le statut."
        );
        return;
      }

      toast.success(
        data.message ??
        "Statut utilisateur mis à jour."
      );

      setUsers(
        (current) =>
          current.map(
            (currentUser) =>
              currentUser.uuid === item.uuid
                ? {
                  ...currentUser,
                  status:
                    action === "block"
                      ? "blocked"
                      : "active",
                }
                : currentUser
          )
      );

    } catch (error) {

      console.error(
        "Erreur modification utilisateur :",
        error
      );

      toast.error(
        "Une erreur est survenue."
      );

    } finally {

      setUpdatingUser(null);
    }
  }

  useEffect(() => {

    if (
      authLoading ||
      !token ||
      !user
    ) {
      return;
    }

    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      setLoading(false);
      return;
    }

    const loadUsers =
      async () => {

        try {

          setLoading(true);
          setError(null);

          const response =
            await fetch(
              "/api/utilisateurs",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            setError(
              data.message ??
              "Impossible de récupérer les utilisateurs."
            );
            return;
          }

          setUsers(
            data.data ?? []
          );

        } catch (err) {

          console.error(
            "Erreur chargement utilisateurs :",
            err
          );

          setError(
            "Une erreur est survenue lors du chargement."
          );

        } finally {

          setLoading(false);
        }
      };

    loadUsers();

  }, [
    authLoading,
    token,
    user,
  ]);

  const filteredUsers =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (item) => {

          const matchesSearch =
            !normalizedSearch ||
            `${item.nom} ${item.prenom}`
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            item.email
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            (
              item.telephone ?? ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesRole =
            roleFilter === "all" ||
            item.role === roleFilter;

          const matchesStatus =
            statusFilter === "all" ||
            item.status === statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );

    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);

  const counts =
    useMemo(() => ({
      total: users.length,

      actifs: users.filter(
        (item) =>
          item.status === "active"
      ).length,

      vendeurs: users.filter(
        (item) =>
          item.role === "vendeur"
      ).length,

      livreurs: users.filter(
        (item) =>
          item.role === "livreur"
      ).length,

      clients: users.filter(
        (item) =>
          item.role === "client"
      ).length,
    }), [users]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">

        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />

      </div>
    );
  }

  if (
    !user ||
    (
      user.role !== "admin" &&
      user.role !== "super_admin"
    )
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <FaBan
            size={40}
            className="mx-auto text-red-300"
          />

          <h1 className="mt-4 text-lg font-bold text-gray-900">
            Accès refusé
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Cette section est réservée aux administrateurs.
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <div className="flex items-center gap-3">

          <FaBan className="text-red-600" />

          <div>
            <h2 className="font-semibold text-red-800">
              Impossible de charger les utilisateurs
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Utilisateurs
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gérez les comptes et les accès à MarketMali.
        </p>

      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {counts.total}
              </p>
            </div>

            <FaUsers
              className="text-gray-400"
              size={22}
            />

          </div>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Actifs
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {counts.actifs}
              </p>
            </div>

            <FaCheckCircle
              className="text-green-500"
              size={22}
            />

          </div>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Vendeurs
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {counts.vendeurs}
              </p>
            </div>

            <FaStore
              className="text-emerald-500"
              size={22}
            />

          </div>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Livreurs
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-700">
                {counts.livreurs}
              </p>
            </div>

            <FaTruck
              className="text-orange-500"
              size={22}
            />

          </div>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Clients
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {counts.clients}
              </p>
            </div>

            <FaUser
              className="text-blue-500"
              size={22}
            />

          </div>

        </div>

      </div>

      {/* Filtres */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-3">

          <div className="relative">

            <FaSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher un utilisateur..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as
                | "all"
                | UserRole
              )
            }
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >

            <option value="all">
              Tous les rôles
            </option>

            <option value="vendeur">
              Vendeurs
            </option>

            <option value="livreur">
              Livreurs
            </option>

            <option value="client">
              Clients
            </option>

            {user.role ===
              "super_admin" && (
                <>
                  <option value="admin">
                    Administrateurs
                  </option>

                  <option value="super_admin">
                    Super-admins
                  </option>
                </>
              )}

          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                | "all"
                | UserStatus
              )
            }
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >

            <option value="all">
              Tous les statuts
            </option>

            <option value="active">
              Actifs
            </option>

            <option value="pending">
              En attente
            </option>

            <option value="blocked">
              Bloqués
            </option>

          </select>

        </div>

      </section>

      {/* Tableau */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <h2 className="font-semibold text-gray-900">
              Liste des utilisateurs
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredUsers.length} utilisateur(s)
            </p>
          </div>

        </div>

        {filteredUsers.length === 0 ? (

          <div className="p-12 text-center">

            <FaUsers
              size={40}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 font-semibold text-gray-900">
              Aucun utilisateur trouvé
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Modifiez vos filtres ou votre recherche.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-287.5">

              <thead className="border-b border-gray-100 bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Utilisateur
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rôle
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Inscription
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredUsers.map(
                  (item) => (

                    <tr
                      key={item.uuid}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            {roleIcon(
                              item.role
                            )}
                          </div>

                          <div>

                            <Link
                              href={`/dashboard/utilisateurs/${item.uuid}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {item.prenom} {item.nom}
                            </Link>

                            <p className="text-xs text-gray-400">
                              ID #{item.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-800">
                          {item.email}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.telephone ||
                            "Téléphone non renseigné"}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${roleClasses[item.role]}`}
                        >
                          {roleIcon(
                            item.role
                          )}

                          {roleLabels[
                            item.role
                          ]}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[item.status]}`}
                        >

                          {item.status ===
                            "active" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaClock />
                          )}

                          {statusLabels[
                            item.status
                          ]}

                        </span>

                      </td>

                      <td className="px-5 py-4">

                        {item.id === user?.id ? (

                          <span className="text-xs text-gray-400">
                            Votre compte
                          </span>

                        ) : user?.role === "admin" &&
                          (
                            item.role === "admin" ||
                            item.role === "super_admin"
                          ) ? (

                          <span className="text-xs text-gray-400">
                            Non autorisé
                          </span>

                        ) : (

                          <div className="flex items-center gap-2">

                            {/* Compte en attente : Activer */}
                            {item.status === "pending" && (
                              <button
                                type="button"
                                disabled={
                                  updatingUser === item.uuid
                                }
                                onClick={() =>
                                  activateUser(item)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaCheckCircle />

                                {updatingUser === item.uuid
                                  ? "Activation..."
                                  : "Activer"}
                              </button>
                            )}

                            {/* Compte bloqué : Débloquer */}
                            {item.status === "blocked" && (
                              <button
                                type="button"
                                disabled={
                                  updatingUser === item.uuid
                                }
                                onClick={() =>
                                  setConfirmUser(item)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaCheckCircle />

                                {updatingUser === item.uuid
                                  ? "Traitement..."
                                  : "Débloquer"}
                              </button>
                            )}

                            {/* Compte actif : Bloquer */}
                            {item.status === "active" && (
                              <button
                                type="button"
                                disabled={
                                  updatingUser === item.uuid
                                }
                                onClick={() =>
                                  setConfirmUser(item)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaBan />

                                {updatingUser === item.uuid
                                  ? "Traitement..."
                                  : "Bloquer"}
                              </button>
                            )}

                          </div>

                        )}

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          item.created_at
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>
      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <h2 className="text-lg font-bold text-gray-900">
              {confirmUser.status === "blocked"
                ? "Débloquer cet utilisateur ?"
                : "Bloquer cet utilisateur ?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Vous êtes sur le point de{" "}
              <span className="font-semibold">
                {confirmUser.status === "blocked"
                  ? "débloquer"
                  : "bloquer"}
              </span>{" "}
              le compte de{" "}
              <span className="font-semibold text-gray-900">
                {confirmUser.prenom}{" "}
                {confirmUser.nom}
              </span>.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setConfirmUser(null)
                }
                disabled={!!updatingUser}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={!!updatingUser}
                onClick={async () => {
                  await toggleUserStatus(confirmUser);
                  setConfirmUser(null);
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmUser.status === "blocked"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {updatingUser
                  ? "Traitement..."
                  : confirmUser.status === "blocked"
                    ? "Débloquer"
                    : "Bloquer"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>


  );
}

