"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCategoriePage(){

    const params = useParams();
    const router = useRouter();

    const uuid = params.uuid as string;


    const [nom,setNom] = useState("");
    const [description,setDescription] = useState("");
    const [image,setImage] = useState("");

    const [loading,setLoading] = useState(true);



    useEffect(()=>{


        const loadCategorie = async()=>{

            try{

                const token =
                    localStorage.getItem("token");


                const response =
                    await fetch(
                        `/api/dashboard/categories/uuid/${uuid}`,
                        {
                            headers:{
                                Authorization:
                                `Bearer ${token}`
                            }
                        }
                    );


                const result =
                    await response.json();


                if(result.success){

                    setNom(
                        result.data.nom
                    );

                    setDescription(
                        result.data.description ?? ""
                    );

                    setImage(
                        result.data.image ?? ""
                    );

                }


            }catch(error){

                console.error(error);

            }finally{

                setLoading(false);

            }

        };


        if(uuid){

            loadCategorie();

        }


    },[uuid]);





    const updateCategorie = async(e:React.FormEvent)=>{

        e.preventDefault();


        try{

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `/api/dashboard/categories/uuid/${uuid}`,
                    {
                        method:"PATCH",

                        headers:{
                            "Content-Type":"application/json",

                            Authorization:
                            `Bearer ${token}`
                        },

                        body:JSON.stringify({
                            nom,
                            description,
                            image
                        })
                    }
                );


            const result =
                await response.json();


            if(result.success){

                alert(
                    "Catégorie modifiée avec succès."
                );

                router.push(
                    "/dashboard/categories"
                );

            }


        }catch(error){

            console.error(error);

        }


    };





    if(loading){

        return (
            <div className="p-6">
                Chargement...
            </div>
        );

    }



    return (

        <div className="p-6 max-w-xl">

            <h1 className="text-2xl font-bold mb-6">
                Modifier la catégorie
            </h1>


            <form
                onSubmit={updateCategorie}
                className="space-y-4"
            >


                <div>

                    <label className="block mb-1">
                        Nom
                    </label>

                    <input
                        value={nom}
                        onChange={(e)=>
                            setNom(e.target.value)
                        }
                        className="border rounded-lg w-full px-4 py-2"
                    />

                </div>



                <div>

                    <label className="block mb-1">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e)=>
                            setDescription(e.target.value)
                        }
                        className="border rounded-lg w-full px-4 py-2"
                    />

                </div>




                <div>

                    <label className="block mb-1">
                        Image
                    </label>

                    <input
                        value={image}
                        onChange={(e)=>
                            setImage(e.target.value)
                        }
                        className="border rounded-lg w-full px-4 py-2"
                    />

                </div>



                <button
                    type="submit"
                    className="bg-black text-white px-5 py-2 rounded-lg"
                >
                    Enregistrer
                </button>


            </form>


        </div>

    );

}