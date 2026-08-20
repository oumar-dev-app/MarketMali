"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm, {
    ProductFormData
} from "../../../composants/ProductForm";

import { useAuth } from "@/contexts/AuthContext";


export default function EditProduitPage() {

    const params = useParams();

    const router = useRouter();

    const uuid =
        params.uuid as string;


    const { token } = useAuth();


    const [produit, setProduit] =
        useState<ProductFormData | null>(null);


    const [loading, setLoading] =
        useState(true);



    useEffect(() => {


        async function loadProduit() {


            const response =
                await fetch(
                    `/api/dashboard/produit/uuid/${uuid}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                setProduit({

                    categorie_id:
                        data.data.categorie_id,

                    nom:
                        data.data.nom,

                    description:
                        data.data.description ?? "",

                    prix:
                        Number(data.data.prix),

                    stock:
                        data.data.stock,

                    image:
                        data.data.image ?? ""

                });

            }


            setLoading(false);

        }


        if (token && uuid) {
            loadProduit();
        }


    }, [token, uuid]);




    async function modifierProduit(
        form: ProductFormData
    ) {


        setLoading(true);


        const response =
            await fetch(
                `/api/dashboard/produit/uuid/${uuid}`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(form)

                }
            );


        const data =
            await response.json();



        if (data.success) {

            router.push(
                "/dashboard/produits"
            );

        }


        setLoading(false);

    }



    if (loading || !produit) {

        return (
            <p>
                Chargement du produit...
            </p>
        );

    }



    return (

        <div>

            <h1 className="text-3xl font-bold mb-6">
                Modifier le produit
            </h1>


            <ProductForm

                initialData={produit}

                loading={loading}

                onSubmit={
                    modifierProduit
                }

            />

        </div>

    );

}
