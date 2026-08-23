"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "Le lien de réinitialisation est invalide."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== confirmation) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de réinitialiser le mot de passe."
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmation("");
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

  if (success) {
    return (
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-sm
        "
      >
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-[#14a800]" />
          <div className="flex-1 bg-[#fcd116]" />
          <div className="flex-1 bg-[#ce1126]" />
        </div>

        <div className="p-6 text-center sm:p-8">

          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-green-50
              text-green-600
            "
          >
            <CheckCircle2
              size={32}
              strokeWidth={1.8}
            />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-950">
            Mot de passe réinitialisé
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Votre nouveau mot de passe a été enregistré
            avec succès. Vous pouvez maintenant vous
            connecter à votre compte.
          </p>

          <Link
            href="/login"
            className="
              mt-6
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-[#14a800]
              text-sm
              font-bold
              text-white
              transition
              hover:bg-[#108f00]
            "
          >
            Se connecter
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
        shadow-sm
      "
    >

      {/* BANDE MALI */}

      <div className="flex h-1.5 w-full">
        <div className="flex-1 bg-[#14a800]" />
        <div className="flex-1 bg-[#fcd116]" />
        <div className="flex-1 bg-[#ce1126]" />
      </div>

      <div className="p-6 sm:p-8">

        {/* ICON */}

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-[#14a800]/10
            text-[#14a800]
          "
        >
          <KeyRound
            size={30}
            strokeWidth={1.8}
          />
        </div>

        {/* TITRE */}

        <div className="mt-5 text-center">

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
            Nouveau mot de passe
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Choisissez un nouveau mot de passe
            sécurisé pour votre compte MarketMali.
          </p>

        </div>

        {/* ERREUR */}

        {error && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* FORMULAIRE */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* PASSWORD */}

          <div>

            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-xs
                font-bold
                text-gray-700
              "
            >
              Nouveau mot de passe
            </label>

            <div className="relative">

              <KeyRound
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 8 caractères"
                autoComplete="new-password"
                required
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  pl-11
                  pr-12
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-[#14a800]
                  focus:ring-4
                  focus:ring-[#14a800]/10
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:text-gray-700
                "
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>

          {/* CONFIRMATION */}

          <div>

            <label
              htmlFor="confirmation"
              className="
                mb-2
                block
                text-xs
                font-bold
                text-gray-700
              "
            >
              Confirmer le mot de passe
            </label>

            <div className="relative">

              <KeyRound
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                id="confirmation"
                type={
                  showConfirmation
                    ? "text"
                    : "password"
                }
                value={confirmation}
                onChange={(event) =>
                  setConfirmation(
                    event.target.value
                  )
                }
                placeholder="Confirmez votre mot de passe"
                autoComplete="new-password"
                required
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  pl-11
                  pr-12
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-[#14a800]
                  focus:ring-4
                  focus:ring-[#14a800]/10
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmation(
                    (value) => !value
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:text-gray-700
                "
                aria-label={
                  showConfirmation
                    ? "Masquer la confirmation"
                    : "Afficher la confirmation"
                }
              >
                {showConfirmation ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>

          {/* BOUTON */}

          <button
            type="submit"
            disabled={loading || !token}
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-[#14a800]
              px-5
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#108f00]
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Réinitialisation..."
              : "Enregistrer le nouveau mot de passe"}
          </button>

        </form>

        {/* SECURITE */}

        <div
          className="
            mt-7
            flex
            items-start
            gap-3
            border-t
            border-gray-100
            pt-5
          "
        >
          <ShieldCheck
            size={17}
            className="
              mt-0.5
              shrink-0
              text-[#14a800]
            "
          />

          <p className="text-[11px] leading-5 text-gray-400">
            Votre lien de réinitialisation est temporaire
            et ne peut être utilisé qu'une seule fois.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa]">

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">

        <div className="w-full max-w-md">

          {/* HEADER */}

          <div className="mb-6 flex items-center justify-between">

            <Link
              href="/"
              className="
                text-xl
                font-extrabold
                tracking-tight
                text-[#14a800]
              "
            >
              MarketMali
            </Link>

            <Link
              href="/login"
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-gray-500
                transition
                hover:text-[#14a800]
              "
            >
              <ArrowLeft size={15} />
              Connexion
            </Link>

          </div>

          <Suspense
            fallback={
              <div
                className="
                  rounded-3xl
                  border
                  border-gray-100
                  bg-white
                  p-8
                  text-center
                  shadow-sm
                "
              >
                <p className="text-sm text-gray-500">
                  Chargement...
                </p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MarketMali
          </p>

        </div>

      </div>

    </main>
  );
}
