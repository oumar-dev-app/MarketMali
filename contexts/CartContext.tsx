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
};



type CartContextType = {

    items: CartItem[];

    total: number;

    addToCart:
        (item: Omit<CartItem, "quantity">) => boolean;

    removeFromCart:
        (uuid: string) => void;

    increaseQuantity:
        (uuid: string) => void;

    decreaseQuantity:
        (uuid: string) => void;

    clearCart:
        () => void;

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


    if (saved) {

      setItems(
        JSON.parse(saved)
      );

    }

  }, []);




  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(items)
    );

  }, [items]);

  function addToCart(
    item: Omit<CartItem, "quantity">
  ): boolean {

    if (
      items.length > 0 &&
      items.some(
        p =>
          p.boutique_id !==
          item.boutique_id
      )
    ) {
      return false;
    }

    setItems((old) => {

      const existing =
        old.find(
          p =>
            p.uuid ===
            item.uuid
        );

      if (existing) {

        return old.map(
          p =>
            p.uuid === item.uuid
              ? {
                ...p,
                quantity:
                  p.quantity + 1,
              }
              : p
        );
      }

      return [
        ...old,
        {
          ...item,
          quantity: 1,
        }
      ];
    });

    return true;
  }



  function removeFromCart(
    uuid: string
  ) {

    setItems(
      old =>
        old.filter(
          item =>
            item.uuid !== uuid
        )
    );

  }




  function increaseQuantity(
    uuid: string
  ) {

    setItems(
      old =>
        old.map(
          item =>
            item.uuid === uuid
              ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
              : item
        )
    );

  }




  function decreaseQuantity(
    uuid: string
  ) {


    setItems(
      old =>
        old
          .map(
            item =>
              item.uuid === uuid
                ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
                : item
          )
          .filter(
            item =>
              item.quantity > 0
          )
    );


  }




  function clearCart() {

    setItems([]);

  }



  const total =
    items.reduce(
      (sum, item) =>
        sum +
        item.prix *
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