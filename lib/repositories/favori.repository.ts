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
  ): Promise<
    Array<
      FavoriRow & {
        produit_uuid: string;
        produit_nom: string;
        produit_slug: string;
        produit_prix: string;
        produit_image: string | null;
        produit_stock: number;
        produit_status: string;
        boutique_id: number;
        boutique_nom: string;
        boutique_slug: string;
      }
    >
  > {
    const [rows] = await db.query<
      Array<
        FavoriRow & {
          produit_uuid: string;
          produit_nom: string;
          produit_slug: string;
          produit_prix: string;
          produit_image: string | null;
          produit_stock: number;
          produit_status: string;
          boutique_id: number;
          boutique_nom: string;
          boutique_slug: string;
        }
      >
    >(
      `
    SELECT
      f.id,
      f.uuid,
      f.user_id,
      f.produit_id,
      f.created_at,

      p.uuid AS produit_uuid,
      p.nom AS produit_nom,
      p.slug AS produit_slug,
      p.prix AS produit_prix,
      p.image AS produit_image,
      p.stock AS produit_stock,
      p.status AS produit_status,

      b.id AS boutique_id,
      b.nom AS boutique_nom,
      b.slug AS boutique_slug

    FROM favoris f

    INNER JOIN produits p
      ON p.id = f.produit_id

    INNER JOIN boutiques b
      ON b.id = p.boutique_id

    WHERE f.user_id = ?

    ORDER BY f.created_at DESC
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
