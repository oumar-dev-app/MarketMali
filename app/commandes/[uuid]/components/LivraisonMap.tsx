"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface LivraisonMapProps {
  livraisonUuid: string;

  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAdresse: string | null;
}

interface LivraisonPosition {
  latitude: number;
  longitude: number;
  precision_gps: number | null;
  updated_at: string;
}

const livreurIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #2563eb;
        border: 4px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 21px;
      "
    >
      🚚
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #dc2626;
        border: 4px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 19px;
      "
    >
      📍
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      Math.max(map.getZoom(), 14),
      {
        animate: true,
      }
    );
  }, [latitude, longitude, map]);

  return null;
}

export default function LivraisonMap({
  livraisonUuid,
  destinationLatitude,
  destinationLongitude,
  destinationAdresse,
}: LivraisonMapProps) {
  const [livreurPosition, setLivreurPosition] =
    useState<LivraisonPosition | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadPosition() {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Votre session a expiré."
        );
        return;
      }

      const response = await fetch(
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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            "Impossible de récupérer la position du livreur."
        );
      }

      setLivreurPosition(
        data.position ?? null
      );

      setError(null);
    } catch (err) {
      console.error(
        "Erreur récupération position livreur :",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer la position du livreur."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosition();

    /*
     * Actualiser régulièrement la position.
     * Le livreur envoie sa position depuis son téléphone,
     * le client la récupère ici.
     */
    const interval =
      window.setInterval(
        loadPosition,
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [livraisonUuid]);

  const destination =
    destinationLatitude !== null &&
    destinationLongitude !== null
      ? {
          latitude:
            destinationLatitude,
          longitude:
            destinationLongitude,
        }
      : null;

  const initialPosition =
    livreurPosition
      ? [
          livreurPosition.latitude,
          livreurPosition.longitude,
        ] as [number, number]
      : destination
        ? [
            destination.latitude,
            destination.longitude,
          ] as [number, number]
        : [12.6392, -8.0029] as [
            number,
            number
          ];

  return (
    <div className="relative overflow-hidden rounded-2xl">

      <div className="relative h-105 w-full">

        <MapContainer
          center={initialPosition}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {livreurPosition && (
            <>
              <Marker
                position={[
                  livreurPosition.latitude,
                  livreurPosition.longitude,
                ]}
                icon={livreurIcon}
              >
                <Popup>

                  <div className="text-sm">

                    <strong>
                      Votre livreur
                    </strong>

                    <div className="mt-1 text-gray-600">
                      Position actuelle
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Mise à jour :{" "}
                      {new Date(
                        livreurPosition.updated_at
                      ).toLocaleTimeString(
                        "fr-FR"
                      )}
                    </div>

                    {livreurPosition.precision_gps !==
                      null && (
                      <div className="mt-1 text-xs text-gray-500">
                        Précision :{" "}
                        {Math.round(
                          livreurPosition.precision_gps
                        )}{" "}
                        m
                      </div>
                    )}

                  </div>

                </Popup>
              </Marker>

              <RecenterMap
                latitude={
                  livreurPosition.latitude
                }
                longitude={
                  livreurPosition.longitude
                }
              />
            </>
          )}

          {destination && (
            <Marker
              position={[
                destination.latitude,
                destination.longitude,
              ]}
              icon={destinationIcon}
            >
              <Popup>

                <div className="text-sm">

                  <strong>
                    Adresse de livraison
                  </strong>

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

        {/* Statut de connexion GPS */}
        <div className="absolute left-3 top-3 z-1000">

          {loading ? (

            <div className="rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-gray-600 shadow">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-gray-400" />
              Recherche du livreur...
            </div>

          ) : livreurPosition ? (

            <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-emerald-700 shadow">

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              Position en direct

            </div>

          ) : (

            <div className="rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-orange-700 shadow">
              🚚 Position du livreur indisponible
            </div>

          )}

        </div>

      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !livreurPosition &&
        !error && (
          <div className="border-t border-yellow-100 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
            Le livreur n'a pas encore transmis
            sa position GPS. La carte sera
            automatiquement actualisée.
          </div>
        )}

    </div>
  );
}
