"use client";

import {
  useEffect,
} from "react";

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
  livreurPosition: {
    latitude: number;
    longitude: number;
    precision_gps: number | null;
    updated_at: string;
  } | null;

  destination: {
    latitude: number;
    longitude: number;
  } | null;
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
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

export default function LivraisonMap({
  livreurPosition,
  destination,
}: LivraisonMapProps) {

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
        : [12.6392, -8.0029] as [number, number];

  return (
    <div className="relative h-105 w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={initialPosition}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
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
              <strong>
                Adresse de livraison
              </strong>
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}

