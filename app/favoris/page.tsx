import Navbar from "@/components/Navbar";
import FavorisList from "./components/FavorisList";

export default function FavorisPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f7]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
{/*         <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mes favoris
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Retrouvez facilement les produits que vous avez ajoutés à vos favoris.
          </p>
        </div> */}

        <FavorisList />
      </section>
    </main>
  );
}