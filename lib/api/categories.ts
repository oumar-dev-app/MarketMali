const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";


export async function getCategories() {

  const response =
    await fetch(
      `${API_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );


  if (!response.ok) {

    throw new Error(
      "Erreur récupération catégories"
    );

  }


  const data =
    await response.json();


  return data.data;

}