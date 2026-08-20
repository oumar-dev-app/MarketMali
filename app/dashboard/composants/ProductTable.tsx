"use client";
import { useState } from "react";
import DeleteProductModal from "./DeleteProductModal";
import {
    FaEdit,
    FaTrash,
    FaBan,
    FaCheck
} from "react-icons/fa";
import { useRouter } from "next/navigation";

import Link from "next/link";

interface Produit {
    uuid: string;
    nom: string;
    prix: string;
    stock: number;
    image: string | null;
    status: string;

    boutique: {
        nom: string;
    } | null;

    categorie: {
        nom: string;
    } | null;
}

interface Props {
    produits: Produit[];
    onDelete: (uuid: string) => Promise<void>;
    onToggleStatus: (
        uuid: string,
        status: string
    ) => Promise<void>;
}


export default function ProductTable({
    produits,
    onDelete,
    onToggleStatus,
}: Props) {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<Produit | null>(null);
    const router = useRouter();

    if (produits.length === 0) {

        return (
            <p>Aucun produit disponible.</p>
        );

    }

    return (

        <div className="overflow-x-auto rounded-lg bg-white shadow">

            <table className="min-w-full">

                <thead className="bg-gray-100">

                    <tr>

                        <th className="px-4 py-3 text-left">
                            Produit
                        </th>

                        <th className="px-4 py-3 text-left">
                            Catégorie
                        </th>

                        <th className="px-4 py-3 text-left">
                            Boutique
                        </th>

                        <th className="px-4 py-3 text-right">
                            Prix
                        </th>

                        <th className="px-4 py-3 text-center">
                            Stock
                        </th>

                        <th className="px-4 py-3 text-center">
                            Statut
                        </th>

                        <th className="px-4 py-3 text-center">
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {produits.map((produit) => (

                        <tr
                            key={produit.uuid}
                            className="border-t"
                        >

                            <td className="px-4 py-3">
                                {produit.nom}
                            </td>

                            <td className="px-4 py-3">
                                {produit.categorie?.nom ?? "-"}
                            </td>

                            <td className="px-4 py-3">
                                {produit.boutique?.nom ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-right">
                                {Number(produit.prix).toLocaleString("fr-FR")} FCFA
                            </td>

                            <td className="px-4 py-3 text-center">
                                {produit.stock}
                            </td>

                            <td className="px-4 py-3 text-center">

                                <span
                                    className={
                                        produit.status === "active"
                                            ? "text-green-600 font-semibold"
                                            : "text-red-600 font-semibold"
                                    }
                                >
                                    <span
                                        className={
                                            produit.status === "active"
                                                ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                                                : "px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
                                        }
                                    >
                                        {
                                            produit.status === "active"
                                                ? "Actif"
                                                : "Bloqué"
                                        }
                                    </span>
                                </span>

                            </td>
                            <td className="px-4 py-3">

                                <div className="flex justify-center gap-2">
                                    <button
                                        title="Modifier le produit"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/produits/edit/${produit.uuid}`
                                            )
                                        }
                                        className="
                                                    p-2 rounded
                                                    bg-blue-600
                                                    text-white
                                                    hover:bg-blue-700
                                                    hover:scale-110
                                                    cursor-pointer
                                                    transition
                                                    shadow
                                                    "
                                    >
                                        <FaEdit size={16} />
                                    </button>

                                    <button
                                        title={
                                            produit.status === "active"
                                                ? "Cliquer pour bloquer le produit"
                                                : "Cliquer pour débloquer le produit"
                                        }
                                        onClick={() =>
                                            onToggleStatus(
                                                produit.uuid,
                                                produit.status
                                            )
                                        }
                                        className={
                                            produit.status === "active"
                                                ? `
                                                    p-2 rounded 
                                                    bg-yellow-500 
                                                    text-white 
                                                    hover:bg-yellow-600 
                                                    hover:scale-110
                                                    cursor-pointer
                                                    transition
                                                    shadow
                                                    `
                                                : `
                                                    p-2 rounded 
                                                    bg-green-600 
                                                    text-white 
                                                    hover:bg-green-700 
                                                    hover:scale-110
                                                    cursor-pointer
                                                    transition
                                                    shadow
                                                    `
                                        }
                                    >
                                        {
                                            produit.status === "active"
                                                ? <FaBan size={16} />
                                                : <FaCheck size={16} />
                                        }
                                    </button>
                                    <button
                                        title="Supprimer"
                                        onClick={() => {
                                            setSelectedProduct(produit);
                                            setOpen(true);
                                        }}
                                        className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                                    >
                                        <FaTrash />
                                    </button>

                                </div>

                            </td>
                        </tr>

                    ))}

                </tbody>

            </table>

            <DeleteProductModal
                open={open}
                loading={loading}
                productName={selectedProduct?.nom ?? ""}
                onClose={() => setOpen(false)}
                onConfirm={async () => {

                    if (!selectedProduct) {
                        return;
                    }

                    setLoading(true);

                    await onDelete(selectedProduct.uuid);

                    setLoading(false);

                    setOpen(false);

                    setSelectedProduct(null);

                }}
            />

        </div>

    );

}