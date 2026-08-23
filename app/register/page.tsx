"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Store,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();

  const {
    login,
    token,
    loading: authLoading,
  } = useAuth();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      router.replace("/");
    }
  }, [authLoading, token, router]);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const trimmedNom = nom.trim();
    const trimmedPrenom = prenom.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedTelephone = telephone.trim();

    if (
      !trimmedNom ||
      !trimmedPrenom ||
      !trimmedEmail ||
      !trimmedTelephone ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Veuillez remplir tous les champs."
      );
      return;
    }

    if (trimmedNom.length < 2) {
      setError(
        "Le nom doit contenir au moins 2 caractères."
      );
      return;
    }

    if (trimmedPrenom.length < 2) {
      setError(
        "Le prénom doit contenir au moins 2 caractères."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: trimmedNom,
            prenom: trimmedPrenom,
            email: trimmedEmail,
            telephone: trimmedTelephone,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Erreur lors de la création du compte."
        );
      }

      login(
        data.data.token,
        data.data.user
      );

      router.replace("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création du compte."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="flex min-h-screen">

        {/* =========================
            PARTIE GAUCHE
        ========================== */}

        <section className="relative hidden overflow-hidden bg-[#14a800] lg:flex lg:w-[44%]">

          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10" />
            <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/10" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            <div>
              <Link
                href="/"
                className="text-2xl font-black tracking-tight text-white"
              >
                MarketMali
              </Link>

              <div className="mt-20 max-w-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                  <UserPlus
                    size={28}
                    strokeWidth={1.8}
                  />
                </div>

                <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
                  Bienvenue sur
                  <br />
                  MarketMali.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-white/80">
                  Créez votre compte et découvrez
                  une nouvelle façon d'acheter et de
                  vendre au Mali.
                </p>
              </div>

              <div className="mt-12 space-y-5">

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Achetez simplement
                    </p>

                    <p className="mt-1 text-sm leading-5 text-white/70">
                      Retrouvez les produits de
                      nombreuses boutiques.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Store size={19} />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Devenez vendeur
                    </p>

                    <p className="mt-1 text-sm leading-5 text-white/70">
                      Après votre inscription, vous
                      pourrez demander l'activation
                      de votre compte vendeur.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} MarketMali.
              Tous droits réservés.
            </p>

          </div>
        </section>

        {/* =========================
            PARTIE DROITE
        ========================== */}

        <section className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[56%] lg:px-10">

          <div className="w-full max-w-xl">

            {/* HEADER MOBILE */}

            <div className="mb-8 flex items-center justify-between lg:hidden">

              <Link
                href="/"
                className="text-xl font-black tracking-tight text-[#14a800]"
              >
                MarketMali
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#14a800]"
              >
                Connexion
              </Link>

            </div>

            {/* TITRE */}

            <div className="mb-8">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#14a800] lg:hidden">
                <UserPlus
                  size={24}
                  strokeWidth={1.8}
                />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Créer votre compte
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                Rejoignez MarketMali et commencez
                votre expérience.
              </p>

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={handleRegister}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"
            >

              {error && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* NOM */}

                <div>
                  <label
                    htmlFor="nom"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Nom
                  </label>

                  <input
                    id="nom"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Votre nom"
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:ring-4
                      focus:ring-green-50
                      disabled:bg-gray-50
                    "
                  />
                </div>

                {/* PRENOM */}

                <div>
                  <label
                    htmlFor="prenom"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Prénom
                  </label>

                  <input
                    id="prenom"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Votre prénom"
                    value={prenom}
                    onChange={(e) =>
                      setPrenom(e.target.value)
                    }
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:ring-4
                      focus:ring-green-50
                      disabled:bg-gray-50
                    "
                  />
                </div>

                {/* EMAIL */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Adresse e-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:ring-4
                      focus:ring-green-50
                      disabled:bg-gray-50
                    "
                  />
                </div>

                {/* TELEPHONE */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="telephone"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Numéro de téléphone
                  </label>

                  <input
                    id="telephone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Ex. 75 40 21 50"
                    value={telephone}
                    onChange={(e) =>
                      setTelephone(e.target.value)
                    }
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-[#14a800]
                      focus:ring-4
                      focus:ring-green-50
                      disabled:bg-gray-50
                    "
                  />
                </div>

                {/* MOT DE PASSE */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Mot de passe
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="8 caractères minimum"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        pr-12
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-[#14a800]
                        focus:ring-4
                        focus:ring-green-50
                        disabled:bg-gray-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-400 hover:text-gray-700"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRMATION */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Confirmation
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Confirmez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        pr-12
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-[#14a800]
                        focus:ring-4
                        focus:ring-green-50
                        disabled:bg-gray-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-400 hover:text-gray-700"
                      aria-label={
                        showConfirmPassword
                          ? "Masquer la confirmation"
                          : "Afficher la confirmation"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* INFORMATION */}

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#14a800]"
                />

                <p className="text-xs leading-5 text-gray-500">
                  Votre compte est créé en tant que
                  client. Si vous souhaitez vendre sur
                  MarketMali, vous pourrez demander
                  ultérieurement l'activation du rôle
                  vendeur.
                </p>
              </div>

              {/* BOUTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-6
                  flex
                  h-13
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
                  focus:outline-none
                  focus:ring-4
                  focus:ring-green-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Création du compte...
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              {/* CONNEXION */}

              <p className="mt-6 text-center text-sm text-gray-500">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#14a800] hover:underline"
                >
                  Se connecter
                </Link>
              </p>

            </form>

            {/* SECURITE */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} />
              Vos informations sont protégées.
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}