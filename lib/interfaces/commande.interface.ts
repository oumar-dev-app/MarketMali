export interface CommandeProduitDTO {
  produit_uuid: string;
  quantite: number;
}

export interface CreateCommandeDTO {
  client_uuid: string;
  adresse: string;
  telephone: string;
  note?: string;
  produits: CommandeProduitDTO[];
}

export interface UpdateCommandeStatusDTO {
  statut: string;
}