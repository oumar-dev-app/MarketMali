import {
  ResultSetHeader,
  Pool,
  PoolConnection
} from "mysql2/promise";

import { db } from "../db";
import {
  Paiement,
  PaiementMethode,
  PaiementRow,
  PaiementStatut
} from "../types/paiement";

export class PaiementRepository {

  static async findById(
    id: number
  ): Promise<PaiementRow | null> {

    const [rows] =
      await db.query<PaiementRow[]>(
        `
        SELECT *
        FROM paiements
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
    uuid: string
  ): Promise<PaiementRow | null> {

    const [rows] =
      await db.query<PaiementRow[]>(
        `
        SELECT *
        FROM paiements
        WHERE uuid = ?
        LIMIT 1
        `,
        [uuid]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByReferenceInterne(
    reference_interne: string
  ): Promise<PaiementRow | null> {

    const [rows] =
      await db.query<PaiementRow[]>(
        `
      SELECT *
      FROM paiements
      WHERE reference_interne = ?
      LIMIT 1
      `,
        [reference_interne]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  static async findByCommandeId(
    commande_id: number
  ): Promise<PaiementRow[]> {

    const [rows] =
      await db.query<PaiementRow[]>(
        `
        SELECT *
        FROM paiements
        WHERE commande_id = ?
        ORDER BY created_at DESC
        `,
        [commande_id]
      );

    return rows;
  }


  static async findPendingByCommandeId(
    commande_id: number
  ): Promise<PaiementRow | null> {

    const [rows] =
      await db.query<PaiementRow[]>(
        `
        SELECT *
        FROM paiements
        WHERE commande_id = ?
          AND statut = 'pending'
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [commande_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  static async create(
    data: {
      uuid: string;
      commande_id: number;
      client_id: number;
      boutique_id: number;

      methode: PaiementMethode;
      statut?: PaiementStatut;

      montant: number;
      devise?: string;

      provider?: string | null;

      reference_interne: string;
      reference_externe?: string | null;

      telephone?: string | null;

      metadata?: Record<string, unknown> | null;
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO paiements
        (
          uuid,
          commande_id,
          client_id,
          boutique_id,
          methode,
          statut,
          montant,
          devise,
          provider,
          reference_interne,
          reference_externe,
          telephone,
          metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,

          data.commande_id,

          data.client_id,

          data.boutique_id,

          data.methode,

          data.statut ?? "pending",

          data.montant,

          data.devise ?? "XOF",

          data.provider ?? null,

          data.reference_interne,

          data.reference_externe ?? null,

          data.telephone ?? null,

          data.metadata
            ? JSON.stringify(data.metadata)
            : null
        ]
      );

    return result.insertId;
  }


  static async updateStatus(
    id: number,
    statut: PaiementStatut,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    let timestampField: string | null = null;

    if (statut === "paid") {
      timestampField = "paid_at";
    } else if (statut === "failed") {
      timestampField = "failed_at";
    } else if (statut === "cancelled") {
      timestampField = "cancelled_at";
    } else if (statut === "refunded") {
      timestampField = "refunded_at";
    }

    if (timestampField) {

      await connection.execute(
        `
        UPDATE paiements
        SET
          statut = ?,
          ${timestampField} = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
          statut,
          id
        ]
      );

    } else {

      await connection.execute(
        `
        UPDATE paiements
        SET statut = ?
        WHERE id = ?
        `,
        [
          statut,
          id
        ]
      );
    }
  }


  static async updateExternalReference(
    id: number,
    reference_externe: string,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
      UPDATE paiements
      SET reference_externe = ?
      WHERE id = ?
      `,
      [
        reference_externe,
        id
      ]
    );
  }

  static async updateMetadata(
    id: number,
    metadata: Record<string, unknown>,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
    UPDATE paiements
    SET metadata = ?
    WHERE id = ?
    `,
      [
        JSON.stringify(metadata),
        id
      ]
    );
  }

}
