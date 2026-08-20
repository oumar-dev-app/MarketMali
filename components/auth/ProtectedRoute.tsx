"use client";

import {
  useEffect,
  ReactNode,
} from "react";

import {
  useRouter,
  usePathname,
} from "next/navigation";

import {
  useAuth,
} from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {

  const router = useRouter();
  const pathname = usePathname();

  const {
    token,
    loading,
    user,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    const allowedRoles = [
      "admin",
      "vendeur",
      "super_admin",
      "livreur",
    ];

    if (!allowedRoles.includes(user.role)) {
      router.replace("/");
      return;
    }

    if (
      user.role === "livreur" &&
      pathname !== "/dashboard" &&
      !pathname.startsWith("/dashboard/livraisons") &&
      pathname !== "/dashboard/profil"
    ) {
      router.replace("/dashboard");
      return;
    }
  }, [
    loading,
    token,
    user,
    pathname,
    router,
  ]);

  const allowedRoles = [
    "admin",
    "vendeur",
    "super_admin",
    "livreur",
  ];

  if (
    loading ||
    !token ||
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Vérification de la session...
        </div>
      </div>
    );
  }

  if (
    user.role === "livreur" &&
    pathname !== "/dashboard" &&
    !pathname.startsWith("/dashboard/livraisons") &&
    pathname !== "/dashboard/profil"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Redirection vers votre espace livreur...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}