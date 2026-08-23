import {
  ResultSetHeader,
  RowDataPacket,
  Pool,
  PoolConnection
} from "mysql2/promise";

import {
  Commande,
  UpdateCommandeDTO,
  CommandeStatus
} from "../types/commande";
import { db } from "../db";

export interface CommandeRow extends Commande, RowDataPacket { }

export interface CommandeDetailRow extends CommandeRow {

  livraison_uuid: string | null;
  livraison_status:
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivery_pending_confirmation"
  | "delivered"
  | "cancelled"
  | null;

  boutique_uuid: string;
  boutique_nom: string;
  boutique_slug: string;

  client_uuid: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  client_email: string;

  livreur_uuid: string | null;
  livreur_nom: string | null;
  livreur_prenom: string | null;
  livreur_telephone: string | null;
  livreur_vehicule: string | null;
  livreur_status: string | null;
  livreur_disponibilite: string | null;

  adresse_livraison: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_precision: number | null;
}

export class CommandeRepository {

  static async findById(
    id: number
  ): Promise<CommandeRow | null> {

    const [rows] =
      await db.query<CommandeRow[]>(
        `
        SELECT *
        FROM commandes
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows.length ? rows[0] : null;

  }

static async findByUUID(
  uuid: string
): Promise<CommandeDetailRow | null> {

const [rows] =
  await db.query<CommandeDetailRow[]>(
    `
    SELECT

      c.*,

      b.uuid AS boutique_uuid,
      b.nom AS boutique_nom,
      b.slug AS boutique_slug,

      u.uuid AS client_uuid,
      u.nom AS client_nom,
      u.prenom AS client_prenom,
      u.telephone AS client_telephone,
      u.email AS client_email,

      liv.uuid AS livraison_uuid,
      liv.status AS livraison_status,

      c.adresse_livraison,
      c.latitude,
      c.longitude,
      c.gps_precision,

      l.uuid AS livreur_uuid,
      l.nom AS livreur_nom,
      l.prenom AS livreur_prenom,
      l.telephone AS livreur_telephone,
      l.vehicule AS livreur_vehicule,
      l.status AS livreur_status,
      l.disponibilite AS livreur_disponibilite

    FROM commandes c

    INNER JOIN boutiques b
      ON b.id = c.boutique_id

    INNER JOIN users u
      ON u.id = c.client_id

    LEFT JOIN livreurs l
      ON l.id = c.livreur_id

    LEFT JOIN livraisons liv
      ON liv.commande_id = c.id

    WHERE c.uuid = ?

    LIMIT 1
    `,
    [uuid]
  );

  return rows.length
    ? rows[0]
    : null;
}

  static async countPendingByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
      SELECT COUNT(*) AS total

      FROM commandes

      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      AND commandes.status = 'pending'
      `,
        [user_id]
      );

    return Number(rows[0].total);

  }

  static async findDetailsByUserId(
    user_id: number
  ): Promise<any[]> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT

        c.uuid,
        c.total,
        c.status,
        c.created_at,
        c.updated_at,

        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email

