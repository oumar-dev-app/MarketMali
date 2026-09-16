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
    categorie_id?: number;
    nom?: string;
    slug?: string;
    description?: string;
    prix?: number;
    stock?: number;
    image?: string;
};
export interface ProduitVarianteImage {
  id: number;
  uuid: string;
  variante_id: number;
  image_url: string;
  ordre: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProduitVariante {
  id: number;
  uuid: string;
  produit_id: number;
  nom: string;
  stock: number;
  ordre: number;
  created_at: Date;
  updated_at: Date;
  images: ProduitVarianteImage[];
}
