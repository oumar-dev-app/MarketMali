"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Loader2,
  Package,
  ShoppingBag,
  AlertCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: number;
  uuid: string;
  user_id: number;
  commande_id: number | null;
  commande_uuid: string | null;
  type: string;
  titre: string;
  message: string;
  lu: number;
  read_at: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  /**
   * =========================================================
   * CHARGEMENT DES NOTIFICATIONS
   * =========================================================
   */

  async function loadNotifications() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/notifications?limit=100",
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
            "Impossible de charger les notifications."
        );
      }

      setNotifications(
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

    loadNotifications();
  }, [authLoading, token, user]);

  /**
   * =========================================================
   * MARQUER UNE NOTIFICATION COMME LUE
   * =========================================================
   */

  async function markAsRead(
    notification: Notification
  ) {
    if (!token || notification.lu === 1) {
      return;
    }

    try {
      const response = await fetch(
        `/api/notifications/${notification.uuid}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de marquer la notification comme lue."
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          item.uuid === notification.uuid
            ? {
                ...item,
                lu: 1,
                read_at:
                  new Date().toISOString(),
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Erreur marquage notification :",
        error
      );
    }
  }

  /**
   * =========================================================
   * CLIC SUR UNE NOTIFICATION
   * =========================================================
   */

  async function handleNotificationClick(
    notification: Notification
  ) {
    await markAsRead(notification);

    /**
     * Si la notification est liée à une commande,
     * on ouvre directement la page de cette commande.
     */
    if (notification.commande_uuid) {
      router.push(
        `/commandes/${notification.commande_uuid}`
      );

      return;
    }
  }

  /**
   * =========================================================
   * MARQUER TOUTES LES NOTIFICATIONS COMME LUES
   * =========================================================
   */

  async function markAllAsRead() {
    if (
      !token ||
      unreadCount === 0 ||
      markingAll
    ) {
      return;
    }

    setMarkingAll(true);

    try {
      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de marquer les notifications comme lues."
        );
      }

      const now =
        new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          lu: 1,
          read_at:
            notification.read_at ?? now,
        }))
      );
    } catch (error) {
      console.error(
        "Erreur marquage global :",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  }

  /**
   * =========================================================
   * ICÔNES
   * =========================================================
   */

  function getNotificationIcon(
    type: string
  ) {
    switch (type) {
      case "new_order":
        return (
          <ShoppingBag size={20} />
        );

      case "order_status":
        return (
          <Package size={20} />
        );

      case "order_cancelled":
        return (
          <AlertCircle size={20} />
        );

      default:
        return (
          <Bell size={20} />
        );
    }
  }

  /**
   * =========================================================
   * STYLE ICÔNE
   * =========================================================
   */

  function getNotificationIconStyle(
    type: string
  ) {
    switch (type) {
      case "new_order":
        return "bg-green-50 text-[#14a800]";

      case "order_status":
        return "bg-yellow-50 text-[#b28b00]";

      case "order_cancelled":
        return "bg-red-50 text-[#ce1126]";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /**
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  function formatDate(
    dateString: string
  ) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.lu === 0
    ).length;

  /**
   * =========================================================
   * CHARGEMENT AUTH
   * =========================================================
   */

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2
              size={20}
              className="animate-spin text-[#14a800]"
            />

            <span>
              Chargement de vos notifications...
            </span>
          </div>
        </div>
      </main>
    );
  }

  /**
   * =========================================================
   * UTILISATEUR NON CONNECTÉ
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
              Connectez-vous pour consulter vos
              notifications MarketMali.
            </p>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#14a800] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#108f00]"
            >
              Se connecter
            </Link>

            <Link
              href="/"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /**
   * =========================================================
   * PAGE PRINCIPALE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Décorations */}

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/5" />

        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-yellow-400/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          {/* Bande Mali */}

          <div className="mb-5 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-sm font-bold tracking-wide text-[#14a800]">
                MARKETMALI
              </span>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                Mes notifications
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Retrouvez ici toutes les informations
                importantes concernant vos commandes et
                votre activité sur MarketMali.
              </p>
            </div>

            {/* Compteur */}

            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#14a800]">
                <Bell size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Notifications
                </p>

                <p className="mt-0.5 text-2xl font-extrabold text-gray-950">
                  {notifications.length}
                </p>

                <p className="text-xs text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} non lue${
                        unreadCount > 1
                          ? "s"
                          : ""
                      }`
                    : "Toutes lues"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Barre supérieure */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#14a800]">
              <Bell size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-950 sm:text-base">
                Toutes les notifications
              </h2>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {notifications.length} notification
                {notifications.length > 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-[#14a800] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {markingAll ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={16} />
              )}

              {markingAll
                ? "Traitement..."
                : "Tout marquer comme lu"}
            </button>
          )}
        </div>

        {/* ===================================================
            ERREUR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Impossible de charger les notifications
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-[#14a800]"
            />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Chargement des notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* =================================================
             AUCUNE NOTIFICATION
          ================================================== */

          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-[#14a800]">
              <Bell size={34} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Aucune notification
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Vous n'avez aucune notification pour le
              moment. Nous vous informerons ici dès qu'une
              nouvelle activité concernera votre compte.
            </p>

            <Link
              href="/produits"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#14a800] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#108f00]"
            >
              Découvrir les produits
              <ChevronRight size={17} />
            </Link>
          </div>
        ) : (
          /* =================================================
             LISTE
          ================================================== */

          <div className="space-y-3">
            {notifications.map(
              (notification) => {
                const isUnread =
                  notification.lu === 0;

                const isClickable =
                  Boolean(
                    notification.commande_uuid
                  );

                return (
                  <button
                    key={notification.uuid}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    disabled={!isClickable}
                    className={`
                      group
                      w-full
                      rounded-2xl
                      border
                      p-4
                      text-left
                      shadow-sm
                      transition
                      sm:p-5
                      ${
                        isUnread
                          ? "border-green-100 bg-white hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                      }
                      ${
                        !isClickable
                          ? "cursor-default"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icône */}

                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${getNotificationIconStyle(
                            notification.type
                          )}
                        `}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* Contenu */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`
                                truncate
                                text-sm
                                ${
                                  isUnread
                                    ? "font-bold text-gray-950"
                                    : "font-semibold text-gray-800"
                                }
                              `}
                            >
                              {notification.titre}
                            </h3>

                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[#14a800]" />
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
                            <Clock size={13} />

                            <span>
                              {formatDate(
                                notification.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {notification.commande_uuid && (
                              <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-500">
                                Commande
                              </span>
                            )}

                            {isUnread && (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-[#14a800]">
                                Non lue
                              </span>
                            )}

                            {!isUnread && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-400">
                                <Check size={12} />
                                Lue
                              </span>
                            )}
                          </div>

                          {isClickable && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#14a800] transition group-hover:translate-x-0.5">
                              Voir la commande
                              <ChevronRight size={15} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}

        {/* ===================================================
            RETOUR
        ==================================================== */}

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#14a800]"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}