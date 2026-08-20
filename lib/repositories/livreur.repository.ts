import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

export type LivreurStatus =
  | "active"
  | "inactive"
  | "suspended";

export type LivreurDisponibilite =
  | "available"
  | "unavailable";

export interface Livreur {
  id: number;
  uuid: string;
  boutique_id: number;
  user_id: number | null;

  nom: string;
  prenom: string;
  telephone: string;
  vehicule: string | null;

  status: "active" | "inactive" | "suspended";
  disponibilite: "available" | "unavailable";

  created_at: Date | null;
  updated_at: Date | null;
}

export interface LivreurRow
  extends Livreur,
  RowDataPacket { }

export class LivreurRepository {

  /**
   * Récupérer un livreur par son ID.
   */
  static async findById(
    id: number
  ): Promise<LivreurRow | null> {

    const [rows] =
      await db.query<LivreurRow[]>(
        `
        SELECT *
        FROM livreurs
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  static async findByUserId(
    user_id: number
  ): Promise<LivreurRow | null> {

    const [rows] =
      await db.query<LivreurRow[]>(
        `
      SELECT *
      FROM livreurs
      WHERE user_id = ?
      LIMIT 1
      `,
        [user_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Récupérer un livreur par UUID.
   */
  static async findByUUID(
    uuid: string
  ): Promise<LivreurRow | null> {

    const [rows] =
      await db.query<LivreurRow[]>(
        `
        SELECT *
        FROM livreurs
        WHERE uuid = ?
        LIMIT 1
        `,
        [uuid]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Récupérer tous les livreurs d'une boutique.
   */
  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<LivreurRow[]> {

    const [rows] =
      await db.query<LivreurRow[]>(
        `
        SELECT *
        FROM livreurs
        WHERE boutique_id = ?
        ORDER BY created_at DESC
        `,
        [boutique_id]
      );

    return rows;
  }

  /**
   * Récupérer les livreurs disponibles d'une boutique.
   */
  static async findAvailableByBoutiqueId(
    boutique_id: number
  ): Promise<LivreurRow[]> {

    const [rows] =
      await db.query<LivreurRow[]>(
        `
        SELECT *
        FROM livreurs
        WHERE boutique_id = ?
          AND status = 'active'
          AND disponibilite = 'available'
        ORDER BY nom ASC, prenom ASC
        `,
        [boutique_id]
      );

    return rows;
  }

  /**
   * Créer un livreur.
   */
  /**
   * Créer un livreur.
   */
  static async create(
    data: {
      uuid: string;
      boutique_id: number;
      user_id?: number | null;
      nom: string;
      prenom: string;
      telephone: string;
      vehicule?: string | null;
    },
    connection?: PoolConnection
  ): Promise<number> {

    const executor = connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
        INSERT INTO livreurs (
          uuid,
          boutique_id,
          user_id,
          nom,
          prenom,
          telephone,
          vehicule,
          status,
          disponibilite
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, 'active', 'available'
        )
        `,
        [
          data.uuid,
          data.boutique_id,
          data.user_id ?? null,
          data.nom,
          data.prenom,
          data.telephone,
          data.vehicule ?? null,
        ]
      );

    return result.insertId;
  }
  /**
   * Modifier un livreur.
   */
  static async update(
    id: number,
    data: {
      nom?: string;
      prenom?: string;
      telephone?: string;
      vehicule?: string | null;
      status?: LivreurStatus;
      disponibilite?: LivreurDisponibilite;
    }
  ): Promise<boolean> {

    const fields: string[] = [];
    const values: (
      | string
      | number
      | null
    )[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    if (data.prenom !== undefined) {
      fields.push("prenom = ?");
      values.push(data.prenom);
    }

    if (data.telephone !== undefined) {
      fields.push("telephone = ?");
      values.push(data.telephone);
    }

    if (data.vehicule !== undefined) {
      fields.push("vehicule = ?");
      values.push(data.vehicule);
    }

    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    if (data.disponibilite !== undefined) {
      fields.push("disponibilite = ?");
      values.push(data.disponibilite);
    }

    if (!fields.length) {
      return false;
    }

    values.push(id);

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        UPDATE livreurs
        SET ${fields.join(", ")}
        WHERE id = ?
        `,
        values
      );

    return result.affectedRows > 0;
  }

  /**
   * Supprimer un livreur.
   */
  static async delete(
    id: number
  ): Promise<boolean> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        DELETE FROM livreurs
        WHERE id = ?
        `,
        [id]
      );

    return result.affectedRows > 0;
  }

  /**
   * Modifier la disponibilité d'un livreur.
   *
   * Peut utiliser une transaction lorsqu'une connexion
   * est fournie.
   */
  static async updateDisponibilite(
    id: number,
    disponibilite: LivreurDisponibilite,
    connection?: PoolConnection
  ): Promise<boolean> {

    const executor = connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
        UPDATE livreurs
        SET disponibilite = ?
        WHERE id = ?
        `,
        [
          disponibilite,
          id,
        ]
      );

    return result.affectedRows > 0;
  }
}
