"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de traiter votre demande."
        );
      }

      setSuccess(true);
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

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">

          {/* LOGO / RETOUR */}

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

          {/* CARD */}

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
                {success ? (
                  <CheckCircle2
                    size={30}
                    strokeWidth={1.8}
                  />
                ) : (
                  <KeyRound
                    size={30}
                    strokeWidth={1.8}
                  />
                )}
              </div>

              {/* TITRE */}

              <div className="mt-5 text-center">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                  Mot de passe oublié ?
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                  Entrez votre adresse e-mail et nous
                  vous aiderons à réinitialiser votre
                  mot de passe.
                </p>
              </div>

              {/* SUCCESS */}

              {success ? (
                <div className="mt-7">

                  <div
                    className="
                      rounded-2xl
                      border
                      border-green-100
                      bg-green-50
                      p-4
                    "
                  >
                    <div className="flex gap-3">

                      <CheckCircle2
                        size={20}
                        className="
                          mt-0.5
                          shrink-0
                          text-green-600
                        "
                      />

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Demande prise en compte
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-700">
                          Si cette adresse correspond à
                          un compte MarketMali, un lien de
                          réinitialisation a été généré.
                        </p>
                      </div>

                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="
                      mt-5
                      flex
                      w-full
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#14a800]
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:bg-[#108f00]
                    "
                  >
                    Retour à la connexion
                  </Link>

                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-7"
                >

                  {/* ERREUR */}

                  {error && (
                    <div
                      className="
                        mb-5
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

                  {/* EMAIL */}

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
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="exemple@email.com"
                      autoComplete="email"
                      required
                      className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        pl-11
                        pr-4
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

                  </div>

                  {/* BOUTON */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      mt-5
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
                      ? "Traitement..."
                      : "Réinitialiser mon mot de passe"}
                  </button>

                </form>
              )}

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
                  Pour votre sécurité, nous ne révélons
                  pas si une adresse e-mail correspond à
                  un compte MarketMali.
                </p>
              </div>

            </div>
          </div>

          {/* FOOTER */}

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MarketMali
          </p>

        </div>
      </div>
    </main>
  );
}
