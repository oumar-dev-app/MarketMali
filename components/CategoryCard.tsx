import Link from "next/link";

interface CategoryCardProps {
  categorie: {
    uuid: string;
    nom: string;
    slug: string;
    image?: string | null;
    description?: string | null;
  };
}

export default function CategoryCard({
  categorie,
}: CategoryCardProps) {
  return (
    <Link
      href={`/produits?categorie=${encodeURIComponent(
        categorie.slug
      )}`}
      className="
        group
        block
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#14a800]/20
        hover:shadow-lg
      "
    >
      <div className="relative m-2 h-28 overflow-hidden rounded-xl bg-gray-50">
        {categorie.image ? (
          <img
            src={categorie.image}
            alt={categorie.nom}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl opacity-40">
              📦
            </span>
          </div>
        )}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-1
            bg-gradient-to-r
            from-[#14a800]
            via-[#fcd116]
            to-[#ce1126]
            opacity-0
            transition-opacity
            group-hover:opacity-100
          "
        />
      </div>

      <div className="px-3 pb-4 pt-1 text-center">
        <h3
          className="
            truncate
            text-sm
            font-bold
            text-gray-800
            transition-colors
            group-hover:text-[#14a800]
          "
        >
          {categorie.nom}
        </h3>

        {categorie.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {categorie.description}
          </p>
        )}
      </div>
    </Link>
  );
}