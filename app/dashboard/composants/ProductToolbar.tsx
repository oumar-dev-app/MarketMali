"use client";
import Link from "next/link";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function ProductToolbar({
  search,
  setSearch,
}: Props) {

  return (

    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">

      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 flex-1"
      />

      <Link
        href="/dashboard/produits/create"
        className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 inline-flex items-center justify-center"
      >
        + Nouveau produit
      </Link>

    </div>

  );

}