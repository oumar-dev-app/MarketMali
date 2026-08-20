import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface TarifLivraison {
  id: number;
  boutique_id: number;
  zone: string;
  frais: number;
  created_at: Date;
  updated_at: Date;
}

export interface TarifLivraisonRow
  extends TarifLivraison,
  RowDataPacket { }

export class TarifLivraisonRepository {

  static async findById(
    id: number
  ): Promise<TarifLivraisonRow | null> {

    const [rows] =
      await db.query<TarifLivraisonRow[]>(
        `
        SELECT *
        FROM tarifs_livraison
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows.length ? rows[0] : null;
  }


  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<TarifLivraisonRow[]> {

    const [rows] =
      await db.query<TarifLivraisonRow[]>(
        `
        SELECT *
        FROM tarifs_livraison
        WHERE boutique_id = ?
        ORDER BY zone ASC
        `,
        [boutique_id]
      );

    return rows;
  }


static async findByBoutiqueAndZone(
  boutique_id: number,
  zone: string
): Promise<TarifLivraisonRow | null> {

  const [rows] =
    await db.query<TarifLivraisonRow[]>(
      `
      SELECT *
      FROM tarifs_livraison
      WHERE boutique_id = ?
      AND zone = ?
      LIMIT 1
      `,
      [
        boutique_id,
        zone
      ]
    );

  return rows.length
    ? rows[0]
    : null;
}

  static async create(
    data: {
      boutique_id: number;
      zone: string;
      frais: number;
    }
  ): Promise<number> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO tarifs_livraison
        (
          boutique_id,
          zone,
          frais
        )
        VALUES (?, ?, ?)
        `,
        [
          data.boutique_id,
          data.zone,
          data.frais
        ]
      );

    return result.insertId;
  }


  static async update(
    id: number,
    data: {
      zone?: string;
      frais?: number;
    }
  ) {

    const allowedFields: (
      keyof typeof data
    )[] = [
        "zone",
        "frais"
      ];

    const fields =
      allowedFields.filter(
        field => data[field] !== undefined
      );

    if (!fields.length) {
      return;
    }

    const values =
      fields.map(
        field => data[field] ?? null
      );

    const sql = `
      UPDATE tarifs_livraison
      SET
        ${fields
        .map(field => `${field} = ?`)
        .join(", ")}
      WHERE id = ?
    `;

    await db.execute(
      sql,
      [
        ...values,
        id
      ]
    );
  }


  static async delete(
    id: number
  ) {

    await db.execute(
      `
      DELETE FROM tarifs_livraison
      WHERE id = ?
      `,
      [id]
    );
  }
}
