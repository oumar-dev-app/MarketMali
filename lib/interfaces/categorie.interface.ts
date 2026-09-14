export interface CreateCategorieDTO {
  nom: string;
  parent_id?: number | null;
  description?: string;
  image?: string;
}

export interface UpdateCategorieDTO {
  nom?: string;
  slug?: string;
  parent_id?: number | null;
  description?: string | null;
  image?: string | null;
}