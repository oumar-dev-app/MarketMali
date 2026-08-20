"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();
  const {
    login,
    token,
    loading: authLoading
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (
      !authLoading &&
      token
    ) {

      router.replace("/dashboard");

    }

  }, [
    authLoading,
    token,
    router
  ]);

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);
    setError("");


    try {

      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email,
              password
            })
          }
        );


      const data =
        await response.json();

      console.log("LOGIN OK");
      console.log(data.data.user);
      console.log(data.data.token);

      if (!data.success) {
        setError(
          data.message || "Erreur de connexion"
        );
        return;
      }

      login(
        data.data.token,
        data.data.user
      );
      console.log("TOKEN STOCKÉ");

      const role = data.data.user.role;

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
      setError(
        "Erreur serveur"
      );
    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow w-96"
      >

        <h1 className="text-2xl font-bold mb-6">
          Connexion MarketMali
        </h1>


        {
          error && (
            <p className="text-red-600 mb-4">
              {error}
            </p>
          )
        }


        <input
          type="email"
          placeholder="Email"
          className="border p-3 w-full mb-4 rounded"
          value={email}
          onChange={
            e => setEmail(e.target.value)
          }
        />


        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-3 w-full mb-4 rounded"
          value={password}
          onChange={
            e => setPassword(e.target.value)
          }
        />


        <button
          disabled={loading}
          className="bg-black text-white w-full p-3 rounded"
        >

          {
            loading
              ? "Connexion..."
              : "Se connecter"
          }

        </button>


      </form>


    </div>

  );

}
