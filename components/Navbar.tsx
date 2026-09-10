"use client";

import Link from "next/link";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

import {
  Bell,
  Check,
  X,
  Package,
  Clock,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Truck,
  Phone,
  Car,
  Tag,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

/* ============================================================
   TYPES
============================================================ */

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

interface CommandeProduit {
  id: number;
  commande_id: number;
  produit_id: number;
  quantite: number;
  prix: number;
  promotion_id: number | null;
  uuid: string;
  nom: string;
  slug: string;
  image: string | null;
  sous_total: number;
}

interface CommandeHistorique {
  id: number;
  statut: string;
  commentaire: string | null;
  created_at: string;
}

interface CommandeLivreur {
  uuid: string;
  nom: string;
  prenom?: string | null;
  telephone?: string | null;
  vehicule?: string | null;
  status?: string | null;
  disponibilite?: string | null;
}

interface CommandeDetail {
  id: number;
  uuid: string;

  status: string;

  total: number;

  frais_livraison?: number;

  zone_livraison?: string | null;

  adresse_livraison?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  gps_precision?: number | null;

  created_at: string;

  updated_at?: string;

  boutique?: {
    uuid: string;
    nom: string;
    slug?: string | null;
  } | null;

  client?: {
    uuid: string;
    nom: string;
    prenom?: string | null;
    email?: string | null;
    telephone?: string | null;
  } | null;

  livreur?: CommandeLivreur | null;

  produits?: CommandeProduit[];

  historique?: CommandeHistorique[];
}

interface NotificationAction {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/* ============================================================
   NAVBAR
============================================================ */

export default function Navbar() {
  const { items } = useCart();

  const {
    user,
    token,
    logout,
  } = useAuth();

  const router = useRouter();

  /* ==========================================================
     STATES
  ========================================================== */

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    loadingNotifications,
    setLoadingNotifications,
  ] = useState(false);

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState<Notification | null>(null);

  const [
    commandeDetail,
    setCommandeDetail,
  ] = useState<CommandeDetail | null>(null);

  const [
    loadingCommande,
    setLoadingCommande,
  ] = useState(false);

  const [
    commandeError,
    setCommandeError,
  ] = useState(false);

  /* ==========================================================
     REFS
  ========================================================== */

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const previousUnreadCountRef =
    useRef<number | null>(null);

  const knownNotificationUuidsRef = useRef<Set<string>>(new Set());
  const notificationsInitializedRef = useRef(false);
  const notificationRequestRef = useRef(false);

  const audioUnlockedRef =
    useRef(false);

  /* ==========================================================
     PANIER
  ========================================================== */

  const cartCount =
    items.reduce(
      (total, item) =>
        total + (item.quantity || 0),
      0
    );

  /* ============================================================
     NORMALISER LES NOTIFICATIONS
  ============================================================ */

  function normalizeNotifications(
    data: any
  ): Notification[] {
    const list =
      data?.notifications ??
      data?.data?.notifications ??
      data?.data ??
      data;

    if (!Array.isArray(list)) {
      return [];
    }

    return list.map(
      (notification: any) => ({
        ...notification,

        id: Number(
          notification.id ?? 0
        ),

        user_id: Number(
          notification.user_id ?? 0
        ),

        commande_id:
          notification.commande_id !==
            null &&
            notification.commande_id !==
            undefined
            ? Number(
              notification.commande_id
            )
            : null,

        lu:
          Number(notification.lu) === 1
            ? 1
            : 0,
      })
    );
  }

  /* ============================================================
     COMPTER LES NON LUES
  ============================================================ */

  function countUnread(
    list: Notification[]
  ) {
    return list.filter(
      (notification) =>
        Number(notification.lu) === 0
    ).length;
  }

  /* ============================================================
     SON
  ============================================================ */

  function playNotificationSound() {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const audio =
      notificationAudioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.pause();

      audio.currentTime = 0;

      const promise =
        audio.play();

      if (
        promise !== undefined
      ) {
        promise.catch(
          (error) => {
            console.warn(
              "Lecture du son bloquée par le navigateur :",
              error
            );
          }
        );
      }
    } catch (error) {
      console.warn(
        "Impossible de jouer le son :",
        error
      );
    }
  }

  /* ============================================================
     DÉVERROUILLER LE SON APRÈS UNE INTERACTION UTILISATEUR
  ============================================================ */

  useEffect(() => {
    function unlockAudio() {
      if (
        audioUnlockedRef.current
      ) {
        return;
      }

      const audio =
        notificationAudioRef.current;

      if (!audio) {
        return;
      }

      try {
        audio.muted = true;

        const promise =
          audio.play();

        if (
          promise !== undefined
        ) {
          promise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;

              audioUnlockedRef.current =
                true;
            })
            .catch(() => {
              audio.muted = false;
            });
        }
      } catch {
        audio.muted = false;
      }
    }

    window.addEventListener(
      "pointerdown",
      unlockAudio,
      { once: true }
    );

    window.addEventListener(
      "touchstart",
      unlockAudio,
      { once: true }
    );

    window.addEventListener(
      "keydown",
      unlockAudio,
      { once: true }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlockAudio
      );

      window.removeEventListener(
        "touchstart",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );
    };
  }, []);

  /* ============================================================
     RÉCUPÉRER LES NOTIFICATIONS
  ============================================================ */

  async function fetchNotifications(
    playSoundForNew = false
  ) {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      previousUnreadCountRef.current = null;
      knownNotificationUuidsRef.current.clear();
      notificationsInitializedRef.current = false;
      return;
    }

    if (notificationRequestRef.current) {
      return;
    }

    notificationRequestRef.current = true;

    try {
      const response = await fetch(
        "/api/notifications?page=1&limit=20",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type": "application/json",
          },

          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error(
          "Erreur API notifications :",
          response.status
        );

        return;
      }

      const data = await response.json();

      const list =
        normalizeNotifications(data);

      const newUnreadCount =
        countUnread(list);

      /* ========================================================
         DÉTECTER LES VRAIES NOUVELLES NOTIFICATIONS
      ======================================================== */

      const knownUuids = knownNotificationUuidsRef.current;

      const isInitialized =
        notificationsInitializedRef.current;

      const newNotifications = isInitialized
        ? list.filter(
          (notification) =>
            notification.uuid &&
            !knownUuids.has(notification.uuid)
        )
        : [];

      if (
        isInitialized &&
        playSoundForNew &&
        newNotifications.some(
          (notification) =>
            Number(notification.lu) === 0
        )
      ) {
        playNotificationSound();
      }

      list.forEach((notification) => {
        if (notification.uuid) {
          knownUuids.add(notification.uuid);
        }
      });

      notificationsInitializedRef.current = true;

      setNotifications(list);

      setUnreadCount(
        newUnreadCount
      );

      previousUnreadCountRef.current =
        newUnreadCount;
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error
      );
    } finally {
      notificationRequestRef.current =
        false;
    }
  }

  /* ============================================================
     POLLING 10 SECONDES
  ============================================================ */

  useEffect(() => {
    if (
      !token ||
      !user
    ) {
      setNotifications([]);

      setUnreadCount(0);

      previousUnreadCountRef.current =
        null;

      return;
    }

    fetchNotifications(false);

    const interval =
      window.setInterval(() => {
        fetchNotifications(true);
      }, 10000);

    function handleNotificationsRefresh() {
      fetchNotifications(true);
    }

    window.addEventListener(
      "notifications:refresh",
      handleNotificationsRefresh
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "notifications:refresh",
        handleNotificationsRefresh
      );
    };
  }, [token, user]);

  /* ============================================================
     CLICK EXTÉRIEUR
  ============================================================ */

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
        setShowNotifications(
          false
        );
      }
    }

    if (
      showNotifications
    ) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [
    showNotifications,
  ]);

  /* ============================================================
     CHARGER LES NOTIFICATIONS DU PANNEAU
  ============================================================ */

  async function loadNotificationsForPanel() {
    if (
      !token ||
      !user
    ) {
      return;
    }

    setLoadingNotifications(
      true
    );

    try {
      const response =
        await fetch(
          "/api/notifications?page=1&limit=20",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const list =
        normalizeNotifications(
          data
        );

      setNotifications(list);

      const newUnreadCount =
        countUnread(list);

      setUnreadCount(
        newUnreadCount
      );

      previousUnreadCountRef.current =
        newUnreadCount;

      /*
       * Les notifications affichées dans le panneau
       * deviennent des notifications connues.
       *
       * Aucun son ici.
       */
      list.forEach(
        (notification) => {
          if (notification.uuid) {
            knownNotificationUuidsRef.current.add(
              notification.uuid
            );
          }
        }
      );

      notificationsInitializedRef.current = true;
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error
      );
    } finally {
      setLoadingNotifications(
        false
      );
    }
  }

  /* ============================================================
     TOGGLE NOTIFICATIONS
  ============================================================ */

  async function toggleNotifications() {
    const nextValue =
      !showNotifications;

    setShowNotifications(
      nextValue
    );

    setProfileMenuOpen(
      false
    );

    setMobileMenuOpen(
      false
    );

    if (nextValue) {
      await loadNotificationsForPanel();
    }
  }

  /* ============================================================
     ACTION NOTIFICATION
  ============================================================ */

  function getNotificationAction(
    notification: Notification
  ): NotificationAction | null {
    if (
      notification.commande_uuid
    ) {
      return {
        label:
          "Voir les détails de la commande",

        href:
          `/commandes/${notification.commande_uuid}`,

        icon:
          <Package size={16} />,
      };
    }

    if (
      notification.type ===
      "role_request"
    ) {
      return {
        label:
          "Voir ma demande",

        href:
          "/demande-role",

        icon:
          <ChevronRight size={16} />,
      };
    }

    return null;
  }

  /* ============================================================
     MARQUER COMME LU
  ============================================================ */

  async function markNotificationAsRead(
    notification: Notification
  ) {
    if (!token) {
      return;
    }

    if (
      Number(notification.lu) !==
      0
    ) {
      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (item) =>
            item.uuid ===
              notification.uuid
              ? {
                ...item,

                lu: 1,

                read_at:
                  new Date().toISOString(),
              }
              : item
        )
    );

    setUnreadCount(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    );

    if (
      previousUnreadCountRef.current !==
      null
    ) {
      previousUnreadCountRef.current =
        Math.max(
          0,
          previousUnreadCountRef.current -
          1
        );
    }

    try {
      const response =
        await fetch(
          `/api/notifications/${notification.uuid}/read`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      if (!response.ok) {
        console.warn(
          "Notification non marquée comme lue côté serveur."
        );
      }
    } catch (error) {
      console.error(
        "Erreur marquage notification :",
        error
      );
    }
  }

  /* ============================================================
     CLIC NOTIFICATION
  ============================================================ */

  async function handleNotificationClick(
    notification: Notification
  ) {
    setShowNotifications(
      false
    );

    setSelectedNotification(
      notification
    );

    setCommandeDetail(
      null
    );

    setCommandeError(
      false
    );

    void markNotificationAsRead(
      notification
    );

    if (
      !notification.commande_uuid
    ) {
      return;
    }

    if (!token) {
      return;
    }

    setLoadingCommande(
      true
    );

    try {
      const response =
        await fetch(
          `/api/commandes/${notification.commande_uuid}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Erreur commande HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const commande =
        data?.commande ??
        data?.data?.commande ??
        data?.data ??
        data;

      if (
        !commande ||
        typeof commande !==
        "object"
      ) {
        throw new Error(
          "Réponse commande invalide."
        );
      }

      setCommandeDetail(
        commande
      );
    } catch (error) {
      console.error(
        "Erreur récupération détail commande :",
        error
      );

      setCommandeError(
        true
      );
    } finally {
      setLoadingCommande(
        false
      );
    }
  }

  /* ============================================================
     TOUT MARQUER COMME LU
  ============================================================ */

  async function handleMarkAllAsRead() {
    if (!token) {
      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,

            lu: 1,

            read_at:
              new Date().toISOString(),
          })
        )
    );

    setUnreadCount(0);

    previousUnreadCountRef.current =
      0;

    try {
      const response =
        await fetch(
          "/api/notifications/read-all",
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      if (!response.ok) {
        console.warn(
          "Impossible de marquer toutes les notifications."
        );
      }
    } catch (error) {
      console.error(
        "Erreur marquage toutes les notifications :",
        error
      );
    }
  }

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  function formatDate(
    date: string
  ) {
    try {
      return new Intl.DateTimeFormat(
        "fr-FR",
        {
          day: "2-digit",

          month: "2-digit",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit",
        }
      ).format(
        new Date(date)
      );
    } catch {
      return date;
    }
  }

  /* ============================================================
     FORMAT ARGENT
  ============================================================ */

  function formatMoney(
    value:
      | number
      | string
      | null
      | undefined
  ) {
    const number =
      Number(value ?? 0);

    return new Intl.NumberFormat(
      "fr-FR",
      {
        maximumFractionDigits: 0,
      }
    ).format(number);
  }

  /* ============================================================
     STATUT COMMANDE
  ============================================================ */

  function getStatusLabel(
    status: string
  ) {
    switch (status) {
      case "pending":
        return "En attente";

      case "confirmed":
        return "Confirmée";

      case "preparing":
        return "En préparation";

      case "shipped":
        return "Expédiée";

      case "delivery_pending_confirmation":
        return "En attente de confirmation";

      case "delivered":
        return "Livrée";

      case "cancelled":
        return "Annulée";

      default:
        return status;
    }
  }

  /* ============================================================
     COULEUR STATUT
  ============================================================ */

  function getStatusClass(
    status: string
  ) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "preparing":
        return "bg-orange-100 text-orange-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivery_pending_confirmation":
        return "bg-indigo-100 text-indigo-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /* ============================================================
     LIVREUR STATUS
  ============================================================ */

  function getLivreurStatusLabel(
    status?: string | null
  ) {
    switch (status) {
      case "active":
        return "Actif";

      case "inactive":
        return "Inactif";

      case "suspended":
        return "Suspendu";

      default:
        return status || "—";
    }
  }

  /* ============================================================
     LIVREUR DISPONIBILITÉ
  ============================================================ */

  function getLivreurDisponibiliteLabel(
    disponibilite?: string | null
  ) {
    switch (
    disponibilite
    ) {
      case "available":
        return "Disponible";

      case "unavailable":
        return "Indisponible";

      default:
        return (
          disponibilite || "—"
        );
    }
  }

  /* ============================================================
     FERMER MODAL
  ============================================================ */

  function closeNotificationModal() {
    setSelectedNotification(
      null
    );

    setCommandeDetail(
      null
    );

    setCommandeError(
      false
    );

    setLoadingCommande(
      false
    );
  }

  /* ============================================================
     ACTION MODAL
  ============================================================ */

  function handleNotificationAction() {
    if (
      !selectedNotification
    ) {
      return;
    }

    const action =
      getNotificationAction(
        selectedNotification
      );

    if (!action) {
      return;
    }

    closeNotificationModal();

    router.push(
      action.href
    );
  }

  /* ============================================================
     LOGOUT
  ============================================================ */

  async function handleLogout() {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    setShowNotifications(false);

    knownNotificationUuidsRef.current.clear();

    previousUnreadCountRef.current = null;

    try {
      await logout();
    } catch (error) {
      console.error(
        "Erreur déconnexion :",
        error
      );
    }
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ======================================================
          AUDIO
      ======================================================= */}

      <audio
        ref={
          notificationAudioRef
        }
        src="/sounds/notification.mp3"
        preload="auto"
      />

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">

          {/* ==================================================
              LOGO
          =================================================== */}

          <Link
            href="/"
            className="shrink-0"
            onClick={() => {
              setMobileMenuOpen(
                false
              );

              setProfileMenuOpen(
                false
              );

              setShowNotifications(
                false
              );
            }}
          >
            <div className="text-xl font-extrabold leading-none tracking-tight sm:text-2xl">
              <span className="text-green-600">
                Market
              </span>

              <span className="text-yellow-400">
                M
              </span>

              <span className="text-red-600">
                ali
              </span>
            </div>

            <div className="mt-1 text-[9px] font-medium text-gray-500 sm:text-[10px]">
              Le marché malien en ligne
            </div>
          </Link>

          {/* ==================================================
              NAVIGATION DESKTOP
          =================================================== */}

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 transition hover:text-green-600"
            >
              Accueil
            </Link>

            <Link
              href="/boutiques"
              className="text-sm font-medium text-gray-700 transition hover:text-green-600"
            >
              Boutiques
            </Link>

            <Link
              href="/categories"
              className="text-sm font-medium text-gray-700 transition hover:text-green-600"
            >
              Catégories
            </Link>

            <Link
              href="/produits"
              className="text-sm font-medium text-gray-700 transition hover:text-green-600"
            >
              Produits
            </Link>
          </nav>

          {/* ==================================================
              ACTIONS
          =================================================== */}

          <div className="flex items-center gap-1 sm:gap-2">

            {/* ==================================================
                PANIER
            =================================================== */}

            <Link
              href="/panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-green-600"
              aria-label="Panier"
            >
              <FaShoppingCart
                size={18}
              />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-4.75 min-w-4.75 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            {/* ==================================================
                NOTIFICATIONS
                VISIBLE DESKTOP + MOBILE
            =================================================== */}

            {user && (
              <div
                ref={
                  notificationRef
                }
                className="relative"
              >
                <button
                  type="button"
                  onClick={
                    toggleNotifications
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-green-600"
                  aria-label="Notifications"
                >
                  <Bell size={20} />

                  {unreadCount >
                    0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-h-4.75 min-w-4.75 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-sm">
                        {unreadCount >
                          99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                </button>

                {/* ==================================================
                    PANNEAU
                =================================================== */}

                {showNotifications && (
                  <div className="fixed left-2 right-2 top-17 z-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[380px]">

                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Notifications
                        </h3>

                        <p className="text-xs text-gray-500">
                          {unreadCount >
                            0
                            ? `${unreadCount} notification${unreadCount >
                              1
                              ? "s"
                              : ""
                            } non lue${unreadCount >
                              1
                              ? "s"
                              : ""
                            }`
                            : "Aucune notification non lue"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {unreadCount >
                          0 && (
                            <button
                              type="button"
                              onClick={
                                handleMarkAllAsRead
                              }
                              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                            >
                              <Check
                                size={14}
                              />

                              Tout lire
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            setShowNotifications(
                              false
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                          aria-label="Fermer"
                        >
                          <X
                            size={16}
                          />
                        </button>
                      </div>
                    </div>

                    {/* LISTE */}

                    <div className="max-h-[65vh] overflow-y-auto sm:max-h-105">

                      {loadingNotifications ? (
                        <div className="flex items-center justify-center px-4 py-10">
                          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
                        </div>
                      ) : notifications.length ===
                        0 ? (
                        <div className="px-6 py-10 text-center">
                          <Bell
                            size={30}
                            className="mx-auto mb-3 text-gray-300"
                          />

                          <p className="text-sm font-medium text-gray-600">
                            Aucune notification
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Vos nouvelles notifications apparaîtront ici.
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (
                            notification
                          ) => (
                            <button
                              type="button"
                              key={
                                notification.uuid
                              }
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${Number(
                                notification.lu
                              ) ===
                                0
                                ? "bg-green-50/70"
                                : "bg-white"
                                }`}
                            >
                              {/* ICON */}

                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.commande_uuid
                                  ? "bg-green-100 text-green-600"
                                  : "bg-blue-100 text-blue-600"
                                  }`}
                              >
                                {notification.commande_uuid ? (
                                  <Package
                                    size={17}
                                  />
                                ) : (
                                  <Bell
                                    size={17}
                                  />
                                )}
                              </div>

                              {/* TEXT */}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-sm ${Number(
                                      notification.lu
                                    ) ===
                                      0
                                      ? "font-bold text-gray-900"
                                      : "font-semibold text-gray-700"
                                      }`}
                                  >
                                    {
                                      notification.titre
                                    }
                                  </p>

                                  {Number(
                                    notification.lu
                                  ) ===
                                    0 && (
                                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                                    )}
                                </div>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                                  <Clock
                                    size={11}
                                  />

                                  {formatDate(
                                    notification.created_at
                                  )}
                                </p>
                              </div>
                            </button>
                          )
                        )
                      )}
                    </div>

                    {/* FOOTER */}

                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                      <Link
                        href="/notifications"
                        onClick={() =>
                          setShowNotifications(
                            false
                          )
                        }
                        className="text-xs font-semibold text-green-600 transition hover:text-green-700"
                      >
                        Voir toutes les notifications
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setShowNotifications(
                            false
                          )
                        }
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================
                PROFIL DESKTOP
            =================================================== */}

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(
                      (current) =>
                        !current
                    );

                    setShowNotifications(
                      false
                    );
                  }}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-100"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <FaUser
                      size={15}
                    />
                  </div>

                  <div className="hidden text-left lg:block">
                    <p className="max-w-32.5 truncate text-xs font-semibold text-gray-900">
                      {user.prenom
                        ? `${user.prenom} ${user.nom ??
                        ""
                        }`
                        : user.nom ??
                        "Mon compte"}
                    </p>

                    <p className="text-[10px] capitalize text-gray-500">
                      {user.role ??
                        "client"}
                    </p>
                  </div>

                  <FaChevronDown
                    size={11}
                    className={`text-gray-400 transition ${profileMenuOpen
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 z-100 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {user.prenom
                          ? `${user.prenom} ${user.nom ??
                          ""
                          }`
                          : user.nom ??
                          "Mon compte"}
                      </p>

                      {user.email && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {
                            user.email
                          }
                        </p>
                      )}
                    </div>

                    <div className="p-1.5">

                      <Link
                        href="/compte"
                        onClick={() =>
                          setProfileMenuOpen(
                            false
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <FaUser
                          size={14}
                        />

                        Mon compte
                      </Link>

                      <Link
                        href="/commandes"
                        onClick={() =>
                          setProfileMenuOpen(
                            false
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <Package
                          size={16}
                        />

                        Mes commandes
                      </Link>

                      <button
                        type="button"
                        onClick={async () => {
                          setProfileMenuOpen(
                            false
                          );

                          setShowNotifications(
                            true
                          );

                          await loadNotificationsForPanel();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        <Bell
                          size={16}
                        />

                        Notifications

                        {unreadCount >
                          0 && (
                            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              {unreadCount}
                            </span>
                          )}
                      </button>

                      <div className="my-1 border-t border-gray-100" />

                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <X
                          size={16}
                        />

                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">

                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Connexion
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Inscription
                </Link>

              </div>
            )}

            {/* ==================================================
                MENU MOBILE
            =================================================== */}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(
                  (current) =>
                    !current
                );

                setProfileMenuOpen(
                  false
                );

                setShowNotifications(
                  false
                );
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <FaTimes
                  size={20}
                />
              ) : (
                <FaBars
                  size={20}
                />
              )}
            </button>
          </div>
        </div>

        {/* ====================================================
            MENU MOBILE
        ===================================================== */}

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white md:hidden">
            <div className="space-y-1 px-4 py-4">

              <Link
                href="/"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Accueil
              </Link>

              <Link
                href="/boutiques"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Boutiques
              </Link>

              <Link
                href="/categories"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Catégories
              </Link>

              <Link
                href="/produits"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Produits
              </Link>

              {user && (
                <>
                  <div className="my-2 border-t border-gray-100" />

                  <Link
                    href="/compte"
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FaUser
                      size={15}
                    />

                    Mon compte
                  </Link>

                  <Link
                    href="/commandes"
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Package
                      size={17}
                    />

                    Mes commandes
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(
                        false
                      );

                      setShowNotifications(
                        true
                      );

                      loadNotificationsForPanel();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Bell
                      size={17}
                    />

                    <span>
                      Notifications
                    </span>

                    {unreadCount >
                      0 && (
                        <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount >
                            99
                            ? "99+"
                            : unreadCount}
                        </span>
                      )}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <X
                      size={17}
                    />

                    Déconnexion
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="my-2 border-t border-gray-100" />

                  <Link
                    href="/login"
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Connexion
                  </Link>

                  <Link
                    href="/register"
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className="block rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ======================================================
          MODAL NOTIFICATION
      ======================================================= */}

      {selectedNotification && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-3 sm:p-4"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeNotificationModal();
            }
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ==================================================
                HEADER MODAL
            =================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">

              <div className="flex min-w-0 items-center gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${selectedNotification.commande_uuid
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {selectedNotification.commande_uuid ? (
                    <Package
                      size={20}
                    />
                  ) : (
                    <Bell
                      size={20}
                    />
                  )}
                </div>

                <div className="min-w-0">

                  <h2 className="truncate text-base font-bold text-gray-900">
                    {
                      selectedNotification.titre
                    }
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDate(
                      selectedNotification.created_at
                    )}
                  </p>

                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeNotificationModal
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fermer"
              >
                <X
                  size={19}
                />
              </button>

            </div>

            {/* ==================================================
                CONTENU MODAL
            =================================================== */}

            <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">

              {/* ==================================================
                  MESSAGE
              =================================================== */}

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm leading-6 text-gray-700">
                  {
                    selectedNotification.message
                  }
                </p>

              </div>

              {/* ==================================================
                  CHARGEMENT
              =================================================== */}

              {loadingCommande && (
                <div className="flex items-center justify-center py-10">

                  <div className="flex flex-col items-center gap-3">

                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />

                    <p className="text-sm text-gray-500">
                      Chargement des détails de la commande...
                    </p>

                  </div>

                </div>
              )}

              {/* ==================================================
                  ERREUR
              =================================================== */}

              {!loadingCommande &&
                commandeError && (
                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">

                    <p className="text-sm font-semibold text-red-700">
                      Impossible de charger les détails de la commande.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      Vous pouvez ouvrir directement
                      la page de la commande avec le
                      bouton ci-dessous.
                    </p>

                  </div>
                )}

              {/* ==================================================
                  DÉTAILS
              =================================================== */}

              {!loadingCommande &&
                commandeDetail && (
                  <div className="mt-5 space-y-4">

                    {/* ==================================================
                        COMMANDE
                    =================================================== */}

                    <div className="rounded-xl border border-gray-200 p-4">

                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div>

                          <p className="text-xs text-gray-500">
                            Commande
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-gray-900">
                            #{commandeDetail.id ?? selectedNotification.commande_id}
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            commandeDetail.status
                          )}`}
                        >
                          {
                            getStatusLabel(
                              commandeDetail.status
                            )
                          }
                        </span>

                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>

                          <p className="text-xs text-gray-500">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {formatDate(
                              commandeDetail.created_at
                            )}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-gray-500">
                            Total
                          </p>

                          <p className="mt-1 text-lg font-bold text-green-600">
                            {formatMoney(
                              commandeDetail.total
                            )}{" "}
                            FCFA
                          </p>

                        </div>

                      </div>

                      {commandeDetail.frais_livraison !==
                        undefined && (
                          <div className="mt-4 border-t border-gray-100 pt-3">

                            <div className="flex items-center justify-between">

                              <span className="text-xs text-gray-500">
                                Frais de livraison
                              </span>

                              <span className="text-sm font-semibold text-gray-700">
                                {formatMoney(
                                  commandeDetail.frais_livraison
                                )}{" "}
                                FCFA
                              </span>

                            </div>

                          </div>
                        )}

                    </div>

                    {/* ==================================================
                        BOUTIQUE
                    =================================================== */}

                    {commandeDetail.boutique && (
                      <div className="rounded-xl border border-gray-200 p-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <ShoppingBag
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-gray-500">
                              Boutique
                            </p>

                            <p className="truncate text-sm font-bold text-gray-900">
                              {
                                commandeDetail
                                  .boutique
                                  .nom
                              }
                            </p>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* ==================================================
                        LIVRAISON
                    =================================================== */}

                    {(commandeDetail.adresse_livraison ||
                      commandeDetail.zone_livraison) && (
                        <div className="rounded-xl border border-gray-200 p-4">

                          <div className="mb-3 flex items-center gap-2">

                            <MapPin
                              size={18}
                              className="text-green-600"
                            />

                            <h3 className="text-sm font-bold text-gray-900">
                              Livraison
                            </h3>

                          </div>

                          {commandeDetail.adresse_livraison && (
                            <div className="rounded-lg bg-gray-50 p-3">

                              <p className="text-xs text-gray-500">
                                Adresse
                              </p>

                              <p className="mt-1 text-sm font-semibold text-gray-800">
                                {
                                  commandeDetail.adresse_livraison
                                }
                              </p>

                            </div>
                          )}

                          {commandeDetail.zone_livraison && (
                            <p className="mt-3 text-xs text-gray-500">
                              Zone :{" "}
                              <span className="font-semibold text-gray-700">
                                {
                                  commandeDetail.zone_livraison
                                }
                              </span>
                            </p>
                          )}

                          {commandeDetail.latitude !==
                            null &&
                            commandeDetail.latitude !==
                            undefined &&
                            commandeDetail.longitude !==
                            null &&
                            commandeDetail.longitude !==
                            undefined && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                <MapPin
                                  size={13}
                                />

                                Position GPS enregistrée
                              </div>
                            )}

                        </div>
                      )}

                    {/* ==================================================
                        LIVREUR
                    =================================================== */}

                    {commandeDetail.livreur && (
                      <div className="rounded-xl border border-gray-200 p-4">

                        <div className="mb-4 flex items-center gap-2">

                          <Truck
                            size={18}
                            className="text-green-600"
                          />

                          <h3 className="text-sm font-bold text-gray-900">
                            Livreur affecté
                          </h3>

                        </div>

                        <div className="rounded-xl bg-green-50 p-4">

                          <div className="flex items-start gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                              <Truck
                                size={20}
                              />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-sm font-bold text-gray-900">
                                {
                                  commandeDetail
                                    .livreur
                                    .prenom
                                }{" "}
                                {
                                  commandeDetail
                                    .livreur
                                    .nom
                                }
                              </p>

                              {commandeDetail
                                .livreur
                                .telephone && (
                                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">

                                    <Phone
                                      size={13}
                                    />

                                    {
                                      commandeDetail
                                        .livreur
                                        .telephone
                                    }

                                  </p>
                                )}

                              {commandeDetail
                                .livreur
                                .vehicule && (
                                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">

                                    <Car
                                      size={13}
                                    />

                                    {
                                      commandeDetail
                                        .livreur
                                        .vehicule
                                    }

                                  </p>
                                )}

                            </div>

                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                            {commandeDetail
                              .livreur
                              .status && (
                                <div className="rounded-lg bg-white p-2.5">

                                  <p className="text-[10px] text-gray-400">
                                    Statut
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-700">
                                    {
                                      getLivreurStatusLabel(
                                        commandeDetail
                                          .livreur
                                          .status
                                      )
                                    }
                                  </p>

                                </div>
                              )}

                            {commandeDetail
                              .livreur
                              .disponibilite && (
                                <div className="rounded-lg bg-white p-2.5">

                                  <p className="text-[10px] text-gray-400">
                                    Disponibilité
                                  </p>

                                  <p className="mt-0.5 text-xs font-semibold text-gray-700">
                                    {
                                      getLivreurDisponibiliteLabel(
                                        commandeDetail
                                          .livreur
                                          .disponibilite
                                      )
                                    }
                                  </p>

                                </div>
                              )}

                          </div>

                        </div>

                      </div>
                    )}

                    {/* ==================================================
                        PRODUITS
                    =================================================== */}

                    {commandeDetail.produits &&
                      commandeDetail.produits.length >
                      0 && (
                        <div className="rounded-xl border border-gray-200 p-4">

                          <div className="mb-4 flex items-center gap-2">

                            <Package
                              size={18}
                              className="text-green-600"
                            />

                            <h3 className="text-sm font-bold text-gray-900">
                              Produits
                            </h3>

                          </div>

                          <div className="space-y-3">

                            {commandeDetail.produits.map(
                              (
                                produit
                              ) => (
                                <div
                                  key={
                                    produit.id
                                  }
                                  className="flex gap-3 rounded-xl bg-gray-50 p-3"
                                >

                                  {/* IMAGE */}

                                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">

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
                                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                                        <Package
                                          size={22}
                                        />
                                      </div>
                                    )}

                                  </div>

                                  {/* INFOS */}

                                  <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-bold text-gray-800">
                                      {
                                        produit.nom
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                      Quantité :{" "}
                                      <span className="font-semibold text-gray-700">
                                        {
                                          produit.quantite
                                        }
                                      </span>
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                      Prix unitaire :{" "}
                                      <span className="font-semibold text-gray-700">
                                        {formatMoney(
                                          produit.prix
                                        )}{" "}
                                        FCFA
                                      </span>
                                    </p>

                                    {produit.promotion_id !==
                                      null && (
                                        <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                          <Tag
                                            size={
                                              11
                                            }
                                          />

                                          Prix promotionnel
                                        </p>
                                      )}

                                  </div>

                                  {/* SOUS-TOTAL */}

                                  <div className="shrink-0 text-right">

                                    <p className="text-sm font-bold text-gray-900">
                                      {formatMoney(
                                        produit.sous_total
                                      )}{" "}
                                      FCFA
                                    </p>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    {/* ==================================================
                        RÉCAPITULATIF
                    =================================================== */}

                    {commandeDetail.produits &&
                      commandeDetail.produits.length >
                      0 && (
                        <div className="rounded-xl border border-gray-200 p-4">

                          <div className="space-y-2">

                            <div className="flex items-center justify-between text-sm">

                              <span className="text-gray-500">
                                Sous-total produits
                              </span>

                              <span className="font-semibold text-gray-800">
                                {formatMoney(
                                  commandeDetail.produits.reduce(
                                    (
                                      total,
                                      produit
                                    ) =>
                                      total +
                                      Number(
                                        produit.sous_total ??
                                        0
                                      ),
                                    0
                                  )
                                )}{" "}
                                FCFA
                              </span>

                            </div>

                            <div className="flex items-center justify-between text-sm">

                              <span className="text-gray-500">
                                Livraison
                              </span>

                              <span className="font-semibold text-gray-800">
                                {formatMoney(
                                  commandeDetail.frais_livraison ??
                                  0
                                )}{" "}
                                FCFA
                              </span>

                            </div>

                            <div className="border-t border-gray-100 pt-3">

                              <div className="flex items-center justify-between">

                                <span className="text-sm font-bold text-gray-900">
                                  Total
                                </span>

                                <span className="text-lg font-extrabold text-green-600">
                                  {formatMoney(
                                    commandeDetail.total
                                  )}{" "}
                                  FCFA
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                      )}

                    {/* ==================================================
                        HISTORIQUE
                    =================================================== */}

                    {commandeDetail.historique &&
                      commandeDetail.historique.length >
                      0 && (
                        <div className="rounded-xl border border-gray-200 p-4">

                          <div className="mb-5 flex items-center gap-2">

                            <Clock
                              size={18}
                              className="text-green-600"
                            />

                            <h3 className="text-sm font-bold text-gray-900">
                              Historique
                            </h3>

                          </div>

                          <div className="space-y-5">

                            {commandeDetail.historique.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="relative pl-7"
                                >

                                  {/* LIGNE */}

                                  {index <
                                    commandeDetail
                                      .historique!
                                      .length -
                                    1 && (
                                      <span className="absolute left-1.25 top-4 h-[calc(100%+12px)] w-px bg-gray-200" />
                                    )}

                                  {/* POINT */}

                                  <span
                                    className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${index ===
                                      commandeDetail
                                        .historique!
                                        .length -
                                      1
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                      }`}
                                  />

                                  <p className="text-sm font-semibold text-gray-800">
                                    {
                                      getStatusLabel(
                                        item.statut
                                      )
                                    }
                                  </p>

                                  {item.commentaire && (
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                      {
                                        item.commentaire
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">

                                    <Clock
                                      size={10}
                                    />

                                    {formatDate(
                                      item.created_at
                                    )}

                                  </p>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>
                )}
            </div>

            {/* ==================================================
                FOOTER
            =================================================== */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

              <button
                type="button"
                onClick={
                  closeNotificationModal
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                Fermer
              </button>

              {getNotificationAction(
                selectedNotification
              ) && (
                  <button
                    type="button"
                    onClick={
                      handleNotificationAction
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
                  >
                    {
                      getNotificationAction(
                        selectedNotification
                      )?.icon
                    }

                    {
                      getNotificationAction(
                        selectedNotification
                      )?.label
                    }

                    <ChevronRight
                      size={15}
                    />
                  </button>
                )}

            </div>

          </div>
        </div>
      )}
    </>
  );
}