export interface CreateProduitDTO {
  categorie_id: number;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  image?: string;
}


export interface UpdateProduitDTO {
  nom?: string;
  description?: string;
  prix?: number;
  stock?: number;
  image?: string;
}