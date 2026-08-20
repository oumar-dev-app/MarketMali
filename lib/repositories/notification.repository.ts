import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { db } from "../db";
import {
  Notification,
  NotificationCreate,
  NotificationRow,
} from "../types/notification";

export class NotificationRepository {

  static async create(
    data: NotificationCreate
  ): Promise<number> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO notifications
        (
          uuid,
          user_id,
          commande_id,
          type,
          titre,
          message
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,
          data.user_id,
          data.commande_id ?? null,
          data.type,
          data.titre,
          data.message,
        ]
      );

    return result.insertId;
  }

  static async findByUserId(
    user_id: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {

    const [rows] =
      await db.query<NotificationRow[]>(
        `
    SELECT
      n.*,
      c.uuid AS commande_uuid
    FROM notifications n
    LEFT JOIN commandes c
      ON c.id = n.commande_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
    `,
        [
          user_id,
          limit,
          offset,
        ]
      );

    return rows;
  }
  

  static async countUnread(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<
        Array<RowDataPacket & { total: number }>
      >(
        `
        SELECT COUNT(*) AS total
        FROM notifications
        WHERE user_id = ?
        AND lu = 0
        `,
        [user_id]
      );

    return Number(rows[0]?.total ?? 0);
  }

  static async findByUUID(
    uuid: string
  ): Promise<Notification | null> {

    const [rows] =
      await db.query<NotificationRow[]>(
        `
        SELECT *
        FROM notifications
        WHERE uuid = ?
        LIMIT 1
        `,
        [uuid]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async markAsRead(
    id: number
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      UPDATE notifications
      SET
        lu = 1,
        read_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );
  }

  static async markAllAsRead(
    user_id: number
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      UPDATE notifications
      SET
        lu = 1,
        read_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
      AND lu = 0
      `,
      [user_id]
    );
  }

}
