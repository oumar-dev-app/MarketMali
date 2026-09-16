"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  uuid: string;
  produit_id: number;
  boutique_id: number;
  nom: string;
  prix: number;
  image?: string | null;
  quantity: number;
  stock: number;

  // Variante
  variante_id?: number | null;
  variante_uuid?: string | null;
  variante_nom?: string | null;

  // Promotion
  promotion_uuid?: string | null;
  promotion_type?: "percentage" | "special_price" | null;
  promotion_reduction_pourcentage?: number | null;
  promotion_prix_promotionnel?: number | null;
};

type CartContextType = {
  items: CartItem[];

  total: number;

  addToCart: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => boolean;

  removeFromCart: (cartKey: string) => void;

  increaseQuantity: (cartKey: string) => void;

  decreaseQuantity: (cartKey: string) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/**
 * Identifie une ligne du panier.
 *
 * Un même produit peut avoir plusieurs variantes :
 *
 * produit + Rouge
 * produit + Bleu
 * produit sans variante
 *
 * doivent donc être trois lignes différentes.
 */
export function getCartItemKey(
  item: Pick<
    CartItem,
    "uuid" | "variante_id"
  >
): string {
  return `${item.uuid}::${item.variante_id ?? "none"}`;
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  useEffect(() => {
    const saved =
      localStorage.getItem("cart");

    if (!saved) {
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return;
      }

      setItems(
        parsed.map((item) => ({
          ...item,

          variante_id:
            item.variante_id !==
              null &&
            item.variante_id !==
              undefined
              ? Number(
                  item.variante_id
                )
              : null,

          variante_uuid:
            item.variante_uuid ??
            null,

          variante_nom:
            item.variante_nom ??
            null,

          stock:
            typeof item.stock ===
            "number"
              ? item.stock
              : 999999,

          promotion_uuid:
            item.promotion_uuid ??
            null,

          promotion_type:
            item.promotion_type ??
            null,

          promotion_reduction_pourcentage:
            item.promotion_reduction_pourcentage !==
              null &&
            item.promotion_reduction_pourcentage !==
              undefined
              ? Number(
                  item.promotion_reduction_pourcentage
                )
              : null,

          promotion_prix_promotionnel:
            item.promotion_prix_promotionnel !==
              null &&
            item.promotion_prix_promotionnel !==
              undefined
              ? Number(
                  item.promotion_prix_promotionnel
                )
              : null,
        }))
      );
    } catch (error) {
      console.error(
        "Erreur lecture panier :",
        error
      );

      localStorage.removeItem("cart");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(items)
    );
  }, [items]);

  function addToCart(
    item: Omit<CartItem, "quantity">,
    quantity: number = 1
  ): boolean {
    if (
      items.length > 0 &&
      items.some(
        (p) =>
          p.boutique_id !==
          item.boutique_id
      )
    ) {
      return false;
    }

    const quantityToAdd = Math.max(
      1,
      Math.floor(quantity)
    );

    const itemKey =
      getCartItemKey(item);

    setItems((old) => {
      const existing = old.find(
        (p) =>
          getCartItemKey(p) ===
          itemKey
      );

      if (existing) {
        const newQuantity =
          Math.min(
            existing.quantity +
              quantityToAdd,
            item.stock
          );

        return old.map((p) =>
          getCartItemKey(p) ===
          itemKey
            ? {
                ...p,
                quantity:
                  newQuantity,
                stock:
                  item.stock,

                image:
                  item.image,

                variante_id:
                  item.variante_id ??
                  null,

                variante_uuid:
                  item.variante_uuid ??
                  null,

                variante_nom:
                  item.variante_nom ??
                  null,

                promotion_uuid:
                  item.promotion_uuid ??
                  null,

                promotion_type:
                  item.promotion_type ??
                  null,

                promotion_reduction_pourcentage:
                  item.promotion_reduction_pourcentage ??
                  null,

                promotion_prix_promotionnel:
                  item.promotion_prix_promotionnel ??
                  null,
              }
            : p
        );
      }

      return [
        ...old,
        {
          ...item,

          variante_id:
            item.variante_id ??
            null,

          variante_uuid:
            item.variante_uuid ??
            null,

          variante_nom:
            item.variante_nom ??
            null,

          quantity:
            Math.min(
              quantityToAdd,
              item.stock
            ),
        },
      ];
    });

    return true;
  }

  function removeFromCart(
    cartKey: string
  ) {
    setItems((old) =>
      old.filter(
        (item) =>
          getCartItemKey(item) !==
          cartKey
      )
    );
  }

  function increaseQuantity(
    cartKey: string
  ) {
    setItems((old) =>
      old.map((item) => {
        if (
          getCartItemKey(item) !==
          cartKey
        ) {
          return item;
        }

        if (
          item.quantity >=
          item.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  }

  function decreaseQuantity(
    cartKey: string
  ) {
    setItems((old) =>
      old
        .map((item) =>
          getCartItemKey(item) ===
          cartKey
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function clearCart() {
    setItems([]);
  }

  /**
   * Prix final utilisé pour l'affichage
   * et le calcul du panier.
   *
   * Le serveur devra néanmoins
   * recalculer ce prix au moment
   * de la création de la commande.
   */
  function getPrixFinal(
    item: CartItem
  ): number {
    const prix = Number(item.prix);

    if (!Number.isFinite(prix)) {
      return 0;
    }

    if (
      item.promotion_type ===
        "percentage" &&
      item.promotion_reduction_pourcentage !==
        null &&
      item.promotion_reduction_pourcentage !==
        undefined
    ) {
      const reduction =
        Number(
          item.promotion_reduction_pourcentage
        );

      if (
        Number.isFinite(reduction) &&
        reduction >= 0 &&
        reduction <= 100
      ) {
        return (
          prix -
          (prix * reduction) /
            100
        );
      }
    }

    if (
      item.promotion_type ===
        "special_price" &&
      item.promotion_prix_promotionnel !==
        null &&
      item.promotion_prix_promotionnel !==
        undefined
    ) {
      const prixPromotionnel =
        Number(
          item.promotion_prix_promotionnel
        );

      if (
        Number.isFinite(
          prixPromotionnel
        ) &&
        prixPromotionnel >= 0
      ) {
        return prixPromotionnel;
      }
    }

    return prix;
  }

  const total = items.reduce(
    (sum, item) =>
      sum +
      getPrixFinal(item) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart doit être utilisé dans un CartProvider"
    );
  }

  return context;
}
