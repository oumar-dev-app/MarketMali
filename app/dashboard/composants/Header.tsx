"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiX,
  FiLogOut,
  FiPackage,
  FiUser,
  FiMapPin,
  FiClock,
  FiShoppingBag,
  FiChevronRight,
} from "react-icons/fi";

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

interface CommandeDetail {
  uuid: string;
  total: number;
  frais_livraison: number;
  status: string;
  created_at: string;
  updated_at: string;

  adresse_livraison: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_precision: number | null;

  boutique: {
    uuid: string;
    nom: string;
    slug: string;
  };

  client: {
    uuid: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };

  produits: {
    id: number;
    commande_id: number;
    produit_id: number;
    quantite: number;
    prix: number;
    uuid: string;
    nom: string;
    slug: string;
    image: string | null;
    sous_total: number;
  }[];

  historique: {
    id?: number;
    status: string;
    commentaire?: string | null;
    created_at: string;
  }[];
}

export default function Header() {
  const { user, token, logout } = useAuth();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [commandeDetail, setCommandeDetail] =
    useState<CommandeDetail | null>(null);

  const [loadingCommande, setLoadingCommande] =
    useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusComment, setStatusComment] =
    useState("");

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */

  useEffect(() => {
    if (!token) return;

    loadUnreadCount();
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function loadUnreadCount() {
    if (!token) return;

    try {
      const response = await fetch(
        "/api/notifications/unread",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error(
        "Erreur chargement notifications non lues :",
        error
      );
    }
  }

  async function loadNotifications() {
    if (!token) return;

    setLoadingNotifications(true);

    try {
      const response = await fetch(
        "/api/notifications?page=1&limit=20",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (!token) return;

    /*
     * Marquer comme lue
     */
    if (notification.lu === 0) {
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

        if (response.ok && data.success) {
          setNotifications((current) =>
            current.map((item) =>
              item.uuid === notification.uuid
                ? {
                  ...item,
                  lu: 1,
                  read_at: new Date().toISOString(),
                }
                : item
            )
          );

          setUnreadCount((current) =>
            Math.max(0, current - 1)
          );
        }
      } catch (error) {
        console.error(
          "Erreur marquage notification :",
          error
        );
      }
    }

    /*
     * Fermer le panneau
     */
    setShowNotifications(false);

    /*
     * Ouvrir le modal
     */
    setSelectedNotification(notification);

    /*
     * Réinitialiser l'ancien détail
     */
    setCommandeDetail(null);
    setStatusComment("");

    /*
     * Pas de commande liée
     */
    if (!notification.commande_uuid) {
      return;
    }

    setLoadingCommande(true);

    try {
      const response = await fetch(
        `/api/commandes/${notification.commande_uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setCommandeDetail(data.data);
      } else {
        console.error(
          "Erreur récupération commande :",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Erreur récupération détail commande :",
        error
      );
    } finally {
      setLoadingCommande(false);
    }
  }

  async function handleMarkAllAsRead() {
    if (!token || unreadCount === 0) return;

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

      if (response.ok && data.success) {
        const now = new Date().toISOString();

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            lu: 1,
            read_at:
              notification.read_at ?? now,
          }))
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Erreur marquage de toutes les notifications :",
        error
      );
    }
  }

  function toggleNotifications() {
    const nextState = !showNotifications;

    setShowNotifications(nextState);

    if (nextState) {
      loadNotifications();
    }
  }

  /*
   * =========================================================
   * COMMANDE
   * =========================================================
   */

  async function handleUpdateCommandeStatus(
    status: string
  ) {
    if (
      !token ||
      !commandeDetail?.uuid ||
      updatingStatus
    ) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const response = await fetch(
        `/api/commandes/${commandeDetail.uuid}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            commentaire:
              statusComment.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
          "Impossible de modifier le statut."
        );

        return;
      }

      /*
       * Recharger la commande
       */
      const refreshResponse = await fetch(
        `/api/commandes/${commandeDetail.uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const refreshData =
        await refreshResponse.json();

      if (
        refreshResponse.ok &&
        refreshData.success
      ) {
        setCommandeDetail(refreshData.data);
      }

      setStatusComment("");

      /*
       * Actualiser le badge notifications
       */
      await loadUnreadCount();
    } catch (error) {
      console.error(
        "Erreur changement statut commande :",
        error
      );

      alert(
        "Une erreur est survenue lors de la modification du statut."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return labels[status] ?? status;
  }

  function getStatusClass(status: string) {
    const classes: Record<string, string> = {
      pending:
        "bg-amber-50 text-amber-700 border-amber-200",

      confirmed:
        "bg-blue-50 text-blue-700 border-blue-200",

      preparing:
        "bg-purple-50 text-purple-700 border-purple-200",

      shipped:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

      delivered:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

      cancelled:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      classes[status] ??
      "bg-gray-50 text-gray-700 border-gray-200"
    );
  }

  function getNextStatuses(status: string) {
    const transitions: Record<string, string[]> = {
      pending: [
        "confirmed",
        "cancelled",
      ],

      confirmed: [
        "preparing",
        "cancelled",
      ],

      preparing: [
        "shipped",
        "cancelled",
      ],

      shipped: [
        "delivered",
      ],

      delivered: [],

      cancelled: [],
    };

    return transitions[status] ?? [];
  }

  /*
   * =========================================================
   * FORMATAGE
   * =========================================================
   */

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  }

  function formatMoney(value: number) {
    return Number(value).toLocaleString(
      "fr-FR"
    );
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <>
      <header
        className="
          sticky top-0 z-40
          h-16
          bg-white
          border-b border-gray-200
          shadow-sm
        "
      >
        <div
          className="
    h-full
    pl-16
    pr-3
    sm:px-5
    lg:px-6
    flex
    items-center
    justify-between
    gap-3
  "
        >
          {/* =================================================
              GAUCHE
          ================================================== */}

          <div className="min-w-0">
            <p
              className="
                text-[11px]
                sm:text-xs
                font-medium
                text-gray-400
                uppercase
                tracking-wide
              "
            >
              MarketMali
            </p>

            <h2
              className="
                text-sm
                sm:text-base
                font-semibold
                text-gray-900
                truncate
              "
            >
              Administration
            </h2>
          </div>

          {/* =================================================
              DROITE
          ================================================== */}

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Utilisateur desktop */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-3
                pr-3
                border-r
                border-gray-200
              "
            >
              <div
                className="
                  w-9 h-9
                  rounded-full
                  bg-gray-900
                  text-white
                  flex
                  items-center
                  justify-center
                  text-sm
                  font-semibold
                "
              >
                {user?.prenom?.charAt(0)?.toUpperCase() ??
                  "U"}
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900">
                  {user
                    ? `${user.prenom} ${user.nom}`
                    : "Utilisateur"}
                </p>

                <p className="text-[11px] text-gray-400">
                  Administrateur
                </p>
              </div>
            </div>

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                className="
                  relative
                  w-10 h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-gray-600
                  hover:text-gray-900
                  hover:bg-gray-100
                  transition
                "
              >
                <FiBell size={21} />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1
                      min-w-5
                      h-5
                      px-1
                      rounded-full
                      bg-red-600
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                      border-2
                      border-white
                    "
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* =================================================
                  PANNEAU NOTIFICATIONS
              ================================================== */}

              {showNotifications && (
                <div
                  className="
                    fixed
                    sm:absolute
                    top-16
                    sm:top-12
                    left-2
                    right-2
                    sm:left-auto
                    sm:right-0
                    w-auto
                    sm:w-95
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    shadow-2xl
                    overflow-hidden
                    z-100
                  "
                >
                  {/* Header */}

                  <div
                    className="
                      px-4
                      py-4
                      border-b
                      border-gray-100
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          Notifications
                        </h3>

                        {unreadCount > 0 && (
                          <span
                            className="
                              px-2
                              py-0.5
                              rounded-full
                              bg-red-50
                              text-red-600
                              text-[10px]
                              font-semibold
                            "
                          >
                            {unreadCount} nouvelle
                            {unreadCount > 1
                              ? "s"
                              : ""}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1">
                        Activité récente de votre boutique
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(false)
                      }
                      className="
                        w-8 h-8
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-gray-400
                        hover:text-gray-700
                        hover:bg-gray-100
                      "
                    >
                      <FiX size={18} />
                    </button>
                  </div>

                  {/* Liste */}

                  <div className="max-h-[420px] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="py-12 text-center">
                        <div
                          className="
                            w-8 h-8
                            border-2
                            border-gray-200
                            border-t-gray-800
                            rounded-full
                            animate-spin
                            mx-auto
                          "
                        />

                        <p className="text-xs text-gray-400 mt-3">
                          Chargement des notifications...
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 px-6 text-center">
                        <div
                          className="
                            w-12 h-12
                            rounded-full
                            bg-gray-100
                            flex
                            items-center
                            justify-center
                            mx-auto
                          "
                        >
                          <FiBell
                            size={22}
                            className="text-gray-400"
                          />
                        </div>

                        <p className="text-sm font-medium text-gray-700 mt-4">
                          Aucune notification
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Vous êtes à jour.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification.uuid}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`
                              w-full
                              text-left
                              px-4
                              py-4
                              border-b
                              border-gray-100
                              transition
                              hover:bg-gray-50
                              ${notification.lu === 0
                                ? "bg-blue-50/60"
                                : "bg-white"
                              }
                            `}
                          >
                            <div className="flex gap-3">
                              {/* Icône */}

                              <div
                                className={`
                                  shrink-0
                                  w-9
                                  h-9
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  ${notification.lu === 0
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-400"
                                  }
                                `}
                              >
                                {notification.commande_uuid ? (
                                  <FiPackage size={17} />
                                ) : (
                                  <FiBell size={17} />
                                )}
                              </div>

                              {/* Texte */}

                              <div className="flex-1 min-w-0">
                                <div
                                  className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                  "
                                >
                                  <p
                                    className={`
                                      text-sm
                                      truncate
                                      ${notification.lu === 0
                                        ? "font-semibold text-gray-900"
                                        : "font-medium text-gray-700"
                                      }
                                    `}
                                  >
                                    {notification.titre}
                                  </p>

                                  {notification.lu ===
                                    1 && (
                                      <FiCheck
                                        size={14}
                                        className="text-emerald-500 shrink-0"
                                      />
                                    )}
                                </div>

                                <p
                                  className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                    leading-5
                                    line-clamp-2
                                  "
                                >
                                  {notification.message}
                                </p>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                    mt-2
                                    text-[10px]
                                    text-gray-400
                                  "
                                >
                                  <FiClock size={11} />

                                  {formatDate(
                                    notification.created_at
                                  )}
                                </div>
                              </div>

                              <FiChevronRight
                                size={15}
                                className="
                                  shrink-0
                                  mt-2
                                  text-gray-300
                                "
                              />
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>

                  {/* Footer */}

                  {unreadCount > 0 && (
                    <div
                      className="
                        px-4
                        py-3
                        border-t
                        border-gray-100
                        bg-gray-50
                      "
                    >
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="
                          w-full
                          py-2
                          rounded-lg
                          text-xs
                          font-semibold
                          text-blue-600
                          hover:bg-blue-50
                          transition
                        "
                      >
                        ✓ Tout marquer comme lu
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                DÉCONNEXION
            ================================================== */}

            <button
              type="button"
              onClick={logout}
              className="
                hidden
                sm:flex
                items-center
                gap-2
                h-10
                px-3
                rounded-xl
                text-sm
                font-medium
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              <FiLogOut size={17} />

              <span>Déconnexion</span>
            </button>

            {/* Mobile logout */}

            <button
              type="button"
              onClick={logout}
              aria-label="Déconnexion"
              className="
                sm:hidden
                w-10
                h-10
                rounded-xl
                flex
                items-center
                justify-center
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MODAL NOTIFICATION / COMMANDE
      ====================================================== */}

      {selectedNotification && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-2
            sm:p-4
          "
          onClick={() =>
            setSelectedNotification(null)
          }
        >
          <div
            className="
              w-full
              max-w-2xl
              max-h-[95vh]
              sm:max-h-[90vh]
              bg-white
              rounded-2xl
              sm:rounded-3xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}

            <div
              className="
                shrink-0
                px-4
                sm:px-6
                py-4
                border-b
                border-gray-100
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-9 h-9
                      rounded-xl
                      bg-blue-100
                      text-blue-600
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    {selectedNotification.commande_uuid ? (
                      <FiPackage size={18} />
                    ) : (
                      <FiBell size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                        text-base
                        sm:text-lg
                        font-bold
                        text-gray-900
                        truncate
                      "
                    >
                      {selectedNotification.titre}
                    </h3>

                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                      {formatDate(
                        selectedNotification.created_at
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                className="
                  w-9 h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  hover:text-gray-700
                  hover:bg-gray-100
                  shrink-0
                "
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal body */}

            <div
              className="
                flex-1
                overflow-y-auto
                px-4
                sm:px-6
                py-5
                space-y-4
              "
            >
              {/* Message */}

              <div
                className="
                  rounded-xl
                  bg-blue-50
                  border
                  border-blue-100
                  p-4
                "
              >
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                  Notification
                </p>

                <p className="text-sm text-gray-700 mt-1 leading-6">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Loading */}

              {loadingCommande && (
                <div className="py-10 text-center">
                  <div
                    className="
                      w-8 h-8
                      border-2
                      border-gray-200
                      border-t-gray-800
                      rounded-full
                      animate-spin
                      mx-auto
                    "
                  />

                  <p className="text-xs text-gray-400 mt-3">
                    Chargement de la commande...
                  </p>
                </div>
              )}

              {/* =================================================
                  COMMANDE
              ================================================== */}

              {!loadingCommande &&
                commandeDetail && (
                  <>
                    {/* Informations commande */}

                    <div className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <div className="flex items-center gap-2">
                          <FiShoppingBag
                            size={16}
                            className="text-gray-500"
                          />

                          <h4 className="text-sm font-bold text-gray-900">
                            Informations de la commande
                          </h4>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-gray-400">
                            Numéro
                          </p>

                          <p className="text-sm font-bold text-gray-900 mt-1">
                            #
                            {
                              selectedNotification.commande_id
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">
                            Statut
                          </p>

                          <span
                            className={`
                              inline-flex
                              items-center
                              mt-1
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              border
                              ${getStatusClass(
                              commandeDetail.status
                            )}
                            `}
                          >
                            {getStatusLabel(
                              commandeDetail.status
                            )}
                          </span>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">
                            Total
                          </p>

                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {formatMoney(
                              commandeDetail.total
                            )}{" "}
                            FCFA
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">
                            Livraison
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatMoney(
                              commandeDetail.frais_livraison
                            )}{" "}
                            FCFA
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Client */}

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FiUser
                            size={15}
                            className="text-gray-500"
                          />
                        </div>

                        <h4 className="text-sm font-bold text-gray-900">
                          Client
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[11px] text-gray-400">
                            Nom
                          </p>

                          <p className="font-medium text-gray-900 mt-1">
                            {commandeDetail.client.nom}{" "}
                            {commandeDetail.client.prenom}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">
                            Téléphone
                          </p>

                          <p className="font-medium text-gray-900 mt-1">
                            {
                              commandeDetail.client
                                .telephone
                            }
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-[11px] text-gray-400">
                            Email
                          </p>

                          <p className="font-medium text-gray-900 mt-1 break-all">
                            {
                              commandeDetail.client
                                .email
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Livraison */}

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FiMapPin
                            size={15}
                            className="text-gray-500"
                          />
                        </div>

                        <h4 className="text-sm font-bold text-gray-900">
                          Livraison
                        </h4>
                      </div>

                      <p className="text-[11px] text-gray-400">
                        Adresse
                      </p>

                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {commandeDetail.adresse_livraison ||
                          "Adresse non renseignée"}
                      </p>

                      {commandeDetail.latitude !==
                        null &&
                        commandeDetail.longitude !==
                        null && (
                          <div className="mt-4 pt-3 border-t">
                            <p className="text-[11px] text-gray-400">
                              Position GPS
                            </p>

                            <p className="text-xs font-medium text-gray-700 mt-1">
                              {
                                commandeDetail.latitude
                              }
                              ,{" "}
                              {
                                commandeDetail.longitude
                              }
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Produits */}

                    <div className="rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <div className="flex items-center gap-2">
                          <FiPackage
                            size={16}
                            className="text-gray-500"
                          />

                          <h4 className="text-sm font-bold text-gray-900">
                            Produits commandés
                          </h4>
                        </div>
                      </div>

                      <div className="divide-y">
                        {commandeDetail.produits.map(
                          (produit) => (
                            <div
                              key={produit.id}
                              className="
                                p-4
                                flex
                                items-center
                                justify-between
                                gap-4
                              "
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {produit.nom}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {produit.quantite} ×{" "}
                                  {formatMoney(
                                    produit.prix
                                  )}{" "}
                                  FCFA
                                </p>
                              </div>

                              <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                {formatMoney(
                                  produit.sous_total
                                )}{" "}
                                FCFA
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      <div className="px-4 py-4 bg-gray-900 text-white flex items-center justify-between">
                        <span className="text-sm">
                          Total
                        </span>

                        <span className="text-lg font-bold">
                          {formatMoney(
                            commandeDetail.total
                          )}{" "}
                          FCFA
                        </span>
                      </div>
                    </div>

                    {/* Historique */}

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FiClock
                            size={15}
                            className="text-gray-500"
                          />
                        </div>

                        <h4 className="text-sm font-bold text-gray-900">
                          Historique
                        </h4>
                      </div>

                      {commandeDetail.historique
                        .length === 0 ? (
                        <p className="text-sm text-gray-400">
                          Aucun historique disponible.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {commandeDetail.historique.map(
                            (item, index) => (
                              <div
                                key={
                                  item.id ?? index
                                }
                                className="flex gap-3"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`
                                      w-3
                                      h-3
                                      rounded-full
                                      ${index ===
                                        commandeDetail
                                          .historique
                                          .length -
                                        1
                                        ? "bg-blue-600"
                                        : "bg-gray-300"
                                      }
                                    `}
                                  />

                                  {index !==
                                    commandeDetail
                                      .historique
                                      .length -
                                    1 && (
                                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                                    )}
                                </div>

                                <div className="pb-2">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {getStatusLabel(
                                      item.status
                                    )}
                                  </p>

                                  {item.commentaire && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {
                                        item.commentaire
                                      }
                                    </p>
                                  )}

                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {formatDate(
                                      item.created_at
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}

                    {getNextStatuses(
                      commandeDetail.status
                    ).length > 0 && (
                        <div className="rounded-2xl border border-gray-200 p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            Gestion de la commande
                          </h4>

                          <textarea
                            value={statusComment}
                            onChange={(event) =>
                              setStatusComment(
                                event.target.value
                              )
                            }
                            rows={3}
                            placeholder="Ajouter un commentaire facultatif..."
                            className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            py-2.5
                            text-sm
                            outline-none
                            resize-none
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-50
                          "
                          />

                          <div className="flex flex-wrap gap-2 mt-3">
                            {getNextStatuses(
                              commandeDetail.status
                            ).map(
                              (nextStatus) => (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  disabled={
                                    updatingStatus
                                  }
                                  onClick={() =>
                                    handleUpdateCommandeStatus(
                                      nextStatus
                                    )
                                  }
                                  className={`
                                  px-4
                                  py-2.5
                                  rounded-xl
                                  text-xs
                                  font-semibold
                                  text-white
                                  transition
                                  disabled:opacity-50
                                  disabled:cursor-not-allowed
                                  ${nextStatus ===
                                      "cancelled"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-gray-900 hover:bg-gray-800"
                                    }
                                `}
                                >
                                  {updatingStatus
                                    ? "Mise à jour..."
                                    : getStatusLabel(
                                      nextStatus
                                    )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </>
                )}

              {/* Erreur */}

              {!loadingCommande &&
                selectedNotification.commande_uuid &&
                !commandeDetail && (
                  <div
                    className="
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      p-4
                    "
                  >
                    <p className="text-sm text-red-700">
                      Impossible de récupérer les
                      informations de cette commande.
                    </p>
                  </div>
                )}
            </div>

            {/* Footer */}

            <div
              className="
                shrink-0
                px-4
                sm:px-6
                py-3
                border-t
                border-gray-100
                bg-gray-50
                flex
                justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-gray-900
                  text-white
                  text-xs
                  sm:text-sm
                  font-semibold
                  hover:bg-gray-800
                  transition
                "
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}