import { RowDataPacket } from "mysql2";

export interface PaiementWebhookEvent {
  id: number;
  provider: string;
  event_id: string;
  event_type: string;
  paiement_id: number | null;
  reference_interne: string | null;
  payload: Record<string, unknown> | null;
  processed_at: Date | null;
  created_at: Date;
}

export interface PaiementWebhookEventRow
  extends PaiementWebhookEvent,
    RowDataPacket {}
