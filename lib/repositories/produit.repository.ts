import {
  ResultSetHeader,
  RowDataPacket,
  Pool,
  PoolConnection
} from "mysql2/promise";
import { db } from "../db";

import { Produit } from "../types/produit";
import { ProduitUpdate } from "../types/produit";


export interface ProduitRow extends Produit, RowDataPacket { }

export interface ProduitDetailRow
  extends ProduitRow {

  boutique_uuid: string;
  boutique_nom: string;
  boutique_slug: string;

  categorie_uuid: string;
  categorie_nom: string;
  categorie_slug: string;

  promotion_uuid: string | null;
  promotion_type:
  | "percentage"
  | "special_price"
  | null;
  promotion_reduction_pourcentage: number | null;
  promotion_prix_promotionnel: number | null;
}

export interface RechercheAvanceeParams {
  q?: string;
  categorie?: string;
  boutique?: string;
  prix_min?: number;
  prix_max?: number;
  note_min?: number;
  en_stock?: boolean;
  promotion?: boolean;
  tri?: "pertinence" | "recent" | "prix_asc" | "prix_desc" | "note";
  page?: number;
  limit?: number;
}

export interface RechercheAvanceeResult {
  produits: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export class ProduitRepository {


  static async findById(
    id: number
  ): Promise<ProduitDetailRow | null> {

    const [rows] =
      await db.query<ProduitDetailRow[]>(
        `
            SELECT
        p.*,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        c.uuid AS categorie_uuid,
        c.nom AS categorie_nom,
        c.slug AS categorie_slug,

        pmt.uuid AS promotion_uuid,
        pmt.type AS promotion_type,
        pmt.reduction_pourcentage AS promotion_reduction_pourcentage,
        pmt.prix_promotionnel AS promotion_prix_promotionnel

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

      LEFT JOIN promotions pmt
        ON pmt.produit_id = p.id
        AND pmt.boutique_id = p.boutique_id
        AND pmt.date_debut <= NOW()
        AND pmt.date_fin >= NOW()

      WHERE p.id = ?

      LIMIT 1
      `,
        [id]
      );


    return rows.length ? rows[0] : null;

  }

  static async delete(
    id: number
  ) {

    await db.execute(
      `
        DELETE FROM produits
        WHERE id = ?
        `,
      [id]
    );

  }

  static async countOutOfStockByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
      SELECT COUNT(*) AS total

      FROM produits

      INNER JOIN boutiques
        ON produits.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      AND produits.stock = 0
      `,
        [user_id]
      );

    return Number(rows[0].total);

  }

  static async countByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT COUNT(*) AS total
      FROM produits

      INNER JOIN boutiques
        ON produits.boutique_id = boutiques.id

      WHERE boutiques.user_id = ?
      `,
        [
          user_id
        ]
      );

