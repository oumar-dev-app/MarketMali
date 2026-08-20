import { Categorie } from "../types/categorie";


export function categorieResponse(
    categorie: Categorie
) {
    return {

        id: categorie.id,

        uuid: categorie.uuid,

        boutique_id:
            categorie.boutique_id,

        nom:
            categorie.nom,

        slug:
            categorie.slug,

        description:
            categorie.description,

        image:
            categorie.image,

        status:
            categorie.status,

        created_at:
            categorie.created_at,

        updated_at:
            categorie.updated_at,
    };
}



export function categorieListResponse(
    categories: Categorie[]
) {

    return categories.map(
        categorie => categorieResponse(categorie)
    );

}