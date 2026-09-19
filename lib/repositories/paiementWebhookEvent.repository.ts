import {
  ResultSetHeader,
  Pool,
  PoolConnection
} from "mysql2/promise";

import { db } from "../db";

import {
  PaiementWebhookEventRow
} from "../types/paiementWebhookEvent";

export class PaiementWebhookEventRepository {

  // =========================================================
  // Récupérer un événement par ID
  // =========================================================

  static async findById(
    id: number,
    connection: Pool | PoolConnection = db
  ): Promise<PaiementWebhookEventRow | null> {

    const [rows] =
      await connection.query<PaiementWebhookEventRow[]>(
        `
        SELECT *
        FROM paiement_webhook_events
        WHERE id = ?
        LIMIT 1
        `,
        [
          id
        ]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  // =========================================================
  // Récupérer un événement par provider + event_id
  // =========================================================

  static async findByProviderAndEventId(
    provider: string,
    event_id: string,
    connection: Pool | PoolConnection = db
  ): Promise<PaiementWebhookEventRow | null> {

    const [rows] =
      await connection.query<PaiementWebhookEventRow[]>(
        `
        SELECT *
        FROM paiement_webhook_events
        WHERE provider = ?
          AND event_id = ?
        LIMIT 1
        `,
        [
          provider,
          event_id
        ]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  // =========================================================
  // Créer un événement
  // =========================================================

  static async create(
    data: {
      provider: string;
      event_id: string;
      event_type: string;
      paiement_id?: number | null;
      reference_interne?: string | null;
      payload?: Record<string, unknown> | null;
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO paiement_webhook_events
        (
          provider,
          event_id,
          event_type,
          paiement_id,
          reference_interne,
          payload
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          data.provider,

          data.event_id,

          data.event_type,

          data.paiement_id ?? null,

          data.reference_interne ?? null,

          data.payload
            ? JSON.stringify(data.payload)
            : null
        ]
      );

    return result.insertId;
  }


  // =========================================================
  // Créer uniquement si l'événement n'existe pas
  // =========================================================

  static async createIfNotExists(
    data: {
      provider: string;
      event_id: string;
      event_type: string;
      paiement_id?: number | null;
      reference_interne?: string | null;
      payload?: Record<string, unknown> | null;
    },
    connection: Pool | PoolConnection = db
  ): Promise<PaiementWebhookEventRow | null> {

    try {

      const id =
        await this.create(
          data,
          connection
        );

      return await this.findById(
        id,
        connection
      );

    } catch (error) {

      const mysqlError =
        error as {
          code?: string;
        };

      if (
        mysqlError.code ===
        "ER_DUP_ENTRY"
      ) {

        return null;
      }

      throw error;
    }
  }


  // =========================================================
  // Marquer un événement comme traité
  // =========================================================

  static async markAsProcessed(
    id: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
      UPDATE paiement_webhook_events
      SET processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        id
      ]
    );
  }
}