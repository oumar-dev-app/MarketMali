import {User} from "@/lib/types/user";

export function userResponse(user: User) {
  return {
    id: user.id,
    uuid: user.uuid,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    role: user.role,
    image: user.image,
    email_verified: user.email_verified,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}