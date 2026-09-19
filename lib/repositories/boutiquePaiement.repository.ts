import {
  ResultSetHeader,
  Pool,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";
import {
  BoutiquePaiementCompteRow,
  BoutiquePaiementProvider,
} from "../types/boutiquePaiement";

export class BoutiquePaiementRepository {
  static async findById(
    id: number
  ): Promise<BoutiquePaiementCompteRow | null> {
    const [rows] = await db.query<BoutiquePaiementCompteRow[]>(
      `
      SELECT *
      FROM boutique_paiement_comptes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<BoutiquePaiementCompteRow[]> {
    const [rows] = await db.query<BoutiquePaiementCompteRow[]>(
      `
      SELECT *
      FROM boutique_paiement_comptes
      WHERE boutique_id = ?
      ORDER BY provider ASC
      `,
      [boutique_id]
    );

    return rows;
  }

  static async findByBoutiqueAndProvider(
    boutique_id: number,
    provider: BoutiquePaiementProvider
  ): Promise<BoutiquePaiementCompteRow | null> {
    const [rows] = await db.query<BoutiquePaiementCompteRow[]>(
      `
      SELECT *
      FROM boutique_paiement_comptes
      WHERE boutique_id = ?
        AND provider = ?
      LIMIT 1
      `,
      [boutique_id, provider]
    );

    return rows.length ? rows[0] : null;
  }

  static async findActiveByBoutiqueAndProvider(
    boutique_id: number,
    provider: BoutiquePaiementProvider
  ): Promise<BoutiquePaiementCompteRow | null> {
    const [rows] = await db.query<BoutiquePaiementCompteRow[]>(
      `
      SELECT *
      FROM boutique_paiement_comptes
      WHERE boutique_id = ?
        AND provider = ?
        AND actif = 1
      LIMIT 1
      `,
      [boutique_id, provider]
    );

    return rows.length ? rows[0] : null;
  }

  static async create(
    data: {
      boutique_id: number;
      provider: BoutiquePaiementProvider;
      numero: string;
      nom_compte?: string | null;
      actif?: boolean;
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO boutique_paiement_comptes
      (
        boutique_id,
        provider,
        numero,
        nom_compte,
        actif
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.boutique_id,
        data.provider,
        data.numero,
        data.nom_compte ?? null,
        (data.actif ?? true) ? 1 : 0,
      ]
    );

    return result.insertId;
  }

  static async update(
    id: number,
    data: {
      numero?: string;
      nom_compte?: string | null;
      actif?: boolean;
    },
    connection: Pool | PoolConnection = db
  ): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.numero !== undefined) {
      fields.push("numero = ?");
      values.push(data.numero);
    }

    if (data.nom_compte !== undefined) {
      fields.push("nom_compte = ?");
      values.push(data.nom_compte);
    }

    if (data.actif !== undefined) {
      fields.push("actif = ?");
      values.push(data.actif ? 1 : 0);
    }

    if (!fields.length) {
      return;
    }

    values.push(id);

    await connection.execute(
      `
      UPDATE boutique_paiement_comptes
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values
    );
  }

  static async delete(
    id: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {
    await connection.execute(
      `
      DELETE FROM boutique_paiement_comptes
      WHERE id = ?
      `,
      [id]
    );
  }
}
