import { RowDataPacket } from "mysql2";

export type PaiementMethode =
  | "cash"
  | "wave"
  | "orange_money"
  | "moov_money";

export type PaiementStatut =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export interface Paiement {
  id: number;
  uuid: string;

  commande_id: number;
  client_id: number;
  boutique_id: number;

  methode: PaiementMethode;
  statut: PaiementStatut;

  montant: number;
  devise: string;

  provider: string | null;

  reference_interne: string;
  reference_externe: string | null;

  telephone: string | null;

  metadata: Record<string, unknown> | null;

  paid_at: Date | null;
  failed_at: Date | null;
  cancelled_at: Date | null;
  refunded_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface PaiementRow
  extends Paiement,
    RowDataPacket {}
