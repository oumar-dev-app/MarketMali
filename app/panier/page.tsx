"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: number;
}

interface GpsDebug {
  url: string;
  protocol: string;
  secure: boolean;
  geolocation: boolean;
  permission: string;
  device: string;
  browser: string;
}

type PermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "unknown";

export default function PagePanier() {
  const router = useRouter();

  const { user, token } = useAuth();

  const {
    items,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [tarifsLivraison, setTarifsLivraison] =
    useState<TarifLivraison[]>([]);

  const [zoneLivraison, setZoneLivraison] =
    useState("");

  const [tarifLivraison, setTarifLivraison] =
    useState(0);

  const [tarifsLoading, setTarifsLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [localisationLoading, setLocalisationLoading] =
    useState(false);

  const [localisationError, setLocalisationError] =
    useState("");

  const [localisationErrorCode, setLocalisationErrorCode] =
    useState<number | null>(null);

  const [gpsPermission, setGpsPermission] =
    useState<PermissionState>("unknown");

  const [gpsDebug, setGpsDebug] =
    useState<GpsDebug>({
      url: "",
      protocol: "",
      secure: false,
      geolocation: false,
      permission: "unknown",
      device: "unknown",
      browser: "unknown",
    });

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [gpsPrecision, setGpsPrecision] =
    useState<number | null>(null);

  const [adresseLivraison, setAdresseLivraison] =
    useState("");

  const localisationAutomatique =
    useRef(false);

  /**
   * Empêche plusieurs requêtes GPS simultanées.
   */
  const gpsRequestActive =
    useRef(false);

  /**
   * Timer de sécurité.
   *
   * Certains navigateurs mobiles peuvent parfois
   * ne jamais retourner le callback GPS.
   */
  const gpsTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * =========================================================
   * DÉTECTION APPAREIL / NAVIGATEUR
   * =========================================================
   */

  const detecterAppareil = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        device: "unknown",
        browser: "unknown",
      };
    }

    const userAgent =
      navigator.userAgent || "";

    const platform =
      navigator.platform || "";

    const isIOS =
      /iPad|iPhone|iPod/i.test(userAgent) ||
      (
        platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      );

    const isAndroid =
      /Android/i.test(userAgent);

    const isChrome =
      /Chrome|CriOS/i.test(userAgent);

    const isFirefox =
      /Firefox|FxiOS/i.test(userAgent);

    const isEdge =
      /Edg|EdgiOS|EdgA/i.test(userAgent);

    const isSafari =
      /Safari/i.test(userAgent) &&
      !isChrome &&
      !isFirefox &&
      !isEdge;

    let device = "Ordinateur";

    if (isIOS) {
      device = "iPhone / iPad";
    } else if (isAndroid) {
      device = "Android";
    }

    let browser = "Navigateur";

    if (isSafari) {
      browser = "Safari";
    } else if (isChrome) {
      browser = "Chrome";
    } else if (isFirefox) {
      browser = "Firefox";
    } else if (isEdge) {
      browser = "Edge";
    }

    return {
      device,
      browser,
    };
  }, []);

  /**
   * =========================================================
   * PERMISSION GPS
   * =========================================================
   *
   * IMPORTANT :
   *
   * On ne bloque JAMAIS la récupération GPS
   * en attendant navigator.permissions.query().
   *
   * Sur certains Safari iOS, cette API peut être
   * incomplète ou se comporter de manière imprévisible.
   */

  const verifierPermissionGPS =
    useCallback(async (): Promise<PermissionState> => {
      if (
        typeof window === "undefined" ||
        !navigator.permissions ||
        typeof navigator.permissions.query !== "function"
      ) {
        return "unknown";
      }

      try {
        const permission =
          await Promise.race([
            navigator.permissions.query({
              name: "geolocation" as PermissionName,
            }),

            new Promise<null>((resolve) => {
              setTimeout(() => {
                resolve(null);
              }, 1500);
            }),
          ]);

        if (!permission) {
          return "unknown";
        }

        const state =
          permission.state as PermissionState;

        setGpsPermission(state);

        setGpsDebug((previous) => ({
          ...previous,
          permission: state,
        }));

        return state;
      } catch {
        return "unknown";
      }
    }, []);

  /**
   * =========================================================
   * PRIX FINAL
   * =========================================================
   */

  function getPrixFinal(
    item: (typeof items)[number]
  ): number {
    const prix =
      Number(item.prix);

    if (!Number.isFinite(prix)) {
      return 0;
    }

    if (
      item.promotion_type === "percentage" &&
      item.promotion_reduction_pourcentage !== null &&
      item.promotion_reduction_pourcentage !== undefined
    ) {
      const reduction =
        Number(
          item.promotion_reduction_pourcentage
        );

      if (
        Number.isFinite(reduction) &&
        reduction >= 0 &&
        reduction <= 100
      ) {
        return (
          prix -
          (prix * reduction) / 100
        );
      }
    }

    if (
      item.promotion_type === "special_price" &&
      item.promotion_prix_promotionnel !== null &&
      item.promotion_prix_promotionnel !== undefined
    ) {
      const prixPromotionnel =
        Number(
          item.promotion_prix_promotionnel
        );

      if (
        Number.isFinite(prixPromotionnel) &&
        prixPromotionnel >= 0
      ) {
        return prixPromotionnel;
      }
    }

    return prix;
  }

  /**
   * =========================================================
   * TOTAL NORMAL
   * =========================================================
   */

  const totalNormal =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.prix) *
          item.quantity,
      0
    );

  /**
   * =========================================================
   * ÉCONOMIE
   * =========================================================
   */

  const economie =
    Math.max(
      0,
      totalNormal - total
    );

  /**
   * =========================================================
   * GPS
   * =========================================================
   */

  const recupererPosition =
    useCallback(async () => {
      if (typeof window === "undefined") {
        return;
      }

      /**
       * Empêche deux demandes GPS simultanées.
       */
      if (gpsRequestActive.current) {
        console.log(
          "Une demande GPS est déjà en cours."
        );

        return;
      }

      const appareil =
        detecterAppareil();

      const secure =
        window.isSecureContext;

      const geolocation =
        "geolocation" in navigator;

      /**
       * Diagnostic
       */
      setGpsDebug((previous) => ({
        ...previous,

        url:
          window.location.href,

        protocol:
          window.location.protocol,

        secure,

        geolocation,

        device:
          appareil.device,

        browser:
          appareil.browser,
      }));

      console.log(
        "================================"
      );

      console.log(
        "GPS MarketMali"
      );

      console.log(
        "URL :",
        window.location.href
      );

      console.log(
        "HTTPS :",
        secure
      );

      console.log(
        "Geolocation :",
        geolocation
      );

      console.log(
        "Appareil :",
        appareil.device
      );

      console.log(
        "Navigateur :",
        appareil.browser
      );

      console.log(
        "================================"
      );

      /**
       * =====================================================
       * VÉRIFICATION HTTPS
       * =====================================================
       */

      if (!secure) {
        setLocalisationLoading(false);

        setLocalisationErrorCode(
          null
        );

        setLocalisationError(
          "La localisation GPS nécessite une connexion sécurisée HTTPS. Ouvrez MarketMali avec son adresse HTTPS."
        );

        return;
      }

      /**
       * =====================================================
       * VÉRIFICATION GEOLOCATION
       * =====================================================
       */

      if (!geolocation) {
        setLocalisationLoading(false);

        setLocalisationErrorCode(
          null
        );

        setLocalisationError(
          "La géolocalisation n'est pas disponible sur ce navigateur. Utilisez Safari ou Chrome."
        );

        return;
      }

      /**
       * =====================================================
       * NOUVELLE TENTATIVE
       * =====================================================
       */

      gpsRequestActive.current =
        true;

      setLocalisationLoading(true);

      setLocalisationError("");

      setLocalisationErrorCode(
        null
      );

      /**
       * Nettoyer un ancien timer.
       */

      if (gpsTimeoutRef.current) {
        clearTimeout(
          gpsTimeoutRef.current
        );
      }

      /**
       * =====================================================
       * VÉRIFICATION RAPIDE DE LA PERMISSION
       * =====================================================
       *
       * IMPORTANT :
       *
       * Cette vérification est informative.
       * Elle NE BLOQUE PAS la demande GPS.
       */

      void verifierPermissionGPS();

      /**
       * =====================================================
       * TIMER DE SÉCURITÉ
       * =====================================================
       *
       * Si le navigateur ne retourne absolument rien
       * après 20 secondes, on débloque l'interface.
       */

      gpsTimeoutRef.current =
        setTimeout(() => {
          console.warn(
            "GPS : timeout de sécurité MarketMali."
          );

          gpsRequestActive.current =
            false;

          setLocalisationLoading(
            false
          );

          setLocalisationErrorCode(
            3
          );

          if (
            appareil.device ===
            "iPhone / iPad"
          ) {
            setLocalisationError(
              "La recherche de votre position prend trop de temps. Vérifiez que le Service de localisation est activé pour Safari et que « Localisation précise » est autorisée, puis appuyez sur Actualiser."
            );
          } else {
            setLocalisationError(
              "La recherche de votre position prend trop de temps. Vérifiez que la localisation GPS est activée, puis appuyez sur Actualiser."
            );
          }
        }, 20000);

      /**
       * =====================================================
       * DEMANDE RÉELLE DE POSITION
       * =====================================================
       */

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            "========== GPS SUCCÈS =========="
          );

          console.log(
            "Latitude :",
            position.coords.latitude
          );

          console.log(
            "Longitude :",
            position.coords.longitude
          );

          console.log(
            "Précision :",
            position.coords.accuracy,
            "m"
          );

          console.log(
            "Source altitude :",
            position.coords.altitude
          );

          console.log(
            "================================"
          );

          /**
           * Nettoyage timer.
           */

          if (gpsTimeoutRef.current) {
            clearTimeout(
              gpsTimeoutRef.current
            );

            gpsTimeoutRef.current =
              null;
          }

          gpsRequestActive.current =
            false;

          const lat =
            Number(
              position.coords.latitude
            );

          const lng =
            Number(
              position.coords.longitude
            );

          const accuracy =
            Number(
              position.coords.accuracy
            );

          /**
           * Vérification coordonnées.
           */

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            setLocalisationLoading(
              false
            );

            setLocalisationErrorCode(
              2
            );

            setLocalisationError(
              "Le navigateur a retourné une position GPS invalide. Veuillez réessayer."
            );

            return;
          }

          /**
           * Sauvegarde position.
           */

          setLatitude(lat);

          setLongitude(lng);

          setGpsPrecision(
            Number.isFinite(accuracy)
              ? accuracy
              : null
          );

          setGpsPermission(
            "granted"
          );

          setGpsDebug(
            (previous) => ({
              ...previous,

              permission:
                "granted",
            })
          );

          setLocalisationError(
            "");

          setLocalisationErrorCode(
            null
          );

          setLocalisationLoading(
            false
          );
        },

        (error) => {
          console.error(
            "========== GPS ERREUR =========="
          );

          console.error(
            "Code :",
            error.code
          );

          console.error(
            "Message :",
            error.message
          );

          console.error(
            "Appareil :",
            appareil.device
          );

          console.error(
            "Navigateur :",
            appareil.browser
          );

          console.error(
            "================================"
          );

          /**
           * Nettoyage.
           */

          if (gpsTimeoutRef.current) {
            clearTimeout(
              gpsTimeoutRef.current
            );

            gpsTimeoutRef.current =
              null;
          }

          gpsRequestActive.current =
            false;

          setLocalisationLoading(
            false
          );

          setLocalisationErrorCode(
            error.code
          );

          /**
           * =================================================
           * ERREUR 1
           * PERMISSION REFUSÉE
           * =================================================
           */

          if (error.code === 1) {
            setGpsPermission(
              "denied"
            );

            setGpsDebug(
              (previous) => ({
                ...previous,

                permission:
                  "denied",
              })
            );

            if (
              appareil.device ===
              "iPhone / iPad"
            ) {
              setLocalisationError(
                "L'accès à votre position a été refusé. Sur iPhone, ouvrez Réglages → Confidentialité et sécurité → Service de localisation → Safari. Autorisez la localisation et activez « Localisation précise », puis revenez sur MarketMali et appuyez sur Actualiser."
              );
            } else if (
              appareil.device ===
              "Android"
            ) {
              setLocalisationError(
                "L'accès à votre position a été refusé. Autorisez la localisation pour votre navigateur dans les paramètres Android, puis revenez sur MarketMali et appuyez sur Actualiser."
              );
            } else {
              setLocalisationError(
                "L'accès à votre position a été refusé. Autorisez la localisation pour ce site dans les paramètres du navigateur, puis appuyez sur Actualiser."
              );
            }

            return;
          }

          /**
           * =================================================
           * ERREUR 2
           * POSITION INDISPONIBLE
           * =================================================
           */

          if (error.code === 2) {
            setLocalisationError(
              "Votre position est actuellement indisponible. Vérifiez que la localisation GPS est activée sur votre téléphone et réessayez."
            );

            return;
          }

          /**
           * =================================================
           * ERREUR 3
           * TIMEOUT
           * =================================================
           */

          if (error.code === 3) {
            setLocalisationError(
              "La récupération de votre position a pris trop de temps. Vérifiez votre signal GPS, activez la localisation précise si disponible, puis appuyez sur Actualiser."
            );

            return;
          }

          /**
           * =================================================
           * ERREUR INCONNUE
           * =================================================
           */

          setLocalisationError(
            "Impossible de récupérer votre position. Vérifiez les paramètres de localisation de votre appareil, puis réessayez."
          );
        },

        {
          /**
           * IMPORTANT :
           *
           * true demande au navigateur de privilégier
           * la meilleure précision disponible.
           *
           * C'est particulièrement important pour le
           * client lorsque la position doit servir à la
           * livraison.
           */
          enableHighAccuracy: true,

          /**
           * Timeout navigateur.
           */
          timeout: 15000,

          /**
           * Pour une commande, on préfère une nouvelle
           * position plutôt qu'une ancienne position.
           */
          maximumAge: 0,
        }
      );
    }, [
      detecterAppareil,
      verifierPermissionGPS,
    ]);

  /**
   * =========================================================
   * NETTOYAGE GPS
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (gpsTimeoutRef.current) {
        clearTimeout(
          gpsTimeoutRef.current
        );
      }
    };
  }, []);

  /**
   * =========================================================
   * GPS AUTOMATIQUE
   * =========================================================
   */

  useEffect(() => {
    if (
      localisationAutomatique.current
    ) {
      return;
    }

    localisationAutomatique.current =
      true;

    /**
     * Petit délai pour laisser Safari/Chrome
     * terminer l'initialisation de la page.
     */

    const timer =
      setTimeout(() => {
        void recupererPosition();
      }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [recupererPosition]);

  /**
   * =========================================================
   * TARIFS LIVRAISON
   * =========================================================
   */

  useEffect(() => {
    if (items.length === 0) {
      setTarifsLivraison([]);
      setZoneLivraison("");
      setTarifLivraison(0);

      return;
    }

    const boutiqueId =
      items[0].boutique_id;

    let actif = true;

    async function chargerTarifs() {
      setTarifsLoading(true);

      try {
        const response =
          await fetch(
            `/api/boutiques/id/${boutiqueId}/tarifs-livraison`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Impossible de récupérer les tarifs."
          );
        }

        const tarifs =
          Array.isArray(data.data)
            ? data.data
            : [];

        if (!actif) {
          return;
        }

        setTarifsLivraison(
          tarifs
        );

        setZoneLivraison(
          (currentZone) => {
            if (
              !currentZone ||
              tarifs.some(
                (
                  tarif: TarifLivraison
                ) =>
                  tarif.zone ===
                  currentZone
              )
            ) {
              return currentZone;
            }

            return "";
          }
        );
      } catch (error) {
        if (!actif) {
          return;
        }

        console.error(
          "Erreur tarifs livraison :",
          error
        );

        setTarifsLivraison([]);
      } finally {
        if (actif) {
          setTarifsLoading(false);
        }
      }
    }

    void chargerTarifs();

    return () => {
      actif = false;
    };
  }, [items]);

  /**
   * =========================================================
   * TARIF ZONE
   * =========================================================
   */

  useEffect(() => {
    const tarif =
      tarifsLivraison.find(
        (item) =>
          item.zone ===
          zoneLivraison
      );

    setTarifLivraison(
      tarif
        ? Number(tarif.frais)
        : 0
    );
  }, [
    zoneLivraison,
    tarifsLivraison,
  ]);

  /**
   * =========================================================
   * PASSER COMMANDE
   * =========================================================
   */

  async function passerCommande() {
    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "client") {
      alert(
        "Vous devez être connecté avec un compte client pour passer une commande."
      );

      return;
    }

    if (items.length === 0) {
      return;
    }

    if (
      latitude === null ||
      longitude === null
    ) {
      alert(
        "Votre position GPS est nécessaire pour la livraison. Autorisez la localisation puis appuyez sur Actualiser."
      );

      return;
    }

    if (!zoneLivraison) {
      alert(
        "Veuillez sélectionner une zone de livraison."
      );

      return;
    }

    setLoading(true);

    try {
      const boutique_id =
        items[0].boutique_id;

      const response =
        await fetch(
          "/api/commandes",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              boutique_id,

              produits:
                items.map(
                  (item) => ({
                    produit_id:
                      item.produit_id,

                    quantite:
                      item.quantity,
                  })
                ),

              zone_livraison:
                zoneLivraison,

              adresse_livraison:
                adresseLivraison,

              latitude,

              longitude,

              gps_precision:
                gpsPrecision,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Impossible de créer la commande."
        );
      }

      clearCart();

      router.push(
        "/commandes"
      );
    } catch (error) {
      console.error(
        "Erreur création commande :",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la commande."
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * =========================================================
   * PANIER VIDE
   * =========================================================
   */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#14a800]/10 text-[#14a800]">
              <ShoppingBag
                size={36}
                strokeWidth={1.7}
              />
            </div>

            <div className="mx-auto mt-6 flex w-fit items-center gap-1">
              <span className="h-1.5 w-8 rounded-full bg-[#14a800]" />
              <span className="h-1.5 w-8 rounded-full bg-[#fcd116]" />
              <span className="h-1.5 w-8 rounded-full bg-[#ce1126]" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
              Votre panier est vide
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Découvrez nos produits et
              ajoutez vos articles préférés
              à votre panier pour commencer
              vos achats.
            </p>

            <Link
              href="/produits"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#14a800] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#108f00] hover:shadow-md"
            >
              <ShoppingBag size={17} />
              Découvrir les produits
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const tarifSelectionne =
    tarifsLivraison.find(
      (tarif) =>
        tarif.zone ===
        zoneLivraison
    );

  const totalGeneral =
    total + tarifLivraison;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* HERO */}

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                  <ShoppingBag size={18} />
                </div>

                <span className="text-sm font-bold uppercase tracking-wide text-[#14a800]">
                  MarketMali
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                Mon panier
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Vérifiez vos articles avant de
                passer votre commande.
              </p>
            </div>

            <Link
              href="/produits"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#14a800]/30 hover:bg-[#14a800]/5 hover:text-[#14a800]"
            >
              <ArrowLeft size={16} />
              Continuer mes achats
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-1">
            <span className="h-1.5 w-10 rounded-full bg-[#14a800]" />
            <span className="h-1.5 w-10 rounded-full bg-[#fcd116]" />
            <span className="h-1.5 w-10 rounded-full bg-[#ce1126]" />
          </div>
        </div>
      </section>

      {/* CONTENU */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ARTICLES */}

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Vos articles
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {items.length} article
                  {items.length > 1
                    ? "s"
                    : ""}{" "}
                  dans votre panier
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
                Vider
              </button>
            </div>

            {items.map((item) => {
              const prixNormal =
                Number(item.prix);

              const prixFinal =
                getPrixFinal(item);

              const sousTotal =
                prixFinal *
                item.quantity;

              const promotionActive =
                Boolean(
                  item.promotion_uuid
                ) &&
                prixFinal <
                  prixNormal;

              const reductionPourcentage =
                item.promotion_reduction_pourcentage !==
                  null &&
                item.promotion_reduction_pourcentage !==
                  undefined
                  ? Number(
                      item.promotion_reduction_pourcentage
                    )
                  : null;

              return (
                <div
                  key={item.uuid}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex gap-4 p-4 sm:p-5">

                    <Link
                      href={`/produits/${item.uuid}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-28 sm:w-28"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.nom}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Package
                            size={28}
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/produits/${item.uuid}`}
                        className="line-clamp-2 text-sm font-bold text-gray-950 transition hover:text-[#14a800] sm:text-base"
                      >
                        {item.nom}
                      </Link>

                      {promotionActive ? (
                        <div className="mt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.promotion_type ===
                              "percentage" &&
                              reductionPourcentage !==
                                null && (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold text-red-600">
                                  -
                                  {
                                    reductionPourcentage
                                  }{" "}
                                  %
                                </span>
                              )}

                            {item.promotion_type ===
                              "special_price" && (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold text-red-600">
                                PROMOTION
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-extrabold text-red-600">
                              {Math.round(
                                prixFinal
                              ).toLocaleString(
                                "fr-FR"
                              )}{" "}
                              FCFA
                            </span>

                            <span className="text-xs font-semibold text-gray-400 line-through">
                              {prixNormal.toLocaleString(
                                "fr-FR"
                              )}{" "}
                              FCFA
                            </span>
                          </div>

                          <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
                            Prix promotionnel
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-extrabold text-[#14a800]">
                          {prixNormal.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.uuid
                              )
                            }
                            disabled={
                              item.quantity <=
                              1
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#14a800] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="flex h-9 min-w-9 items-center justify-center border-x border-gray-200 px-2 text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.uuid
                              )
                            }
                            disabled={
                              item.quantity >=
                              item.stock
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#14a800] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.uuid
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Sous-total
                      </p>

                      <p className="mt-1 text-base font-extrabold text-gray-950">
                        {Math.round(
                          sousTotal
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Sous-total
                      </span>

                      <span className="text-sm font-extrabold text-gray-950">
                        {Math.round(
                          sousTotal
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* LIVRAISON */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14a800]/10 text-[#14a800]">
                  <Truck size={20} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    Livraison
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                    Sélectionnez votre zone pour
                    calculer automatiquement les
                    frais de livraison.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {tarifsLoading ? (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Chargement des zones...
                  </div>
                ) : tarifsLivraison.length ===
                  0 ? (
                  <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-yellow-600"
                    />

                    <p className="text-sm leading-5 text-yellow-800">
                      Aucune zone de livraison
                      n'est disponible pour cette
                      boutique.
                    </p>
                  </div>
                ) : (
                  <select
                    value={zoneLivraison}
                    onChange={(event) =>
                      setZoneLivraison(
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#14a800] focus:ring-4 focus:ring-[#14a800]/10"
                  >
                    <option value="">
                      Sélectionnez votre zone
                    </option>

                    {tarifsLivraison.map(
                      (tarif) => (
                        <option
                          key={tarif.id}
                          value={tarif.zone}
                        >
                          {tarif.zone} —{" "}
                          {Number(
                            tarif.frais
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* LOCALISATION */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Localisation de livraison
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                      Votre position GPS précise
                      permettra de faciliter la
                      livraison.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void recupererPosition()
                  }
                  disabled={
                    localisationLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:border-[#14a800]/30 hover:bg-[#14a800]/5 hover:text-[#14a800] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {localisationLoading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={15} />
                  )}

                  {localisationLoading
                    ? "Recherche GPS..."
                    : "Actualiser"}
                </button>
              </div>

              {/* MESSAGE PENDANT GPS */}

              {localisationLoading && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Loader2
                      size={20}
                      className="mt-0.5 shrink-0 animate-spin text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-blue-800">
                        Recherche de votre position
                        GPS précise en cours...
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Gardez la page ouverte quelques
                        secondes. Votre navigateur
                        recherche la meilleure position
                        disponible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ADRESSE */}

              <div className="mt-5">
                <label
                  htmlFor="adresse"
                  className="mb-2 block text-xs font-bold text-gray-700"
                >
                  Adresse / indication de livraison
                </label>

                <textarea
                  id="adresse"
                  value={adresseLivraison}
                  onChange={(event) =>
                    setAdresseLivraison(
                      event.target.value
                    )
                  }
                  placeholder="Ex : Hamdallaye ACI 2000, près de..., porte..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#14a800] focus:bg-white focus:ring-4 focus:ring-[#14a800]/10"
                />
              </div>

              {/* POSITION RÉCUPÉRÉE */}

              {latitude !== null &&
              longitude !== null ? (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <span className="text-sm font-bold text-green-800">
                      Position GPS récupérée
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-gray-700 sm:grid-cols-3">
                    <div>
                      <span className="font-bold">
                        Latitude :
                      </span>{" "}
                      {latitude.toFixed(7)}
                    </div>

                    <div>
                      <span className="font-bold">
                        Longitude :
                      </span>{" "}
                      {longitude.toFixed(7)}
                    </div>

                    <div>
                      <span className="font-bold">
                        Précision :
                      </span>{" "}
                      {gpsPrecision !== null
                        ? `${Math.round(
                            gpsPrecision
                          )} m`
                        : "-"}
                    </div>
                  </div>
                </div>
              ) : (
                !localisationLoading && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-yellow-600"
                    />

                    <div>
                      <p className="text-xs leading-5 text-yellow-800 sm:text-sm">
                        Votre position n'a pas
                        encore été récupérée.
                        Autorisez la géolocalisation
                        puis appuyez sur « Actualiser ».
                      </p>

                      {gpsPermission ===
                        "denied" && (
                        <p className="mt-2 text-xs font-bold text-yellow-900">
                          La permission de localisation
                          est actuellement refusée.
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* ERREUR */}

              {localisationError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-5 text-red-800 sm:text-sm">
                        {localisationError}
                      </p>

                      {localisationErrorCode !==
                        null && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2">
                          <p className="text-xs font-bold text-red-600">
                            Code erreur GPS :{" "}
                            {
                              localisationErrorCode
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-gray-500">
                            {localisationErrorCode ===
                              1 &&
                              "Permission refusée"}

                            {localisationErrorCode ===
                              2 &&
                              "Position indisponible"}

                            {localisationErrorCode ===
                              3 &&
                              "Délai dépassé"}
                          </p>
                        </div>
                      )}

                                            <button
                        type="button"
                        onClick={() =>
                          void recupererPosition()
                        }
                        disabled={
                          localisationLoading
                        }
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          size={14}
                        />
                        Réessayer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DIAGNOSTIC */}

              {gpsDebug.url && (
                <details className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-blue-800">
                    Diagnostic GPS
                  </summary>

                  <div className="border-t border-blue-200 px-4 py-3">
                    <div className="space-y-1.5 text-xs text-blue-700">
                      <p className="break-all">
                        <strong>URL :</strong>{" "}
                        {gpsDebug.url}
                      </p>

                      <p>
                        <strong>
                          Protocole :
                        </strong>{" "}
                        {gpsDebug.protocol}
                      </p>

                      <p>
                        <strong>
                          Contexte sécurisé :
                        </strong>{" "}
                        {gpsDebug.secure
                          ? "Oui"
                          : "Non"}
                      </p>

                      <p>
                        <strong>
                          Géolocalisation :
                        </strong>{" "}
                        {gpsDebug.geolocation
                          ? "Disponible"
                          : "Indisponible"}
                      </p>

                      <p>
                        <strong>
                          Appareil :
                        </strong>{" "}
                        {gpsDebug.device}
                      </p>

                      <p>
                        <strong>
                          Navigateur :
                        </strong>{" "}
                        {gpsDebug.browser}
                      </p>

                      <p>
                        <strong>
                          Permission :
                        </strong>{" "}
                        {gpsDebug.permission}
                      </p>

                      {gpsPrecision !== null && (
                        <p>
                          <strong>
                            Précision obtenue :
                          </strong>{" "}
                          {Math.round(
                            gpsPrecision
                          )}{" "}
                          mètres
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* RÉCAPITULATIF */}

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="flex h-1">
                <div className="flex-1 bg-[#14a800]" />
                <div className="flex-1 bg-[#fcd116]" />
                <div className="flex-1 bg-[#ce1126]" />
              </div>

              <div className="p-5 sm:p-6">
                <h2 className="text-lg font-extrabold text-gray-950">
                  Résumé de la commande
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Produits
                    </span>

                    <span className="font-bold text-gray-900">
                      {total.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </span>
                  </div>

                  {economie > 0 && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Économie
                      </span>

                      <span className="font-bold text-red-600">
                        -
                        {Math.round(
                          economie
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Livraison
                    </span>

                    <span className="font-bold text-gray-900">
                      {!tarifSelectionne
                        ? "À calculer"
                        : tarifLivraison ===
                            0
                          ? "Gratuit"
                          : `${tarifLivraison.toLocaleString(
                              "fr-FR"
                            )} FCFA`}
                    </span>
                  </div>
                </div>

                <div className="my-5 h-px bg-gray-100" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#14a800]">
                      {totalGeneral.toLocaleString(
                        "fr-FR"
                      )}{" "}
                      <span className="text-sm">
                        FCFA
                      </span>
                    </p>
                  </div>
                </div>

                {!zoneLivraison && (
                  <div className="mt-5 rounded-xl bg-yellow-50 p-3">
                    <p className="text-xs leading-5 text-yellow-800">
                      Sélectionnez une zone de
                      livraison pour connaître le
                      montant exact.
                    </p>
                  </div>
                )}

                {(latitude === null ||
                  longitude === null) && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-xs leading-5 text-red-700">
                      La position GPS est nécessaire
                      avant de passer la commande.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    passerCommande
                  }
                  disabled={
                    loading ||
                    localisationLoading ||
                    latitude === null ||
                    longitude === null ||
                    !zoneLivraison ||
                    tarifsLoading
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14a800] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#108f00] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Commande en cours...
                    </>
                  ) : (
                    <>
                      Passer la commande
                      <ChevronRight
                        size={18}
                      />
                    </>
                  )}
                </button>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#14a800]"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      Votre commande est sécurisée
                      et votre position GPS est
                      transmise uniquement pour
                      faciliter la livraison.
                    </p>
                  </div>

                  <div className="mt-3 flex items-start gap-2.5">
                    <Truck
                      size={16}
                      className="mt-0.5 shrink-0 text-[#14a800]"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      Suivi de la livraison disponible
                      après expédition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}