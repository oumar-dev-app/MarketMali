"use client";

import Link from "next/link";
import {
    Plus,
    Search,
    X,
} from "lucide-react";

interface Props {
    search: string;
    setSearch: (value: string) => void;
}

export default function ProductToolbar({
    search,
    setSearch,
}: Props) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                        w-full rounded-xl border border-gray-200
                        bg-white py-3 pl-10 pr-10 text-sm
                        outline-none transition
                        focus:border-gray-400
                        focus:ring-2 focus:ring-gray-100
                    "
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="
                            absolute right-3 top-1/2
                            -translate-y-1/2
                            rounded-full p-1
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-700
                        "
                        aria-label="Effacer la recherche"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <Link
                href="/dashboard/produits/create"
                className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl bg-black px-5 py-3
                    text-sm font-semibold text-white
                    shadow-sm transition
                    hover:bg-gray-800
                    active:scale-[0.98]
                "
            >
                <Plus size={18} />
                Nouveau produit
            </Link>
        </div>
    );
}