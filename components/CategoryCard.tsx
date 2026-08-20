interface CategoryCardProps {

  categorie: {
    uuid: string;
    nom: string;
    image?: string | null;
    description?: string | null;
  };

}


export default function CategoryCard({
  categorie
}: CategoryCardProps) {


  return (

    <div
      className="cursor-pointer rounded-xl border bg-white p-4 text-center shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-20 items-center justify-center rounded-lg bg-gray-100">
        {categorie.image ? (

          <img
            src={categorie.image}
            alt={categorie.nom}
            className="h-full w-full rounded-lg object-cover"
          />

        ) : (
          <span className="text-gray-400">
            📦
          </span>
        )}

      </div>

      <h3 className="mt-3 font-medium">
        {categorie.nom}
      </h3>

    </div>

  );

}