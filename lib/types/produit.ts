export interface Produit {
  id: number;

  uuid: string;

  boutique_id: number;

  categorie_id: number;

  nom: string;

  slug: string;

  description: string | null;

  prix: number;

  stock: number;

  image: string | null;

  status: "active" | "pending" | "blocked";

  created_at: Date;

  updated_at: Date;
}

export type ProduitUpdate = {
  nom?: string;
  slug?: string;
  description?: string | null;
  prix?: number;
  stock?: number;
  image?: string | null;
};