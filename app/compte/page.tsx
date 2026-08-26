"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Package,
  Bell,
  LogOut,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ComptePage() {
  const {
    user,
    token,
    loading: authLoading,
    updateUser,
    logout,
  } = useAuth();

  const [profile, setProfile] =
    useState<ProfileForm>({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
    });

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      nom: user.nom ?? "",
      prenom: user.prenom ?? "",
      email: user.email ?? "",
      telephone: user.telephone ?? "",
    });
  }, [user]);

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
            Chargement de votre compte...
          </div>
        </div>
      </main>
    );
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
          <div className="w-full rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-sm sm:p-9">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14a800]/10 text-[#14a800]">
              <User size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
              Connectez-vous
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Connectez-vous pour accéder à votre
              espace personnel MarketMali.
            </p>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#14a800] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#108c00]"
            >
              Se connecter
            </Link>

            <Link
              href="/register"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#14a800]/30 hover:bg-green-50 hover:text-[#14a800]"
            >
              Créer un compte
            </Link>

          </div>
        </section>
      </main>
    );
  }

  async function handleProfileSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setProfileLoading(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom: profile.nom,
            prenom: profile.prenom,
            email: profile.email,
            telephone:
              profile.telephone || undefined,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Impossible de mettre à jour votre profil."
        );
      }

      updateUser(data.data);

      setProfileMessage(
        "Vos informations ont été mises à jour avec succès."
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Les deux nouveaux mots de passe ne correspondent pas."
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 8
    ) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        "/api/auth/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword:
              passwordForm.oldPassword,
            newPassword:
              passwordForm.newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Impossible de modifier le mot de passe."
        );
      }

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Votre mot de passe a été modifié avec succès."
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  const initials =
    `${user.prenom?.charAt(0) ?? ""}${user.nom?.charAt(0) ?? ""}`
      .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      <Navbar />

      {/* =====================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* =================================================
            FIL D'ARIANE
        ================================================== */}

        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-400 transition hover:text-[#14a800]"
          >
            Accueil
          </Link>

          <ChevronRight
            size={15}
            className="text-gray-300"
          />

          <span className="font-medium text-gray-700">
            Mon compte
          </span>
        </div>


        {/* =================================================
            EN-TÊTE
        ================================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <span className="text-sm font-semibold text-[#14a800]">
                MARKETMALI
              </span>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Mon compte
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Gérez vos informations personnelles,
                votre sécurité et votre espace MarketMali.
              </p>
            </div>

          </div>

        </section>


        {/* =================================================
            PROFIL RÉSUMÉ
        ================================================== */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          <div className="h-1 bg-linear-to-r from-[#14a800] via-[#fcd116] to-[#ce1126]" />

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="flex min-w-0 items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#14a800]/10 text-lg font-extrabold text-[#14a800]">
                {initials || <User size={26} />}
              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Profil
                </p>

                <h2 className="mt-1 truncate text-lg font-extrabold text-gray-900 sm:text-xl">
                  {user.prenom} {user.nom}
                </h2>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {user.email}
                </p>

              </div>

            </div>


            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-green-50 px-4 py-3">

              <span className="h-2.5 w-2.5 rounded-full bg-[#14a800]" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Statut
                </p>

                <p className="text-sm font-bold text-[#087f00]">
                  {user.status === "active"
                    ? "Compte actif"
                    : user.status}
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            RACCOURCIS
        ================================================== */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2">

          <Link
            href="/commandes"
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#14a800]/20 hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                <Package size={20} />
              </div>

              <ChevronRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#14a800]"
              />

            </div>

            <h2 className="mt-4 font-bold text-gray-900">
              Mes commandes
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Consultez vos commandes et suivez
              l'état de vos livraisons.
            </p>

          </Link>


          <Link
            href="/notifications"
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Bell size={20} />
              </div>

              <ChevronRight
                size={18}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-yellow-600"
              />

            </div>

            <h2 className="mt-4 font-bold text-gray-900">
              Notifications
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Consultez vos notifications et les dernières
              informations concernant votre compte.
            </p>
          </Link>

        </section>


        {/* =================================================
            CONTENU
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">


          {/* =================================================
              INFORMATIONS PERSONNELLES
          ================================================== */}

          <section className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                <User size={20} />
              </div>

              <div>

                <h2 className="font-bold text-gray-900">
                  Informations personnelles
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Modifiez les informations associées
                  à votre compte.
                </p>

              </div>

            </div>


            {profileMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{profileMessage}</span>
              </div>
            )}


            {profileError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{profileError}</span>
              </div>
            )}


            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Prénom
                  </label>

                  <input
                    type="text"
                    value={profile.prenom}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        prenom: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                    required
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nom
                  </label>

                  <input
                    type="text"
                    value={profile.nom}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        nom: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                    required
                  />
                </div>

              </div>


              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail
                    size={15}
                    className="text-gray-400"
                  />
                  Adresse e-mail
                </label>

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                  required
                />

              </div>


              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone
                    size={15}
                    className="text-gray-400"
                  />
                  Téléphone
                </label>

                <input
                  type="tel"
                  value={profile.telephone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      telephone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                />

              </div>


              <div className="flex justify-end border-t border-gray-100 pt-5">

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#14a800] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#108c00] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {profileLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Enregistrer
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>


          {/* =================================================
              SÉCURITÉ
          ================================================== */}

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <Shield size={20} />
              </div>

              <div>

                <h2 className="font-bold text-gray-900">
                  Sécurité
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Gardez votre compte sécurisé.
                </p>

              </div>

            </div>


            {passwordMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3 text-xs text-green-700">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                <span>{passwordMessage}</span>
              </div>
            )}


            {passwordError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                <span>{passwordError}</span>
              </div>
            )}


            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ancien mot de passe
                </label>

                <input
                  type="password"
                  value={
                    passwordForm.oldPassword
                  }
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nouveau mot de passe
                </label>

                <input
                  type="password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                  required
                  minLength={8}
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirmer le mot de passe
                </label>

                <input
                  type="password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-green-50"
                  required
                  minLength={8}
                />

              </div>


              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock size={17} />
                    Modifier le mot de passe
                  </>
                )}
              </button>

            </form>

          </section>

        </div>


        {/* =================================================
            DÉCONNEXION
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-bold text-gray-900">
                Déconnexion
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Vous serez déconnecté de votre compte
                MarketMali sur cet appareil.
              </p>

            </div>


            <button
              type="button"
              onClick={logout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 sm:w-auto"
            >
              <LogOut size={17} />
              Se déconnecter
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}