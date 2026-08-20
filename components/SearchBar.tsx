"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch() {
    const value = search.trim();

    if (!value) return;

    router.push(
      `/recherche?q=${encodeURIComponent(value)}`
    );
  }

  return (
    <div className="flex w-full items-center rounded-lg border px-4 py-2">
      <FaSearch className="text-gray-400" />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Rechercher un produit..."
        className="ml-3 w-full outline-none"
      />
    </div>
  );
}