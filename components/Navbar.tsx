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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import SearchBar from "@/components/SearchBar";
import { useCart } from "@/contexts/CartContext";
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

export default function Navbar() {
const { items } = useCart();
const { user, token, logout } = useAuth();

const [mobileMenuOpen, setMobileMenuOpen] =
useState(false);

const [profileOpen, setProfileOpen] =
useState(false);

const [notifications, setNotifications] =
useState<Notification[]>([]);

const [unreadCount, setUnreadCount] =
useState(0);

const [showNotifications, setShowNotifications] =
useState(false);

const [loadingNotifications, setLoadingNotifications] =
useState(false);

const [selectedNotification, setSelectedNotification] =
useState<Notification | null>(null);

const [commandeDetail, setCommandeDetail] =
useState<CommandeDetail | null>(null);

const [loadingCommande, setLoadingCommande] =
useState(false);

const notificationRef =
useRef<HTMLDivElement | null>(null);

const notificationAudioRef =
useRef<HTMLAudioElement | null>(null);

const previousUnreadCountRef =
useRef<number | null>(null);

const totalItems = items.reduce(
(sum, item) => sum + item.quantity,
0
);

function closeMobileMenu() {
setMobileMenuOpen(false);
}

function handleLogout() {
setProfileOpen(false);
setMobileMenuOpen(false);
setShowNotifications(false);
logout();
}

/*

* =========================================================
* SON DE NOTIFICATION
* =========================================================
  */

function playNotificationSound() {
if (typeof window === "undefined") {
return;
}


const audio = notificationAudioRef.current;

if (!audio) {
  return;
}

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
* COMPTEUR NOTIFICATIONS
* =========================================================
  */

async function loadUnreadNotifications() {
if (!token) {
setUnreadCount(0);
return;
}

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

  if (!response.ok) {
    return;
  }

  const data = await response.json();

  if (!data.success) {
    return;
  }

  const newCount = Number(
    data.data?.count ?? 0
  );

  setUnreadCount(newCount);

  const previousCount =
    previousUnreadCountRef.current;

  /*
   * Première vérification :
   * on initialise simplement le compteur.
   *
   * Aucun son au chargement de la page.
   */
  if (previousCount === null) {
    previousUnreadCountRef.current =
      newCount;

    return;
  }

  /*
   * Une nouvelle notification est arrivée.
   */
  if (newCount > previousCount) {
    playNotificationSound();
  }

  previousUnreadCountRef.current =
    newCount;
} catch (error) {
  console.error(
    "Erreur chargement notifications :",
    error
  );
}


}

/*

* =========================================================
* CHARGEMENT INITIAL + POLLING
* =========================================================
  */

useEffect(() => {
if (!token || !user) {
setUnreadCount(0);
previousUnreadCountRef.current = null;


  return;
}

loadUnreadNotifications();

/*
 * Vérification toutes les 10 secondes.
 */
const interval = setInterval(
  loadUnreadNotifications,
  10000
);

/*
 * Permet à une autre partie de l'application
 * de demander une actualisation immédiate.
 */
function handleNotificationRefresh() {
  loadUnreadNotifications();
}

window.addEventListener(
  "notifications:refresh",
  handleNotificationRefresh
);

return () => {
  clearInterval(interval);

  window.removeEventListener(
    "notifications:refresh",
    handleNotificationRefresh
  );
};


}, [token, user]);

/*

* =========================================================
* CLICK EXTÉRIEUR
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
* CHARGER LES NOTIFICATIONS
* =========================================================
  */

async function loadNotifications() {
if (!token) {
return;
}

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
* OUVERTURE DU PANNEAU
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
* MARQUER UNE NOTIFICATION COMME LUE
* =========================================================
  */

async function handleNotificationClick(
notification: Notification
) {
if (!token) {
return;
}

/*
 * Marquer comme lue.
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

      previousUnreadCountRef.current =
        Math.max(
          0,
          (previousUnreadCountRef.current ??
            unreadCount) - 1
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
 * Fermer le panneau.
 */
setShowNotifications(false);

/*
 * Ouvrir le détail.
 */
setSelectedNotification(
  notification
);

setCommandeDetail(null);

/*
 * Pas de commande liée.
 */
if (!notification.commande_uuid) {
  return;
}

/*
 * Charger la commande.
 */
setLoadingCommande(true);

try {
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

/*

* =========================================================
* TOUT MARQUER COMME LU
* =========================================================
  */

async function handleMarkAllAsRead() {
if (
!token ||
unreadCount === 0
) {
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
      current.map(
        (notification) => ({
          ...notification,
          lu: 1,
          read_at:
            notification.read_at ??
            now,
        })
      )
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
delivery_pending_confirmation:
"En attente de confirmation",
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

  delivery_pending_confirmation:
    "bg-orange-50 text-orange-700 border-orange-200",

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

/*

* =========================================================
* UI
* =========================================================
  */

return (
<>
{/* =====================================================
SON NOTIFICATION
====================================================== */}

  <audio
    ref={notificationAudioRef}
    src="/sounds/notification.mp3"
    preload="auto"
  />

  <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* =================================================
          LIGNE PRINCIPALE
      ================================================== */}

      <div className="flex min-h-16 items-center justify-between gap-3 sm:min-h-18">

        {/* =================================================
            LOGO
        ================================================== */}

        <Link
          href="/"
          onClick={closeMobileMenu}
          className="shrink-0 text-2xl font-extrabold tracking-tight sm:text-[26px]"
        >
          <span className="text-[#14a800]">
            Market
          </span>

          <span className="text-[#fcd116]">
            M
          </span>

          <span className="text-[#ce1126]">
            ali
          </span>
        </Link>

        {/* =================================================
            NAVIGATION DESKTOP
        ================================================== */}

        <nav className="hidden items-center gap-1 lg:flex">

          <Link
            href="/"
            className="
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-green-50
              hover:text-[#14a800]
            "
          >
            Accueil
          </Link>

          <Link
            href="/categories"
            className="
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-green-50
              hover:text-[#14a800]
            "
          >
            Catégories
          </Link>

          <Link
            href="/boutiques"
            className="
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-green-50
              hover:text-[#14a800]
            "
          >
            Boutiques
          </Link>

          {token && user && (
            <Link
              href="/commandes"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-green-50
                hover:text-[#14a800]
              "
            >
              Mes commandes
            </Link>
          )}

        </nav>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className="flex items-center gap-1 sm:gap-2">

          {/* =================================================
              PANIER
          ================================================== */}

          <Link
            href="/panier"
            aria-label="Panier"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-gray-700
              transition
              hover:bg-green-50
              hover:text-[#14a800]
            "
          >
            <FaShoppingCart size={18} />

            {totalItems > 0 && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-[#fcd116]
                  px-1
                  text-[10px]
                  font-extrabold
                  text-gray-900
                  ring-2
                  ring-white
                "
              >
                {totalItems > 99
                  ? "99+"
                  : totalItems}
              </span>
            )}
          </Link>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {token && user && (
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
                aria-expanded={
                  showNotifications
                }
                className="
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-700
                  transition
                  hover:bg-green-50
                  hover:text-[#14a800]
                "
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-0.5
                      -top-0.5
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[#ce1126]
                      px-1
                      text-[10px]
                      font-extrabold
                      text-white
                      ring-2
                      ring-white
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
                    left-2
                    right-2
                    top-16
                    z-[100]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    shadow-2xl
                    sm:absolute
                    sm:left-auto
                    sm:right-0
                    sm:top-12
                    sm:w-[380px]
                  "
                >

                  {/* HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-gray-100
                      px-4
                      py-4
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
                              rounded-full
                              bg-red-50
                              px-2
                              py-0.5
                              text-[10px]
                              font-semibold
                              text-red-600
                            "
                          >
                            {unreadCount} nouvelle
                            {unreadCount > 1
                              ? "s"
                              : ""}
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-[11px] text-gray-400">
                        Suivez l'évolution de vos commandes
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                      aria-label="Fermer"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-400
                        transition
                        hover:bg-gray-100
                        hover:text-gray-700
                      "
                    >
                      <X size={17} />
                    </button>

                  </div>

                  {/* LISTE */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {loadingNotifications ? (
                      <div className="px-6 py-12 text-center">

                        <div
                          className="
                            mx-auto
                            h-8
                            w-8
                            animate-spin
                            rounded-full
                            border-2
                            border-gray-200
                            border-t-[#14a800]
                          "
                        />

                        <p className="mt-3 text-xs text-gray-400">
                          Chargement des notifications...
                        </p>

                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">

                        <div
                          className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-100
                          "
                        >
                          <Bell
                            size={22}
                            className="text-gray-400"
                          />
                        </div>

                        <p className="mt-4 text-sm font-medium text-gray-700">
                          Aucune notification
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
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
                              border-b
                              border-gray-100
                              px-4
                              py-4
                              text-left
                              transition
                              hover:bg-gray-50
                              ${
                                notification.lu ===
                                0
                                  ? "bg-green-50/50"
                                  : "bg-white"
                              }
                            `}
                          >

                            <div className="flex gap-3">

                              {/* ICÔNE */}

                              <div
                                className={`
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  ${
                                    notification.lu ===
                                    0
                                      ? "bg-green-100 text-[#14a800]"
                                      : "bg-gray-100 text-gray-400"
                                  }
                                `}
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

                              {/* TEXTE */}

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p
                                    className={`
                                      truncate
                                      text-sm
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
                                    <Check
                                      size={14}
                                      className="shrink-0 text-emerald-500"
                                    />
                                  )}

                                </div>

                                <p
                                  className="
                                    mt-1
                                    line-clamp-2
                                    text-xs
                                    leading-5
                                    text-gray-500
                                  "
                                >
                                  {
                                    notification.message
                                  }
                                </p>

                                <div
                                  className="
                                    mt-2
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    text-gray-400
                                  "
                                >
                                  <Clock
                                    size={11}
                                  />

                                  {formatDate(
                                    notification.created_at
                                  )}
                                </div>

                              </div>

                              <ChevronRight
                                size={15}
                                className="
                                  mt-2
                                  shrink-0
                                  text-gray-300
                                "
                              />

                            </div>

                          </button>
                        )
                      )
                    )}

                  </div>

                  {/* FOOTER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-2
                      border-t
                      border-gray-100
                      bg-gray-50
                      px-4
                      py-3
                    "
                  >

                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="
                          rounded-lg
                          px-2
                          py-2
                          text-xs
                          font-semibold
                          text-[#14a800]
                          transition
                          hover:bg-green-50
                        "
                      >
                        ✓ Tout marquer comme lu
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        Toutes les notifications sont lues
                      </span>
                    )}

                    <Link
                      href="/notifications"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                      className="
                        rounded-lg
                        px-2
                        py-2
                        text-xs
                        font-semibold
                        text-gray-600
                        transition
                        hover:bg-white
                        hover:text-gray-900
                      "
                    >
                      Voir tout
                    </Link>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =================================================
              PROFIL DESKTOP
          ================================================== */}

          {token && user ? (
            <div className="relative hidden sm:block">

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (value) => !value
                  )
                }
                aria-expanded={
                  profileOpen
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  px-2
                  py-1.5
                  transition
                  hover:bg-green-50
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-[#14a800]/10
                    text-[#14a800]
                  "
                >
                  <FaUser size={14} />
                </div>

                <div className="hidden text-left md:block">

                  <p className="text-[10px] font-medium text-gray-400">
                    Bonjour
                  </p>

                  <p className="max-w-24 truncate text-sm font-bold text-gray-800">
                    {user.prenom}
                  </p>

                </div>

                <FaChevronDown
                  size={9}
                  className={`
                    hidden
                    text-gray-400
                    transition-transform
                    md:block
                    ${
                      profileOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />

              </button>

              {/* MENU PROFIL */}

              {profileOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    mt-2
                    w-60
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    shadow-2xl
                  "
                >

                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">

                    <p className="text-xs text-gray-400">
                      Connecté en tant que
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-gray-900">
                      {user.prenom}{" "}
                      {user.nom}
                    </p>

                  </div>

                  <Link
                    href="/compte"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-green-50
                      hover:text-[#14a800]
                    "
                  >
                    <FaUser size={14} />

                    Mon compte
                  </Link>

                  <Link
                    href="/commandes"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-green-50
                      hover:text-[#14a800]
                    "
                  >
                    <span className="text-base">
                      📦
                    </span>

                    Mes commandes
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(
                        false
                      );

                      setShowNotifications(
                        true
                      );

                      loadNotifications();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-3
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-green-50
                      hover:text-[#14a800]
                    "
                  >

                    <span className="flex items-center gap-3">
                      <Bell size={16} />

                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#ce1126] px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 99
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
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      border-t
                      border-gray-100
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <span className="text-base">
                      ↪
                    </span>

                    Se déconnecter
                  </button>

                </div>
              )}

            </div>
          ) : (
            <Link
              href="/login"
              className="
                hidden
                rounded-xl
                bg-[#14a800]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#108f00]
                hover:shadow-md
                sm:block
              "
            >
              Se connecter
            </Link>
          )}

          {/* =================================================
              MENU MOBILE
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (value) => !value
              )
            }
            aria-label={
              mobileMenuOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={
              mobileMenuOpen
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-gray-700
              transition
              hover:bg-green-50
              hover:text-[#14a800]
              lg:hidden
            "
          >
            {mobileMenuOpen ? (
              <FaTimes size={19} />
            ) : (
              <FaBars size={19} />
            )}
          </button>

        </div>
      </div>

      {/* =====================================================
          RECHERCHE MOBILE
      ====================================================== */}

      {/* <div className="pb-3 lg:hidden">
        <SearchBar />
      </div> */}

      {/* =====================================================
          MENU MOBILE
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="
            border-t
            border-gray-100
            py-3
            lg:hidden
          "
        >
          <nav className="flex flex-col gap-1">

            <Link
              href="/"
              onClick={
                closeMobileMenu
              }
              className="
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-green-50
                hover:text-[#14a800]
              "
            >
              Accueil
            </Link>

            <Link
              href="/categories"
              onClick={
                closeMobileMenu
              }
              className="
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-green-50
                hover:text-[#14a800]
              "
            >
              Catégories
            </Link>

            <Link
              href="/boutiques"
              onClick={
                closeMobileMenu
              }
              className="
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:bg-green-50
                hover:text-[#14a800]
              "
            >
              Boutiques
            </Link>

            {token && user && (
              <>
                <Link
                  href="/commandes"
                  onClick={
                    closeMobileMenu
                  }
                  className="
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-green-50
                    hover:text-[#14a800]
                  "
                >
                  Mes commandes
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();

                    setShowNotifications(
                      true
                    );

                    loadNotifications();
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-green-50
                    hover:text-[#14a800]
                  "
                >

                  <span className="flex items-center gap-3">
                    <Bell size={17} />

                    Notifications
                  </span>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#ce1126] px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}

                </button>
              </>
            )}

            {!token && (
              <Link
                href="/login"
                onClick={
                  closeMobileMenu
                }
                className="
                  mt-2
                  rounded-xl
                  bg-[#14a800]
                  px-4
                  py-3
                  text-center
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#108f00]
                "
              >
                Se connecter
              </Link>
            )}

            {token && user && (
              <div className="mt-2 border-t border-gray-100 pt-2">

                <Link
                  href="/compte"
                  onClick={
                    closeMobileMenu
                  }
                  className="
                    mb-2
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-gray-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-gray-800
                  "
                >

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14a800]/10 text-[#14a800]">
                    <FaUser size={13} />
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-gray-400">
                      Compte
                    </p>

                    <p className="text-sm font-bold">
                      {user.prenom}{" "}
                      {user.nom}
                    </p>
                  </div>

                </Link>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="
                    w-full
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  Se déconnecter
                </button>

              </div>
            )}

          </nav>
        </div>
      )}

    </div>

    {/* =====================================================
        BANDE COULEURS MALI
    ====================================================== */}

    <div className="flex h-0.5 w-full">
      <div className="flex-1 bg-[#14a800]" />
      <div className="flex-1 bg-[#fcd116]" />
      <div className="flex-1 bg-[#ce1126]" />
    </div>

  </header>

  {/* =====================================================
      MODAL DÉTAIL NOTIFICATION
  ====================================================== */}

  {selectedNotification && (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/50
        p-2
        backdrop-blur-sm
        sm:p-4
      "
      onClick={() =>
        setSelectedNotification(null)
      }
    >

      <div
        className="
          flex
          max-h-[95vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          sm:max-h-[90vh]
          sm:rounded-3xl
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
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-gray-100
            px-4
            py-4
            sm:px-6
          "
        >

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-100
                  text-[#14a800]
                "
              >
                {selectedNotification.commande_uuid ? (
                  <Package size={18} />
                ) : (
                  <Bell size={18} />
                )}
              </div>

              <div className="min-w-0">

                <h3
                  className="
                    truncate
                    text-base
                    font-bold
                    text-gray-900
                    sm:text-lg
                  "
                >
                  {
                    selectedNotification.titre
                  }
                </h3>

                <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
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
              setSelectedNotification(
                null
              )
            }
            aria-label="Fermer"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            BODY MODAL
        ================================================== */}

        <div
          className="
            flex-1
            space-y-4
            overflow-y-auto
            px-4
            py-5
            sm:px-6
          "
        >

          {/* MESSAGE */}

          <div
            className="
              rounded-xl
              border
              border-green-100
              bg-green-50
              p-4
            "
          >

            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#14a800]">
              Notification
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-700">
              {
                selectedNotification.message
              }
            </p>

          </div>

          {/* CHARGEMENT */}

          {loadingCommande && (
            <div className="py-10 text-center">

              <div
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-gray-200
                  border-t-[#14a800]
                "
              />

              <p className="mt-3 text-xs text-gray-400">
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

                {/* INFORMATIONS */}

                <div className="overflow-hidden rounded-2xl border border-gray-200">

                  <div className="border-b bg-gray-50 px-4 py-3">

                    <div className="flex items-center gap-2">

                      <ShoppingBag
                        size={16}
                        className="text-gray-500"
                      />

                      <h4 className="text-sm font-bold text-gray-900">
                        Informations de la commande
                      </h4>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Numéro
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
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
                          mt-1
                          inline-flex
                          items-center
                          rounded-full
                          border
                          px-2.5
                          py-1
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

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
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

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatMoney(
                          commandeDetail.frais_livraison
                        )}{" "}
                        FCFA
                      </p>
                    </div>

                  </div>

                </div>

                {/* BOUTIQUE */}

                <div className="rounded-2xl border border-gray-200 p-4">

                  <div className="mb-4 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#14a800]">
                      <ShoppingBag size={15} />
                    </div>

                    <h4 className="text-sm font-bold text-gray-900">
                      Boutique
                    </h4>

                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    {commandeDetail.boutique.nom}
                  </p>

                </div>

                {/* LIVRAISON */}

                <div className="rounded-2xl border border-gray-200 p-4">

                  <div className="mb-4 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <MapPin
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

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {commandeDetail.adresse_livraison ||
                      "Adresse non renseignée"}
                  </p>

                </div>

                {/* PRODUITS */}

                <div className="overflow-hidden rounded-2xl border border-gray-200">

                  <div className="border-b bg-gray-50 px-4 py-3">

                    <div className="flex items-center gap-2">

                      <Package
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
                            flex
                            items-center
                            justify-between
                            gap-4
                            p-4
                          "
                        >

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {produit.nom}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {produit.quantite} ×{" "}
                              {formatMoney(
                                produit.prix
                              )}{" "}
                              FCFA
                            </p>

                          </div>

                          <p className="whitespace-nowrap text-sm font-bold text-gray-900">
                            {formatMoney(
                              produit.sous_total
                            )}{" "}
                            FCFA
                          </p>

                        </div>
                      )
                    )}

                  </div>

                  <div className="flex items-center justify-between bg-gray-900 px-4 py-4 text-white">

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

                {/* HISTORIQUE */}

                <div className="rounded-2xl border border-gray-200 p-4">

                  <div className="mb-4 flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Clock
                        size={15}
                        className="text-gray-500"
                      />
                    </div>

                    <h4 className="text-sm font-bold text-gray-900">
                      Historique de la commande
                    </h4>

                  </div>

                  {commandeDetail
                    .historique.length ===
                  0 ? (
                    <p className="text-sm text-gray-400">
                      Aucun historique disponible.
                    </p>
                  ) : (
                    <div className="space-y-4">

                      {commandeDetail.historique.map(
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

                            <div className="flex flex-col items-center">

                              <div
                                className={`
                                  h-3
                                  w-3
                                  rounded-full
                                  ${
                                    index ===
                                    commandeDetail
                                      .historique
                                      .length -
                                      1
                                      ? "bg-[#14a800]"
                                      : "bg-gray-300"
                                  }
                                `}
                              />

                              {index !==
                                commandeDetail
                                  .historique
                                  .length -
                                  1 && (
                                <div className="mt-1 w-px flex-1 bg-gray-200" />
                              )}

                            </div>

                            <div className="pb-2">

                              <p className="text-sm font-semibold text-gray-900">
                                {getStatusLabel(
                                  item.status
                                )}
                              </p>

                              {item.commentaire && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    item.commentaire
                                  }
                                </p>
                              )}

                              <p className="mt-1 text-[10px] text-gray-400">
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

              </>
            )}

          {/* ERREUR */}

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
                  Impossible de récupérer les informations de cette commande.
                </p>
              </div>
            )}

        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            justify-end
            border-t
            border-gray-100
            bg-gray-50
            px-4
            py-3
            sm:px-6
          "
        >

          <button
            type="button"
            onClick={() =>
              setSelectedNotification(
                null
              )
            }
            className="
              rounded-xl
              bg-gray-900
              px-5
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              sm:text-sm
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
