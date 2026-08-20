import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Categorie, CategorieUpdate } from "../types/categorie";



export interface CategorieRow extends Categorie, RowDataPacket { }


export class CategorieRepository {


  static async findById(
    id: number
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  


  static async findByUUID(
    uuid: string
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    return rows.length ? rows[0] : null;
  }


  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE boutique_id = ?
      ORDER BY created_at DESC
      `,
      [
        boutique_id
      ]
    );

    return rows;
  }



  static async findAll(): Promise<CategorieRow[]> {
    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
    ORDER BY created_at DESC
    `
    );

    return rows;
  }

  static async findByUserId(
    user_id: number
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT categories.*
    FROM categories
    INNER JOIN boutiques
      ON categories.boutique_id = boutiques.id
    WHERE boutiques.user_id = ?
    ORDER BY categories.created_at DESC
    `,
      [
        user_id
      ]
    );

    return rows;
  }

  static async findBySlugGlobal(
    slug: string
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
    WHERE slug = ?
    LIMIT 1
    `,
      [slug]
    );

    return rows.length ? rows[0] : null;
  }

  static async findBySlug(
    slug: string,
    boutique_id: number
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
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

  static async findBySlugGlobalActive(
    slug: string
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
    WHERE slug = ?
      AND status = 'active'
    LIMIT 1
    `,
      [slug]
    );

    return rows.length ? rows[0] : null;
  }

  static async findAllActive(): Promise<CategorieRow[]> {
    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
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
      nom: string;
      slug: string;
      description?: string;
      image?: string;
    }
  ): Promise<number> {


    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO categories
      (
        uuid,
        boutique_id,
        nom,
        slug,
        description,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.uuid,
        data.boutique_id,
        data.nom,
        data.slug,
        data.description ?? null,
        data.image ?? null
      ]
    );


    return result.insertId;
  }

  static async findBySlugActive(
    slug: string,
    boutique_id: number
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
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

  static async findByBoutiqueIdActive(
    boutique_id: number
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT *
    FROM categories
    WHERE boutique_id = ?
    AND status = 'active'
    ORDER BY created_at DESC
    `,
      [
        boutique_id
      ]
    );

    return rows;
  }

  static async unblock(
    id: number
  ) {

    await db.execute(
      `
    UPDATE categories
    SET status = 'active'
    WHERE id = ?
    `,
      [
        id
      ]
    );

  }


  static async update(
    id: number,
    data: CategorieUpdate
  ) {


    const allowedFields: (keyof CategorieUpdate)[] = [
      "nom",
      "slug",
      "description",
      "image"
    ];



    const fields = allowedFields.filter(
      field => data[field] !== undefined
    );



    if (!fields.length) {
      return;
    }



    const values = fields.map(
      field => data[field] ?? null
    );



    const sql = `
      UPDATE categories
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
  static async activate(
    id: number
  ) {

    await db.execute(
      `
      UPDATE categories
      SET status = 'active'
      WHERE id = ?
      `,
      [
        id
      ]
    );

  }


  static async delete(
    id: number
  ) {

    await db.execute(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [
        id
      ]
    );

  }
static async existsBySlug(
  slug:string,
  boutique_id:number
):Promise<boolean>{

 const [rows] =
 await db.query<RowDataPacket[]>(
 `
 SELECT id
 FROM categories
 WHERE slug = ?
 AND boutique_id = ?
 LIMIT 1
 `,
 [
  slug,
  boutique_id
 ]);

 return rows.length > 0;

}

  static async block(
    id: number
  ) {

    await db.execute(
      `
    UPDATE categories
    SET status = 'blocked'
    WHERE id = ?
    `,
      [
        id
      ]
    );

  }

  static async countByUser(
    user_id: number
  ): Promise<number> {

    const [rows] =
      await db.query<any[]>(
        `
        SELECT COUNT(*) AS total

        FROM categories

        INNER JOIN boutiques
          ON categories.boutique_id = boutiques.id

        WHERE boutiques.user_id = ?
        `,
        [
          user_id
        ]
      );


    return Number(rows[0].total);

  }

}

  

