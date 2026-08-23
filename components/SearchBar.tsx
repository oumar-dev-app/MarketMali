"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  variant?: "default" | "hero";
}

export default function SearchBar({
  variant = "default",
}: SearchBarProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch() {
    const value = search.trim();

    if (!value) return;

    router.push(
      `/recherche?q=${encodeURIComponent(value)}`
    );
  }

  const isHero = variant === "hero";

  return (
    <div
      className={`
        flex w-full items-center
        ${
          isHero
            ? "rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-900/5"
            : "rounded-lg border px-4 py-2"
        }
      `}
    >
      <div
        className={`
          flex shrink-0 items-center justify-center
          ${
            isHero
              ? "ml-2 h-11 w-11 rounded-xl bg-[#14a800]/10 text-[#14a800]"
              : "text-gray-400"
          }
        `}
      >
        <FaSearch size={isHero ? 17 : 14} />
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Rechercher un produit..."
        className={`
          min-w-0 flex-1 bg-transparent outline-none
          ${
            isHero
              ? "px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 sm:text-base"
              : "ml-3"
          }
        `}
      />

      {isHero && (
        <button
          type="button"
          onClick={handleSearch}
          className="
            hidden
            shrink-0
            rounded-xl
            bg-[#14a800]
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-[#108f00]
            sm:block
          "
        >
          Rechercher
        </button>
      )}
    </div>
  );
}