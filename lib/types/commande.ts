export type CommandeModePaiement =
  | "legacy"
  | "cash"
  | "wave"
  | "orange_money"
  | "moov_money";

export type CommandeStatutPaiement =
  | "legacy"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type CommandeStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Commande {
  id: number;
  uuid: string;

  boutique_id: number;
  client_id: number;
  livreur_id: number | null;

  zone_livraison: string;

  adresse_livraison: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_precision: number | null;

  total: number;
  frais_livraison: number;

  mode_paiement: CommandeModePaiement;
  statut_paiement: CommandeStatutPaiement;

  status: CommandeStatus;

  created_at: Date;
  updated_at: Date;
}

export interface CommandeProduitInput {
  produit_id: number;
  variante_id?: number | null;
  quantite: number;
}

export interface CreateCommandeDTO {
  boutique_id: number;

  produits: CommandeProduitInput[];

  zone_livraison: string;

  adresse_livraison?: string;
  latitude?: number;
  longitude?: number;
  gps_precision?: number;

  mode_paiement: Exclude<
    CommandeModePaiement,
    "legacy"
  >;
}

export interface UpdateCommandeDTO {
  total?: number;
  status?: CommandeStatus;
}

export interface CommandeStatut {
  id: number;
  commande_id: number;
  status: CommandeStatus;
  commentaire: string | null;
  created_at: Date;
}

export interface CreateCommandeStatutDTO {
  commande_id: number;
  status: CommandeStatus;
  commentaire?: string;
}