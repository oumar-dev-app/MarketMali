const API_URL = "";


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