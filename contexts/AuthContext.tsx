"use client";
import { useRouter } from "next/navigation";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: number;
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    async function checkAuth() {
      console.log("checkAuth");
      const storedToken =
        localStorage.getItem("token");
      console.log("storedToken =", storedToken);

      if (!storedToken) {

        setLoading(false);
        return;

      }

      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const response =
          await fetch(
            "/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${storedToken}`
              }
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          setToken(storedToken);

          setUser(data.data);

        } else {

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setToken(null);
          setUser(null);

        }

      } catch {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

      } finally {

        setLoading(false);

      }

    }

    checkAuth();

  }, []);

  function login(
    token: string,
    user: User
  ) {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setToken(token);

    setUser(user);
  }

  function logout() {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setToken(null);

    setUser(null);

    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider"
    );
  }

  return context;
}