import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Boutique, BoutiqueUpdate } from "../types/boutique";
import { ProduitRow } from "./produit.repository";
import {
  LivreurRepository,
} from "../repositories/livreur.repository";


export interface BoutiqueRow extends Boutique, RowDataPacket { }



export class BoutiqueRepository {


  static async findById(
    id: number
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows.length ? rows[0] : null;
  }



  static async findAll(): Promise<BoutiqueRow[]> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      ORDER BY created_at DESC
      `
    );

    return rows;
  }



  static async findByUUID(
    uuid: string
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    return rows.length ? rows[0] : null;
  }



  static async findBySlug(
    slug: string
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE slug = ?
      LIMIT 1
      `,
      [slug]
    );

    return rows.length ? rows[0] : null;
  }



  static async findByUserId(
    user_id: number
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE user_id = ?
      LIMIT 1
      `,
      [user_id]
    );

    return rows.length ? rows[0] : null;
  }

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



  static async findByUserIdActive(
    user_id: number
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE user_id = ?
      AND status = 'active'
      LIMIT 1
      `,
      [user_id]
    );

    return rows.length ? rows[0] : null;
  }



  static async findAllActive(): Promise<BoutiqueRow[]> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE status = 'active'
      ORDER BY created_at DESC
      `
    );

    return rows;
  }



  static async findBySlugActive(
    slug: string
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
      SELECT *
      FROM boutiques
      WHERE slug = ?
      AND status = 'active'
      LIMIT 1
      `,
      [slug]
    );

    return rows.length ? rows[0] : null;
  }



  static async create(
    data: {
      uuid: string;
      user_id: number;
      nom: string;
      slug: string;
      description?: string;
      logo?: string;
      telephone?: string;
      email?: string;
      adresse?: string;
      ville?: string;
      activation_expires_at?: Date | null;
    }
  ): Promise<number> {


    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO boutiques
        (
          uuid,
          user_id,
          nom,
          slug,
          description,
          logo,
          telephone,
          email,
          adresse,
          ville,
          activation_expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,
          data.user_id,
          data.nom,
          data.slug,
          data.description ?? null,
          data.logo ?? null,
          data.telephone ?? null,
          data.email ?? null,
          data.adresse ?? null,
          data.ville ?? null,
          data.activation_expires_at ?? null
        ]
      );


    return result.insertId;

  }

  static async findByUUIDActive(
    uuid: string
  ): Promise<BoutiqueRow | null> {

    const [rows] = await db.query<BoutiqueRow[]>(
      `
    SELECT *
    FROM boutiques
    WHERE uuid = ?
      AND status = 'active'
    LIMIT 1
    `,
      [uuid]
    );

    return rows[0] ?? null;
  }

  static async update(
    id: number,
    data: BoutiqueUpdate
  ) {


    const allowedFields:
      (keyof BoutiqueUpdate)[] = [

        "nom",
        "slug",
        "description",
        "logo",
        "telephone",
        "email",
        "adresse",
        "ville"

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
    UPDATE boutiques
    SET 
      ${fields.map(
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


  static async activate(
    id: number
  ) {

    await db.execute(
      `
      UPDATE boutiques
      SET
        status = 'active',
        activation_expires_at = NULL
      WHERE id = ?
      `,
      [id]
    );

  }



  static async block(
    id: number
  ) {

    await db.execute(
      `
      UPDATE boutiques
      SET status = 'blocked'
      WHERE id = ?
      `,
      [id]
    );

  }



  static async blockExpired() {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        UPDATE boutiques
        SET status = 'blocked'
        WHERE activation_expires_at IS NOT NULL
        AND activation_expires_at < NOW()
        AND status IN ('pending','active')
        `
      );


    return result.affectedRows;

  }



  static async delete(
    id: number
  ) {

    await db.execute(
      `
      DELETE FROM boutiques
      WHERE id = ?
      `,
      [id]
    );

  }


}