import { RowDataPacket } from "mysql2";

export type NotificationType =
  | "new_order"
  | "order_status"
  | "order_cancelled"
  | "role_request"
  | "boutique_pending"
  | "boutique_activated";

export interface Notification {
  id: number;
  uuid: string;
  user_id: number;
  commande_id: number | null;
  commande_uuid: string | null;
  type: string;
  titre: string;
  message: string;
  lu: number;
  read_at: string | null;
  created_at: string;
}

export interface NotificationCreate {
  uuid: string;
  user_id: number;
  commande_id?: number | null;
  type: NotificationType;
  titre: string;
  message: string;
}

export interface NotificationRow
  extends Notification,
  RowDataPacket { }
