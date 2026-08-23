import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
import BoutiqueClient from "@/components/BoutiqueClient";

interface Produit {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  prix: string;
  stock: number;
  image: string | null;
  categorie_id: number;
}

interface ProduitResponse {
  success: boolean;
  data: Produit[];
}

interface Categorie {
  id: number;
  uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
}

interface CategorieResponse {
  success: boolean;
  data: Categorie[];
}

interface Boutique {
  telephone: string | null;
  adresse: string | null;
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  ville: string;
  logo: string | null;
  status: string;
}

interface BoutiqueResponse {
  success: boolean;
  data: Boutique;
}

export default async function BoutiquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /*
   * =========================================================
   * RÉCUPÉRATION DES DONNÉES
   * =========================================================
   */

  const boutique = await apiGet<BoutiqueResponse>(
    `/boutiques/slug/${slug}`
  );

  const categories = await apiGet<CategorieResponse>(
    `/boutiques/slug/${slug}/categories`
  );

  const produits = await apiGet<ProduitResponse>(
    `/boutiques/slug/${slug}/produits`
  );

  const boutiqueData = boutique.data;
  const categoriesData = categories.data ?? [];
  const produitsData = produits.data ?? [];

  /*
   * =========================================================
   * AFFICHAGE
   *
   * BoutiqueClient gère maintenant :
   * - la recherche
   * - les catégories cliquables
   * - le filtrage des produits
   * - l'affichage des produits
   * - les états vides
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <BoutiqueClient
        boutique={{
          uuid: boutiqueData.uuid,
          nom: boutiqueData.nom,
          slug: boutiqueData.slug,
          description: boutiqueData.description,
          logo: boutiqueData.logo,
          telephone: boutiqueData.telephone,
          email: null,
          adresse: boutiqueData.adresse,
          ville: boutiqueData.ville,
        }}
        categories={categoriesData}
        produits={produitsData}
      />
    </main>
  );
}