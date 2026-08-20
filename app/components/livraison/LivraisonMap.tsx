"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface LivraisonPosition {
  latitude: number;
  longitude: number;
  precision_gps: number | null;
  updated_at: string;
}

interface LivraisonMapProps {
  livraisonUuid: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  destinationAdresse?: string | null;
}

const livreurIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #2563eb;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 17px;
    ">
      📍
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function MapUpdater({
  position,
}: {
  position: LivraisonPosition | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(
      [position.latitude, position.longitude],
      Math.max(map.getZoom(), 14),
      {
        animate: true,
      }
    );
  }, [position, map]);

  return null;
}

export default function LivraisonMap({
  livraisonUuid,
  destinationLatitude = null,
  destinationLongitude = null,
  destinationAdresse = null,
}: LivraisonMapProps) {
  const [position, setPosition] =
    useState<LivraisonPosition | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPosition() {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `/api/livraisons/${livraisonUuid}/position`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Impossible de récupérer la position du livreur."
          );
        }

        if (!mounted) {
          return;
        }

        setPosition(data.position ?? null);
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
      window.clearInterval(interval);
    };
  }, [livraisonUuid]);

  const hasDestination =
    typeof destinationLatitude === "number" &&
    typeof destinationLongitude === "number";

  const defaultCenter: [number, number] =
    position
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
      <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Chargement de la position...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!position && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Position du livreur indisponible
          </p>

          <p className="mt-1 text-xs text-amber-700">
            La carte sera mise à jour automatiquement
            lorsque le livreur transmettra sa position.
          </p>
        </div>
      )}

      <div className="h-[400px] w-full">
        <MapContainer
          center={defaultCenter}
          zoom={position ? 15 : 13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater position={position} />

          {position && (
            <Marker
              position={[
                position.latitude,
                position.longitude,
              ]}
              icon={livreurIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Livreur
                  </p>

                  <p className="mt-1 text-gray-600">
                    Position actuelle
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Mise à jour :{" "}
                    {new Date(
                      position.updated_at
                    ).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {hasDestination && (
            <Marker
              position={[
                destinationLatitude!,
                destinationLongitude!,
              ]}
              icon={destinationIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    Adresse de livraison
                  </p>

                  {destinationAdresse && (
                    <p className="mt-1 text-gray-600">
                      {destinationAdresse}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow" />
          <span>Position du livreur</span>
        </div>

        {hasDestination && (
          <div className="flex items-center gap-2">
            <span className="text-base">
              📍
            </span>
            <span>Adresse de livraison</span>
          </div>
        )}

        {position?.precision_gps !== null &&
          position?.precision_gps !== undefined && (
            <span className="ml-auto">
              Précision GPS :{" "}
              {Math.round(
                position.precision_gps
              )}
              m
            </span>
          )}
      </div>
    </div>
  );
}

