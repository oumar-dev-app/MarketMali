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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

const GPS_TARGET_ACCURACY = 50;
const GPS_MAX_ACCEPTED_ACCURACY = 300;
const GPS_TIMEOUT = 30000;

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
   * Identifiant de la surveillance GPS actuelle.
   */
  const gpsWatchId =
    useRef<number | null>(null);

  /**
   * Timer utilisé pour arrêter la recherche GPS.
   */
  const gpsTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

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

    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

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
   * VÉRIFICATION PERMISSION GPS
   * =========================================================
   */

  const verifierPermissionGPS =
    useCallback(async (): Promise<PermissionState> => {
      if (typeof window === "undefined") {
        return "unknown";
      }

      if (
        !navigator.permissions ||
        typeof navigator.permissions.query !==
          "function"
      ) {
        setGpsPermission("unknown");

        return "unknown";
      }

      try {
        const permission =
          await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });

        const state =
          permission.state as PermissionState;

        setGpsPermission(state);

        return state;
      } catch (error) {
        console.warn(
          "Impossible de vérifier directement la permission GPS :",
          error
        );

        setGpsPermission("unknown");

        return "unknown";
      }
    }, []);

  /**
   * =========================================================
   * NETTOYAGE GPS
   * =========================================================
   */

  const nettoyerGps =
    useCallback(() => {
      if (
        gpsWatchId.current !== null &&
        typeof navigator !== "undefined" &&
        "geolocation" in navigator
      ) {
        navigator.geolocation.clearWatch(
          gpsWatchId.current
        );

        gpsWatchId.current = null;
      }

      if (gpsTimeoutRef.current !== null) {
        clearTimeout(
          gpsTimeoutRef.current
        );

        gpsTimeoutRef.current = null;
      }
    }, []);

  /**
   * =========================================================
   * PRIX PROMOTIONNELS
   * =========================================================
   */

  function getPrixFinal(
    item: (typeof items)[number]
  ): number {
    const prix = Number(item.prix);

    if (!Number.isFinite(prix)) {
      return 0;
    }

    if (
      item.promotion_type === "percentage" &&
      item.promotion_reduction_pourcentage !==
        null &&
      item.promotion_reduction_pourcentage !==
        undefined
    ) {
      const reduction = Number(
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
      item.promotion_prix_promotionnel !==
        null &&
      item.promotion_prix_promotionnel !==
        undefined
    ) {
      const prixPromotionnel = Number(
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

  const totalNormal = items.reduce(
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

  const economie = Math.max(
    0,
    totalNormal - total
  );

  /**
   * =========================================================
   * GPS HAUTE PRÉCISION
   * =========================================================
   */

  const recupererPosition =
    useCallback(async () => {
      if (typeof window === "undefined") {
        return;
      }

      const appareil =
        detecterAppareil();

      const secure =
        window.isSecureContext;

      const geolocation =
        "geolocation" in navigator;

      /**
       * Arrêter une éventuelle recherche
       * précédente.
       */
      nettoyerGps();

      /**
       * Diagnostic.
       */
      setGpsDebug((previous) => ({
        ...previous,
        url: window.location.href,
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
        "========== GPS CLIENT =========="
      );

      console.log(
        "URL :",
        window.location.href
      );

      console.log(
        "Protocol :",
        window.location.protocol
      );

      console.log(
        "Contexte sécurisé :",
        secure
      );

      console.log(
        "Géolocalisation disponible :",
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
        "Permission connue :",
        gpsPermission
      );

      console.log(
        "Précision recherchée :",
        GPS_TARGET_ACCURACY,
        "m"
      );

      console.log(
        "Précision maximale acceptée :",
        GPS_MAX_ACCEPTED_ACCURACY,
        "m"
      );

      console.log(
        "================================"
      );

      /**
       * HTTPS obligatoire.
       */
      if (!secure) {
        setLocalisationLoading(false);
        setLocalisationErrorCode(null);

        setLocalisationError(
          "La localisation GPS nécessite une connexion sécurisée (HTTPS)."
        );

        return;
      }

      /**
       * API GPS absente.
       */
      if (!geolocation) {
        setLocalisationLoading(false);
        setLocalisationErrorCode(null);

        setLocalisationError(
          "La géolocalisation n'est pas disponible sur ce navigateur."
        );

        return;
      }

      /**
       * État initial.
       */
      setLocalisationLoading(true);
      setLocalisationError("");
      setLocalisationErrorCode(null);

      /**
       * Vérification permission.
       */
      const permission =
        await verifierPermissionGPS();

      setGpsDebug((previous) => ({
        ...previous,
        permission,
      }));

      console.log(
        "Permission GPS :",
        permission
      );

      /**
       * Permission refusée.
       */
      if (
        permission === "denied"
      ) {
        setLocalisationLoading(false);
        setLocalisationErrorCode(1);

        if (
          appareil.device ===
          "iPhone / iPad"
        ) {
          setLocalisationError(
            "L'accès à votre position est refusé. Sur iPhone, ouvrez Réglages → Confidentialité et sécurité → Service de localisation → Safari, autorisez la localisation et activez « Localisation précise ». Revenez ensuite ici et appuyez sur Actualiser."
          );
        } else if (
          appareil.device ===
          "Android"
        ) {
          setLocalisationError(
            "L'accès à votre position est refusé. Autorisez la localisation pour votre navigateur dans les paramètres Android, puis autorisez également la localisation pour ce site."
          );
        } else {
          setLocalisationError(
            "L'accès à votre position est refusé. Autorisez la localisation pour ce site dans les paramètres de votre navigateur."
          );
        }

        return;
      }

      /**
       * =====================================================
       * RECHERCHE GPS
       * =====================================================
       *
       * On utilise watchPosition() afin de permettre au
       * téléphone d'améliorer progressivement la précision.
       */

      let meilleurePosition:
        GeolocationPosition | null =
        null;

      let terminee = false;

      const terminerAvecErreur = (
        code: number,
        message: string
      ) => {
        if (terminee) {
          return;
        }

        terminee = true;

        nettoyerGps();

        setLocalisationLoading(false);
        setLocalisationErrorCode(code);
        setLocalisationError(message);
      };

      const validerPosition = (
        position: GeolocationPosition
      ) => {
        if (terminee) {
          return;
        }

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const accuracy =
          position.coords.accuracy;

        console.log(
          "========== NOUVELLE POSITION =========="
        );

        console.log(
          "Latitude :",
          lat
        );

        console.log(
          "Longitude :",
          lng
        );

        console.log(
          "Précision :",
          accuracy,
          "m"
        );

        console.log(
          "========================================"
        );

        /**
         * Position invalide.
         */
        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          !Number.isFinite(accuracy)
        ) {
          return;
        }

        /**
         * On conserve uniquement la meilleure
         * précision obtenue.
         */
        if (
          meilleurePosition === null ||
          accuracy <
            meilleurePosition.coords.accuracy
        ) {
          meilleurePosition =
            position;
        }

        const meilleurePrecision =
          meilleurePosition.coords.accuracy;

        console.log(
          "Meilleure précision actuelle :",
          meilleurePrecision,
          "m"
        );

        /**
         * Position suffisamment précise.
         *
         * Dès que nous sommes à 50 m ou moins,
         * nous arrêtons la surveillance.
         */
        if (
          meilleurePrecision <=
          GPS_TARGET_ACCURACY
        ) {
          terminee = true;

          nettoyerGps();

          const meilleureLat =
            meilleurePosition.coords
              .latitude;

          const meilleureLng =
            meilleurePosition.coords
              .longitude;

          const meilleureAccuracy =
            meilleurePosition.coords
              .accuracy;

          setLatitude(
            meilleureLat
          );

          setLongitude(
            meilleureLng
          );

          setGpsPrecision(
            meilleureAccuracy
          );

          setGpsPermission(
            "granted"
          );

          setGpsDebug((previous) => ({
            ...previous,
            permission: "granted",
          }));

          setLocalisationError("");
          setLocalisationErrorCode(
            null
          );
          setLocalisationLoading(
            false
          );

          console.log(
            "GPS VALIDÉ — précision :",
            meilleureAccuracy,
            "m"
          );

          return;
        }
      };

      /**
       * Démarrage surveillance.
       */
      try {
        gpsWatchId.current =
          navigator.geolocation.watchPosition(
            (position) => {
              validerPosition(
                position
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
               * Permission refusée.
               */
              if (
                error.code === 1
              ) {
                terminerAvecErreur(
                  1,
                  appareil.device ===
                    "iPhone / iPad"
                    ? "L'accès à votre position a été refusé. Sur iPhone, vérifiez Réglages → Confidentialité et sécurité → Service de localisation → Safari et activez « Localisation précise »."
                    : appareil.device ===
                        "Android"
                      ? "L'accès à votre position a été refusé. Autorisez la localisation pour votre navigateur et pour ce site dans les paramètres Android."
                      : "L'accès à votre position a été refusé par le navigateur. Autorisez la localisation pour ce site."
                );

                setGpsPermission(
                  "denied"
                );

                return;
              }

              /**
               * Pour les erreurs 2 et 3, on ne coupe
               * pas immédiatement la recherche.
               *
               * Le téléphone peut encore réussir à
               * déterminer sa position.
               */
              if (
                error.code === 2
              ) {
                console.warn(
                  "Position momentanément indisponible. Nouvelle tentative automatique..."
                );

                return;
              }

              if (
                error.code === 3
              ) {
                console.warn(
                  "GPS trop lent. Nous continuons la recherche..."
                );

                return;
              }

              terminerAvecErreur(
                error.code,
                "Impossible de récupérer votre position GPS. Vérifiez les paramètres de localisation de votre téléphone puis réessayez."
              );
            },

            {
              /**
               * IMPORTANT :
               * demande explicitement la meilleure
               * précision disponible.
               */
              enableHighAccuracy:
                true,

              /**
               * 30 secondes maximum par tentative.
               */
              timeout:
                GPS_TIMEOUT,

              /**
               * Aucune ancienne position.
               *
               * Nous voulons une position fraîche.
               */
              maximumAge: 0,
            }
          );
      } catch (error) {
        console.error(
          "Erreur démarrage GPS :",
          error
        );

        terminerAvecErreur(
          2,
          "Impossible de démarrer la localisation GPS. Vérifiez que la localisation est activée sur votre téléphone."
        );

        return;
      }

      /**
       * =====================================================
       * FIN DE RECHERCHE APRÈS 30 SECONDES
       * =====================================================
       */

      gpsTimeoutRef.current =
        setTimeout(() => {
          if (terminee) {
            return;
          }

          terminee = true;

          nettoyerGps();

          /**
           * Nous avons obtenu au moins une position.
           */
          if (
            meilleurePosition !== null
          ) {
            const accuracy =
              meilleurePosition.coords
                .accuracy;

            const lat =
              meilleurePosition.coords
                .latitude;

            const lng =
              meilleurePosition.coords
                .longitude;

            console.log(
              "Fin du délai GPS."
            );

            console.log(
              "Meilleure précision :",
              accuracy,
              "m"
            );

            /**
             * Position suffisamment correcte.
             */
            if (
              accuracy <=
              GPS_MAX_ACCEPTED_ACCURACY
            ) {
              setLatitude(lat);
              setLongitude(lng);
              setGpsPrecision(
                accuracy
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
                ""
              );

              setLocalisationErrorCode(
                null
              );

              setLocalisationLoading(
                false
              );

              return;
            }

            /**
             * Position beaucoup trop imprécise.
             */
            terminerAvecErreur(
              2,
              `La position obtenue est trop imprécise (${Math.round(
                accuracy
              )} m). Activez la localisation précise sur votre téléphone, placez-vous dans un endroit où le GPS capte mieux, puis appuyez sur Actualiser.`
            );

            return;
          }

          /**
           * Aucune position obtenue.
           */
          terminerAvecErreur(
            3,
            "La récupération de votre position a pris trop de temps. Vérifiez que le GPS/localisation est activé, puis appuyez sur Actualiser."
          );
        }, GPS_TIMEOUT);
    },
    [
      detecterAppareil,
      gpsPermission,
      nettoyerGps,
      verifierPermissionGPS,
    ]);

  /**
   * =========================================================
   * RÉCUPÉRATION AUTOMATIQUE
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

    void recupererPosition();

    return () => {
      nettoyerGps();
    };
  }, [
    recupererPosition,
    nettoyerGps,
  ]);

  /**
   * Nettoyage lorsque la page est démontée.
   */
  useEffect(() => {
    return () => {
      nettoyerGps();
    };
  }, [nettoyerGps]);

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
          setTarifsLoading(
            false
          );
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

              produits: items.map(
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
              Découvrez nos produits et ajoutez
              vos articles préférés à votre panier
              pour commencer vos achats.
            </p>

            <Link
              href="/produits"
              className="
                mt-7
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#14a800]
                px-6
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#108f00]
                hover:shadow-md
              "
            >
              <ShoppingBag size={17} />
              Découvrir les produits
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /**
   * =========================================================
   * TARIF SÉLECTIONNÉ
   * =========================================================
   */

  const tarifSelectionne =
    tarifsLivraison.find(
      (tarif) =>
        tarif.zone ===
        zoneLivraison
    );

  /**
   * =========================================================
   * TOTAL GÉNÉRAL
   * =========================================================
   */

  const totalGeneral =
    total + tarifLivraison;

  /**
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

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
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-gray-700
                transition
                hover:border-[#14a800]/30
                hover:bg-[#14a800]/5
                hover:text-[#14a800]
              "
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

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              ARTICLES
          ================================================== */}

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
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-red-500
                  transition
                  hover:bg-red-50
                  hover:text-red-600
                "
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
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    <Link
                      href={`/produits/${item.uuid}`}
                      className="
                        relative
                        h-24
                        w-24
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-gray-50
                        sm:h-28
                        sm:w-28
                      "
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
                            aria-label="Diminuer la quantité"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              text-gray-500
                              transition
                              hover:bg-gray-50
                              hover:text-[#14a800]
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
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
                            aria-label="Augmenter la quantité"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              text-gray-500
                              transition
                              hover:bg-gray-50
                              hover:text-[#14a800]
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
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
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            px-2
                            py-1.5
                            text-xs
                            font-semibold
                            text-red-500
                            transition
                            hover:bg-red-50
                          "
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

            {/* =================================================
                LIVRAISON
            ================================================== */}

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
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-gray-700
                      outline-none
                      transition
                      focus:border-[#14a800]
                      focus:ring-4
                      focus:ring-[#14a800]/10
                    "
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

            {/* =================================================
                LOCALISATION
            ================================================== */}

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
                      Votre position GPS permettra de
                      faciliter la livraison.
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
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-gray-700
                    transition
                    hover:border-[#14a800]/30
                    hover:bg-[#14a800]/5
                    hover:text-[#14a800]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {localisationLoading ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={15}
                    />
                  )}

                  {localisationLoading
                    ? "Recherche GPS..."
                    : "Actualiser"}
                </button>
              </div>

              {/* =================================================
                  ADRESSE
              ================================================== */}

              <div className="mt-5">
                <label
                  htmlFor="adresse"
                  className="mb-2 block text-xs font-bold text-gray-700"
                >
                  Adresse / indication de
                  livraison
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
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-[#14a800]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#14a800]/10
                  "
                />
              </div>

              {/* =================================================
                  POSITION
              ================================================== */}

              {latitude !== null &&
              longitude !== null ? (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <span className="text-sm font-bold text-green-800">
                      Position récupérée
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

                  <div className="mt-3 rounded-lg bg-white/70 px-3 py-2">
                    <p className="text-[11px] font-semibold text-green-700">
                      {gpsPrecision !==
                        null &&
                      gpsPrecision <= 20
                        ? "Excellente précision GPS"
                        : gpsPrecision !==
                              null &&
                            gpsPrecision <= 50
                          ? "Très bonne précision GPS"
                          : gpsPrecision !==
                                null &&
                              gpsPrecision <=
                                100
                            ? "Bonne précision GPS"
                            : "Précision GPS acceptable"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-yellow-600"
                  />

                  <div>
                    <p className="text-xs leading-5 text-yellow-800 sm:text-sm">
                      {localisationLoading
                        ? "Recherche de votre position GPS précise en cours..."
                        : "Votre position n'a pas encore été récupérée. Autorisez la géolocalisation puis appuyez sur « Actualiser »."}
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
              )}

              {/* =================================================
                  ERREUR GPS
              ================================================== */}

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
                              "Position indisponible ou trop imprécise"}

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
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-2
                          rounded-lg
                          bg-white
                          px-3
                          py-2
                          text-xs
                          font-bold
                          text-red-700
                          shadow-sm
                          ring-1
                          ring-red-200
                          transition
                          hover:bg-red-50
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
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

              {/* =================================================
                  DIAGNOSTIC GPS
              ================================================== */}

              {gpsDebug.url && (
                <details className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-blue-50">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-blue-800">
                    Diagnostic GPS
                  </summary>

                  <div className="border-t border-blue-200 px-4 py-3">
                    <div className="space-y-1.5 text-xs text-blue-700">
                      <p className="break-all">
                        <strong>
                          URL :
                        </strong>{" "}
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

                      <p>
                        <strong>
                          Précision cible :
                        </strong>{" "}
                        ≤{" "}
                        {
                          GPS_TARGET_ACCURACY
                        }{" "}
                        m
                      </p>

                      <p>
                        <strong>
                          Précision maximale :
                        </strong>{" "}
                        {
                          GPS_MAX_ACCEPTED_ACCURACY
                        }{" "}
                        m
                      </p>

                      {gpsPrecision !==
                        null && (
                        <p>
                          <strong>
                            Dernière précision :
                          </strong>{" "}
                          {Math.round(
                            gpsPrecision
                          )}{" "}
                          m
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* =================================================
              RÉCAPITULATIF
          ================================================== */}

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
                  className="
                    mt-6
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#14a800]
                    px-5
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#108f00]
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
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