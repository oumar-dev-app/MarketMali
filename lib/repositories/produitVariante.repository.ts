import {
  ResultSetHeader,
  RowDataPacket,
  Pool,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

export interface ProduitVarianteRow
  extends RowDataPacket {
  id: number;
  uuid: string;
  produit_id: number;
  nom: string;
  image_url: string | null;
  stock: number;
  ordre: number;
  created_at: Date;
  updated_at: Date;
}

export class ProduitVarianteRepository {

  static async findById(
    id: number,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow | null> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE id = ?
                LIMIT 1
                `,
        [id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByUUID(
    uuid: string,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow | null> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE uuid = ?
                LIMIT 1
                `,
        [uuid]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByIdAndProduitId(
    id: number,
    produit_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow | null> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE id = ?
                AND produit_id = ?
                LIMIT 1
                `,
        [id, produit_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByUUIDAndProduitId(
    uuid: string,
    produit_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow | null> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE uuid = ?
                AND produit_id = ?
                LIMIT 1
                `,
        [uuid, produit_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByProduitId(
    produit_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow[]> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE produit_id = ?
                ORDER BY ordre ASC, id ASC
                `,
        [produit_id]
      );

    return rows;
  }

  static async findByProduitIdAndNom(
    produit_id: number,
    nom: string,
    connection: Pool | PoolConnection = db
  ): Promise<ProduitVarianteRow | null> {

    const [rows] =
      await connection.query<
        ProduitVarianteRow[]
      >(
        `
                SELECT
                    id,
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variantes
                WHERE produit_id = ?
                AND nom = ?
                LIMIT 1
                `,
        [produit_id, nom]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async create(
    data: {
      uuid: string;
      produit_id: number;
      nom: string;
      stock: number;
      ordre?: number;
      image_url?: string | null;
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
                INSERT INTO produit_variantes (
                    uuid,
                    produit_id,
                    nom,
                    image_url,
                    stock,
                    ordre
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
        [
          data.uuid,
          data.produit_id,
          data.nom,
          data.image_url ?? null,
          data.stock,
          data.ordre ?? 0,
        ]
      );

    return result.insertId;
  }

  static async update(
    id: number,
    data: {
      nom?: string;
      stock?: number;
      ordre?: number;
      image_url?: string | null;
    },
    connection: Pool | PoolConnection = db
  ): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    if (data.stock !== undefined) {
      fields.push("stock = ?");
      values.push(data.stock);
    }

    if (data.ordre !== undefined) {
      fields.push("ordre = ?");
      values.push(data.ordre);
    }

    if (data.image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(data.image_url);
    }

    if (!fields.length) return;

    values.push(id);

    await connection.execute(
      `UPDATE produit_variantes
         SET ${fields.join(", ")}
         WHERE id = ?`,
      values
    );
  }

  static async delete(
    id: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
            DELETE FROM produit_variantes
            WHERE id = ?
            `,
      [id]
    );
  }

  static async decreaseStock(
    id: number,
    quantite: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
                UPDATE produit_variantes
                SET stock = stock - ?
                WHERE id = ?
                AND stock >= ?
                `,
        [quantite, id, quantite]
      );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Stock insuffisant ou variante introuvable."
      );
    }
  }

  static async increaseStock(
    id: number,
    quantite: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
                UPDATE produit_variantes
                SET stock = stock + ?
                WHERE id = ?
                `,
        [quantite, id]
      );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Variante introuvable."
      );
    }
  }
}
