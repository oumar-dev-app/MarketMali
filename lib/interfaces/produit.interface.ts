export interface CreateProduitDTO {
  categorie_id: number;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  image?: string;
}


export interface UpdateProduitDTO {
    categorie_id?: number;
    nom?: string;
    description?: string;
    prix?: number;
    stock?: number;
    image?: string;
}