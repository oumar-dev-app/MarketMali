import { apiGet } from "@/lib/api";
import type { Produit, ProduitVariante } from "@/lib/types/produit";

interface ProduitResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ProduitDetail
  extends Produit {
  boutique?: {
    id: number;
    nom: string;
    slug: string;
  } | null;

  categorie?: {
    id: number;
    nom: string;
    slug: string;
  } | null;

  promotion_uuid?: string | null;
  promotion_type?:
    | "percentage"
    | "special_price"
    | null;
  promotion_reduction_pourcentage?:
    | string
    | number
    | null;
  promotion_prix_promotionnel?:
    | string
    | number
    | null;

  variantes: ProduitVariante[];
}

export async function getProduits(
  search?: string
) {
  const endpoint = search?.trim()
    ? `/produits?search=${encodeURIComponent(search.trim())}`
    : "/produits";

  const response =
    await apiGet<ProduitResponse<any[]>>(
      endpoint
    );

  return response.data;
}

export async function getProduit(
  uuid: string
): Promise<ProduitDetail> {
  const response =
    await apiGet<ProduitResponse<ProduitDetail>>(
      `/produits/${encodeURIComponent(uuid)}`
    );

  return response.data;
}
