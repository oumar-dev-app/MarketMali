"use client";

import { useCart } from "@/contexts/CartContext";

interface Props {
    produit: {
        uuid: string;
        id: number;
        boutique_id: number;
        nom: string;
        prix: string | number;
        image?: string | null;
    };
}

export default function AddToCartButton({
    produit,
}: Props) {

    const { addToCart } = useCart();

    function handleClick() {

        const added = addToCart({

            uuid: produit.uuid,
            produit_id: produit.id,
            boutique_id: produit.boutique_id,
            nom: produit.nom,
            prix: Number(produit.prix),
            image: produit.image,

        });

        if (!added) {
            alert(
                "Votre panier contient déjà des produits d'une autre boutique. Videz votre panier avant d'ajouter ce produit."
            );
        }
    }

    return (
        <button
            onClick={handleClick}
            className="mt-8 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
            Ajouter au panier
        </button>
    );
}