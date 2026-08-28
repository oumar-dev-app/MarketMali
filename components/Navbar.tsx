"use client";

import Link from "next/link";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import SearchBar from "@/components/SearchBar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { items } = useCart();
  const { user, token, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

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
    logout();
  }

  /**
   * Charger le nombre de notifications non lues.
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

      if (data.success) {
        setUnreadCount(
          Number(data.data?.count ?? 0)
        );
      }
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error
      );
    }
  }

  /**
   * Chargement initial + actualisation périodique.
   */
  useEffect(() => {
    if (!token || !user) {
      setUnreadCount(0);
      return;
    }

    // Chargement initial
    loadUnreadNotifications();

    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(
      loadUnreadNotifications,
      30000
    );

    // Actualisation immédiate lorsqu'une nouvelle
    // notification vient d'être créée dans l'interface
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LIGNE PRINCIPALE
        ====================================================== */}

        <div className="flex min-h-16 items-center justify-between gap-3 sm:min-h-[72px]">

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
              <Link
                href="/notifications"
                aria-label="Notifications"
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
              </Link>
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
                  aria-expanded={profileOpen}
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
                      ${profileOpen
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
                        {user.prenom} {user.nom}
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

                    <Link
                      href="/notifications"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex
                        items-center
                        justify-between
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
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
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
              aria-expanded={mobileMenuOpen}
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

        {/*        <div className="pb-3 lg:hidden">
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
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
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
                    onClick={closeMobileMenu}
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

                  <Link
                    href="/notifications"
                    onClick={closeMobileMenu}
                    className="
                      flex
                      items-center
                      justify-between
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
                  </Link>
                </>
              )}

              {!token && (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
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
                    onClick={closeMobileMenu}
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
                        {user.prenom} {user.nom}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
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
  );
}