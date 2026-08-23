import { apiGet } from "@/lib/api";

interface ProduitResponse<T> {
  success: boolean;
  message?: string;
  data: T;
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
) {
  const response =
    await apiGet<ProduitResponse<any>>(
      `/produits/${encodeURIComponent(uuid)}`
    );

  return response.data;
}