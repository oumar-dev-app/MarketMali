"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

interface SearchSortProps {
  tri: string;
}

export default function SearchSort({
  tri,
}: SearchSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = (value: string) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    // Revenir à la première page après
    // un changement de tri.
    params.delete("page");

    if (value === "pertinence") {
      params.delete("tri");
    } else {
      params.set("tri", value);
    }

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  };

  return (
    <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
      <label
        htmlFor="search-sort"
        className="text-sm font-bold text-gray-700"
      >
        Trier :
      </label>

      <select
        id="search-sort"
        value={tri || "pertinence"}
        onChange={(e) =>
          updateSort(e.target.value)
        }
        className="
          h-10
          w-52
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3
          text-sm
          font-semibold
          text-gray-700
          outline-none
          transition
          focus:border-[#14a800]
          focus:ring-4
          focus:ring-[#14a800]/10
        "
      >
        <option value="pertinence">
          Pertinence
        </option>

        <option value="recent">
          Plus récents
        </option>

        <option value="prix_asc">
          Prix croissant
        </option>

        <option value="prix_desc">
          Prix décroissant
        </option>

        <option value="note">
          Mieux notés
        </option>
      </select>
    </div>
  );
}
