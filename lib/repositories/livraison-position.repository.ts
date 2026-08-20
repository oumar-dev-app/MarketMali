import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

export interface LivraisonPosition {
  id: number;
  livraison_id: number;
  livreur_id: number;
  latitude: number;
  longitude: number;
  precision_gps: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface LivraisonPositionRow
  extends LivraisonPosition,
    RowDataPacket {}

export class LivraisonPositionRepository {

  /**
   * Créer ou mettre à jour la position actuelle
   * d'une livraison.
   */
  static async upsert(
    data: {
      livraison_id: number;
      livreur_id: number;
      latitude: number;
      longitude: number;
      precision_gps?: number | null;
    },
    connection?: PoolConnection
  ): Promise<void> {

    const executor = connection ?? db;

    await executor.execute<ResultSetHeader>(
      `
      INSERT INTO livraison_positions (
        livraison_id,
        livreur_id,
        latitude,
        longitude,
        precision_gps
      )
      VALUES (?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        livreur_id = VALUES(livreur_id),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        precision_gps = VALUES(precision_gps),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        data.livraison_id,
        data.livreur_id,
        data.latitude,
        data.longitude,
        data.precision_gps ?? null,
      ]
    );
  }

  /**
   * Récupérer la position actuelle
   * d'une livraison.
   */
  static async findByLivraisonId(
    livraison_id: number
  ): Promise<LivraisonPositionRow | null> {

    const [rows] =
      await db.query<LivraisonPositionRow[]>(
        `
        SELECT *
        FROM livraison_positions
        WHERE livraison_id = ?
        LIMIT 1
        `,
        [livraison_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Supprimer la position d'une livraison.
   */
  static async deleteByLivraisonId(
    livraison_id: number,
    connection?: PoolConnection
  ): Promise<void> {

    const executor = connection ?? db;

    await executor.execute<ResultSetHeader>(
      `
      DELETE FROM livraison_positions
      WHERE livraison_id = ?
      `,
      [livraison_id]
    );
  }
}