      FROM commandes c
      INNER JOIN boutiques b
        ON c.boutique_id = b.id
      INNER JOIN users u
        ON c.client_id = u.id
      WHERE b.user_id = ?
      ORDER BY c.created_at DESC
      `,
        [
          user_id
        ]
      );

    return rows;

  }

  static async countByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT COUNT(*) AS total
      FROM commandes
      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id
      WHERE boutiques.user_id = ?
      `,
        [
          user_id
        ]
      );

    return Number(rows[0].total);

  }

  static async countStatusesByUser(
    user_id: number
  ): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT
        COUNT(*) AS total,

        SUM(
          CASE
            WHEN commandes.status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending,

        SUM(
          CASE
            WHEN commandes.status = 'confirmed'
            THEN 1
            ELSE 0
          END
        ) AS confirmed,

        SUM(
          CASE
            WHEN commandes.status = 'preparing'
            THEN 1
            ELSE 0
          END
        ) AS preparing,

        SUM(
          CASE
            WHEN commandes.status = 'shipped'
            THEN 1
            ELSE 0
          END
        ) AS shipped,

        SUM(
          CASE
            WHEN commandes.status = 'delivered'
            THEN 1
            ELSE 0
          END
        ) AS delivered,

        SUM(
          CASE
            WHEN commandes.status = 'cancelled'
            THEN 1
            ELSE 0
          END
        ) AS cancelled

      FROM commandes

      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      `,
        [user_id]
      );

    const row = rows[0];

    return {
      total: Number(row.total),
      pending: Number(row.pending),
      confirmed: Number(row.confirmed),
      preparing: Number(row.preparing),
      shipped: Number(row.shipped),
      delivered: Number(row.delivered),
      cancelled: Number(row.cancelled)
    };
  }

  static async countDeliveredByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT COUNT(*) AS total

      FROM commandes

      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      AND commandes.status = 'delivered'
      `,
        [
          user_id
        ]
      );

    return Number(rows[0].total);

  }

  static async sumDeliveredByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT COALESCE(SUM(commandes.total), 0) AS total
      FROM commandes

      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      AND commandes.status = 'delivered'
      `,
        [
          user_id
        ]
      );


    return Number(rows[0].total);

  }


  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<CommandeRow[]> {

    const [rows] =
      await db.query<CommandeRow[]>(
        `
        SELECT *
        FROM commandes
        WHERE boutique_id = ?
        ORDER BY created_at DESC
        `,
        [boutique_id]
      );

    return rows;

  }

  static async findByClientId(
    client_id: number,
    limit: number = 20,
    offset: number = 0,
    search: string = "",
    status?: string
  ): Promise<any[]> {

    let sql = `
    SELECT
      c.uuid,
      c.total,
      c.frais_livraison,
      c.status,
      c.zone_livraison,
      c.adresse_livraison,
      c.latitude,
      c.longitude,
      c.gps_precision,
      c.created_at,
      c.updated_at,

      b.nom AS boutique_nom,
      b.slug AS boutique_slug,

      (
        SELECT COUNT(*)
        FROM commande_produits cp
        WHERE cp.commande_id = c.id
      ) AS nombre_articles

    FROM commandes c

    LEFT JOIN boutiques b
      ON c.boutique_id = b.id

    WHERE c.client_id = ?
  `;

    const params: any[] = [client_id];

    /*
     * Recherche
     */
    if (search.trim()) {

      sql += `
      AND (
        c.uuid LIKE ?
        OR b.nom LIKE ?
      )
    `;

      const value = `%${search.trim()}%`;

      params.push(
        value,
        value
      );
    }

    /*
     * Filtre statut
     */
    if (status) {

      sql += `
      AND c.status = ?
    `;

      params.push(status);
    }

    sql += `
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;

    params.push(
      limit,
      offset
    );

    const [rows] =
      await db.query<any[]>(
        sql,
        params
      );

    return rows.map((commande) => ({

      uuid: commande.uuid,

      total: commande.total,

      frais_livraison:
        commande.frais_livraison,

      status:
        commande.status,

      zone_livraison:
        commande.zone_livraison,

      adresse_livraison:
        commande.adresse_livraison,

      latitude:
        commande.latitude,

      longitude:
        commande.longitude,

      gps_precision:
        commande.gps_precision,

      created_at:
        commande.created_at,

      updated_at:
        commande.updated_at,

      nombre_articles:
        Number(
          commande.nombre_articles
        ) || 0,

      boutique: {
        nom:
          commande.boutique_nom ??
          "Boutique supprimée",

        slug:
          commande.boutique_slug ??
          ""
      }

    }));
  }

  static async countStatusesByClient(
    client_id: number
  ): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
  }> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT

        COUNT(*) AS total,

        SUM(
          CASE
            WHEN status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending,

        SUM(
          CASE
            WHEN status IN (
              'confirmed',
              'preparing',
              'shipped'
            )
            THEN 1
            ELSE 0
          END
        ) AS inProgress,

        SUM(
          CASE
            WHEN status = 'delivered'
            THEN 1
            ELSE 0
          END
        ) AS delivered,

        SUM(
          CASE
            WHEN status = 'cancelled'
            THEN 1
            ELSE 0
          END
        ) AS cancelled

      FROM commandes

      WHERE client_id = ?
      `,
        [client_id]
      );

    const row = rows[0];

    return {
      total: Number(row.total) || 0,
      pending: Number(row.pending) || 0,
      inProgress:
        Number(row.inProgress) || 0,
      delivered:
        Number(row.delivered) || 0,
      cancelled:
        Number(row.cancelled) || 0
    };
  }

  static async findByUserId(

    user_id: number,

    limit: number = 20,

    offset: number = 0,

    search: string = "",

    status?: string

  ): Promise<any[]> {


    let sql = `

    SELECT
       
    c.id,
    c.uuid,
    c.total,
    c.frais_livraison,
    c.status,
    c.zone_livraison,
    c.adresse_livraison,
    c.latitude,
    c.longitude,
    c.gps_precision,
    c.created_at,
    c.updated_at,

    b.nom AS boutique_nom,
    b.slug AS boutique_slug,

    u.nom AS client_nom,
    u.prenom AS client_prenom,
    u.telephone AS client_telephone,
    u.email AS client_email

    FROM commandes c

    INNER JOIN boutiques b
    ON c.boutique_id = b.id

    INNER JOIN users u
    ON c.client_id = u.id

    WHERE b.user_id = ?
    `;

    const params: any[] = [
      user_id
    ];

    if (search) {
      sql += `
    AND (
      c.uuid LIKE ?
      OR u.nom LIKE ?
      OR u.prenom LIKE ?
      OR u.telephone LIKE ?
      OR u.email LIKE ?
    )
  `;

      const value = `%${search}%`;

      params.push(
        value,
        value,
        value,
        value,
        value
      );
    }

    if (status) {

      sql += `
    AND c.status = ?
    `;

      params.push(status);

    }

    sql += `
ORDER BY c.created_at DESC
LIMIT ? OFFSET ?
`;
    params.push(
      limit,
      offset
    );

    const [rows] =
      await db.query<any[]>(
        sql,
        params
      );

    return rows.map((commande) => ({
      uuid: commande.uuid,

      total: commande.total,
      frais_livraison:
        commande.frais_livraison,
      status: commande.status,

      zone_livraison:
        commande.zone_livraison,

      adresse_livraison: commande.adresse_livraison,
      latitude: commande.latitude,
      longitude: commande.longitude,
      gps_precision: commande.gps_precision,

      created_at: commande.created_at,
      updated_at: commande.updated_at,

      boutique: {
        nom: commande.boutique_nom,
        slug: commande.boutique_slug
      },

      client: {
        nom: commande.client_nom,
        prenom: commande.client_prenom,
        telephone: commande.client_telephone,
        email: commande.client_email
      }
    }));

  }

  static async countByStatusForUser(
    user_id: number
  ): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT

        COUNT(*) AS total,

        SUM(
          CASE
            WHEN commandes.status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pending,

        SUM(
          CASE
            WHEN commandes.status = 'confirmed'
            THEN 1
            ELSE 0
          END
        ) AS confirmed,

        SUM(
          CASE
            WHEN commandes.status = 'preparing'
            THEN 1
            ELSE 0
          END
        ) AS preparing,

        SUM(
          CASE
            WHEN commandes.status = 'shipped'
            THEN 1
            ELSE 0
          END
        ) AS shipped,

        SUM(
          CASE
            WHEN commandes.status = 'delivered'
            THEN 1
            ELSE 0
          END
        ) AS delivered,

        SUM(
          CASE
            WHEN commandes.status = 'cancelled'
            THEN 1
            ELSE 0
          END
        ) AS cancelled

      FROM commandes

      INNER JOIN boutiques
        ON commandes.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      `,
        [user_id]
      );

    const row = rows[0];

    return {
      total: Number(row.total) || 0,
      pending: Number(row.pending) || 0,
      confirmed: Number(row.confirmed) || 0,
      preparing: Number(row.preparing) || 0,
      shipped: Number(row.shipped) || 0,
      delivered: Number(row.delivered) || 0,
      cancelled: Number(row.cancelled) || 0,
    };
  }

  static async findAll(): Promise<any[]> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT

        c.uuid,
        c.total,
        c.frais_livraison,
        c.status,

        c.adresse_livraison,
        c.latitude,
        c.longitude,
        c.gps_precision,

        c.created_at,
        c.updated_at,

        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        u.nom AS client_nom,
        u.prenom AS client_prenom,
        u.telephone AS client_telephone,
        u.email AS client_email

      FROM commandes c

      INNER JOIN boutiques b
        ON c.boutique_id = b.id

      INNER JOIN users u
        ON c.client_id = u.id

      ORDER BY c.created_at DESC
      `
      );

    return rows.map((commande) => ({
      uuid: commande.uuid,

      total: commande.total,
      frais_livraison:
        commande.frais_livraison,
      status: commande.status,

      adresse_livraison: commande.adresse_livraison,
      latitude: commande.latitude,
      longitude: commande.longitude,
      gps_precision: commande.gps_precision,

      created_at: commande.created_at,
      updated_at: commande.updated_at,

      boutique: {
        nom: commande.boutique_nom,
        slug: commande.boutique_slug
      },

      client: {
        nom: commande.client_nom,
        prenom: commande.client_prenom,
        telephone: commande.client_telephone,
        email: commande.client_email
      }
    }));

  }

  static async create(
    data: {
      uuid: string;
      boutique_id: number;
      client_id: number;
      zone_livraison: string;

      total: number;
      frais_livraison: number;
      status?: CommandeStatus;

      adresse_livraison?: string;
      latitude?: number;
      longitude?: number;
      gps_precision?: number;
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
      INSERT INTO commandes
(
  uuid,
  boutique_id,
  client_id,
  zone_livraison,
  adresse_livraison,
  latitude,
  longitude,
  gps_precision,
  total,
  frais_livraison,
  status
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          data.uuid,
          data.boutique_id,
          data.client_id,

          data.zone_livraison,

          data.adresse_livraison ?? null,
          data.latitude ?? null,
          data.longitude ?? null,
          data.gps_precision ?? null,

          data.total,
          data.frais_livraison,

          data.status ?? "pending"
        ]
      );

    return result.insertId;
  }
  static async update(
    id: number,
    data: UpdateCommandeDTO
  ) {

    const allowedFields: (keyof UpdateCommandeDTO)[] = [
      "total",
      "status"
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
      UPDATE commandes
      SET ${fields.map(field => `${field} = ?`).join(", ")}
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

  static async assignLivreur(
    commande_id: number,
    livreur_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
    UPDATE commandes
    SET livreur_id = ?
    WHERE id = ?
    `,
      [
        livreur_id,
        commande_id
      ]
    );
  }


  static async unassignLivreur(
    commande_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<void> {

    await connection.execute(
      `
    UPDATE commandes
    SET livreur_id = NULL
    WHERE id = ?
    `,
      [commande_id]
    );
  }

  static async updateStatus(
    id: number,
    status: CommandeStatus,
    connection: Pool | PoolConnection = db
  ) {

    await connection.execute(
      `
    UPDATE commandes
    SET status = ?
    WHERE id = ?
    `,
      [
        status,
        id
      ]
    );

  }

  static async delete(
    id: number
  ) {

    await db.execute(
      `
      DELETE FROM commandes
      WHERE id = ?
      `,
      [
        id
      ]
    );

  }


}