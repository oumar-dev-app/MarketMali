"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  ExternalLink,
  Pencil,
  Package,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  status: "active" | "pending" | "blocked";
  activation_expires_at: string | null;
  created_at: string;
}

interface BoutiqueResponse {
  success: boolean;
  message?: string;
  data: Boutique;
}

export default function MaBoutiquePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "vendeur") {
      router.push("/dashboard");
      return;
    }

    const fetchBoutique = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await apiGet<BoutiqueResponse>(
            "/dashboard/boutiques"
          );

        if (!result?.data) {
          throw new Error(
            "Aucune boutique trouvée."
          );
        }

        setBoutique(result.data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer votre boutique."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBoutique();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-56 bg-gray-200 rounded-xl animate-pulse" />

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />

              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-80 max-w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 bg-white border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Impossible de charger votre boutique
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return null;
  }

  const statusConfig = {
    active: {
      label: "Active",
      icon: CheckCircle,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    pending: {
      label: "En attente de validation",
      icon: Clock,
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    blocked: {
      label: "Bloquée",
      icon: Ban,
      className:
        "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };

  const status =
    statusConfig[boutique.status];

  const StatusIcon = status.icon;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div>
                <p className="text-sm text-gray-500">
                  Espace vendeur
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Ma boutique
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Gérez les informations et la présence de votre boutique.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <Link
              href={`/boutiques/${boutique.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Visiter ma boutique
            </Link>

            <Link
              href={`/dashboard/boutiques/${boutique.uuid}/edit`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Modifier
            </Link>

          </div>
        </div>

        {/* BOUTIQUE HERO */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

          <div className="h-2 bg-gray-900" />

          <div className="p-5 sm:p-7 lg:p-8">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* LOGO */}

              <div className="shrink-0">

                {boutique.logo ? (
                  <img
                    src={boutique.logo}
                    alt={boutique.nom}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <Store className="w-10 h-10 text-gray-400" />
                  </div>
                )}

              </div>

              {/* INFORMATIONS */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                    {boutique.nom}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.className}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                    />

                    <StatusIcon className="w-3.5 h-3.5" />

                    {status.label}
                  </span>

                </div>

                <p className="text-sm text-gray-400 mt-2">
                  /{boutique.slug}
                </p>

                {boutique.description && (
                  <p className="text-sm text-gray-600 mt-4 max-w-2xl leading-relaxed">
                    {boutique.description}
                  </p>
                )}

              </div>

            </div>

          </div>
        </div>

        {/* ACTIONS RAPIDES */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

          <Link
            href="/dashboard/produits"
            className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>

              <ArrowLeft className="w-4 h-4 rotate-180 text-gray-300 group-hover:text-gray-700 transition" />

            </div>

            <h3 className="font-semibold text-gray-900 mt-4">
              Mes produits
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Gérer les produits de votre boutique
            </p>
          </Link>

          <Link
            href="/dashboard/commandes"
            className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-violet-600" />
              </div>

              <ArrowLeft className="w-4 h-4 rotate-180 text-gray-300 group-hover:text-gray-700 transition" />

            </div>

            <h3 className="font-semibold text-gray-900 mt-4">
              Mes commandes
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Consulter et gérer vos commandes
            </p>
          </Link>

          <Link
            href={`/boutiques/${boutique.slug}`}
            target="_blank"
            className="group bg-gray-900 rounded-2xl p-5 shadow-sm hover:bg-gray-800 transition"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>

              <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white transition" />

            </div>

            <h3 className="font-semibold text-white mt-4">
              Ma vitrine
            </h3>

            <p className="text-sm text-gray-300 mt-1">
              Voir votre boutique comme un client
            </p>
          </Link>

        </div>

        {/* INFORMATIONS */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Informations de la boutique
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Les informations actuellement enregistrées.
            </p>
          </div>

          <div className="p-5 sm:p-7">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* TELEPHONE */}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    Téléphone
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                    {boutique.telephone || "Non renseigné"}
                  </p>
                </div>
              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    Email
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                    {boutique.email || "Non renseigné"}
                  </p>
                </div>
              </div>

              {/* LOCALISATION */}

              <div className="flex items-start gap-3 md:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    Localisation
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {boutique.ville || "Ville non renseignée"}
                  </p>

                  {boutique.adresse && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {boutique.adresse}
                    </p>
                  )}
                </div>
              </div>

              {/* CREATION */}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Créée le
                  </p>

                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {new Date(
                      boutique.created_at
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* STATUT PENDING */}

        {boutique.status === "pending" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

            <div className="flex items-start gap-4">

              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>

              <div>
                <h3 className="font-semibold text-amber-900">
                  Boutique en attente de validation
                </h3>

                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  Votre boutique a bien été créée. Elle doit maintenant être
                  validée par un administrateur avant d'être pleinement
                  opérationnelle sur MarketMali.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* STATUT BLOCKED */}

        {boutique.status === "blocked" && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">

            <div className="flex items-start gap-4">

              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h3 className="font-semibold text-red-900">
                  Boutique bloquée
                </h3>

                <p className="text-sm text-red-800 mt-1 leading-relaxed">
                  Votre boutique est actuellement bloquée. Certaines
                  fonctionnalités peuvent être indisponibles.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
