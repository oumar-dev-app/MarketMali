"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  Store,
  Truck,
  XCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

type DemandeRoleType =
  | "vendeur"
  | "livreur";

type DemandeRoleStatut =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

interface DemandeRole {
  id: number;
  uuid: string;
  user_id: number;
  type: DemandeRoleType;
  statut: DemandeRoleStatut;
  motif: string | null;
  commentaire_admin: string | null;
  traite_par: number | null;
  traite_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function DemandeRolePage() {
  const router = useRouter();

  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [demandes, setDemandes] =
    useState<DemandeRole[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState<DemandeRoleType | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /**
   * =========================================================
   * CHARGER LES DEMANDES
   * =========================================================
   */

  async function loadDemandes() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/demandes-roles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de charger vos demandes."
        );
      }

      setDemandes(
        Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token || !user) {
      setLoading(false);
      return;
    }

    loadDemandes();
  }, [authLoading, token, user]);

  /**
   * =========================================================
   * ENVOYER UNE DEMANDE
   * =========================================================
   */

  async function submitDemande(
    type: DemandeRoleType
  ) {
    if (!token || submitting) {
      return;
    }

    setSubmitting(type);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/demandes-roles",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible d'envoyer la demande."
        );
      }

      setSuccess(
        type === "vendeur"
          ? "Votre demande pour devenir vendeur a été envoyée. Elle sera examinée par notre équipe."
          : "Votre demande pour devenir livreur a été envoyée. Elle sera examinée par notre équipe."
      );

      await loadDemandes();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setSubmitting(null);
    }
  }

  /**
   * =========================================================
   * UTILITAIRES
   * =========================================================
   */

  function getStatusLabel(
    statut: DemandeRoleStatut
  ) {
    switch (statut) {
      case "pending":
        return "En attente";

      case "approved":
        return "Approuvée";

      case "rejected":
        return "Refusée";

      case "cancelled":
        return "Annulée";

      default:
        return statut;
    }
  }

  function getStatusClass(
    statut: DemandeRoleStatut
  ) {
    switch (statut) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";

      case "approved":
        return "bg-green-50 text-[#14a800] border-green-100";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";

      case "cancelled":
        return "bg-gray-50 text-gray-500 border-gray-100";

      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  }

  function getRoleLabel(
    type: DemandeRoleType
  ) {
    return type === "vendeur"
      ? "Vendeur"
      : "Livreur";
  }

  function formatDate(
    dateString: string
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(dateString));
  }

  /**
   * =========================================================
   * DEMANDES EN ATTENTE
   * =========================================================
   */

  const pendingVendeur =
    demandes.some(
      (demande) =>
        demande.type === "vendeur" &&
        demande.statut === "pending"
    );

  const pendingLivreur =
    demandes.some(
      (demande) =>
        demande.type === "livreur" &&
        demande.statut === "pending"
    );

  /**
   * =========================================================
   * AUTH LOADING
   * =========================================================
   */

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2
              size={20}
              className="animate-spin text-[#14a800]"
            />

            <span>
              Chargement...
            </span>
          </div>
        </div>
      </main>
    );
  }

  /**
   * =========================================================
   * NON CONNECTÉ
   * =========================================================
   */

  if (!token || !user) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-10">
          <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#14a800]">
              <Bell size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-950">
              Connectez-vous
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Connectez-vous pour accéder aux demandes
              de rôle MarketMali.
            </p>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#14a800] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#108f00]"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /**
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/5" />

        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-yellow-400/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">

          <div className="mb-5 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>

          <div className="max-w-3xl">
            <span className="text-sm font-bold tracking-wide text-[#14a800]">
              MARKETMALI
            </span>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              Rejoignez l'équipe MarketMali
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Vous souhaitez vendre vos produits sur
              MarketMali ou rejoindre notre réseau de
              livreurs ? Choisissez le rôle qui vous
              correspond et envoyez votre demande.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* Messages */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Une erreur est survenue
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Demande envoyée
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            CHOIX
        ==================================================== */}

        <div className="grid gap-5 md:grid-cols-2">

          {/* VENDEUR */}

          <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md sm:p-8">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-[#14a800]">
              <Store size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-gray-950">
              Devenir vendeur
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Créez votre boutique sur MarketMali,
              présentez vos produits et recevez des
              commandes directement depuis la plateforme.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-[#14a800]"
                />
                Créer votre boutique
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-[#14a800]"
                />
                Ajouter et gérer vos produits
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-[#14a800]"
                />
                Recevoir et gérer vos commandes
              </li>
            </ul>

            <button
              type="button"
              onClick={() =>
                submitDemande("vendeur")
              }
              disabled={
                submitting !== null ||
                pendingVendeur
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14a800] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#108f00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === "vendeur" ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Envoi...
                </>
              ) : pendingVendeur ? (
                <>
                  <Clock size={17} />
                  Demande en attente
                </>
              ) : (
                <>
                  Devenir vendeur
                  <ChevronRight size={17} />
                </>
              )}
            </button>
          </div>

          {/* LIVREUR */}

          <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md sm:p-8">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Truck size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-gray-950">
              Devenir livreur
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Rejoignez le réseau de livraison MarketMali
              et livrez les commandes des clients dans
              votre zone.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-blue-600"
                />
                Recevoir des missions de livraison
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-blue-600"
                />
                Gérer vos livraisons
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-blue-600"
                />
                Suivre vos missions en temps réel
              </li>
            </ul>

            <button
              type="button"
              onClick={() =>
                submitDemande("livreur")
              }
              disabled={
                submitting !== null ||
                pendingLivreur
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === "livreur" ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Envoi...
                </>
              ) : pendingLivreur ? (
                <>
                  <Clock size={17} />
                  Demande en attente
                </>
              ) : (
                <>
                  Devenir livreur
                  <ChevronRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================================================
            MES DEMANDES
        ==================================================== */}

        <div className="mt-8 rounded-3xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-extrabold text-gray-950">
              Mes demandes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consultez l'état de vos demandes de rôle.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-12">
              <Loader2
                size={24}
                className="animate-spin text-[#14a800]"
              />
            </div>
          ) : demandes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <Clock size={25} />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-700">
                Aucune demande
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez encore envoyé aucune demande
                de rôle.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {demandes.map((demande) => (
                <div
                  key={demande.uuid}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                      {demande.type === "vendeur" ? (
                        <Store size={20} />
                      ) : (
                        <Truck size={20} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-950">
                        Demande pour devenir{" "}
                        {getRoleLabel(
                          demande.type
                        )}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Envoyée le{" "}
                        {formatDate(
                          demande.created_at
                        )}
                      </p>

                      {demande.commentaire_admin && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold">
                            Commentaire :
                          </span>{" "}
                          {demande.commentaire_admin}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                      demande.statut
                    )}`}
                  >
                    {demande.statut === "pending" && (
                      <Clock size={13} />
                    )}

                    {demande.statut === "approved" && (
                      <CheckCircle2 size={13} />
                    )}

                    {demande.statut === "rejected" && (
                      <XCircle size={13} />
                    )}

                    {getStatusLabel(
                      demande.statut
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================
            RETOUR
        ==================================================== */}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#14a800]"
          >
            <ArrowLeft size={16} />
            Retour aux notifications
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#14a800]"
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
