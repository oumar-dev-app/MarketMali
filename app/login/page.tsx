"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const {
    login,
    token,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      router.replace("/dashboard");
    }
  }, [authLoading, token, router]);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Adresse e-mail ou mot de passe incorrect."
        );
        return;
      }

      login(
        data.data.token,
        data.data.user
      );

      const role =
        data.data.user.role;

      if (
        role === "vendeur" ||
        role === "admin" ||
        role === "super_admin"
      ) {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    } catch (err) {
      console.error(
        "Erreur connexion :",
        err
      );

      setError(
        "Impossible de contacter le serveur. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fa] px-4 py-8 sm:px-6">

      {/* =====================================================
          DÉCORATIONS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-[#14a800]/5
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-32
          h-96
          w-96
          rounded-full
          bg-[#fcd116]/5
        "
      />

      {/* =====================================================
          CONTENEUR
      ====================================================== */}

      <div className="relative w-full max-w-md">

        {/* =================================================
            LOGO / IDENTITÉ
        ================================================== */}

        <div className="mb-6 text-center">

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-3
              transition-opacity
              hover:opacity-80
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#14a800]
                text-white
                shadow-lg
                shadow-[#14a800]/20
              "
            >
              <ShoppingBag
                size={24}
                strokeWidth={2}
              />
            </div>

            <div className="text-left">

              <p className="text-xl font-extrabold tracking-tight text-gray-950">
                Market<span className="text-[#14a800]">Mali</span>
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Marketplace malien
              </p>

            </div>

          </Link>

        </div>

        {/* =================================================
            CARTE
        ================================================== */}

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-gray-100
            bg-white
            shadow-xl
            shadow-gray-200/50
          "
        >

          {/* BANDE MALI */}

          <div className="flex h-1.5">
            <div className="flex-1 bg-[#14a800]" />
            <div className="flex-1 bg-[#fcd116]" />
            <div className="flex-1 bg-[#ce1126]" />
          </div>

          <div className="p-6 sm:p-8">

            {/* =================================================
                TITRE
            ================================================== */}

            <div className="mb-7">

              <div
                className="
                  mb-4
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#14a800]/10
                  text-[#14a800]
                "
              >
                <LockKeyhole
                  size={21}
                  strokeWidth={1.9}
                />
              </div>

              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-gray-950
                  sm:text-3xl
                "
              >
                Bon retour parmi nous
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Connectez-vous à votre compte
                MarketMali pour continuer.
              </p>

            </div>

            {/* =================================================
                ERREUR
            ================================================== */}

            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                "
              >
                <p className="text-sm font-medium leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                FORMULAIRE
            ================================================== */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    text-gray-700
                  "
                >
                  Adresse e-mail
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="exemple@email.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      pl-11
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#14a800]/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                </div>

              </div>

              {/* MOT DE PASSE */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="
                      text-xs
                      font-bold
                      text-gray-700
                    "
                  >
                    Mot de passe
                  </label>

                  <Link
                    href="/forgot-password"
                    className="
                      text-xs
                      font-semibold
                      text-[#14a800]
                      transition
                      hover:text-[#108f00]
                    "
                  >
                    Mot de passe oublié ?
                  </Link>

                </div>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-3.5
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
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      pl-11
                      pr-11
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#14a800]/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-700
                    "
                  >
                    {showPassword ? (
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
                disabled={
                  loading ||
                  !email.trim() ||
                  !password
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#14a800]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  shadow-[#14a800]/20
                  transition-all
                  hover:bg-[#108f00]
                  hover:shadow-md
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:bg-gray-200
                  disabled:text-gray-400
                  disabled:shadow-none
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </form>

            {/* =================================================
                SÉCURITÉ
            ================================================== */}

            <div
              className="
                mt-6
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-gray-100
                pt-5
              "
            >
              <ShieldCheck
                size={15}
                className="text-[#14a800]"
              />

              <span className="text-[11px] text-gray-400">
                Vos informations sont protégées
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            INSCRIPTION
        ================================================== */}

        <p className="mt-6 text-center text-sm text-gray-500">

          Vous n'avez pas encore de compte ?{" "}

          <Link
            href="/register"
            className="
              font-bold
              text-[#14a800]
              transition
              hover:text-[#108f00]
            "
          >
            Créer un compte
          </Link>

        </p>

        {/* =================================================
            RETOUR ACCUEIL
        ================================================== */}

        <div className="mt-4 text-center">

          <Link
            href="/"
            className="
              text-xs
              font-medium
              text-gray-400
              transition
              hover:text-gray-600
            "
          >
            ← Retour à l'accueil
          </Link>

        </div>

      </div>

    </main>
  );
}