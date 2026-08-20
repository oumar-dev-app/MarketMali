"use client";

import {
  useEffect,
  ReactNode
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  useAuth
} from "@/contexts/AuthContext";


export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {

  const router = useRouter();

  const {
    token,
    loading,
    user
  } = useAuth();


  const allowedRoles = [
    "admin",
    "vendeur"
  ];


  console.log("PROTECTED CHECK", {
    loading,
    token,
    role: user?.role
  });


  useEffect(() => {

    if (loading) return;


    if (!token || !user) {
      router.replace("/login");
      return;
    }


    if (!allowedRoles.includes(user.role)) {
      router.replace("/");
    }


  }, [
    loading,
    token,
    user,
    router
  ]);


  if (
    loading ||
    !token ||
    !user ||
    !allowedRoles.includes(user.role)
  ) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Vérification de la session...
      </div>
    );

  }


  return (
    <>
      {children}
    </>
  );
}