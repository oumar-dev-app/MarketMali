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
  FiTruck,
  FiPhone,
} from "react-icons/fi";

import LivreurNotificationModal from "@/app/dashboard/composants/notifications/LivreurNotificationModal";
import { useAuth } from "@/contexts/AuthContext";

interface LivraisonDetail {
  uuid: string;
  commande_id: number;
  livreur_id: number;
  status: string;
  created_at: string;
  updated_at?: string | null;
  assigned_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
}

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

  const [livraisonDetail, setLivraisonDetail] =
    useState<LivraisonDetail | null>(null);

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

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const previousUnreadCountRef =
    useRef<number | null>(null);

  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */

  useEffect(() => {
    if (!token || !user?.id) return;

    let isMounted = true;

    async function checkNotifications() {
      if (!isMounted) return;

      try {
        const response = await fetch(
          "/api/notifications/unread",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error(
            "Erreur API notifications :",
            data?.message
          );
          return;
        }

        const newCount = Number(
          data.data?.count ?? 0
        );

        console.log(
          "🔔 HEADER NOTIFICATIONS :",
          {
            userId: user?.id,
            role: user?.role,
            count: newCount,
          }
        );

        if (!isMounted) return;

        setUnreadCount(newCount);

        const previousCount =
          previousUnreadCountRef.current;

        if (previousCount === null) {
          previousUnreadCountRef.current =
            newCount;

          return;
        }

        if (newCount > previousCount) {
          playNotificationSound();
        }

        previousUnreadCountRef.current =
          newCount;
      } catch (error) {
        console.error(
          "Erreur vérification notifications :",
          error
        );
      }
    }

    checkNotifications();

    const interval = window.setInterval(
      checkNotifications,
      10000
    );

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [token, user?.id, user?.role]);

  /*
   * =========================================================
   * CLICK OUTSIDE
   * =========================================================
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
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

  /*
   * =========================================================
   * RÔLES
   * =========================================================
   */

  function getRoleTitle(role?: string) {
    switch (role) {
      case "vendeur":
        return "Espace vendeur";

      case "admin":
        return "Administration";

      case "super_admin":
        return "Super administration";

      case "livreur":
        return "Espace livreur";

      default:
        return "Espace MarketMali";
    }
  }

  function getRoleLabel(role?: string) {
    switch (role) {
      case "vendeur":
        return "Vendeur";

      case "admin":
        return "Administrateur";

      case "super_admin":
        return "Super administrateur";

      case "livreur":
        return "Livreur";

      default:
        return "Utilisateur";
    }
  }

  function getNotificationDescription(
    role?: string
  ) {
    switch (role) {
      case "vendeur":
        return "Activité récente de votre boutique";

      case "livreur":
        return "Activité récente de vos livraisons";

      case "admin":
      case "super_admin":
        return "Activité récente de la plateforme";

      default:
        return "Activité récente";
    }
  }

  /*
   * =========================================================
   * SON
   * =========================================================
   */

  function playNotificationSound() {
    if (typeof window === "undefined") {
      return;
    }

    const audio =
      notificationAudioRef.current;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.warn(
        "Lecture du son de notification bloquée :",
        error
      );
    });
  }

  /*
   * =========================================================
   * COMPTEUR
   * =========================================================
   */

  async function loadUnreadCount() {
    if (!token) return;

    try {
      const response = await fetch(
        "/api/notifications/unread",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUnreadCount(
          Number(data.data?.count ?? 0)
        );
      }
    } catch (error) {
      console.error(
        "Erreur chargement notifications non lues :",
        error
      );
    }
  }

  /*
   * =========================================================
   * CHARGER NOTIFICATIONS
   * =========================================================
   */

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
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications(
          Array.isArray(data.data)
            ? data.data
            : []
        );
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

  /*
   * =========================================================
   * FERMER MODAL
   * =========================================================
   */

  function closeNotificationModal() {
    setSelectedNotification(null);
    setCommandeDetail(null);
    setLivraisonDetail(null);
    setStatusComment("");
    setUpdatingStatus(false);
    setLoadingCommande(false);
  }

  /*
   * =========================================================
   * CLIQUER SUR UNE NOTIFICATION
   * =========================================================
   */

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (!token) return;

    /*
     * -------------------------------------------------------
     * Marquer comme lue
     * -------------------------------------------------------
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
                    read_at:
                      new Date().toISOString(),
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
     * -------------------------------------------------------
     * Ouvrir modal
     * -------------------------------------------------------
     */

    setShowNotifications(false);

    setSelectedNotification(notification);

    setCommandeDetail(null);
    setLivraisonDetail(null);
    setStatusComment("");

    /*
     * Notification sans commande
     */

    if (!notification.commande_uuid) {
      return;
    }

    setLoadingCommande(true);

    try {
      /*
       * -----------------------------------------------------
       * Récupération commande
       * -----------------------------------------------------
       */

      const response = await fetch(
        `/api/commandes/${notification.commande_uuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error(
          "Erreur récupération commande :",
          data?.message
        );

        return;
      }

      setCommandeDetail(data.data);

      /*
       * -----------------------------------------------------
       * Livreur :
       * récupération livraison
       * -----------------------------------------------------
       */

      if (user?.role === "livreur") {
        try {
          const livraisonResponse =
            await fetch(
              `/api/livraisons/commande/${notification.commande_uuid}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              }
            );

          const livraisonData =
            await livraisonResponse.json();

          if (
            livraisonResponse.ok &&
            livraisonData.success
          ) {
            setLivraisonDetail(
              livraisonData.data?.livraison ??
                null
            );
          } else {
            console.error(
              "Erreur récupération livraison :",
              livraisonData?.message
            );
          }
        } catch (error) {
          console.error(
            "Erreur récupération détail livraison :",
            error
          );
        }
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

  /*
   * =========================================================
   * TOUT MARQUER COMME LU
   * =========================================================
   */

  async function handleMarkAllAsRead() {
    if (!token || unreadCount === 0) {
      return;
    }

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

        setUnreadCount(0);

        previousUnreadCountRef.current = 0;
      }
    } catch (error) {
      console.error(
        "Erreur marquage de toutes les notifications :",
        error
      );
    }
  }

  /*
   * =========================================================
   * TOGGLE
   * =========================================================
   */

  function toggleNotifications() {
    const nextState =
      !showNotifications;

    setShowNotifications(nextState);

    if (nextState) {
      loadNotifications();
    }
  }

  /*
   * =========================================================
   * STATUT COMMANDE
   * =========================================================
   */

  async function handleUpdateCommandeStatus(
    status: string
  ) {
    if (
      !token ||
      !commandeDetail?.uuid ||
      updatingStatus ||
      user?.role !== "vendeur"
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
              statusComment.trim() ||
              undefined,
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
       * Recharger commande
       */

      const refreshResponse =
        await fetch(
          `/api/commandes/${commandeDetail.uuid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

      const refreshData =
        await refreshResponse.json();

      if (
        refreshResponse.ok &&
        refreshData.success
      ) {
        setCommandeDetail(
          refreshData.data
        );
      }

      setStatusComment("");

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

  /*
   * =========================================================
   * STATUTS
   * =========================================================
   */

  function getStatusLabel(
    status: string
  ) {
    const labels: Record<
      string,
      string
    > = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return (
      labels[status] ?? status
    );
  }

  function getStatusClass(
    status: string
  ) {
    const classes: Record<
      string,
      string
    > = {
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

  function getNextStatuses(
    status: string
  ) {
    const transitions: Record<
      string,
      string[]
    > = {
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

    return (
      transitions[status] ?? []
    );
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
   * RENDU
   * =========================================================
   */

  return (
    <>
      <audio
        ref={notificationAudioRef}
        src="/sounds/notification.mp3"
        preload="auto"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

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
          {/* Gauche */}

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
              {getRoleTitle(user?.role)}
            </h2>
          </div>

          {/* Droite */}

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Utilisateur */}

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
                  w-9
                  h-9
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
                {user?.prenom
                  ?.charAt(0)
                  ?.toUpperCase() ??
                  "U"}
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900">
                  {user
                    ? `${user.prenom} ${user.nom}`
                    : "Utilisateur"}
                </p>

                <p className="text-[11px] text-gray-400">
                  {getRoleLabel(user?.role)}
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
                onClick={
                  toggleNotifications
                }
                aria-label="Notifications"
                className="
                  relative
                  w-10
                  h-10
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
                      z-50
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
                      shadow-sm
                    "
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* =================================================
                  PANNEAU
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
                  {/* Header panneau */}

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
                        {getNotificationDescription(
                          user?.role
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                      className="
                        w-8
                        h-8
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

                  <div className="max-h-105 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="py-12 text-center">
                        <div
                          className="
                            w-8
                            h-8
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
                    ) : notifications.length ===
                      0 ? (
                      <div className="py-12 px-6 text-center">
                        <div
                          className="
                            w-12
                            h-12
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
                            key={
                              notification.uuid
                            }
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
                              ${
                                notification.lu ===
                                0
                                  ? "bg-blue-50/60"
                                  : "bg-white"
                              }
                            `}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`
                                  shrink-0
                                  w-9
                                  h-9
                                  rounded-xl
                                  flex
                                  items-center
                                  justify-center
                                  ${
                                    notification.lu ===
                                    0
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-gray-100 text-gray-400"
                                  }
                                `}
                              >
                                {user?.role ===
                                  "livreur" ? (
                                  <FiTruck
                                    size={17}
                                  />
                                ) : notification.commande_uuid ? (
                                  <FiPackage
                                    size={17}
                                  />
                                ) : (
                                  <FiBell
                                    size={17}
                                  />
                                )}
                              </div>

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
                                      ${
                                        notification.lu ===
                                        0
                                          ? "font-semibold text-gray-900"
                                          : "font-medium text-gray-700"
                                      }
                                    `}
                                  >
                                    {
                                      notification.titre
                                    }
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
                                  {
                                    notification.message
                                  }
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
                                  <FiClock
                                    size={11}
                                  />

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

            {/* Déconnexion desktop */}

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

              <span>
                Déconnexion
              </span>
            </button>

            {/* Déconnexion mobile */}

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
          MODAL LIVREUR
      ====================================================== */}

      {selectedNotification &&
      user?.role === "livreur" ? (
        <LivreurNotificationModal
          notification={selectedNotification}
          commande={commandeDetail}
          livraison={livraisonDetail}
          loadingCommande={loadingCommande}
          onClose={
            closeNotificationModal
          }
        />
      ) : null}

      {/* =====================================================
          MODAL VENDEUR
      ====================================================== */}

      {selectedNotification &&
      user?.role === "vendeur" ? (
        <div
          className="
            fixed
            inset-0
            z-200
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-2
            sm:p-4
          "
          onClick={
            closeNotificationModal
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
            {/* =================================================
                HEADER MODAL
            ================================================== */}

            <div
              className="
                px-4
                sm:px-6
                py-4
                border-b
                border-gray-100
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <FiPackage size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    {selectedNotification.titre}
                  </h2>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Notification de votre boutique
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeNotificationModal
                }
                className="
                  w-9
                  h-9
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
                <FiX size={19} />
              </button>
            </div>

            {/* =================================================
                CONTENU
            ================================================== */}

            <div className="flex-1 overflow-y-auto">
              {loadingCommande ? (
                <div className="py-16 text-center">
                  <div
                    className="
                      w-10
                      h-10
                      border-2
                      border-gray-200
                      border-t-gray-800
                      rounded-full
                      animate-spin
                      mx-auto
                    "
                  />

                  <p className="text-sm text-gray-500 mt-4">
                    Chargement de la commande...
                  </p>
                </div>
              ) : !commandeDetail ? (
                <div className="py-16 px-6 text-center">
                  <div
                    className="
                      w-14
                      h-14
                      rounded-full
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      mx-auto
                    "
                  >
                    <FiPackage
                      size={25}
                      className="text-gray-400"
                    />
                  </div>

                  <p className="text-sm font-semibold text-gray-700 mt-4">
                    Commande introuvable
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Impossible de récupérer les détails de cette commande.
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-5">
                  {/* Notification */}

                  <div
                    className="
                      rounded-2xl
                      bg-blue-50
                      border
                      border-blue-100
                      p-4
                    "
                  >
                    <div className="flex gap-3">
                      <FiBell
                        size={19}
                        className="text-blue-600 shrink-0 mt-0.5"
                      />

                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {
                            selectedNotification.titre
                          }
                        </p>

                        <p className="text-xs text-blue-700 mt-1 leading-5">
                          {
                            selectedNotification.message
                          }
                        </p>

                        <p className="text-[10px] text-blue-500 mt-2">
                          {formatDate(
                            selectedNotification.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Commande */}

                  <section>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FiPackage size={17} />
                        Commande
                      </h3>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          border
                          text-[11px]
                          font-semibold
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Référence
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1">
                          #
                          {commandeDetail.uuid.slice(
                            0,
                            8
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Date
                        </p>

                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {formatDate(
                            commandeDetail.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Client */}

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <FiUser size={17} />
                      Client
                    </h3>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {
                              commandeDetail.client
                                .prenom
                            }{" "}
                            {
                              commandeDetail.client
                                .nom
                            }
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {
                              commandeDetail.client
                                .email
                            }
                          </p>
                        </div>

                        <a
                          href={`tel:${commandeDetail.client.telephone}`}
                          className="
                            w-10
                            h-10
                            rounded-xl
                            bg-emerald-50
                            text-emerald-600
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                          aria-label="Appeler le client"
                        >
                          <FiPhone size={18} />
                        </a>
                      </div>

                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                        {
                          commandeDetail.client
                            .telephone
                        }
                      </p>
                    </div>
                  </section>

                  {/* Livraison */}

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <FiMapPin size={17} />
                      Livraison
                    </h3>

                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-sm text-gray-800 leading-6">
                        {commandeDetail.adresse_livraison ||
                          "Adresse non renseignée"}
                      </p>

                      {commandeDetail.latitude !==
                        null &&
                        commandeDetail.longitude !==
                          null && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${commandeDetail.latitude},${commandeDetail.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              mt-3
                              inline-flex
                              items-center
                              gap-2
                              px-3
                              py-2
                              rounded-xl
                              bg-gray-900
                              text-white
                              text-xs
                              font-semibold
                            "
                          >
                            <FiMapPin size={14} />
                            Voir la position
                          </a>
                        )}
                    </div>
                  </section>

                  {/* Produits */}

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <FiShoppingBag size={17} />
                      Produits
                    </h3>

                    <div className="space-y-2">
                      {commandeDetail.produits.map(
                        (produit) => (
                          <div
                            key={produit.id}
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              rounded-xl
                              border
                              border-gray-100
                              p-3
                            "
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {produit.image ? (
                                <img
                                  src={
                                    produit.image
                                  }
                                  alt={
                                    produit.nom
                                  }
                                  className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    object-cover
                                    shrink-0
                                  "
                                />
                              ) : (
                                <div
                                  className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-gray-100
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                  "
                                >
                                  <FiPackage
                                    size={18}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {
                                    produit.nom
                                  }
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  Quantité :{" "}
                                  {
                                    produit.quantite
                                  }
                                </p>
                              </div>
                            </div>

                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {formatMoney(
                                produit.sous_total
                              )}{" "}
                              FCFA
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>

                  {/* Total */}

                  <section
                    className="
                      rounded-2xl
                      bg-gray-900
                      text-white
                      p-4
                    "
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">
                        Sous-total
                      </span>

                      <span>
                        {formatMoney(
                          commandeDetail.total -
                            commandeDetail.frais_livraison
                        )}{" "}
                        FCFA
                      </span>
                    </div>

                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-300">
                        Livraison
                      </span>

                      <span>
                        {formatMoney(
                          commandeDetail.frais_livraison
                        )}{" "}
                        FCFA
                      </span>
                    </div>

                    <div className="border-t border-white/10 my-3" />

                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">
                        Total
                      </span>

                      <span className="text-lg font-bold">
                        {formatMoney(
                          commandeDetail.total
                        )}{" "}
                        FCFA
                      </span>
                    </div>
                  </section>

                  {/* =================================================
                      ACTIONS VENDEUR
                  ================================================== */}

                  {getNextStatuses(
                    commandeDetail.status
                  ).length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 mb-3">
                        Actions sur la commande
                      </h3>

                      <textarea
                        value={statusComment}
                        onChange={(event) =>
                          setStatusComment(
                            event.target.value
                          )
                        }
                        placeholder="Ajouter un commentaire (facultatif)..."
                        rows={3}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-gray-400
                          resize-none
                        "
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {getNextStatuses(
                          commandeDetail.status
                        ).map((nextStatus) => (
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
                              py-2.5
                              rounded-xl
                              text-xs
                              font-semibold
                              border
                              transition
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              ${
                                nextStatus ===
                                "cancelled"
                                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                  : "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                              }
                            `}
                          >
                            {updatingStatus
                              ? "Traitement..."
                              : getStatusLabel(
                                  nextStatus
                                )}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Historique */}

                  {commandeDetail.historique
                    ?.length > 0 && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <FiClock size={17} />
                        Historique
                      </h3>

                      <div className="space-y-3">
                        {commandeDetail.historique
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={
                                  item.id ??
                                  index
                                }
                                className="flex gap-3"
                              >
                                <div
                                  className="
                                    w-2
                                    h-2
                                    rounded-full
                                    bg-gray-400
                                    mt-2
                                    shrink-0
                                  "
                                />

                                <div>
                                  <p className="text-xs font-semibold text-gray-700">
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
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}

            <div
              className="
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
                onClick={
                  closeNotificationModal
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-white
                  border
                  border-gray-200
                  text-xs
                  font-semibold
                  text-gray-700
                  hover:bg-gray-100
                "
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          MODAL AUTRES RÔLES
      ====================================================== */}

      {selectedNotification &&
      user?.role !== "livreur" &&
      user?.role !== "vendeur" ? (
        <div
          className="
            fixed
            inset-0
            z-200
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-2
            sm:p-4
          "
          onClick={
            closeNotificationModal
          }
        >
          <div
            className="
              w-full
              max-w-2xl
              max-h-[95vh]
              bg-white
              rounded-2xl
              shadow-2xl
              overflow-hidden
              flex
              flex-col
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                px-4
                sm:px-6
                py-4
                border-b
                border-gray-100
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {
                    selectedNotification.titre
                  }
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {
                    selectedNotification.message
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeNotificationModal
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                "
              >
                <FiX size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loadingCommande ? (
                <div className="py-16 text-center">
                  <div
                    className="
                      w-9
                      h-9
                      border-2
                      border-gray-200
                      border-t-gray-800
                      rounded-full
                      animate-spin
                      mx-auto
                    "
                  />

                  <p className="text-sm text-gray-500 mt-4">
                    Chargement...
                  </p>
                </div>
              ) : commandeDetail ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        Commande
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        #
                        {commandeDetail.uuid.slice(
                          0,
                          8
                        )}
                      </p>
                    </div>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        border
                        text-xs
                        font-semibold
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

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">
                      Boutique
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {
                        commandeDetail.boutique
                          .nom
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-400">
                      Client
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {
                        commandeDetail.client
                          .prenom
                      }{" "}
                      {
                        commandeDetail.client
                          .nom
                      }
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {
                        commandeDetail.client
                          .telephone
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-900 text-white p-4 flex justify-between">
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
              ) : (
                <div className="py-16 text-center">
                  <FiPackage
                    size={30}
                    className="mx-auto text-gray-300"
                  />

                  <p className="text-sm text-gray-500 mt-3">
                    Aucun détail disponible.
                  </p>
                </div>
              )}
            </div>

            <div
              className="
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
                onClick={
                  closeNotificationModal
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-white
                  border
                  border-gray-200
                  text-xs
                  font-semibold
                  text-gray-700
                  hover:bg-gray-100
                "
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}