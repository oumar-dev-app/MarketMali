"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

interface ProduitVariante {
  id: number;
  uuid: string;
  nom: string;
  stock: number;
  image?: string | null;
}

interface Props {
  produit: {
    uuid: string;
    id: number;
    boutique_id: number;
    nom: string;
    prix: string | number;
    image?: string | null;
    stock: number;

    // Variante sélectionnée
    variante?: ProduitVariante | null;

    // Promotion
    promotion_uuid?: string | null;
    promotion_type?:
      | "percentage"
      | "special_price"
      | null;
    promotion_reduction_pourcentage?:
      | string
      | number
      | null;
    promotion_prix_promotionnel?:
      | string
      | number
      | null;
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

  /**
   * Stock réellement disponible.
   *
   * Si une variante est sélectionnée,
   * son stock devient prioritaire.
   */
  const stockDisponible =
    produit.variante
      ? produit.variante.stock
      : produit.stock;

  /**
   * Image réellement utilisée.
   *
   * La photo de la variante est prioritaire
   * lorsqu'elle existe.
   *
   * Sinon on conserve la photo principale
   * du produit.
   */
  const imageProduit =
    produit.variante?.image ||
    produit.image ||
    null;

  /**
   * Si l'utilisateur change de variante
   * avec une quantité trop élevée pour
   * le nouveau stock, on la ramène à 1.
   */
  useEffect(() => {
    setQuantity((value) => {
      if (stockDisponible <= 0) {
        return 1;
      }

      return Math.min(
        value,
        stockDisponible
      );
    });

    setMessage("");
  }, [
    produit.variante?.id,
    stockDisponible,
  ]);

  function decrease() {
    setQuantity((value) =>
      Math.max(1, value - 1)
    );

    setMessage("");
  }

  function increase() {
    setQuantity((value) =>
      Math.min(
        stockDisponible,
        value + 1
      )
    );

    setMessage("");
  }

  function handleClick() {
    if (stockDisponible <= 0) {
      setMessage(
        produit.variante
          ? `La variante « ${produit.variante.nom} » est en rupture de stock.`
          : "Ce produit est en rupture de stock."
      );

      return;
    }

    const added = addToCart(
      {
        uuid: produit.uuid,

        produit_id:
          produit.id,

        boutique_id:
          produit.boutique_id,

        nom: produit.nom,

        prix:
          Number(produit.prix),

        image:
          imageProduit,

        stock:
          stockDisponible,

        // Variante
        variante_id:
          produit.variante?.id ??
          null,

        variante_uuid:
          produit.variante?.uuid ??
          null,

        variante_nom:
          produit.variante?.nom ??
          null,

        // Promotion
        promotion_uuid:
          produit.promotion_uuid ??
          null,

        promotion_type:
          produit.promotion_type ??
          null,

        promotion_reduction_pourcentage:
          produit.promotion_reduction_pourcentage !==
            null &&
          produit.promotion_reduction_pourcentage !==
            undefined
            ? Number(
                produit.promotion_reduction_pourcentage
              )
            : null,

        promotion_prix_promotionnel:
          produit.promotion_prix_promotionnel !==
            null &&
          produit.promotion_prix_promotionnel !==
            undefined
            ? Number(
                produit.promotion_prix_promotionnel
              )
            : null,
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
      `${quantity} produit${
        quantity > 1 ? "s" : ""
      }${
        produit.variante
          ? ` (${produit.variante.nom})`
          : ""
      } ajouté${
        quantity > 1 ? "s" : ""
      } au panier.`
    );
  }

  const rupture =
    stockDisponible <= 0;

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3">

        {/* QUANTITÉ */}

        <div
          className="
            flex
            h-14
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-2
          "
        >
          <button
            type="button"
            onClick={decrease}
            disabled={
              quantity <= 1 ||
              rupture
            }
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
              min-w-10
              flex-1
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
            disabled={
              rupture ||
              quantity >=
                stockDisponible
            }
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
          disabled={rupture}
          className="
            flex
            h-14
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            overflow-hidden
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <ShoppingCart
            size={19}
            className="shrink-0"
          />

          <span className="whitespace-nowrap">
            {rupture
              ? "Rupture de stock"
              : "Ajouter au panier"}
          </span>
        </button>
      </div>

      {/* STOCK */}

      <p className="mt-2 text-xs text-gray-500">
        {stockDisponible} unité
        {stockDisponible > 1
          ? "s"
          : ""}{" "}
        disponible
        {stockDisponible > 1
          ? "s"
          : ""}
        {produit.variante && (
          <>
            {" · "}
            Variante :{" "}
            <span className="font-semibold text-gray-700">
              {produit.variante.nom}
            </span>
          </>
        )}
      </p>

      {/* MESSAGE */}

      {message && (
        <div
          className="
            mt-3
            w-full
            rounded-xl
            border
            border-green-100
            bg-green-50
            px-4
            py-3
            text-xs
            font-semibold
            leading-5
            text-green-700
          "
        >
          {message}
        </div>
      )}
    </div>
  );
}