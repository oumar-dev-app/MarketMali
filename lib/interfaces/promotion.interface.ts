import { PromotionType } from "../types/promotion";

export interface CreatePromotionDTO {
  produit_id: number;
  nom: string;

  type: PromotionType;

  reduction_pourcentage?: number;
  prix_promotionnel?: number;

  date_debut: string;
  date_fin: string;

  quantite_limite?: number | null;
}

export interface UpdatePromotionDTO {
  nom?: string;

  type?: PromotionType;

  reduction_pourcentage?: number;
  prix_promotionnel?: number;

  date_debut?: string;
  date_fin?: string;

  quantite_limite?: number | null;
}