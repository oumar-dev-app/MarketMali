import { Boutique } from "../types/boutique";


export function boutiqueResponse(
  boutique: Boutique
) {
  return {

    id: boutique.id,

    uuid: boutique.uuid,

    nom: boutique.nom,
    slug: boutique.slug,

    description: boutique.description,

    logo: boutique.logo,

    telephone: boutique.telephone,
    email: boutique.email,

    adresse: boutique.adresse,
    ville: boutique.ville,

    status: boutique.status,

    activation_expires_at:
      boutique.activation_expires_at,

    created_at:
      boutique.created_at,

    updated_at:
      boutique.updated_at,

  };
}



export function boutiqueListResponse(
  boutiques: Boutique[]
) {

  return boutiques.map(
    boutique => boutiqueResponse(boutique)
  );

}