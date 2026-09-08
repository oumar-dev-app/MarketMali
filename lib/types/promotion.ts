import { RowDataPacket } from "mysql2/promise";

export type PromotionType =
  | "percentage"
  | "special_price";

export interface Promotion {
  id: number;
  uuid: string;

  boutique_id: number;
  produit_id: number;

  nom: string;

  type: PromotionType;

  reduction_pourcentage: number | null;
  prix_promotionnel: number | null;

  date_debut: Date;
  date_fin: Date;

  quantite_limite: number | null;

  created_at: Date;
  updated_at: Date;
}

export interface PromotionRow
  extends Promotion,
    RowDataPacket {}

export interface PromotionDetailRow
  extends PromotionRow {
  produit_uuid: string;
  produit_nom: string;
  produit_slug: string;
  produit_prix: number;
  produit_stock: number;

  boutique_uuid: string;
  boutique_nom: string;
  boutique_slug: string;
}

export interface PromotionStats {
  quantite_vendue: number;
  chiffre_affaires: number;
}