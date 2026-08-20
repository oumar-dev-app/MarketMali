export interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTarifLivraisonDTO {
  boutique_id: number;
  zone: string;
  frais: number;
}

export interface UpdateTarifLivraisonDTO {
  zone?: string;
  frais?: number;
}
