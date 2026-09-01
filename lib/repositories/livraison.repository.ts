import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";


import { db } from "../db";

export type LivraisonStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivery_pending_confirmation"
  | "delivered"
  | "cancelled";

export interface Livraison {
  id: number;
  uuid: string;
  commande_id: number;
  livreur_id: number;
  status: LivraisonStatus;
  commentaire: string | null;

  assigned_at: Date | null;
  picked_up_at: Date | null;
  in_transit_at: Date | null;
  delivery_pending_confirmation_at: Date | null;
  delivered_at: Date | null;
  cancelled_at: Date | null;

  created_at: Date | null;
  updated_at: Date | null;
}

export interface LivraisonRow
  extends Livraison,
  RowDataPacket { }

export interface LivraisonDetailRow
  extends LivraisonRow {
  commande_uuid: string;
  commande_total: string;
  commande_status: string;

  zone_livraison: string;
  adresse_livraison: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_precision: number | null;

  client_id: number;
  client_uuid: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  client_email: string;

  livreur_uuid: string;
  livreur_nom: string;
  livreur_prenom: string;
  livreur_telephone: string;
  livreur_vehicule: string | null;
}

export class LivraisonRepository {

  /**
   * Créer une livraison
   */
  static async create(
    data: {
      uuid: string;
      commande_id: number;
      livreur_id: number;
    },
    connection?: PoolConnection
  ): Promise<number> {

    const executor = connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
      INSERT INTO livraisons (
        uuid,
        commande_id,
        livreur_id,
        status,
        assigned_at
      )
      VALUES (
        ?, ?, ?, 'assigned', CURRENT_TIMESTAMP
      )
      `,
        [
          data.uuid,
          data.commande_id,
          data.livreur_id,
        ]
      );

    return result.insertId;
  }

  /**
   * Récupérer une livraison par son ID
   */
  static async findById(
    id: number,
    connection?: PoolConnection
  ): Promise<LivraisonRow | null> {

    const executor =
      connection ?? db;

    const [rows] =
      await executor.query<LivraisonRow[]>(
        `
      SELECT *
      FROM livraisons
      WHERE id = ?
      LIMIT 1
      `,
        [id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Récupérer une livraison par UUID
   */
  static async findByUUID(
    uuid: string
  ): Promise<LivraisonDetailRow | null> {

    const [rows] =
      await db.query<LivraisonDetailRow[]>(
        `
        SELECT

          l.*,

          c.uuid AS commande_uuid,
          c.client_id AS client_id,
          c.total AS commande_total,
          c.status AS commande_status,

          c.zone_livraison,
          c.adresse_livraison,
          c.latitude,
          c.longitude,
          c.gps_precision,

          u.uuid AS client_uuid,
          u.nom AS client_nom,
          u.prenom AS client_prenom,
          u.telephone AS client_telephone,
          u.email AS client_email,

          lv.uuid AS livreur_uuid,
          lv.nom AS livreur_nom,
          lv.prenom AS livreur_prenom,
          lv.telephone AS livreur_telephone,
          lv.vehicule AS livreur_vehicule

        FROM livraisons l

        INNER JOIN commandes c
          ON c.id = l.commande_id

        INNER JOIN users u
          ON u.id = c.client_id

        INNER JOIN livreurs lv
          ON lv.id = l.livreur_id

        WHERE l.uuid = ?

        LIMIT 1
        `,
        [uuid]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Récupérer la livraison d'une commande
   */
  static async findByCommandeId(
    commande_id: number,
    connection?: PoolConnection
  ): Promise<LivraisonRow | null> {

    const executor = connection ?? db;

    const [rows] =
      await executor.query<LivraisonRow[]>(
        `
        SELECT *
        FROM livraisons
        WHERE commande_id = ?
        LIMIT 1
        `,
        [commande_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
 * Récupérer toutes les livraisons.
 */
  static async findAll(): Promise<LivraisonDetailRow[]> {

    const [rows] =
      await db.query<LivraisonDetailRow[]>(
        `
      SELECT

        l.*,

        c.uuid AS commande_uuid,
        c.total AS commande_total,
        c.status AS commande_status,

        c.zone_livraison,
        c.adresse_livraison,
        c.latitude,
        c.longitude,
        c.gps_precision,

        u.uuid AS client_uuid,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email,

        lv.uuid AS livreur_uuid,
        lv.nom AS livreur_nom,
        lv.prenom AS livreur_prenom,
        lv.telephone AS livreur_telephone,
        lv.vehicule AS livreur_vehicule

      FROM livraisons l

      INNER JOIN commandes c
        ON c.id = l.commande_id

      INNER JOIN users u
        ON u.id = c.client_id

      INNER JOIN livreurs lv
        ON lv.id = l.livreur_id

      ORDER BY l.created_at DESC
      `
      );

    return rows;
  }

  /**
   * Récupérer les livraisons d'une boutique.
   */
  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<LivraisonDetailRow[]> {

    const [rows] =
      await db.query<LivraisonDetailRow[]>(
        `
      SELECT

        l.*,

        c.uuid AS commande_uuid,
        c.total AS commande_total,
        c.status AS commande_status,

        c.zone_livraison,
        c.adresse_livraison,
        c.latitude,
        c.longitude,
        c.gps_precision,

        u.uuid AS client_uuid,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email,

        lv.uuid AS livreur_uuid,
        lv.nom AS livreur_nom,
        lv.prenom AS livreur_prenom,
        lv.telephone AS livreur_telephone,
        lv.vehicule AS livreur_vehicule

      FROM livraisons l

      INNER JOIN commandes c
        ON c.id = l.commande_id

      INNER JOIN users u
        ON u.id = c.client_id

      INNER JOIN livreurs lv
        ON lv.id = l.livreur_id

      WHERE c.boutique_id = ?

      ORDER BY l.created_at DESC
      `,
        [boutique_id]
      );

    return rows;
  }

  /**
   * Récupérer toutes les livraisons d'un livreur
   */
  static async findByLivreurId(
    livreur_id: number
  ): Promise<LivraisonDetailRow[]> {

    const [rows] =
      await db.query<LivraisonDetailRow[]>(
        `
      SELECT

        l.*,

        c.uuid AS commande_uuid,
        c.total AS commande_total,
        c.status AS commande_status,

        c.zone_livraison,
        c.adresse_livraison,
        c.latitude,
        c.longitude,
        c.gps_precision,

        u.uuid AS client_uuid,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email,

        lv.uuid AS livreur_uuid,
        lv.nom AS livreur_nom,
        lv.prenom AS livreur_prenom,
        lv.telephone AS livreur_telephone,
        lv.vehicule AS livreur_vehicule

      FROM livraisons l

      INNER JOIN commandes c
        ON c.id = l.commande_id

      INNER JOIN users u
        ON u.id = c.client_id

      INNER JOIN livreurs lv
        ON lv.id = l.livreur_id

      WHERE l.livreur_id = ?

      ORDER BY l.created_at DESC
      `,
        [livreur_id]
      );

    return rows;
  }
  /**
   * Récupérer les livraisons actives d'un livreur
   *
   * Retourne uniquement :
   * - assigned
   * - picked_up
   * - in_transit
   *
   * Avec les informations complètes de la commande,
   * du client et du livreur.
   */
  static async findActiveByLivreurId(
    livreur_id: number
  ): Promise<LivraisonDetailRow[]> {

    const [rows] =
      await db.query<LivraisonDetailRow[]>(
        `
      SELECT

        l.*,

        c.uuid AS commande_uuid,
        c.total AS commande_total,
        c.status AS commande_status,

        c.zone_livraison,
        c.adresse_livraison,
        c.latitude,
        c.longitude,
        c.gps_precision,

        u.uuid AS client_uuid,
        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email,

        lv.uuid AS livreur_uuid,
        lv.nom AS livreur_nom,
        lv.prenom AS livreur_prenom,
        lv.telephone AS livreur_telephone,
        lv.vehicule AS livreur_vehicule

      FROM livraisons l

      INNER JOIN commandes c
        ON c.id = l.commande_id

      INNER JOIN users u
        ON u.id = c.client_id

      INNER JOIN livreurs lv
        ON lv.id = l.livreur_id

      WHERE l.livreur_id = ?
        AND l.status IN (
          'assigned',
          'picked_up',
          'in_transit',
          'delivery_pending_confirmation'
        )

      ORDER BY l.assigned_at ASC
      `,
        [livreur_id]
      );

    return rows;
  }

  /**
   * Mettre à jour le statut
   */
  static async updateStatus(
    id: number,
    status: LivraisonStatus,
    commentaire?: string | null,
    connection?: PoolConnection
  ): Promise<void> {

    const executor = connection ?? db;

    let query = "";
    let params: unknown[] = [];

    switch (status) {

      case "picked_up":

        query = `
          UPDATE livraisons
          SET
            status = ?,
            picked_up_at = COALESCE(
              picked_up_at,
              CURRENT_TIMESTAMP
            ),
            commentaire = COALESCE(?, commentaire)
          WHERE id = ?
        `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      case "in_transit":

        query = `
          UPDATE livraisons
          SET
            status = ?,
            in_transit_at = COALESCE(
              in_transit_at,
              CURRENT_TIMESTAMP
            ),
            commentaire = COALESCE(?, commentaire)
          WHERE id = ?
        `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      case "delivery_pending_confirmation":

        query = `
          UPDATE livraisons
          SET
            status = ?,
            delivery_pending_confirmation_at = COALESCE(
              delivery_pending_confirmation_at,
              CURRENT_TIMESTAMP
            ),
            commentaire = COALESCE(?, commentaire)
          WHERE id = ?
        `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      case "delivered":

        query = `
          UPDATE livraisons
          SET
            status = ?,
            delivered_at = COALESCE(
              delivered_at,
              CURRENT_TIMESTAMP
            ),
            commentaire = COALESCE(?, commentaire)
          WHERE id = ?
        `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      case "cancelled":

        query = `
          UPDATE livraisons
          SET
            status = ?,
            cancelled_at = COALESCE(
              cancelled_at,
              CURRENT_TIMESTAMP
            ),
            commentaire = COALESCE(?, commentaire)
          WHERE id = ?
        `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      case "assigned":

        query = `
      UPDATE livraisons
      SET
        status = ?,
        assigned_at = COALESCE(
          assigned_at,
          CURRENT_TIMESTAMP
        ),
        cancelled_at = NULL,
        commentaire = COALESCE(?, commentaire)
      WHERE id = ?
    `;

        params = [
          status,
          commentaire ?? null,
          id,
        ];

        break;

      default:
        throw new Error(
          `Statut de livraison invalide : ${status}`
        );
    }

    await executor.query<ResultSetHeader>(
      query,
      params
    );
  }

  /**
 * Changer le livreur affecté à une livraison
 */
  static async updateLivreur(
    id: number,
    livreur_id: number,
    connection?: PoolConnection
  ): Promise<void> {

    const executor = connection ?? db;

    await executor.execute<ResultSetHeader>(
      `
      UPDATE livraisons
      SET livreur_id = ?
      WHERE id = ?
      `,
      [
        livreur_id,
        id,
      ]
    );
  }

  /**
   * Mettre à jour le commentaire
   */
  static async updateCommentaire(
    id: number,
    commentaire: string | null
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      UPDATE livraisons
      SET commentaire = ?
      WHERE id = ?
      `,
      [
        commentaire,
        id,
      ]
    );
  }
}