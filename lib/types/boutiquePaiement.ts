import { RowDataPacket } from "mysql2";

export type BoutiquePaiementProvider =
  | "wave"
  | "orange_money"
  | "moov_money";

export interface BoutiquePaiementCompte {
  id: number;
  boutique_id: number;
  provider: BoutiquePaiementProvider;
  numero: string;
  nom_compte: string | null;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BoutiquePaiementCompteRow
  extends BoutiquePaiementCompte,
    RowDataPacket {}
