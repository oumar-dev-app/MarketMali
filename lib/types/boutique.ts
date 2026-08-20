export interface Boutique {
  id: number;
  uuid: string;
  user_id: number;

  nom: string;
  slug: string;

  description: string | null;

  logo: string | null;
  telephone: string | null;
  email: string | null;

  adresse: string | null;
  ville: string | null;

  status: "active" | "pending" | "blocked";

  activation_expires_at: Date | null;

  created_at: Date;
  updated_at: Date;
}



export type BoutiqueUpdate = {
  nom?: string;
  slug?: string;

  description?: string | null;

  logo?: string | null;
  telephone?: string | null;
  email?: string | null;

  adresse?: string | null;
  ville?: string | null;
};