"use client";

import { useState } from "react";
import {
  AlertCircle,
  Car,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface AddLivreurStepProps {
  onCompleted: () => void;
}

interface LivreurForm {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  vehicule: string;
}

interface BoutiqueResponse {
  success: boolean;
  message?: string;
  data:
    | {
        id: number;
        nom: string;
      }
    | null;
}

const initialForm: LivreurForm = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
  password: "",
  vehicule: "",
};

export default function AddLivreurStep({
  onCompleted,
}: AddLivreurStepProps) {
  const [form, setForm] =
    useState<LivreurForm>(initialForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    field: keyof LivreurForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveLivreur = async () => {
    setError("");

    if (!form.nom.trim()) {
      const message = "Le nom est obligatoire.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!form.prenom.trim()) {
      const message = "Le prénom est obligatoire.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!form.telephone.trim()) {
      const message =
        "Le numéro de téléphone est obligatoire.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!form.email.trim()) {
      const message =
        "L'adresse email est obligatoire.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!form.password.trim()) {
      const message =
        "Le mot de passe est obligatoire.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.password.length < 6) {
      const message =
        "Le mot de passe doit contenir au moins 6 caractères.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Session expirée.");
      }

      /*
       * Récupération de la boutique du vendeur.
       * Le vendeur n'a pas besoin de la sélectionner :
       * sa boutique est déjà déterminée côté serveur.
       */
      const boutiqueResponse = await fetch(
        "/api/dashboard/boutiques",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const boutiqueResult =
        (await boutiqueResponse.json()) as BoutiqueResponse;

      if (
        !boutiqueResponse.ok ||
        !boutiqueResult.success ||
        !boutiqueResult.data
      ) {
        throw new Error(
          boutiqueResult.message ||
            "Impossible de récupérer votre boutique."
        );
      }

      const boutiqueId = boutiqueResult.data.id;

      const response = await fetch(
        "/api/dashboard/livreurs",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            boutique_id: boutiqueId,
            nom: form.nom.trim(),
            prenom: form.prenom.trim(),
            telephone: form.telephone.trim(),
            email: form.email.trim(),
            password: form.password,
            vehicule:
              form.vehicule.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Impossible de créer le livreur."
        );
      }

      toast.success(
        "Livreur créé avec succès."
      );

      setForm(initialForm);

      /*
       * Le parent recharge ensuite l'état depuis
       * le serveur et active automatiquement
       * l'étape suivante.
       */
      onCompleted();
    } catch (error) {
      console.error(
        "Erreur création livreur :",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-gray-100 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Truck className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Ajouter un livreur
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Créez le compte d'un livreur qui pourra
              prendre en charge les commandes de votre
              boutique.
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-5 p-5 sm:p-6">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Impossible de créer le livreur
              </p>

              <p className="mt-1 text-xs leading-5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* IDENTITÉ */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />

            <h3 className="text-sm font-bold text-gray-900">
              Informations personnelles
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Prénom
              </label>

              <input
                type="text"
                value={form.prenom}
                onChange={(event) =>
                  handleInputChange(
                    "prenom",
                    event.target.value
                  )
                }
                placeholder="Prénom"
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nom
              </label>

              <input
                type="text"
                value={form.nom}
                onChange={(event) =>
                  handleInputChange(
                    "nom",
                    event.target.value
                  )
                }
                placeholder="Nom"
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-500" />

            <h3 className="text-sm font-bold text-gray-900">
              Contact
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Téléphone
            </label>

            <input
              type="tel"
              value={form.telephone}
              onChange={(event) =>
                handleInputChange(
                  "telephone",
                  event.target.value
                )
              }
              placeholder="Ex : 70 00 00 00"
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* VEHICULE */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-gray-500" />

            <h3 className="text-sm font-bold text-gray-900">
              Véhicule
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Type de véhicule
            </label>

            <input
              type="text"
              value={form.vehicule}
              onChange={(event) =>
                handleInputChange(
                  "vehicule",
                  event.target.value
                )
              }
              placeholder="Ex : Moto, Toyota, Tricycle..."
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* COMPTE */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-600" />

            <h3 className="text-sm font-bold text-gray-900">
              Accès du livreur
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleInputChange(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="livreur@example.com"
                  disabled={saving}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mot de passe
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  handleInputChange(
                    "password",
                    event.target.value
                  )
                }
                placeholder="Minimum 6 caractères"
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100 disabled:bg-gray-50"
              />

              <p className="mt-2 text-xs text-gray-500">
                Le livreur utilisera ces identifiants
                pour accéder à son espace.
              </p>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <p className="text-xs leading-5 text-blue-700">
            Le livreur sera créé avec le statut{" "}
            <strong>actif</strong>. Vous pourrez ensuite
            modifier son statut et sa disponibilité depuis
            la gestion des livreurs.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
        <button
          type="button"
          onClick={saveLivreur}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Truck className="h-4 w-4" />
              Créer le livreur
            </>
          )}
        </button>
      </div>
    </section>
  );
}
