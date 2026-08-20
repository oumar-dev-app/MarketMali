"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {

  const router = useRouter();

  const {
    login,
    token,
    loading: authLoading
  } = useAuth();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!authLoading && token) {
      router.replace("/");
    }

  }, [authLoading, token, router]);

  async function handleRegister(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom,
            prenom,
            email,
            telephone,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {

        setError(
          data.message || "Erreur lors de la création du compte."
        );

        return;

      }

      login(
        data.data.token,
        data.data.user
      );

      router.replace("/");

    } catch {

      setError("Erreur serveur.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >

        <h1 className="text-2xl font-bold mb-6">
          Créer un compte
        </h1>

        {error && (
          <p className="text-red-600 mb-4">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Nom"
          className="border p-3 w-full mb-4 rounded"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          type="text"
          placeholder="Prénom"
          className="border p-3 w-full mb-4 rounded"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-3 w-full mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Téléphone"
          className="border p-3 w-full mb-4 rounded"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-3 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="border p-3 w-full mb-6 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white w-full p-3 rounded"
        >
          {loading
            ? "Création..."
            : "Créer un compte"}
        </button>

      </form>

    </div>

  );

}