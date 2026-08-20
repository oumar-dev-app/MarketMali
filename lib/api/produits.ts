const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

export async function getProduits(
  search?: string
) {

  const url = new URL(
    "/api/produits",
    API_URL
  );

  if (search?.trim()) {
    url.searchParams.set(
      "search",
      search.trim()
    );
  }

  const response =
    await fetch(
      url.toString(),
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      "Erreur récupération produits"
    );
  }

  const data =
    await response.json();

  return data.data;
}

export async function getProduit(
  uuid: string
) {
  const response = await fetch(
    `${API_URL}/api/produits/${uuid}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Erreur récupération du produit"
    );
  }

  const data = await response.json();

  return data.data;
}