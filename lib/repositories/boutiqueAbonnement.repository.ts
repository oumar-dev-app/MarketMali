import { RowDataPacket } from "mysql2";
import { db } from "../db";

export interface BoutiqueAbonnementRow extends RowDataPacket {
  id: number;
  uuid: string;
  user_id: number;
  boutique_id: number;
  created_at: Date;
}

export class BoutiqueAbonnementRepository {
  static async create(
    uuid: string,
    userId: number,
    boutiqueId: number
  ): Promise<BoutiqueAbonnementRow> {
    const [result] = await db.execute(
      `
      INSERT INTO boutique_abonnements (
        uuid,
        user_id,
        boutique_id
      )
      VALUES (?, ?, ?)
      `,
      [uuid, userId, boutiqueId]
    );

    const insertId = (result as { insertId: number }).insertId;

    const abonnement = await this.findById(insertId);

    if (!abonnement) {
      throw new Error(
        "Abonnement boutique introuvable après création."
      );
    }

    return abonnement;
  }

  static async findById(
    id: number
  ): Promise<BoutiqueAbonnementRow | null> {
    const [rows] = await db.query<BoutiqueAbonnementRow[]>(
      `
      SELECT *
      FROM boutique_abonnements
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  static async findByUserAndBoutique(
    userId: number,
    boutiqueId: number
  ): Promise<BoutiqueAbonnementRow | null> {
    const [rows] = await db.query<BoutiqueAbonnementRow[]>(
      `
      SELECT *
      FROM boutique_abonnements
      WHERE user_id = ?
        AND boutique_id = ?
      LIMIT 1
      `,
      [userId, boutiqueId]
    );

    return rows.length ? rows[0] : null;
  }

  static async findByUuid(
    uuid: string
  ): Promise<BoutiqueAbonnementRow | null> {
    const [rows] = await db.query<BoutiqueAbonnementRow[]>(
      `
      SELECT *
      FROM boutique_abonnements
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    return rows.length ? rows[0] : null;
  }

  static async deleteByUserAndBoutique(
    userId: number,
    boutiqueId: number
  ): Promise<void> {
    await db.execute(
      `
      DELETE FROM boutique_abonnements
      WHERE user_id = ?
        AND boutique_id = ?
      `,
      [userId, boutiqueId]
    );
  }

  static async findAllByUser(
    userId: number
  ): Promise<BoutiqueAbonnementRow[]> {
    const [rows] = await db.query<BoutiqueAbonnementRow[]>(
      `
      SELECT *
      FROM boutique_abonnements
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows;
  }

  static async countByBoutique(
    boutiqueId: number
  ): Promise<number> {
    const [rows] = await db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `
      SELECT COUNT(*) AS total
      FROM boutique_abonnements
      WHERE boutique_id = ?
      `,
      [boutiqueId]
    );

    return Number(rows[0]?.total ?? 0);
  }

  static async countByUser(
    userId: number
  ): Promise<number> {
    const [rows] = await db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `
      SELECT COUNT(*) AS total
      FROM boutique_abonnements
      WHERE user_id = ?
      `,
      [userId]
    );

    return Number(rows[0]?.total ?? 0);
  }

  static async findUserIdsByBoutique(
    boutiqueId: number
  ): Promise<number[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `
    SELECT user_id
    FROM boutique_abonnements
    WHERE boutique_id = ?
    `,
      [boutiqueId]
    );

    return rows.map((row) => Number(row.user_id));
  }
}
