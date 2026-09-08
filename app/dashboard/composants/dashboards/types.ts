export interface Statistiques {
  nombre_clients: number;
  nombre_produits: number;
  nombre_categories: number;
  nombre_commandes: number;
  commandes_en_attente: number;
  commandes_livrees: number;
  produits_en_rupture: number;
  chiffre_affaires: number;
}

export interface Commande {
  uuid: string;
  total: string;
  frais_livraison: string;
  status: string;
  adresse_livraison: string | null;
  latitude: string | null;
  longitude: string | null;
  gps_precision: string | null;
  created_at: string;
  updated_at: string;

  boutique: {
    nom: string;
    slug: string;
  };

  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
}

export interface Vente {
  mois: string;
  ventes: string | number;
}

export interface ProduitVendu {
  nom: string;
  quantite_vendue: number | string;
  chiffre_affaires: number | string;
}
