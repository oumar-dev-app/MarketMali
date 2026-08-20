"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TarifLivraison {
    id: number;
    boutique_id: number;
    zone: string;
    frais: number;
}

export default function PagePanier() {

    const [tarifsLivraison, setTarifsLivraison] =
        useState<TarifLivraison[]>([]);

    const [zoneLivraison, setZoneLivraison] =
        useState("");

    const [tarifLivraison, setTarifLivraison] =
        useState(0);

    const [tarifsLoading, setTarifsLoading] =
        useState(false);

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [localisationLoading, setLocalisationLoading] =
        useState(false);

    const [localisationError, setLocalisationError] =
        useState("");

    const [latitude, setLatitude] =
        useState<number | null>(null);

    const [longitude, setLongitude] =
        useState<number | null>(null);

    const [gpsPrecision, setGpsPrecision] =
        useState<number | null>(null);

    const [adresseLivraison, setAdresseLivraison] =
        useState("");

    const { user, token } = useAuth();

    const {
        items,
        total,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    /**
     * Récupération de la position GPS
     */
    const recupererPosition = () => {
        if (!navigator.geolocation) {
            setLocalisationError(
                "La géolocalisation n'est pas supportée par votre navigateur."
            );
            return;
        }

        setLocalisationLoading(true);
        setLocalisationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const precision = position.coords.accuracy;

                setLatitude(lat);
                setLongitude(lng);
                setGpsPrecision(precision);

                setLocalisationLoading(false);

                console.log("POSITION GPS :", {
                    latitude: lat,
                    longitude: lng,
                    precision,
                });
            },

            (error) => {
                console.error(
                    "Erreur géolocalisation :",
                    error
                );

                let message =
                    "Impossible de récupérer votre position.";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message =
                            "Vous avez refusé l'accès à votre position.";
                        break;

                    case error.POSITION_UNAVAILABLE:
                        message =
                            "Votre position est actuellement indisponible.";
                        break;

                    case error.TIMEOUT:
                        message =
                            "La récupération de votre position a pris trop de temps.";
                        break;
                }

                setLocalisationError(message);
                setLocalisationLoading(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    /**
     * Première récupération automatique
     */
    useEffect(() => {
        recupererPosition();
    }, []);

    /**
     * Création de la commande
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
                "Veuillez autoriser la localisation avant de passer la commande."
            );
            return;
        }

        setLoading(true);

        try {
            const boutique_id =
                items[0].boutique_id;

            const response = await fetch(
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

            if (data.success) {
                clearCart();
                router.push("/commandes");
            } else {
                alert(
                    data.message ||
                    "Impossible de créer la commande."
                );
            }

        } catch (error) {
            console.error(error);

            alert(
                "Erreur serveur."
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        if (items.length === 0) {
            setTarifsLivraison([]);
            setZoneLivraison("");
            setTarifLivraison(0);
            return;
        }

        const boutique_id =
            items[0].boutique_id;

        async function chargerTarifs() {

            setTarifsLoading(true);

            try {

                const response =
                    await fetch(
                        `/api/boutiques/id/${boutique_id}/tarifs-livraison`
                    );

                const data =
                    await response.json();

                if (!data.success) {
                    throw new Error(
                        data.message ||
                        "Impossible de récupérer les tarifs."
                    );
                }

                setTarifsLivraison(
                    data.data
                );

            } catch (error) {

                console.error(
                    "Erreur tarifs livraison :",
                    error
                );

                setTarifsLivraison([]);

            } finally {

                setTarifsLoading(false);

            }
        }

        chargerTarifs();

    }, [items]);


    useEffect(() => {

        const tarif =
            tarifsLivraison.find(
                (item) =>
                    item.zone === zoneLivraison
            );

        setTarifLivraison(
            tarif
                ? Number(tarif.frais)
                : 0
        );

    }, [
        zoneLivraison,
        tarifsLivraison
    ]);

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10">

            <div className="mx-auto max-w-5xl">

                <h1 className="mb-8 text-3xl font-bold">
                    Mon panier ({items.length})
                </h1>

                {items.length === 0 ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            Votre panier est vide.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {items.map((item) => (

                            <div
                                key={item.uuid}
                                className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm"
                            >

                                <div className="flex items-center gap-5">

                                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">

                                        {item.image ? (

                                            <img
                                                src={item.image}
                                                alt={item.nom}
                                                className="h-full w-full rounded-lg object-cover"
                                            />

                                        ) : (

                                            <span className="text-xs text-gray-400">
                                                Pas d'image
                                            </span>

                                        )}

                                    </div>

                                    <div>

                                        <h2 className="font-semibold">
                                            {item.nom}
                                        </h2>

                                        <p className="font-bold text-blue-600">
                                            {item.prix.toLocaleString(
                                                "fr-FR"
                                            )}{" "}
                                            FCFA
                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center gap-3">

                                    <button
                                        onClick={() =>
                                            decreaseQuantity(
                                                item.uuid
                                            )
                                        }
                                        className="rounded bg-gray-200 px-3 py-1"
                                    >
                                        -
                                    </button>

                                    <span className="font-semibold">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            increaseQuantity(
                                                item.uuid
                                            )
                                        }
                                        className="rounded bg-gray-200 px-3 py-1"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() =>
                                            removeFromCart(
                                                item.uuid
                                            )
                                        }
                                        className="ml-3 text-red-500"
                                    >
                                        Supprimer
                                    </button>

                                </div>

                            </div>

                        ))}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <h2 className="mb-2 text-lg font-bold">
                                Zone de livraison
                            </h2>

                            <p className="mb-4 text-sm text-gray-500">
                                Sélectionnez votre zone pour calculer les frais de livraison.
                            </p>

                            {tarifsLoading ? (

                                <p className="text-sm text-gray-500">
                                    Chargement des zones de livraison...
                                </p>

                            ) : tarifsLivraison.length === 0 ? (

                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="text-sm text-yellow-800">
                                        Aucune zone de livraison n'est disponible pour cette boutique.
                                    </p>
                                </div>

                            ) : (

                                <select
                                    value={zoneLivraison}
                                    onChange={(e) =>
                                        setZoneLivraison(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                        {/* LOCALISATION */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <div className="mb-5 flex items-center justify-between">

                                <div>
                                    <h2 className="text-lg font-bold">
                                        📍 Localisation de livraison
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Votre position permettra au vendeur
                                        de faciliter la livraison.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        recupererPosition
                                    }
                                    disabled={
                                        localisationLoading
                                    }
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {localisationLoading
                                        ? "🔄 Localisation..."
                                        : "📍 Actualiser ma position"}
                                </button>

                            </div>

                            {/* Adresse complémentaire */}

                            <div className="mb-5">

                                <label
                                    htmlFor="adresse"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Adresse / indication de livraison
                                </label>

                                <textarea
                                    id="adresse"
                                    value={
                                        adresseLivraison
                                    }
                                    onChange={(e) =>
                                        setAdresseLivraison(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ex : Hamdallaye ACI 2000, près de..., porte..."
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                            {/* Position récupérée */}

                            {latitude !== null &&
                                longitude !== null ? (

                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">

                                    <div className="mb-2 flex items-center gap-2">

                                        <span className="text-green-600">
                                            ✓
                                        </span>

                                        <span className="font-semibold text-green-800">
                                            Position récupérée
                                        </span>

                                    </div>

                                    <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3">

                                        <div>
                                            <span className="font-medium">
                                                Latitude :
                                            </span>{" "}
                                            {latitude.toFixed(
                                                7
                                            )}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                Longitude :
                                            </span>{" "}
                                            {longitude.toFixed(
                                                7
                                            )}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                Précision :
                                            </span>{" "}
                                            {gpsPrecision !==
                                                null
                                                ? `${Math.round(
                                                    gpsPrecision
                                                )} m`
                                                : "-"}
                                        </div>

                                    </div>

                                    <p className="mt-3 text-xs text-green-700">
                                        Cette position sera utilisée
                                        pour la livraison de votre commande.
                                    </p>

                                </div>

                            ) : (

                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">

                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Votre position n'a pas
                                        encore été récupérée.
                                    </p>

                                </div>

                            )}

                            {/* Erreur GPS */}

                            {localisationError && (

                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">

                                    <p className="text-sm text-red-700">
                                        ❌{" "}
                                        {localisationError}
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* TOTAL */}

                        <div className="rounded-xl bg-white p-6 shadow">

                            <div className="space-y-3">

                                <div className="flex justify-between">
                                    <span>
                                        Sous-total produits :
                                    </span>

                                    <span>
                                        {total.toLocaleString("fr-FR")} FCFA
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Livraison :
                                    </span>

                                    <span>
                                        {tarifLivraison.toLocaleString("fr-FR")} FCFA
                                    </span>
                                </div>

                                <div className="border-t pt-3 flex justify-between text-xl font-bold">

                                    <span>
                                        Total :
                                    </span>

                                    <span className="text-blue-600">
                                        {(total + tarifLivraison).toLocaleString(
                                            "fr-FR"
                                        )} FCFA
                                    </span>

                                </div>

                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">

                                <button
                                    onClick={clearCart}
                                    className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600"
                                >
                                    Vider le panier
                                </button>

                                <button
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
                                    className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? "Commande en cours..."
                                        : "Passer la commande"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </main>
    );
}