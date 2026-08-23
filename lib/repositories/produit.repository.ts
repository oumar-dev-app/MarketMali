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
        c.slug AS categorie_slug

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

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
      categories.slug AS categorie_slug

    FROM produits

    INNER JOIN boutiques
      ON produits.boutique_id = boutiques.id

    INNER JOIN categories
      ON produits.categorie_id = categories.id

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
        c.slug AS categorie_slug

      FROM produits p

      INNER JOIN boutiques b
        ON b.id = p.boutique_id

      INNER JOIN categories c
        ON c.id = p.categorie_id

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
}


