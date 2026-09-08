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

  removeFromCart: (uuid: string) => void;

  increaseQuantity: (uuid: string) => void;

  decreaseQuantity: (uuid: string) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

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

          stock:
            typeof item.stock === "number"
              ? item.stock
              : 999999,

          promotion_uuid:
            item.promotion_uuid ?? null,

          promotion_type:
            item.promotion_type ?? null,

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

    setItems((old) => {
      const existing = old.find(
        (p) => p.uuid === item.uuid
      );

      if (existing) {
        const newQuantity =
          Math.min(
            existing.quantity +
              quantityToAdd,
            item.stock
          );

        return old.map((p) =>
          p.uuid === item.uuid
            ? {
                ...p,
                quantity: newQuantity,
                stock: item.stock,

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
          quantity: Math.min(
            quantityToAdd,
            item.stock
          ),
        },
      ];
    });

    return true;
  }

  function removeFromCart(
    uuid: string
  ) {
    setItems((old) =>
      old.filter(
        (item) =>
          item.uuid !== uuid
      )
    );
  }

  function increaseQuantity(
    uuid: string
  ) {
    setItems((old) =>
      old.map((item) => {
        if (item.uuid !== uuid) {
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
    uuid: string
  ) {
    setItems((old) =>
      old
        .map((item) =>
          item.uuid === uuid
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

  const total =
    items.reduce(
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
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart doit être utilisé dans CartProvider"
    );
  }

  return context;
}