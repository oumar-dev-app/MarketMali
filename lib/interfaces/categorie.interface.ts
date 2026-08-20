export interface CreateCategorieDTO {

  boutique_id: number;

  nom: string;

  slug?: string;

  description?: string;

  image?: string;

}



export interface UpdateCategorieDTO {

  nom?: string;

  slug?: string;

  description?: string | null;

  image?: string | null;

}