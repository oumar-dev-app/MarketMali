import { Produit } from "@/lib/types/produit";

export function produitResponse(
produit: any
) {
return {
    id: produit.id,          

    uuid: produit.uuid,
    boutique_id: produit.boutique_id,
    categorie_id: produit.categorie_id,

    nom: produit.nom,
    slug: produit.slug,
    description: produit.description,

    prix: produit.prix,
    stock: produit.stock,
    image: produit.image,

    status: produit.status,

    created_at: produit.created_at,
    updated_at: produit.updated_at,

    boutique: produit.boutique_uuid
        ? {
            uuid: produit.boutique_uuid,
            nom: produit.boutique_nom,
            slug: produit.boutique_slug,
        }
        : null,

    categorie: produit.categorie_uuid
        ? {
            uuid: produit.categorie_uuid,
            nom: produit.categorie_nom,
            slug: produit.categorie_slug,
        }
        : null,
};
}
export function produitListResponse(
  produits: Produit[]
) {
  return produits.map(produitResponse);
}