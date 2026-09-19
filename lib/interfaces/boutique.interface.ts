export interface CreateBoutiqueDTO {
  user_id: number;

  nom: string;
  description?: string;
  logo?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;

  paiements?: {
    wave?: string;
    orange_money?: string;
    moov_money?: string;
  };
}


export interface UpdateBoutiqueDTO {
  nom?: string;
  slug?: string;

  description?: string | null;
  logo?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  ville?: string | null;

  paiements?: {
    wave?: string;
    orange_money?: string;
    moov_money?: string;
  };
}


export interface BoutiqueFilters {
  ville?: string;
  actif?: boolean;
}