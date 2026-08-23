const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

function getApiUrl(endpoint: string) {
  const baseUrl = API_URL.replace(/\/$/, "");

  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${path}`;
}

export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    getApiUrl(endpoint),
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Erreur lors de la récupération des données."
    );
  }

  return data;
}

export async function apiPost<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const response = await fetch(
    getApiUrl(endpoint),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Erreur lors de l'envoi des données."
    );
  }

  return data;
}