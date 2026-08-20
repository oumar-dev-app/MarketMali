"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import CommandeStatusBadge from "@/components/CommandeStatusBadge";


interface Boutique {
    nom: string;
    slug: string;
}



interface Commande {
    uuid: string;
    total: string;
    status: string;
    created_at: string;
    updated_at: string;
    boutique: Boutique;
}


export default function CommandesPage() {

    const { token, loading } = useAuth();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loadingCommandes, setLoadingCommandes] = useState(true);




    useEffect(() => {

        async function loadCommandes() {

            try {

                const response = await fetch(
                    "/api/commandes",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data =
                    await response.json();
                console.log(data.data);
                if (data.success) {
                    const commandesRecues = Array.isArray(data.data)
                        ? data.data
                        : Array.isArray(data.data?.data)
                            ? data.data.data
                            : [];

                    console.log("Commandes finales :", commandesRecues);

                    setCommandes(commandesRecues);
                }


            } catch (error) {

                console.error(
                    "Erreur chargement commandes:",
                    error
                );

            } finally {

                setLoadingCommandes(false);

            }

        }


        if (!loading && token) {

            loadCommandes();

        }


    }, [token, loading]);



    if (loading || loadingCommandes) {

        return (
            <div className="p-6">
                Chargement des commandes...
            </div>
        );

    }



    return (

        <main className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-bold mb-8">
                    Mes commandes
                </h1>


                {commandes.length === 0 ? (

                    <div className="bg-white rounded-xl shadow p-6 text-center">

                        <p className="text-gray-500">
                            Vous n'avez aucune commande.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {commandes.map((commande) => (

                            <div
                                key={commande.uuid}
                                className="bg-white rounded-xl shadow p-6"
                            >

                                <div className="flex justify-between items-center">

                                    <div>

                                        <p className="font-bold">
                                            Commande :
                                            {" "}
                                            {commande.uuid}
                                        </p>


                                        <p>
                                            Boutique :
                                            {" "}
                                            {commande.boutique.nom}
                                        </p>


                                        <p>
                                            Date :
                                            {" "}
                                            {new Date(
                                                commande.created_at
                                            ).toLocaleString(
                                                "fr-FR",
                                                {
                                                    dateStyle: "long",
                                                    timeStyle: "short",
                                                }
                                            )}
                                        </p>

                                    </div>


                                    <div className="text-right">

                                        <p className="font-bold text-blue-600">
                                            {Number(
                                                commande.total
                                            ).toLocaleString()}
                                            {" "}
                                            FCFA
                                        </p>


                                        <span
                                            className="
                                            inline-block
                                            mt-2
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-yellow-100
                                            text-yellow-800
                                            text-sm
                                            "
                                        >
                                            <CommandeStatusBadge
                                                status={commande.status}
                                            />
                                        </span>


                                    </div>

                                </div>


                                <Link
                                    href={`/commandes/${commande.uuid}`}
                                    className="
                                    inline-block
                                    mt-5
                                    bg-blue-600
                                    text-white
                                    px-5
                                    py-2
                                    rounded-lg
                                    hover:bg-blue-700
                                    "
                                >
                                    Voir détail
                                </Link>


                            </div>

                        ))}

                    </div>

                )}

            </div>

        </main>

    );

}
