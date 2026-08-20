"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function CreateCategoriePage() {

    const router = useRouter();

    const [boutiqueId, setBoutiqueId] =
        useState<number | null>(null);

    const [nom, setNom] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [image, setImage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        const loadBoutique = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                const response =
                    await fetch(
                        "/api/dashboard/boutiques",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const result =
                    await response.json();


                if (result.success) {

                    /*
                    Pour un vendeur :
                    data = boutique
                    */

                    setBoutiqueId(result.data.id);

                }


            } catch (error) {

                console.error(error);

            }

        };


        loadBoutique();

    }, []);



    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();


        if (!boutiqueId) {

            alert(
                "Boutique introuvable."
            );

            return;

        }


        setLoading(true);


        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    "/api/dashboard/categories",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({

                            boutique_id:
                                boutiqueId,

                            nom,

                            description,

                            image

                        }),

                    }
                );


            const result =
                await response.json();


            if (result.success) {

                router.push(
                    "/dashboard/categories"
                );

            } else {

                alert(
                    result.message ??
                    "Erreur création catégorie"
                );

            }


        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };



    return (

        <div className="p-6 max-w-xl">


            <h1 className="text-2xl font-bold mb-6">
                Ajouter une catégorie
            </h1>



            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >


                <div>

                    <label className="block mb-1 font-medium">
                        Nom
                    </label>

                    <input

                        type="text"

                        value={nom}

                        onChange={(e) =>
                            setNom(e.target.value)
                        }

                        className="w-full border rounded-lg px-4 py-2"

                        placeholder="Ex: Smartphones"

                        required

                    />

                </div>



                <div>

                    <label className="block mb-1 font-medium">
                        Description
                    </label>


                    <textarea

                        value={description}

                        onChange={(e) =>
                            setDescription(e.target.value)
                        }

                        className="w-full border rounded-lg px-4 py-2"

                        rows={4}

                        placeholder="Description de la catégorie"

                    />

                </div>



                <div>

                    <label className="block mb-1 font-medium">
                        Image (URL)
                    </label>


                    <input

                        type="text"

                        value={image}

                        onChange={(e) =>
                            setImage(e.target.value)
                        }

                        className="w-full border rounded-lg px-4 py-2"

                        placeholder="https://..."

                    />

                </div>




                <button

                    type="submit"

                    disabled={loading}

                    className="bg-black text-white px-5 py-2 rounded-lg"

                >

                    {
                        loading
                            ? "Création..."
                            : "Créer la catégorie"
                    }

                </button>



            </form>


        </div>

    );

}