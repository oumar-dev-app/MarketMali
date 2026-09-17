import { RowDataPacket } from "mysql2";
import { db } from "../db";

export interface FavoriRow extends RowDataPacket {
  id: number;
  uuid: string;
  user_id: number;
  produit_id: number;
  created_at: Date;
}

export class FavoriRepository {
  static async create(
    uuid: string,
    userId: number,
    produitId: number
  ): Promise<FavoriRow> {
    const [result] = await db.execute(
      `
      INSERT INTO favoris (
        uuid,
        user_id,
        produit_id
      )
      VALUES (?, ?, ?)
      `,
      [uuid, userId, produitId]
    );

    const insertId = (result as { insertId: number }).insertId;

    const favori = await this.findById(insertId);

    if (!favori) {
      throw new Error("Favori introuvable après création.");
    }

    return favori;
  }

  static async findById(id: number): Promise<FavoriRow | null> {
    const [rows] = await db.query<FavoriRow[]>(
      `
      SELECT *
      FROM favoris
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  static async findByUserAndProduit(
    userId: number,
    produitId: number
  ): Promise<FavoriRow | null> {
    const [rows] = await db.query<FavoriRow[]>(
      `
      SELECT *
      FROM favoris
      WHERE user_id = ?
        AND produit_id = ?
      LIMIT 1
      `,
      [userId, produitId]
    );

    return rows.length ? rows[0] : null;
  }

  static async findByUuid(uuid: string): Promise<FavoriRow | null> {
    const [rows] = await db.query<FavoriRow[]>(
      `
      SELECT *
      FROM favoris
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    return rows.length ? rows[0] : null;
  }

  static async deleteByUserAndProduit(
    userId: number,
    produitId: number
  ): Promise<void> {
    await db.execute(
      `
      DELETE FROM favoris
      WHERE user_id = ?
        AND produit_id = ?
      `,
      [userId, produitId]
    );
  }

  static async findAllByUser(
    userId: number
  ): Promise<FavoriRow[]> {
    const [rows] = await db.query<FavoriRow[]>(
      `
      SELECT *
      FROM favoris
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows;
  }

  static async countByProduit(produitId: number): Promise<number> {
    const [rows] = await db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `
      SELECT COUNT(*) AS total
      FROM favoris
      WHERE produit_id = ?
      `,
      [produitId]
    );

    return Number(rows[0]?.total ?? 0);
  }

  static async countByUser(userId: number): Promise<number> {
    const [rows] = await db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `
      SELECT COUNT(*) AS total
      FROM favoris
      WHERE user_id = ?
      `,
      [userId]
    );

    return Number(rows[0]?.total ?? 0);
  }
}
