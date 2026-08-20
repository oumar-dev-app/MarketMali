"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  MapPinned,
  Menu,
  Package,
  Store,
  Tags,
  Truck,
  UserCircle,
  Users,
  X,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";


type UserRole =
  | "super_admin"
  | "admin"
  | "vendeur"
  | "livreur";


type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};


const menuByRole: Record<
  UserRole,
  MenuItem[]
> = {

  super_admin: [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Utilisateurs",
      href: "/dashboard/utilisateurs",
      icon: Users,
    },
    {
      label: "Boutiques",
      href: "/dashboard/boutiques",
      icon: Store,
    },
    {
      label: "Catégories",
      href: "/dashboard/categories",
      icon: Tags,
    },
    {
      label: "Produits",
      href: "/dashboard/produits",
      icon: Package,
    },
    {
      label: "Commandes",
      href: "/dashboard/commandes",
      icon: ClipboardList,
    },
    {
      label: "Livraisons",
      href: "/dashboard/livraisons",
      icon: Truck,
    },
    {
      label: "Livreurs",
      href: "/dashboard/livreurs",
      icon: Users,
    },
    {
      label: "Profil",
      href: "/dashboard/profil",
      icon: UserCircle,
    },
  ],

  admin: [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Boutiques",
      href: "/dashboard/boutiques",
      icon: Store,
    },
    {
      label: "Catégories",
      href: "/dashboard/categories",
      icon: Tags,
    },
    {
      label: "Produits",
      href: "/dashboard/produits",
      icon: Package,
    },
    {
      label: "Commandes",
      href: "/dashboard/commandes",
      icon: ClipboardList,
    },
    {
      label: "Livraisons",
      href: "/dashboard/livraisons",
      icon: Truck,
    },
    {
      label: "Livreurs",
      href: "/dashboard/livreurs",
      icon: Users,
    },
    {
      label: "Profil",
      href: "/dashboard/profil",
      icon: UserCircle,
    },
  ],

  vendeur: [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Boutique",
      href: "/dashboard/boutiques",
      icon: Store,
    },
    {
      label: "Produits",
      href: "/dashboard/produits",
      icon: Package,
    },
    {
      label: "Catégories",
      href: "/dashboard/categories",
      icon: Tags,
    },
    {
      label: "Commandes",
      href: "/dashboard/commandes",
      icon: ClipboardList,
    },
    {
      label: "Livraisons",
      href: "/dashboard/livraisons",
      icon: Truck,
    },
    {
      label: "Livreurs",
      href: "/dashboard/livreurs",
      icon: Users,
    },
    {
      label: "Tarifs livraison",
      href: "/dashboard/tarifs-livraison",
      icon: MapPinned,
    },
    {
      label: "API Keys",
      href: "/dashboard/api-keys",
      icon: KeyRound,
    },
    {
      label: "Profil",
      href: "/dashboard/profil",
      icon: UserCircle,
    },
  ],

  livreur: [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Mes livraisons",
      href: "/dashboard/livraisons",
      icon: Truck,
    },
    {
      label: "Profil",
      href: "/dashboard/profil",
      icon: UserCircle,
    },
  ],
};


function getRoleLabel(
  role: UserRole | null
) {
  switch (role) {

    case "super_admin":
      return "Super administrateur";

    case "admin":
      return "Administrateur";

    case "vendeur":
      return "Vendeur";

    case "livreur":
      return "Livreur";

    default:
      return "";
  }
}


function getRoleIcon(
  role: UserRole
) {

  if (role === "livreur") {
    return Truck;
  }

  if (role === "vendeur") {
    return Store;
  }

  if (role === "super_admin") {
    return BarChart3;
  }

  return Users;
}


