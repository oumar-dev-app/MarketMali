"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  Bike,
  Clock3,
  Crosshair,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Truck,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

interface LivraisonPosition {
  latitude: number;
  longitude: number;
  precision_gps: number | null;
  updated_at: string;
}

interface LivraisonRoute {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

interface LivraisonMapProps {
  livraisonUuid: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  destinationAdresse?: string | null;
}

/* =========================================================
   ICÔNES LEAFLET
========================================================= */
const livreurIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.18);
        animation: livreurPulse 2s infinite;
      "></div>

      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ffffff;
        border: 3px solid #2563eb;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      ">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 17.5
               A2.5 2.5 0 1 0 5 17.49
               M19 17.5
               A2.5 2.5 0 1 0 19 17.49"
            stroke="#2563eb"
            stroke-width="2"
            stroke-linecap="round"
          />

          <path
            d="M7.5 17.5
               L9.5 11
               H15
               L18.5 17.5
               M9.5 11
               L7 8.5
               M15 11
               L17 8
               H19.5
               M11 11
               L13 15
               H18.5"
            stroke="#2563eb"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <style>
      @keyframes livreurPulse {
        0% {
          transform: scale(0.8);
          opacity: 0.8;
        }

        70% {
          transform: scale(1.35);
          opacity: 0;
        }

        100% {
          transform: scale(1.35);
          opacity: 0;
        }
      }
    </style>
  `,
  iconSize: [52, 52],
  iconAnchor: [26, 26],
  popupAnchor: [0, -28],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 9999px;
      background: #111827;
      border: 4px solid #ffffff;
      box-shadow:
        0 4px 12px rgba(15, 23, 42, 0.28),
        0 0 0 3px rgba(17, 24, 39, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
    ">
      •
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34],
});

/* =========================================================
   UTILITAIRES
========================================================= */

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

function hasMovedEnough(
  previous: LivraisonPosition | null,
  current: LivraisonPosition,
  minimumDistanceMeters = 100
): boolean {
  if (!previous) {
    return true;
  }

  const distanceKm = calculateDistance(
    previous.latitude,
    previous.longitude,
    current.latitude,
    current.longitude
  );

  return (
    distanceKm * 1000 >=
    minimumDistanceMeters
  );
}

function formatDistance(
  distance: number
): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}

function formatDuration(
  duration: number
): string {
  return `${Math.max(
    1,
    Math.round(duration / 60)
  )} min`;
}

/* =========================================================
   BOUTON RECENTRAGE
========================================================= */

function RecenterButton({
  position,
}: {
  position: LivraisonPosition | null;
}) {
  const map = useMap();

  if (!position) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        map.flyTo(
          [
            position.latitude,
            position.longitude,
          ],
          Math.max(map.getZoom(), 15),
          {
            duration: 0.8,
          }
        );
      }}
      className="
        absolute
        right-4
        top-4
        z-[1000]
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-200
        bg-white
        text-gray-700
        shadow-lg
        transition
        hover:bg-gray-50
        hover:text-blue-600
        active:scale-95
      "
      title="Recentrer sur le livreur"
      aria-label="Recentrer sur le livreur"
    >
      <Crosshair size={19} />
    </button>
  );
}

/* =========================================================
   MARQUEUR ANIMÉ
========================================================= */

function AnimatedMarker({
  position,
  icon,
}: {
  position: [number, number];
  icon: L.DivIcon;
}) {
  const markerRef =
    useRef<L.Marker | null>(null);

  const previousPosition =
    useRef<[number, number] | null>(null);

  useEffect(() => {
    const marker =
      markerRef.current;

    if (!marker) {
      previousPosition.current =
        position;

      return;
    }

    const previous =
      previousPosition.current;

    if (!previous) {
      previousPosition.current =
        position;

      return;
    }

    const startLat = previous[0];
    const startLng = previous[1];

    const endLat = position[0];
    const endLng = position[1];

    const duration = 1000;
    const startTime = performance.now();

    let animationFrame = 0;

    const animate = (
      currentTime: number
    ) => {
      const elapsed =
        currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const currentLat =
        startLat +
        (endLat - startLat) *
          progress;

      const currentLng =
        startLng +
        (endLng - startLng) *
          progress;

      marker.setLatLng([
        currentLat,
        currentLng,
      ]);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(
            animate
          );
      }
    };

    animationFrame =
      requestAnimationFrame(
        animate
      );

    previousPosition.current =
      position;

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [position]);

  return (
    <Marker
      ref={(marker) => {
        markerRef.current =
          marker;
      }}
      position={position}
      icon={icon}
    >
      <Popup>
        <div className="min-w-[150px]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Bike size={16} />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                Votre livreur
              </p>

              <p className="text-xs text-gray-500">
                Position actuelle
              </p>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

/* =========================================================
   CENTRAGE INITIAL
========================================================= */

function MapUpdater({
  position,
  destinationLatitude,
  destinationLongitude,
}: {
  position: LivraisonPosition | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) {
  const map = useMap();

  const hasCentered =
    useRef(false);

  useEffect(() => {
    if (
      hasCentered.current ||
      !position
    ) {
      return;
    }

    const hasDestination =
      typeof destinationLatitude ===
        "number" &&
      typeof destinationLongitude ===
        "number";

    if (hasDestination) {
      const bounds =
        L.latLngBounds([
          [
            position.latitude,
            position.longitude,
          ],
          [
            destinationLatitude!,
            destinationLongitude!,
          ],
        ]);

      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
        duration: 1,
      });
    } else {
      map.setView(
        [
          position.latitude,
          position.longitude,
        ],
        15,
        {
          animate: true,
        }
      );
    }

    hasCentered.current = true;
  }, [
    position,
    destinationLatitude,
    destinationLongitude,
    map,
  ]);

  return null;
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function LivraisonMap({
  livraisonUuid,
  destinationLatitude = null,
  destinationLongitude = null,
  destinationAdresse = null,
}: LivraisonMapProps) {
  const [position, setPosition] =
    useState<LivraisonPosition | null>(
      null
    );

  const [route, setRoute] =
    useState<LivraisonRoute | null>(
      null
    );

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const lastRoutePosition =
    useRef<LivraisonPosition | null>(
      null
    );

  const hasDestination =
    typeof destinationLatitude ===
      "number" &&
    typeof destinationLongitude ===
      "number";

  const [now, setNow] =
    useState(() => Date.now());

  /* =======================================================
     HORLOGE
  ======================================================= */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     ROUTE
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadRoute() {
      if (
        !position ||
        !hasDestination
      ) {
        setRoute(null);
        lastRoutePosition.current =
          null;
        return;
      }

      if (
        lastRoutePosition.current &&
        !hasMovedEnough(
          lastRoutePosition.current,
          position,
          100
        )
      ) {
        return;
      }

      try {
        setRouteLoading(true);
        setRouteError("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `/api/livraisons/${livraisonUuid}/route`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
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
              "Impossible de calculer le trajet."
          );
        }

        if (!mounted) {
          return;
        }

        setRoute(
          data.route ?? null
        );

        lastRoutePosition.current =
          position;
      } catch (error) {
        console.error(
          "Erreur récupération trajet routier :",
          error
        );

        if (mounted) {
          setRouteError(
            "Impossible de calculer le trajet routier."
          );

          setRoute(null);
        }
      } finally {
        if (mounted) {
          setRouteLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      mounted = false;
    };
  }, [
    livraisonUuid,
    position,
    hasDestination,
  ]);

  /* =======================================================
     POSITION GPS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadPosition() {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `/api/livraisons/${livraisonUuid}/position`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
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
              "Impossible de récupérer la position du livreur."
          );
        }

        if (!mounted) {
          return;
        }

        setPosition(
          data.position ?? null
        );

        setError("");
      } catch (err) {
        console.error(
          "Erreur récupération position livraison :",
          err
        );

        if (mounted) {
          setError(
            "Impossible de récupérer la position du livreur."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosition();

    const interval =
      window.setInterval(
        loadPosition,
        10000
      );

    return () => {
      mounted = false;
      window.clearInterval(
        interval
      );
    };
  }, [livraisonUuid]);

  /* =======================================================
     ÉTAT
  ======================================================= */

  const defaultCenter: [
    number,
    number
  ] = position
    ? [
        position.latitude,
        position.longitude,
      ]
    : hasDestination
      ? [
          destinationLatitude!,
          destinationLongitude!,
        ]
      : [12.6392, -8.0029];

  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex h-[420px] items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <RefreshCw
                size={21}
                className="animate-spin"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-800">
              Localisation du livreur
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Connexion au suivi en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const positionAge =
    position
      ? Math.max(
          0,
          Math.floor(
            (now -
              new Date(
                position.updated_at
              ).getTime()) /
              1000
          )
        )
      : null;

  const isLive =
    positionAge !== null &&
    positionAge <= 30;

  const isRecent =
    positionAge !== null &&
    positionAge <= 120;

  const statusLabel = isLive
    ? "En direct"
    : isRecent
      ? "Position récente"
      : "Position indisponible";

  const statusClasses = isLive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isRecent
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Navigation
                size={20}
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-950 sm:text-base">
                Suivi de livraison
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Suivez votre commande en temps réel
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses}`}
          >
            <span className="relative flex h-2 w-2">
              {isLive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}

              <span
                className={`relative h-2 w-2 rounded-full ${
                  isLive
                    ? "bg-emerald-500"
                    : isRecent
                      ? "bg-amber-500"
                      : "bg-gray-400"
                }`}
              />
            </span>

            {statusLabel}
          </div>
        </div>

        {/* Informations principales */}

        {route && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <Route
                  size={15}
                  className="text-blue-600"
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Distance
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-gray-950">
                {formatDistance(
                  route.distance
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <Clock3
                  size={15}
                  className="text-blue-600"
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Temps estimé
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-gray-950">
                {formatDuration(
                  route.duration
                )}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-gray-50 px-3 py-3 sm:col-span-1">
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={15}
                  className="text-blue-600"
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Actualisation
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-gray-950">
                {position &&
                positionAge !== null
                  ? positionAge <
                    60
                    ? `Il y a ${positionAge}s`
                    : `Il y a ${Math.floor(
                        positionAge /
                          60
                      )} min`
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          ERREUR
      ================================================= */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          DESTINATION
      ================================================= */}

      {hasDestination && (
        <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm">
              <MapPin size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Destination
              </p>

              <p className="truncate text-sm font-semibold text-gray-900">
                {destinationAdresse ||
                  "Adresse de livraison"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          POSITION INDISPONIBLE
      ================================================= */}

      {!position && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 sm:px-5">
          <div className="flex items-start gap-3">
            <Truck
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-bold text-amber-900">
                Position momentanément indisponible
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                La carte sera automatiquement mise
                à jour dès que le livreur transmettra
                une nouvelle position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CARTE
      ================================================= */}

      <div className="relative h-[360px] w-full sm:h-[440px]">
        <MapContainer
          center={defaultCenter}
          zoom={
            position
              ? 15
              : 13
          }
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater
            position={position}
            destinationLatitude={
              destinationLatitude
            }
            destinationLongitude={
              destinationLongitude
            }
          />

          <RecenterButton
            position={position}
          />

          {/* Route */}

          {route &&
            route.coordinates.length >
              0 && (
              <>
                <Polyline
                  positions={
                    route.coordinates
                  }
                  pathOptions={{
                    color: "#ffffff",
                    weight: 10,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                <Polyline
                  positions={
                    route.coordinates
                  }
                  pathOptions={{
                    color: "#2563eb",
                    weight: 6,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </>
            )}

          {/* Livreur */}

          {position && (
            <AnimatedMarker
              position={[
                position.latitude,
                position.longitude,
              ]}
              icon={livreurIcon}
            />
          )}

          {/* Destination */}

          {hasDestination && (
            <Marker
              position={[
                destinationLatitude!,
                destinationLongitude!,
              ]}
              icon={destinationIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                      <MapPin
                        size={16}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Destination
                      </p>

                      {destinationAdresse && (
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {destinationAdresse}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Badge flottant */}

        {isLive && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-[1000]">
            <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-bold text-gray-800 shadow-lg backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              Livreur en mouvement
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="border-t border-gray-100 bg-white">

        <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">

          {/* Livreur */}

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bike size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800">
                Livreur
              </p>

              <p className="text-[11px] text-gray-500">
                Position actuelle
              </p>
            </div>
          </div>

          {hasDestination && (
            <>
              <div className="hidden h-8 w-px bg-gray-200 sm:block" />

              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
                  <MapPin size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800">
                    Destination
                  </p>

                  <p className="max-w-[220px] truncate text-[11px] text-gray-500">
                    {destinationAdresse ||
                      "Adresse de livraison"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Route en cours de calcul */}

        {(routeLoading ||
          routeError) && (
          <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
            {routeLoading && (
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                <RefreshCw
                  size={14}
                  className="animate-spin"
                />

                Actualisation du trajet...
              </div>
            )}

            {routeError &&
              !routeLoading && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50">
                    !
                  </span>

                  {routeError}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}