const API_URL = "";


export async function getBoutiques() {

  const response =
    await fetch(
      `${API_URL}/api/boutiques`,
      {
        cache: "no-store",
      }
    );


  if (!response.ok) {

    throw new Error(
      "Erreur récupération boutiques"
    );

  }


  const data =
    await response.json();


  return data.data;

}