    return Number(rows[0].total);

  }



  /* static async countOutOfStockByUser(
    user_id: number
  ): Promise<number> {
  
    const [rows] =
      await db.query<any[]>(
        `
        SELECT COUNT(*) AS total
        FROM produits
  
        INNER JOIN boutiques
          ON produits.boutique_id = boutiques.id
  
        WHERE boutiques.user_id = ?
        AND produits.stock <= 0
        `,
        [
          user_id
        ]
      );
  
    return Number(rows[0].total);
  
  }
   */
  static async findByBoutiqueIdActive(
    boutique_id: number
  ): Promise<ProduitRow[]> {

    const [rows] =
      await db.query<ProduitRow[]>(
        `
      SELECT *
      FROM produits
      WHERE boutique_id = ?
      AND status = 'active'
      ORDER BY created_at DESC
      `,
        [boutique_id]
      );

    return rows;

  }

  static async search(
    search?: string,
    categorieSlug?: string
  ): Promise<any[]> {

    let sql = `
    SELECT
      produits.*,

      boutiques.nom AS boutique_nom,
      boutiques.slug AS boutique_slug,

      categories.nom AS categorie_nom,
      categories.slug AS categorie_slug,

      promotions.uuid AS promotion_uuid,
      promotions.nom AS promotion_nom,
      promotions.type AS promotion_type,
      promotions.reduction_pourcentage AS promotion_reduction_pourcentage,
      promotions.prix_promotionnel AS promotion_prix_promotionnel,
      promotions.date_debut AS promotion_date_debut,
      promotions.date_fin AS promotion_date_fin,
      promotions.quantite_limite AS promotion_quantite_limite,

      COALESCE(
        (
          SELECT SUM(cp.quantite)
          FROM commande_produits cp
          INNER JOIN commandes c
            ON c.id = cp.commande_id
          WHERE cp.promotion_id = promotions.id
          AND c.status <> 'cancelled'
        ),
        0
      ) AS promotion_quantite_vendue

    FROM produits

    INNER JOIN boutiques
      ON produits.boutique_id = boutiques.id

    INNER JOIN categories
      ON produits.categorie_id = categories.id

    LEFT JOIN promotions
      ON promotions.produit_id = produits.id
      AND promotions.date_debut <= NOW()
      AND promotions.date_fin >= NOW()

    WHERE produits.status = 'active'
  `;

    const params: any[] = [];

    if (search) {

      sql += `
      AND (
        produits.nom LIKE ?
        OR produits.description LIKE ?
        OR boutiques.nom LIKE ?
        OR categories.nom LIKE ?
      )
    `;

      const value = `%${search}%`;

      params.push(
        value,
        value,
        value,
        value
      );
    }

    if (categorieSlug) {

      sql += `
      AND categories.slug = ?
    `;

      params.push(categorieSlug);
    }

    sql += `
    ORDER BY produits.created_at DESC
  `;

    const [rows] =
      await db.query<any[]>(
        sql,
        params
      );

    return rows;
  }

  static async searchAdvanced(
    options: RechercheAvanceeParams = {}
  ): Promise<RechercheAvanceeResult> {

    const {
      q,
      categorie,
      boutique,
      prix_min,
      prix_max,
      note_min,
      en_stock,
      promotion,
      tri = "pertinence",
      page = 1,
      limit = 24,
    } = options;

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(
      48,
      Math.max(1, Number(limit) || 24)
    );

    const offset = (currentPage - 1) * perPage;

    const where: string[] = [
      "p.status = 'active'",
      "b.status = 'active'",
      "c.status = 'active'",
    ];

    const params: any[] = [];

    /*
     * Recherche texte
     */
    if (q?.trim()) {
      const value = `%${q.trim()}%`;

      where.push(`
        (
          p.nom LIKE ?
          OR p.description LIKE ?
          OR b.nom LIKE ?
          OR c.nom LIKE ?
        )
      `);

      params.push(
        value,
        value,
        value,
        value
      );
    }

    /*
     * Catégorie
     */
    if (categorie?.trim()) {
      where.push("c.slug = ?");
      params.push(categorie.trim());
    }

    /*
     * Boutique
     */
    if (boutique?.trim()) {
      where.push("b.slug = ?");
      params.push(boutique.trim());
    }

    /*
     * Prix minimum
     */
    if (
      prix_min !== undefined &&
      Number.isFinite(Number(prix_min))
    ) {
      where.push("p.prix >= ?");
      params.push(Number(prix_min));
    }

    /*
     * Prix maximum
     */
    if (
      prix_max !== undefined &&
      Number.isFinite(Number(prix_max))
    ) {
      where.push("p.prix <= ?");
      params.push(Number(prix_max));
    }

    /*
     * Stock disponible
     */
    if (en_stock === true) {
      where.push("p.stock > 0");
    }

    /*
     * Promotion active
     */
    if (promotion === true) {
      where.push("promo.id IS NOT NULL");
    }

    /*
     * Note minimale
     *
     * Les produits sans avis ne sont pas considérés
     * comme ayant une note minimale.
     */
    if (
      note_min !== undefined &&
      Number.isFinite(Number(note_min))
    ) {
      where.push(`
        COALESCE(avis_stats.note_moyenne, 0) >= ?
      `);

      params.push(Number(note_min));
    }

    const whereClause = where.join("\nAND ");

    /*
     * Tri
     */
    let orderBy = `
      p.created_at DESC
    `;

    switch (tri) {
      case "prix_asc":
        orderBy = `
          p.prix ASC,
          p.created_at DESC
        `;
        break;

      case "prix_desc":
        orderBy = `
          p.prix DESC,
          p.created_at DESC
        `;
        break;

      case "note":
        orderBy = `
          COALESCE(avis_stats.note_moyenne, 0) DESC,
          COALESCE(avis_stats.total_avis, 0) DESC,
          p.created_at DESC
        `;
        break;

      case "recent":
        orderBy = `
          p.created_at DESC
        `;
        break;

      case "pertinence":
      default:
        if (q?.trim()) {
          orderBy = `
            CASE
              WHEN p.nom LIKE ? THEN 1
              WHEN b.nom LIKE ? THEN 2
              WHEN c.nom LIKE ? THEN 3
              ELSE 4
            END,
            p.created_at DESC
          `;
        } else {
          orderBy = `
            p.created_at DESC
          `;
        }
        break;
    }

    /*
     * Paramètres utilisés pour le CASE de pertinence.
     *
     * Ils doivent être placés avant les paramètres LIMIT/OFFSET
     * mais après les paramètres WHERE dans la requête finale.
     */
    const orderParams: any[] = [];

    if (tri === "pertinence" && q?.trim()) {
      const value = `%${q.trim()}%`;

      orderParams.push(
        value,
        value,
        value
      );
    }

    /*
     * Requête principale
     */
    const sql = `
      SELECT
        p.id,
        p.uuid,
        p.boutique_id,
        p.categorie_id,
        p.nom,
        p.slug,
        p.description,
        p.prix,
        p.stock,
        p.image,
        p.status,
        p.created_at,
        p.updated_at,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        c.uuid AS categorie_uuid,
        c.nom AS categorie_nom,
        c.slug AS categorie_slug,

        promo.uuid AS promotion_uuid,
        promo.nom AS promotion_nom,
        promo.type AS promotion_type,
        promo.reduction_pourcentage AS promotion_reduction_pourcentage,
        promo.prix_promotionnel AS promotion_prix_promotionnel,
        promo.date_debut AS promotion_date_debut,
        promo.date_fin AS promotion_date_fin,
        promo.quantite_limite AS promotion_quantite_limite,

        COALESCE(
          (
            SELECT SUM(cp.quantite)
            FROM commande_produits cp
            INNER JOIN commandes co
              ON co.id = cp.commande_id
            WHERE cp.promotion_id = promo.id
              AND co.status <> 'cancelled'
          ),
          0
        ) AS promotion_quantite_vendue,

        COALESCE(
          avis_stats.note_moyenne,
          0
        ) AS note_moyenne,

        COALESCE(
          avis_stats.total_avis,
          0
        ) AS total_avis

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

      LEFT JOIN promotions promo
        ON promo.produit_id = p.id
        AND promo.boutique_id = p.boutique_id
        AND promo.date_debut <= NOW()
        AND promo.date_fin >= NOW()

      LEFT JOIN (
        SELECT
          produit_id,
          AVG(note) AS note_moyenne,
          COUNT(*) AS total_avis
        FROM avis
        WHERE status = 'published'
        GROUP BY produit_id
      ) avis_stats
        ON avis_stats.produit_id = p.id

      WHERE ${whereClause}

      ORDER BY ${orderBy}

      LIMIT ? OFFSET ?
    `;

    const queryParams = [
      ...params,
      ...orderParams,
      perPage,
      offset,
    ];

    const [rows] = await db.query<any[]>(
      sql,
      queryParams
    );

    /*
     * Total
     */
    const countSql = `
      SELECT COUNT(*) AS total

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

      LEFT JOIN promotions promo
        ON promo.produit_id = p.id
        AND promo.boutique_id = p.boutique_id
        AND promo.date_debut <= NOW()
        AND promo.date_fin >= NOW()

      LEFT JOIN (
        SELECT
          produit_id,
          AVG(note) AS note_moyenne,
          COUNT(*) AS total_avis
        FROM avis
        WHERE status = 'published'
        GROUP BY produit_id
      ) avis_stats
        ON avis_stats.produit_id = p.id

      WHERE ${whereClause}
    `;

    const [countRows] = await db.query<
      (RowDataPacket & { total: number })[]
    >(
      countSql,
      params
    );

    const total = Number(
      countRows[0]?.total ?? 0
    );

    return {
      produits: rows,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    };
  }

  static async searchForUser(
    search: string | undefined,
    categorieSlug: string | undefined,
    user_id: number
  ): Promise<any[]> {

    let sql = `
    SELECT
      produits.*,

      boutiques.uuid AS boutique_uuid,
      boutiques.nom AS boutique_nom,
      boutiques.slug AS boutique_slug,

      categories.uuid AS categorie_uuid,
      categories.nom AS categorie_nom,
      categories.slug AS categorie_slug,

      promotions.uuid AS promotion_uuid,
      promotions.nom AS promotion_nom,
      promotions.type AS promotion_type,
      promotions.reduction_pourcentage AS promotion_reduction_pourcentage,
      promotions.prix_promotionnel AS promotion_prix_promotionnel,
      promotions.date_debut AS promotion_date_debut,
      promotions.date_fin AS promotion_date_fin,
      promotions.quantite_limite AS promotion_quantite_limite,

      COALESCE(
        (
          SELECT SUM(cp.quantite)
          FROM commande_produits cp
          INNER JOIN commandes c
            ON c.id = cp.commande_id
          WHERE cp.promotion_id = promotions.id
          AND c.status <> 'cancelled'
        ),
        0
      ) AS promotion_quantite_vendue

    FROM produits

    INNER JOIN boutiques
      ON produits.boutique_id = boutiques.id

    INNER JOIN categories
      ON produits.categorie_id = categories.id

    LEFT JOIN promotions
      ON promotions.produit_id = produits.id
      AND promotions.boutique_id = produits.boutique_id
      AND promotions.date_debut <= NOW()
      AND promotions.date_fin >= NOW()

    WHERE boutiques.user_id = ?
  `;

    const params: any[] = [user_id];

    if (search) {
      sql += `
      AND (
        produits.nom LIKE ?
        OR produits.description LIKE ?
        OR boutiques.nom LIKE ?
        OR categories.nom LIKE ?
      )
    `;

      const value = `%${search}%`;

      params.push(
        value,
        value,
        value,
        value
      );
    }

    if (categorieSlug) {
      sql += `
      AND categories.slug = ?
    `;

      params.push(categorieSlug);
    }

    sql += `
    ORDER BY produits.created_at DESC
  `;

    const [rows] =
      await db.query<any[]>(
        sql,
        params
      );

    return rows;
  }

  static async findByUUID(
    uuid: string
  ): Promise<ProduitDetailRow | null> {

    const [rows] =
      await db.query<ProduitDetailRow[]>(
        `
      SELECT
        p.*,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        c.uuid AS categorie_uuid,
        c.nom AS categorie_nom,
        c.slug AS categorie_slug,

        pmt.uuid AS promotion_uuid,
        pmt.type AS promotion_type,
        pmt.reduction_pourcentage AS promotion_reduction_pourcentage,
        pmt.prix_promotionnel AS promotion_prix_promotionnel

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

      LEFT JOIN promotions pmt
        ON pmt.produit_id = p.id
        AND pmt.boutique_id = p.boutique_id
        AND pmt.date_debut <= NOW()
        AND pmt.date_fin >= NOW()

      WHERE p.uuid = ?

      LIMIT 1
      `,
        [uuid]
      );

    return rows.length ? rows[0] : null;
  }





  static async findBySlug(
    slug: string,
    boutique_id: number
  ): Promise<ProduitRow | null> {


    const [rows] =
      await db.query<ProduitRow[]>(
        `
        SELECT *
        FROM produits
        WHERE slug = ?
        AND boutique_id = ?
        LIMIT 1
        `,
        [
          slug,
          boutique_id
        ]
      );


    return rows.length ? rows[0] : null;

  }

  static async findBySlugActive(
    slug: string,
    boutique_id: number
  ): Promise<ProduitRow | null> {

    const [rows] =
      await db.query<ProduitRow[]>(
        `
      SELECT *
      FROM produits
      WHERE slug = ?
      AND boutique_id = ?
      AND status = 'active'
      LIMIT 1
      `,
        [
          slug,
          boutique_id
        ]
      );


    return rows.length ? rows[0] : null;

  }




  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<ProduitRow[]> {


    const [rows] =
      await db.query<ProduitRow[]>(
        `
        SELECT *
        FROM produits
        WHERE boutique_id = ?
        ORDER BY created_at DESC
        `,
        [
          boutique_id
        ]
      );


    return rows;

  }





  static async findByUserId(
    user_id: number
  ): Promise<any[]> {

    const [rows] =
      await db.query<any[]>(
        `
      SELECT
        p.*,

        b.uuid AS boutique_uuid,
        b.nom AS boutique_nom,
        b.slug AS boutique_slug,

        c.uuid AS categorie_uuid,
        c.nom AS categorie_nom,
        c.slug AS categorie_slug

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

      WHERE b.user_id = ?

      ORDER BY p.created_at DESC
      `,
        [user_id]
      );

    return rows;

  }





  static async findAll(): Promise<ProduitRow[]> {


    const [rows] =
      await db.query<ProduitRow[]>(
        `
        SELECT *
        FROM produits
        ORDER BY created_at DESC
        `
      );


    return rows;

  }





  static async findAllActive(): Promise<ProduitRow[]> {


    const [rows] =
      await db.query<ProduitRow[]>(
        `
        SELECT *
        FROM produits
        WHERE status = 'active'
        ORDER BY created_at DESC
        `
      );


    return rows;

  }

  static async create(
    data: {
      uuid: string;
      boutique_id: number;
      categorie_id: number;
      nom: string;
      slug: string;
      description?: string;
      prix: number;
      stock: number;
      image?: string;
    }

  ): Promise<number> {


    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO produits
        (
          uuid,
          boutique_id,
          categorie_id,
          nom,
          slug,
          description,
          prix,
          stock,
          image
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,
          data.boutique_id,
          data.categorie_id,
          data.nom,
          data.slug,
          data.description ?? null,
          data.prix,
          data.stock,
          data.image ?? null
        ]
      );


    return result.insertId;

  }

  static async update(
    id: number,
    data: ProduitUpdate
  ) {


    const allowedFields: (keyof ProduitUpdate)[] = [
      "categorie_id",
      "nom",
      "slug",
      "description",
      "prix",
      "stock",
      "image"
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
      UPDATE produits
      SET ${fields.map(
      field => `${field} = ?`
    ).join(", ")}
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


  static async block(
    id: number
  ) {


    await db.execute(
      `
      UPDATE produits
      SET status = 'blocked'
      WHERE id = ?
      `,
      [
        id
      ]
    );

  }


  static async unblock(
    id: number
  ) {


    await db.execute(
      `
      UPDATE produits
      SET status = 'active'
      WHERE id = ?
      `,
      [
        id
      ]
    );

  }

  static async decreaseStock(
    id: number,
    quantite: number,
    connection: Pool | PoolConnection = db
  ) {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
      UPDATE produits
      SET stock = stock - ?
      WHERE id = ?
      AND stock >= ?
      `,
        [
          quantite,
          id,
          quantite
        ]
      );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Stock insuffisant ou produit introuvable."
      );
    }
  }

  static async increaseStock(
    id: number,
    quantite: number,
    connection: Pool | PoolConnection = db
  ) {

    const [result] =
      await connection.execute<ResultSetHeader>(
        `
      UPDATE produits
      SET stock = stock + ?
      WHERE id = ?
      `,
        [
          quantite,
          id
        ]
      );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Produit introuvable."
      );
    }
  }

  /**
 * Vérifie si une boutique possède des produits
 * utilisant une catégorie donnée.
 */
  static async countByBoutiqueAndCategorie(
    boutique_id: number,
    categorie_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
      SELECT COUNT(*) AS total
      FROM produits
      WHERE boutique_id = ?
        AND categorie_id = ?
      `,
        [
          boutique_id,
          categorie_id,
        ]
      );

    return Number(rows[0]?.total ?? 0);
  }
}


