export interface Categorie {
  id: number;
  uuid: string;
  parent_id: number | null;
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
  parent_id?: number | null;
  description?: string | null;
  image?: string | null;
};

export interface UpdateCategorieDTO {
  nom?: string;
  slug?: string;
  parent_id?: number | null;
  description?: string | null;
  image?: string | null;
}

export interface CategorieFilters {
  parent_id?: number | null;
  status?: "active" | "pending" | "blocked";
}