import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { db } from "../db";


export interface AvisPurchaseRow
  extends RowDataPacket {

  commande_produit_id: number;

  commande_id: number;

  client_id: number;

  produit_id: number;

  boutique_id: number;

  commande_status:
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

}


export interface AvisRow
  extends RowDataPacket {

  id: number;

  uuid: string;

  commande_produit_id: number;

  client_id: number;

  produit_id: number;

  boutique_id: number;

  note: number;

  commentaire: string | null;

  status:
  | "published"
  | "pending"
  | "blocked";

  created_at: Date;

  updated_at: Date;

}

export interface AvisPublicRow
  extends RowDataPacket {

  uuid: string;

  commande_produit_id: number;

  produit_id: number;

  boutique_id: number;

  note: number;

  commentaire: string | null;

  status:
  | "published"
  | "pending"
  | "blocked";

  created_at: Date;

  updated_at: Date;

}


export class AvisRepository {


  /**
   * Vérifie qu'une ligne de commande appartient
   * réellement au client et récupère les informations
   * nécessaires à la création de l'avis.
   */
  static async findPurchaseForReview(
    commande_produit_id: number,
    client_id: number
  ): Promise<AvisPurchaseRow | null> {

    const [rows] =
      await db.query<AvisPurchaseRow[]>(
        `
        SELECT

          cp.id AS commande_produit_id,

          cp.commande_id,

          c.client_id,

          cp.produit_id,

          c.boutique_id,

          c.status AS commande_status

        FROM commande_produits cp

        INNER JOIN commandes c
          ON c.id = cp.commande_id

        WHERE cp.id = ?
          AND c.client_id = ?

        LIMIT 1
        `,
        [
          commande_produit_id,
          client_id
        ]
      );

    return rows.length
      ? rows[0]
      : null;

  }


  /**
   * Vérifie si un avis existe déjà
   * pour une ligne de commande.
   */
  static async findByCommandeProduitId(
    commande_produit_id: number
  ): Promise<AvisRow | null> {

    const [rows] =
      await db.query<AvisRow[]>(
        `
        SELECT *
        FROM avis
        WHERE commande_produit_id = ?
        LIMIT 1
        `,
        [
          commande_produit_id
        ]
      );

    return rows.length
      ? rows[0]
      : null;

  }

  /**
 * Récupère l'avis d'un client pour une ligne
 * de commande précise.
 *
 * La vérification du client est faite côté SQL
 * afin qu'un client ne puisse consulter que
 * son propre avis.
 */
  static async findByCommandeProduitIdAndClientId(
    commande_produit_id: number,
    client_id: number
  ): Promise<AvisRow | null> {

    const [rows] =
      await db.query<AvisRow[]>(
        `
        SELECT
          a.id,
          a.uuid,
          a.commande_produit_id,
          a.client_id,
          a.produit_id,
          a.boutique_id,
          a.note,
          a.commentaire,
          a.status,
          a.created_at,
          a.updated_at

        FROM avis a

        WHERE a.commande_produit_id = ?
          AND a.client_id = ?

        LIMIT 1
        `,
        [
          commande_produit_id,
          client_id
        ]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  /**
   * Crée un avis.
   */
  static async create(
    data: {
      uuid: string;
      commande_produit_id: number;
      client_id: number;
      produit_id: number;
      boutique_id: number;
      note: number;
      commentaire?: string | null;
      status?:
      | "published"
      | "pending"
      | "blocked";
    }
  ): Promise<number> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO avis
        (
          uuid,
          commande_produit_id,
          client_id,
          produit_id,
          boutique_id,
          note,
          commentaire,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,
          data.commande_produit_id,
          data.client_id,
          data.produit_id,
          data.boutique_id,
          data.note,
          data.commentaire ?? null,
          data.status ?? "published"
        ]
      );

    return result.insertId;

  }


  /**
   * Récupère les avis publiés d'un produit.
   */
  static async findPublishedByProduitId(
    produit_id: number
  ): Promise<AvisRow[]> {

    const [rows] =
      await db.query<AvisRow[]>(
        `
        SELECT *
        FROM avis
        WHERE produit_id = ?
          AND status = 'published'
        ORDER BY created_at DESC
        `,
        [
          produit_id
        ]
      );

    return rows;

  }


  /**
   * Récupère un avis par UUID.
   */
  static async findByUUID(
    uuid: string
  ): Promise<AvisRow | null> {

    const [rows] =
      await db.query<AvisRow[]>(
        `
        SELECT *
        FROM avis
        WHERE uuid = ?
        LIMIT 1
        `,
        [
          uuid
        ]
      );

    return rows.length
      ? rows[0]
      : null;

  }

  /**
 * Récupère les statistiques et les avis publiés
 * d'un produit à partir de son UUID.
 */
  static async findPublishedByProduitUUID(
    produit_uuid: string
  ): Promise<{
    produit_id: number;
    moyenne: number;
    total: number;
    repartition: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    avis: AvisPublicRow[];
  }> {

    const [statsRows] =
      await db.query<
        RowDataPacket[]
      >(
        `
        SELECT
          p.id AS produit_id,

          COALESCE(
            ROUND(AVG(a.note), 2),
            0
          ) AS moyenne,

          COUNT(a.id) AS total,

          SUM(
            CASE
              WHEN a.note = 1 THEN 1
              ELSE 0
            END
          ) AS note_1,

          SUM(
            CASE
              WHEN a.note = 2 THEN 1
              ELSE 0
            END
          ) AS note_2,

          SUM(
            CASE
              WHEN a.note = 3 THEN 1
              ELSE 0
            END
          ) AS note_3,

          SUM(
            CASE
              WHEN a.note = 4 THEN 1
              ELSE 0
            END
          ) AS note_4,

          SUM(
            CASE
              WHEN a.note = 5 THEN 1
              ELSE 0
            END
          ) AS note_5

        FROM produits p

        LEFT JOIN avis a
          ON a.produit_id = p.id
          AND a.status = 'published'

        WHERE p.uuid = ?

        GROUP BY p.id

        LIMIT 1
        `,
        [
          produit_uuid
        ]
      );

    if (!statsRows.length) {
      return {
        produit_id: 0,
        moyenne: 0,
        total: 0,
        repartition: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        avis: []
      };
    }

    const stats =
      statsRows[0];

    const [avisRows] =
      await db.query<AvisPublicRow[]>(
        `
    SELECT
      a.uuid,
      a.commande_produit_id,
      a.produit_id,
      a.boutique_id,
      a.note,
      a.commentaire,
      a.status,
      a.created_at,
      a.updated_at

    FROM avis a

    INNER JOIN produits p
      ON p.id = a.produit_id

    WHERE p.uuid = ?
      AND a.status = 'published'

    ORDER BY a.created_at DESC
    `,
        [
          produit_uuid
        ]
      );

    return {
      produit_id:
        Number(stats.produit_id),

      moyenne:
        Number(stats.moyenne),

      total:
        Number(stats.total),

      repartition: {
        1: Number(stats.note_1 ?? 0),
        2: Number(stats.note_2 ?? 0),
        3: Number(stats.note_3 ?? 0),
        4: Number(stats.note_4 ?? 0),
        5: Number(stats.note_5 ?? 0)
      },

      avis:
        avisRows
    };
  }


}
