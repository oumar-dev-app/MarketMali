export interface Categorie {
  id: number;
  uuid: string;

  boutique_id: number;

  nom: string;
  slug: string;

  description: string | null;

  image: string | null;

  status: "active" | "pending" | "blocked";

  created_at: Date;
  updated_at: Date;
}

export type CategorieUpdate = {
  nom?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
};

export interface UpdateCategorieDTO {
  nom?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
}

export interface UpdateCategorieDTO {
  nom?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
}


export interface CategorieFilters {
  boutique_id?: number;
  status?: "active" | "pending" | "blocked";
}