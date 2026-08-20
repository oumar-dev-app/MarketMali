"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Categorie {
    uuid: string;
    nom: string;
    slug: string;
    description?: string;
    image?: string | null;
    status: string;
    created_at: string;
}


const getStatusBadge = (status: string) => {

    switch (status) {

        case "active":
            return "bg-green-100 text-green-800";

        case "blocked":
            return "bg-red-100 text-red-800";

        default:
            return "bg-gray-100 text-gray-800";
    }

};


export default function CategoriesPage() {

    const [categories, setCategories] =
        useState<Categorie[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");


    const fetchCategories = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    "/api/dashboard/categories",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                setCategories(
                    result.data
                );

            }


        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchCategories();

    }, []);



    const blockCategorie = async (
        uuid: string
    ) => {

        const confirmation =
            confirm(
                "Voulez-vous désactiver cette catégorie ?"
            );


        if (!confirmation)
            return;


        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `/api/dashboard/categories/uuid/${uuid}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                fetchCategories();

            }


        } catch (error) {

            console.error(error);

        }

    };

    const unblockCategorie = async (
        uuid: string
    ) => {

        const confirmation =
            confirm(
                "Voulez-vous réactiver cette catégorie ?"
            );


        if (!confirmation)
            return;


        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `/api/dashboard/categories/uuid/${uuid}/unblock`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                fetchCategories();

            }


        } catch (error) {

            console.error(error);

        }

    };



    const filteredCategories =
        categories.filter((categorie) =>

            categorie.nom
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )

        );



    if (loading) {

        return (
            <div className="p-6">
                Chargement...
            </div>
        );

    }



    return (

        <div className="p-6">

            <div className="flex justify-between mb-6">

                <h1 className="text-2xl font-bold">
                    Gestion des catégories
                </h1>


                <Link
                    href="/dashboard/categories/create"
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    Ajouter
                </Link>

            </div>


            <input

                type="text"

                placeholder="Rechercher une catégorie..."

                value={search}

                onChange={(e) =>
                    setSearch(e.target.value)
                }

                className="border rounded-lg px-4 py-2 mb-6 w-full md:w-1/2"

            />



            <div className="overflow-x-auto border rounded-lg">


                <table className="min-w-full">


                    <thead className="bg-gray-100">

                        <tr>

                            <th className="px-4 py-3 text-left">
                                Nom
                            </th>

                            <th className="px-4 py-3 text-left">
                                Slug
                            </th>

                            <th className="px-4 py-3 text-left">
                                Statut
                            </th>

                            <th className="px-4 py-3 text-left">
                                Date
                            </th>

                            <th className="px-4 py-3 text-left">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {filteredCategories.map(
                            (categorie) => (

                                <tr
                                    key={categorie.uuid}
                                    className="border-t"
                                >

                                    <td className="px-4 py-3">
                                        {categorie.nom}
                                    </td>


                                    <td className="px-4 py-3">
                                        {categorie.slug}
                                    </td>


                                    <td className="px-4 py-3">

                                        <span
                                            className={
                                                `px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(categorie.status)}`
                                            }
                                        >

                                            {categorie.status}

                                        </span>

                                    </td>


                                    <td className="px-4 py-3">

                                        {
                                            new Date(
                                                categorie.created_at
                                            ).toLocaleDateString("fr-FR")
                                        }

                                    </td>


                                    <td className="px-4 py-3 flex gap-2">


                                        <Link
                                            href={`/dashboard/categories/edit/${categorie.uuid}`}
                                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                                        >
                                            Modifier
                                        </Link>


                                        {
                                            categorie.status === "active" ? (

                                                <button
                                                    onClick={() =>
                                                        blockCategorie(
                                                            categorie.uuid
                                                        )
                                                    }
                                                    className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                                                >
                                                    Bloquer
                                                </button>

                                            ) : (

                                                <button
                                                    onClick={() =>
                                                        unblockCategorie(
                                                            categorie.uuid
                                                        )
                                                    }
                                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                                                >
                                                    Débloquer
                                                </button>

                                            )
                                        }


                                    </td>


                                </tr>

                            ))}


                    </tbody>


                </table>


            </div>


        </div>

    );

}