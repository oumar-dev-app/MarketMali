import {
  ResultSetHeader,
  RowDataPacket,
  Pool,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

import {
  Promotion,
  PromotionDetailRow,
  PromotionRow,
  PromotionStats,
} from "../types/promotion";

interface PromotionCreateData {
  uuid: string;
  boutique_id: number;
  produit_id: number;
  nom: string;
  type: "percentage" | "special_price";
  reduction_pourcentage: number | null;
  prix_promotionnel: number | null;
  date_debut: string;
  date_fin: string;
  quantite_limite: number | null;
}

interface PromotionUpdateData {
  nom?: string;
  type?: "percentage" | "special_price";
  reduction_pourcentage?: number | null;
  prix_promotionnel?: number | null;
  date_debut?: string;
  date_fin?: string;
  quantite_limite?: number | null;
}

export class PromotionRepository {

  /**
   * Récupérer une promotion par son ID.
   */
  static async findById(
    id: number
  ): Promise<PromotionDetailRow | null> {

    const [rows] = await db.query<PromotionDetailRow[]>(
      `
      SELECT
        p.*,

        pr.uuid AS produit_uuid,
        pr.nom AS produit_nom,
        pr.slug AS produit_slug,
        pr.prix AS produit_prix,
        pr.stock AS produit_stock,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug

      FROM promotions p

      INNER JOIN produits pr
        ON pr.id = p.produit_id

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      WHERE p.id = ?

      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  /**
   * Récupérer une promotion par UUID.
   */
  static async findByUUID(
    uuid: string
  ): Promise<PromotionDetailRow | null> {

    const [rows] = await db.query<PromotionDetailRow[]>(
      `
      SELECT
        p.*,

        pr.uuid AS produit_uuid,
        pr.nom AS produit_nom,
        pr.slug AS produit_slug,
        pr.prix AS produit_prix,
        pr.stock AS produit_stock,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug

      FROM promotions p

      INNER JOIN produits pr
        ON pr.id = p.produit_id

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      WHERE p.uuid = ?

      LIMIT 1
      `,
      [uuid]
    );

    return rows[0] ?? null;
  }

  /**
   * Récupérer toutes les promotions d'une boutique.
   */
  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<PromotionDetailRow[]> {

    const [rows] = await db.query<PromotionDetailRow[]>(
      `
      SELECT
        p.*,

        pr.uuid AS produit_uuid,
        pr.nom AS produit_nom,
        pr.slug AS produit_slug,
        pr.prix AS produit_prix,
        pr.stock AS produit_stock,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug

      FROM promotions p

      INNER JOIN produits pr
        ON pr.id = p.produit_id

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      WHERE p.boutique_id = ?

      ORDER BY p.created_at DESC
      `,
      [boutique_id]
    );

    return rows;
  }

  /**
   * Récupérer toutes les promotions d'un vendeur.
   */
  static async findByUserId(
    user_id: number
  ): Promise<PromotionDetailRow[]> {

    const [rows] = await db.query<PromotionDetailRow[]>(
      `
      SELECT
        p.*,

        pr.uuid AS produit_uuid,
        pr.nom AS produit_nom,
        pr.slug AS produit_slug,
        pr.prix AS produit_prix,
        pr.stock AS produit_stock,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug

      FROM promotions p

      INNER JOIN produits pr
        ON pr.id = p.produit_id

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      WHERE b.user_id = ?

      ORDER BY p.created_at DESC
      `,
      [user_id]
    );

    return rows;
  }

  /**
   * Vérifier si une autre promotion chevauche
   * la période demandée pour le même produit.
   */
  static async findOverlapping(
    produit_id: number,
    date_debut: string,
    date_fin: string,
    excludeId?: number
  ): Promise<PromotionRow | null> {

    let sql = `
      SELECT *
      FROM promotions

      WHERE produit_id = ?

        AND date_debut < ?
        AND date_fin > ?
    `;

    const params: (
      | string
      | number
      | null
      | Date
    )[] = [
        produit_id,
        date_fin,
        date_debut,
      ];

    if (excludeId !== undefined) {
      sql += `
        AND id != ?
      `;

      params.push(excludeId);
    }

    sql += `
      ORDER BY date_debut ASC
      LIMIT 1
    `;

    const [rows] = await db.query<PromotionRow[]>(
      sql,
      params
    );

    return rows[0] ?? null;
  }

  /**
   * Récupérer la promotion actuellement active
   * pour un produit.
   *
   * La quantité limite est vérifiée dans le service
   * lors de la création de la commande.
   */
  static async findActiveByProduit(
    produit_id: number,
    connection: Pool | PoolConnection = db
  ): Promise<PromotionDetailRow | null> {

    const [rows] =
      await connection.query<PromotionDetailRow[]>(
        `
      SELECT
        p.*,

        pr.uuid AS produit_uuid,
        pr.nom AS produit_nom,
        pr.slug AS produit_slug,
        pr.prix AS produit_prix,
        pr.stock AS produit_stock,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug

      FROM promotions p

      INNER JOIN produits pr
        ON pr.id = p.produit_id

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      WHERE p.produit_id = ?

        AND p.date_debut <= NOW()
        AND p.date_fin >= NOW()

      ORDER BY p.date_debut DESC

      LIMIT 1

      FOR UPDATE
      `,
        [produit_id]
      );

    return rows[0] ?? null;
  }

  /**
   * Créer une promotion.
   */
  static async create(
    data: PromotionCreateData
  ): Promise<number> {

    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO promotions (
        uuid,
        boutique_id,
        produit_id,
        nom,
        type,
        reduction_pourcentage,
        prix_promotionnel,
        date_debut,
        date_fin,
        quantite_limite
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.uuid,
        data.boutique_id,
        data.produit_id,
        data.nom,
        data.type,
        data.reduction_pourcentage,
        data.prix_promotionnel,
        data.date_debut,
        data.date_fin,
        data.quantite_limite,
      ]
    );

    return result.insertId;
  }

  /**
   * Modifier une promotion.
   */
  static async update(
    id: number,
    data: PromotionUpdateData
  ): Promise<void> {

    const fields: string[] = [];
    const values: (
      | string
      | number
      | null
      | Date
    )[] = [];

    if (data.nom !== undefined) {
      fields.push("nom = ?");
      values.push(data.nom);
    }

    if (data.type !== undefined) {
      fields.push("type = ?");
      values.push(data.type);
    }

    if (data.reduction_pourcentage !== undefined) {
      fields.push("reduction_pourcentage = ?");
      values.push(data.reduction_pourcentage);
    }

    if (data.prix_promotionnel !== undefined) {
      fields.push("prix_promotionnel = ?");
      values.push(data.prix_promotionnel);
    }

    if (data.date_debut !== undefined) {
      fields.push("date_debut = ?");
      values.push(data.date_debut);
    }

    if (data.date_fin !== undefined) {
      fields.push("date_fin = ?");
      values.push(data.date_fin);
    }

    if (data.quantite_limite !== undefined) {
      fields.push("quantite_limite = ?");
      values.push(data.quantite_limite);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    await db.execute<ResultSetHeader>(
      `
      UPDATE promotions

      SET ${fields.join(", ")}

      WHERE id = ?
      `,
      values
    );
  }

  /**
   * Supprimer une promotion.
   */
  static async delete(
    id: number
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      DELETE FROM promotions
      WHERE id = ?
      `,
      [id]
    );
  }

  /**
   * Statistiques d'une promotion.
   *
   * On utilise le prix réellement enregistré
   * dans commande_produits.prix.
   *
   * Les commandes annulées ne sont pas comptabilisées.
   */
  static async getStats(
    promotion_id: number
  ): Promise<PromotionStats> {

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        COALESCE(
          SUM(cp.quantite),
          0
        ) AS quantite_vendue,

        COALESCE(
          SUM(cp.quantite * cp.prix),
          0
        ) AS chiffre_affaires

      FROM commande_produits cp

      INNER JOIN commandes c
        ON c.id = cp.commande_id

      WHERE cp.promotion_id = ?

        AND c.status <> 'cancelled'
      `,
      [promotion_id]
    );

    const row = rows[0];

    return {
      quantite_vendue: Number(row?.quantite_vendue ?? 0),
      chiffre_affaires: Number(row?.chiffre_affaires ?? 0),
    };
  }

/**
 * Vérifier combien d'unités ont déjà été vendues
 * pour une promotion.
 */
static async getQuantiteVendue(
  promotion_id: number,
  connection: Pool | PoolConnection = db
): Promise<number> {

  const [rows] =
    await connection.query<RowDataPacket[]>(
      `
      SELECT
        COALESCE(
          SUM(cp.quantite),
          0
        ) AS quantite_vendue

      FROM commande_produits cp

      INNER JOIN commandes c
        ON c.id = cp.commande_id

      WHERE cp.promotion_id = ?

        AND c.status <> 'cancelled'
      `,
      [promotion_id]
    );

  return Number(
    rows[0]?.quantite_vendue ?? 0
  );
}
}
