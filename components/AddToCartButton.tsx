"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

interface Props {
  produit: {
    uuid: string;
    id: number;
    boutique_id: number;
    nom: string;
    prix: string | number;
    image?: string | null;
    stock: number;
  };
}

export default function AddToCartButton({
  produit,
}: Props) {

  const { addToCart } = useCart();

  const [quantity, setQuantity] =
    useState(1);

  const [message, setMessage] =
    useState("");

  function decrease() {

    setQuantity((value) =>
      Math.max(1, value - 1)
    );

    setMessage("");
  }

  function increase() {

    setQuantity((value) =>
      Math.min(produit.stock, value + 1)
    );

    setMessage("");
  }

  function handleClick() {

    const added = addToCart(
      {
        uuid: produit.uuid,
        produit_id: produit.id,
        boutique_id: produit.boutique_id,
        nom: produit.nom,
        prix: Number(produit.prix),
        image: produit.image,
        stock: produit.stock,
      },
      quantity
    );

    if (!added) {

      setMessage(
        "Votre panier contient déjà des produits d'une autre boutique. Videz votre panier avant d'ajouter ce produit."
      );

      return;
    }

    setMessage(
      `${quantity} produit${quantity > 1 ? "s" : ""
      } ajouté${quantity > 1 ? "s" : ""
      } au panier.`
    );

  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row">

        {/* QUANTITÉ */}
        <div
          className="
          flex
          h-14
          w-full
          shrink-0
          items-center
          justify-between
          rounded-2xl
          border
          border-gray-200
          bg-white
          px-2
          sm:w-40
        "
        >
          <button
            type="button"
            onClick={decrease}
            disabled={quantity <= 1}
            className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-gray-600
            transition
            hover:bg-gray-100
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
            aria-label="Diminuer la quantité"
          >
            <Minus size={18} />
          </button>

          <span
            className="
            min-w-8
            shrink-0
            text-center
            text-base
            font-extrabold
            text-gray-900
          "
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={increase}
            disabled={quantity >= produit.stock}
            className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-gray-600
            transition
            hover:bg-gray-100
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
            aria-label="Augmenter la quantité"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* AJOUT PANIER */}
        <button
          type="button"
          onClick={handleClick}
          className="
    flex
    h-14
    w-full
    min-w-0
    flex-1
    items-center
    justify-center
    gap-2
    whitespace-nowrap
    rounded-2xl
    bg-green-700
    px-4
    text-sm
    font-bold
    text-white
    shadow-sm
    transition
    hover:bg-green-800
    hover:shadow-md
    active:scale-[0.99]
    sm:gap-3
    sm:px-6
  "
        >
          <ShoppingCart
            size={19}
            className="shrink-0"
          />

          <span className="truncate">
            Ajouter au panier
          </span>
        </button>

      </div>

      {/* STOCK */}
      <p className="mt-2 text-xs text-gray-500">
        {produit.stock} unité
        {produit.stock > 1 ? "s" : ""} disponible
        {produit.stock > 1 ? "s" : ""}
      </p>

      {/* MESSAGE */}
      {message && (
        <div
          className="
          mt-3
          rounded-xl
          border
          border-green-100
          bg-green-50
          px-4
          py-3
          text-xs
          font-semibold
          text-green-700
        "
        >
          {message}
        </div>
      )}
    </div>
  );
}