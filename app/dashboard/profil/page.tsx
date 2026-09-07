"use client";

import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaCopy,
} from "react-icons/fa";
import { toast } from "sonner";

interface User {
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: string;
  status: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        label: "Compte actif",
        className: "bg-green-100 text-green-700 border-green-200",
        icon: FaCheckCircle,
      };

    case "blocked":
      return {
        label: "Compte bloqué",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: FaBan,
      };

    case "pending":
      return {
        label: "En attente",
        className: "bg-orange-100 text-orange-700 border-orange-200",
        icon: FaClock,
      };

    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: FaClock,
      };
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "super_admin":
      return "Super administrateur";

    case "admin":
      return "Administrateur";

    case "vendeur":
      return "Vendeur";

    case "client":
      return "Client";

    case "livreur":
      return "Livreur";

    default:
      return role;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-700 border-purple-200";

    case "admin":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "vendeur":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";

    case "livreur":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "client":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setUser(result.data);
        } else {
          toast.error(
            result.message || "Impossible de récupérer votre profil."
          );
        }
      } catch (error) {
        console.error(error);

        toast.error(
          "Une erreur est survenue lors du chargement du profil."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const copyUuid = async () => {
    if (!user?.uuid) return;

    try {
      await navigator.clipboard.writeText(user.uuid);
      toast.success("UUID copié.");
    } catch {
      toast.error("Impossible de copier l'UUID.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-36 animate-pulse bg-gray-200 sm:h-44" />

            <div className="p-5 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="-mt-16 h-28 w-28 animate-pulse rounded-full border-4 border-white bg-gray-300" />

                <div className="space-y-2">
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FaBan className="text-2xl text-red-500" />
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              Utilisateur introuvable
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Impossible de récupérer les informations de votre profil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(user.status);
  const StatusIcon = statusConfig.icon;

  const fullName = `${user.prenom} ${user.nom}`.trim();

  const initials = `${user.prenom?.charAt(0) || ""}${user.nom?.charAt(0) || ""}`
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Mon profil
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Consultez les informations de votre compte MarketMali.
          </p>
        </div>

        {/* Carte principale */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Bannière */}
          <div className="relative h-32 bg-linear-to-r from-gray-900 via-gray-800 to-gray-700 sm:h-40">
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
            </div>
          </div>

          {/* Informations principales */}
          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
                  {initials ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-900 text-2xl font-bold text-white">
                      {initials}
                    </div>
                  ) : (
                    <FaUserCircle className="text-7xl text-gray-300" />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {fullName}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${statusConfig.className}`}
              >
                <StatusIcon />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            {/* Séparateur */}
            <div className="my-7 border-t border-gray-100" />

            {/* Informations */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Informations personnelles
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Informations associées à votre compte.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FaEnvelope className="text-gray-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Adresse email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FaPhone className="text-gray-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Téléphone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {user.telephone || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rôle */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FaShieldAlt className="text-gray-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Rôle
                      </p>

                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UUID */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FaIdBadge className="text-gray-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Identifiant du compte
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate font-mono text-xs font-semibold text-gray-900 sm:text-sm">
                          {user.uuid}
                        </p>

                        <button
                          type="button"
                          onClick={copyUuid}
                          title="Copier l'identifiant"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          <FaCopy className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé du compte */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    État du compte
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Votre compte est actuellement{" "}
                    <span className="font-semibold">
                      {statusConfig.label.toLowerCase()}
                    </span>
                    .
                  </p>
                </div>

                <div
                  className={`flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${statusConfig.className}`}
                >
                  <StatusIcon />

                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-gray-400">
          Les informations affichées correspondent aux données de votre
          compte MarketMali.
        </p>
      </div>
    </div>
  );
}