export default function Sidebar() {

  const pathname =
    usePathname();

  const {
    user,
  } = useAuth();


  const [mobileOpen, setMobileOpen] =
    useState(false);


  const role =
    user?.role as UserRole | undefined;


  const menu =
    role
      ? menuByRole[role]
      : [];


  /*
   * Fermer automatiquement
   * la Sidebar mobile lorsque
   * la route change.
   */
  useEffect(() => {

    setMobileOpen(false);

  }, [pathname]);


  /*
   * Empêcher le scroll du body
   * lorsque le menu mobile est ouvert.
   */
  useEffect(() => {

    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };

  }, [mobileOpen]);


  /*
   * Fermer avec la touche Escape.
   */
  useEffect(() => {

    function handleKeyDown(
      event: KeyboardEvent
    ) {

      if (
        event.key === "Escape"
      ) {
        setMobileOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, []);


  const RoleIcon =
    role
      ? getRoleIcon(role)
      : Users;


  return (
    <>

      {/* =====================================================
          BOUTON MOBILE
      ===================================================== */}

      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          className="
              fixed
              left-3
              top-3
              z-60
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
            border-gray-200
            bg-white
            text-gray-700
              shadow-sm
              transition
            hover:bg-gray-50
              lg:hidden
              "
        >
          <Menu
            size={21}
            strokeWidth={2}
          />
        </button>
      )}


      {/* =====================================================
          OVERLAY MOBILE
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-70
          shrink-0
          flex-col
          border-r
          border-gray-200
          bg-white
          shadow-xl
          transition-transform
          duration-300
          ease-out

          lg:sticky
          lg:top-0
          lg:z-30
          lg:h-screen
          lg:translate-x-0
          lg:shadow-none

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-100
            px-5
          "
        >

          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >

            {/* Logo */}
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gray-900
                text-white
                shadow-sm
                transition
                group-hover:scale-105
              "
            >

              <span className="text-lg font-bold">
                M
              </span>

            </div>


            {/* Nom */}
            <div>

              <h1
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-gray-900
                "
              >
                MarketMali
              </h1>

              <p
                className="
                  text-[11px]
                  font-medium
                  text-gray-400
                "
              >
                Administration
              </p>

            </div>

          </Link>


          {/* Fermer mobile */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="Fermer le menu"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
              lg:hidden
            "
          >

            <X
              size={20}
            />

          </button>

        </div>


        {/* =================================================
            ROLE
        ================================================= */}

        {role && (
          <div className="px-4 pt-4">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
                px-3
                py-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-gray-700
                  shadow-sm
                "
              >

                <RoleIcon
                  size={18}
                  strokeWidth={2}
                />

              </div>


              <div className="min-w-0">

                <p
                  className="
                    truncate
                    text-xs
                    font-semibold
                    text-gray-900
                  "
                >
                  {user?.prenom
                    ? `${user.prenom} ${user.nom ?? ""}`
                    : getRoleLabel(role)}
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[11px]
                    text-gray-500
                  "
                >
                  {getRoleLabel(role)}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          <p
            className="
              mb-2
              px-3
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-gray-400
            "
          >
            Navigation
          </p>


          {!role ? (

            /* Skeleton */

            <div className="space-y-2">

              {Array.from({
                length: 7,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    h-11
                    animate-pulse
                    rounded-xl
                    bg-gray-100
                  "
                />

              ))}

            </div>

          ) : (

            <nav className="space-y-1">

              {menu.map(
                (item) => {

                  const Icon =
                    item.icon;


                  const active =
                    pathname ===
                    item.href ||
                    (
                      item.href !==
                      "/dashboard" &&
                      pathname.startsWith(
                        `${item.href}/`
                      )
                    );


                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group
                        relative
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-medium
                        transition-all
                        duration-200

                        ${active
                          ? `
                              bg-gray-900
                              text-white
                              shadow-sm
                            `
                          : `
                              text-gray-600
                              hover:bg-gray-50
                              hover:text-gray-900
                            `
                        }
                      `}
                    >

                      {/* Indicateur actif */}

                      {active && (
                        <span
                          className="
                            absolute
                            left-0
                            top-1/2
                            h-6
                            w-1
                            -translate-y-1/2
                            rounded-r-full
                            bg-white
                          "
                        />
                      )}


                      {/* Icon */}

                      <span
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          transition

                          ${active
                            ? "bg-white/10 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-gray-900"
                          }
                        `}
                      >

                        <Icon
                          size={19}
                          strokeWidth={
                            active
                              ? 2.2
                              : 2
                          }
                        />

                      </span>


                      {/* Label */}

                      <span className="flex-1 truncate">
                        {item.label}
                      </span>


                      {/* Chevron */}

                      <ChevronRight
                        size={15}
                        strokeWidth={2}
                        className={`
                          shrink-0
                          transition-transform
                          ${active
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                          }
                        `}
                      />

                    </Link>
                  );
                }
              )}

            </nav>

          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            shrink-0
            border-t
            border-gray-100
            p-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-gray-100
              bg-white
              px-3
              py-3
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-900
                text-white
              "
            >

              <RoleIcon
                size={17}
                strokeWidth={2}
              />

            </div>


            <div className="min-w-0 flex-1">

              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-gray-900
                "
              >
                Espace MarketMali
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[11px]
                  text-gray-500
                "
              >
                {role
                  ? getRoleLabel(role)
                  : "Chargement..."}
              </p>

            </div>

          </div>

        </div>

      </aside>

    </>
  );
}