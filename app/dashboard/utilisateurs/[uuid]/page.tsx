"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaStore,
  FaTruck,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

interface UserDetails {
  id: number;
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: UserRole;
  image: string | null;
  email_verified: boolean;
  status: UserStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;

  boutique: {
    id: number;
    uuid: string;
    nom: string;
    slug: string;
    telephone: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    status: string;
  } | null;

  livreur: {
    id: number;
    uuid: string;
    boutique_id: number;
    user_id: number | null;
    nom: string;
    prenom: string;
    telephone: string;
    vehicule: string | null;
    status:
      | "active"
      | "inactive"
      | "suspended";
    disponibilite:
      | "available"
      | "unavailable";
    created_at: string | null;
    updated_at: string | null;
  } | null;
}

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super-administrateur",
  admin: "Administrateur",
  vendeur: "Vendeur",
  livreur: "Livreur",
  client: "Client",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function roleIcon(role: UserRole) {
  switch (role) {
    case "super_admin":
    case "admin":
      return <FaUserShield />;

    case "vendeur":
      return <FaStore />;

    case "livreur":
      return <FaTruck />;

    default:
      return <FaUser />;
  }
}

export default function UtilisateurDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { user, token, loading: authLoading } =
    useAuth();

  const uuid =
    typeof params.uuid === "string"
      ? params.uuid
      : "";

  const [data, setData] =
    useState<UserDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  useEffect(() => {
    if (
      authLoading ||
      !token ||
      !user ||
      !uuid
    ) {
      return;
    }

    if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      router.replace("/dashboard");
      return;
    }

    const loadUser = async () => {
      try {
        const response = await fetch(
          `/api/utilisateurs/${uuid}`,
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
          toast.error(
            result.message ??
              "Utilisateur introuvable."
          );
          router.replace(
            "/dashboard/utilisateurs"
          );
          return;
        }

        setData(result.data);

      } catch (error) {
        console.error(
          "Erreur chargement utilisateur :",
          error
        );

        toast.error(
          "Impossible de charger l'utilisateur."
        );

        router.replace(
          "/dashboard/utilisateurs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [
    authLoading,
    token,
    user,
    uuid,
    router,
  ]);

  async function toggleStatus() {
    if (
      !data ||
      !token ||
      !user ||
      updating
    ) {
      return;
    }

    if (data.id === user.id) {
      toast.error(
        "Vous ne pouvez pas modifier votre propre compte."
      );
      return;
    }

    if (
      user.role === "admin" &&
      (
        data.role === "admin" ||
        data.role === "super_admin"
      )
    ) {
      toast.error(
        "Vous ne pouvez pas modifier ce compte."
      );
      return;
    }

    const action =
      data.status === "blocked"
        ? "unblock"
        : "block";

    const confirmation =
      window.confirm(
        data.status === "blocked"
          ? `Voulez-vous débloquer ${data.prenom} ${data.nom} ?`
          : `Voulez-vous bloquer ${data.prenom} ${data.nom} ?`
      );

    if (!confirmation) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `/api/utilisateurs/uuid/${data.uuid}/${action}`,
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
        toast.error(
          result.message ??
            "Impossible de modifier le statut."
        );
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              status:
                action === "block"
                  ? "blocked"
                  : "active",
            }
          : current
      );

      toast.success(
        result.message ??
          "Statut mis à jour."
      );

    } catch (error) {
      console.error(
        "Erreur modification statut :",
        error
      );

      toast.error(
        "Une erreur est survenue."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        Utilisateur introuvable.
      </div>
    );
  }

  const canManage =
    !!user &&
    user.id !== data.id &&
    (
      user.role === "super_admin" ||
      (
        user.role === "admin" &&
        data.role !== "admin" &&
        data.role !== "super_admin"
      )
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div>
        <Link
          href="/dashboard/utilisateurs"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <FaArrowLeft />
          Retour aux utilisateurs
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-500">
              {roleIcon(data.role)}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {data.prenom} {data.nom}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {roleIcon(data.role)}
                  {roleLabels[data.role]}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    data.status === "active"
                      ? "bg-green-100 text-green-700"
                      : data.status === "blocked"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {data.status === "active"
                    ? "Actif"
                    : data.status === "blocked"
                    ? "Bloqué"
                    : "En attente"}
                </span>

              </div>
            </div>

          </div>

          {canManage && (
            <button
              type="button"
              disabled={updating}
              onClick={toggleStatus}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 ${
                data.status === "blocked"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {data.status === "blocked" ? (
                <FaCheckCircle />
              ) : (
                <FaBan />
              )}

              {updating
                ? "Traitement..."
                : data.status === "blocked"
                ? "Débloquer"
                : "Bloquer"}
            </button>
          )}

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Informations personnelles */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Informations personnelles
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">
                  E-mail
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">
                  Téléphone
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.telephone ||
                    "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaCheckCircle
                className={
                  data.email_verified
                    ? "text-green-500"
                    : "text-gray-300"
                }
              />
              <div>
                <p className="text-xs text-gray-500">
                  E-mail vérifié
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.email_verified
                    ? "Oui"
                    : "Non"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Créé le
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(
                  data.created_at
                )}
              </p>
            </div>

          </div>

        </section>

        {/* Boutique */}
        {data.boutique && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <FaStore className="text-gray-500" />

              <h2 className="text-lg font-bold text-gray-900">
                Boutique associée
              </h2>
            </div>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Nom
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {data.boutique.nom}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt />
                {data.boutique.ville ||
                  "Ville non renseignée"}
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Statut
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {data.boutique.status}
                </p>
              </div>

            </div>

          </section>
        )}

        {/* Profil livreur */}
        {data.livreur && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <FaTruck className="text-orange-500" />

              <h2 className="text-lg font-bold text-gray-900">
                Profil livreur
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500">
                  Véhicule
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {data.livreur.vehicule ||
                    "Non renseigné"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Disponibilité
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    data.livreur.disponibilite ===
                    "available"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {data.livreur.disponibilite ===
                  "available"
                    ? "Disponible"
                    : "Indisponible"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Statut livreur
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {data.livreur.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Téléphone
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {data.livreur.telephone}
                </p>
              </div>

            </div>

          </section>
        )}

        {/* Identifiants système */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            Informations système
          </h2>

          <div className="mt-5 space-y-4">

            <div>
              <p className="text-xs text-gray-500">
                ID utilisateur
              </p>

              <p className="mt-1 font-mono text-sm text-gray-800">
                {data.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                UUID
              </p>

              <p className="mt-1 break-all font-mono text-xs text-gray-600">
                {data.uuid}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Dernière modification
              </p>

              <p className="mt-1 text-sm text-gray-800">
                {formatDate(
                  data.updated_at
                )}
              </p>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}
