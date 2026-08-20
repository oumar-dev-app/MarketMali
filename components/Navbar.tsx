"use client";

import Link from "next/link";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {

  const { items } = useCart();

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );


  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
        >
          MarketMali
        </Link>
        <div className="flex flex-1 max-w-xl mx-8">
          <SearchBar />
        </div>
        <Link
          href="/panier"
          className="relative"
        >
          <FaShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-xs text-white">
              {totalItems}
            </span>
          )}

        </Link>
      </div>
    </nav>
  );
}