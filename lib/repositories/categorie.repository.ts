import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  Categorie,
  CategorieUpdate,
} from "../types/categorie";

export interface CategorieRow
  extends Categorie,
  RowDataPacket { }

interface CountRow extends RowDataPacket {
  total: number;
}

export class CategorieRepository {

  /**
   * Récupérer une catégorie par ID.
   */
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


  /**
   * Récupérer une catégorie par UUID.
   */
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


  /**
   * Rechercher une catégorie globalement par nom.
   */
  static async findByNomGlobal(
    nom: string
  ): Promise<CategorieRow | null> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE LOWER(TRIM(nom)) = LOWER(TRIM(?))
      LIMIT 1
      `,
      [nom]
    );

    return rows.length ? rows[0] : null;
  }


  /**
   * Rechercher une catégorie globalement par slug.
   */
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


  /**
   * Rechercher une catégorie active par slug.
   */
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


  /**
   * Toutes les catégories.
   */
  static async findAll(): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      ORDER BY
        parent_id ASC,
        nom ASC
      `
    );

    return rows;
  }


  /**
   * Toutes les catégories actives.
   */
  static async findAllActive(): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE status = 'active'
      ORDER BY
        parent_id ASC,
        nom ASC
      `
    );

    return rows;
  }


  /**
   * Catégories enfants d'une catégorie parente.
   *
   * parent_id = NULL → catégories racines.
   */
  static async findByParentId(
    parent_id: number | null
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE parent_id ${parent_id === null
        ? "IS NULL"
        : "= ?"
      }
      ORDER BY nom ASC
      `,
      parent_id === null
        ? []
        : [parent_id]
    );

    return rows;
  }


  /**
   * Catégories enfants actives.
   */
  static async findByParentIdActive(
    parent_id: number | null
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE parent_id ${parent_id === null
        ? "IS NULL"
        : "= ?"
      }
      AND status = 'active'
      ORDER BY nom ASC
      `,
      parent_id === null
        ? []
        : [parent_id]
    );

    return rows;
  }


  /**
   * Créer une catégorie globale.
   */
  static async create(
    data: {
      uuid: string;
      parent_id?: number | null;
      nom: string;
      slug: string;
      description?: string;
      image?: string;
    }
  ): Promise<number> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO categories
        (
          uuid,
          parent_id,
          nom,
          slug,
          description,
          image
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          data.uuid,
          data.parent_id ?? null,
          data.nom,
          data.slug,
          data.description ?? null,
          data.image ?? null,
        ]
      );

    return result.insertId;
  }


  /**
   * Modifier une catégorie.
   */
  static async update(
    id: number,
    data: CategorieUpdate
  ): Promise<void> {

    const allowedFields:
      (keyof CategorieUpdate)[] = [
        "nom",
        "slug",
        "parent_id",
        "description",
        "image",
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
      UPDATE categories
      SET ${fields
        .map(field => `${field} = ?`)
        .join(", ")}
      WHERE id = ?
    `;

    await db.execute(
      sql,
      [
        ...values,
        id,
      ]
    );
  }


  /**
   * Activer une catégorie.
   */
  static async activate(
    id: number
  ): Promise<void> {

    await db.execute(
      `
      UPDATE categories
      SET status = 'active'
      WHERE id = ?
      `,
      [id]
    );
  }


  /**
   * Réactiver une catégorie bloquée.
   */
  static async unblock(
    id: number
  ): Promise<void> {

    await db.execute(
      `
      UPDATE categories
      SET status = 'active'
      WHERE id = ?
      `,
      [id]
    );
  }


  /**
   * Bloquer une catégorie.
   */
  static async block(
    id: number
  ): Promise<void> {

    await db.execute(
      `
      UPDATE categories
      SET status = 'blocked'
      WHERE id = ?
      `,
      [id]
    );
  }


  /**
   * Supprimer une catégorie.
   *
   * La contrainte FK empêchera la suppression
   * si des produits utilisent encore cette catégorie.
   */
  static async delete(
    id: number
  ): Promise<void> {

    await db.execute(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [id]
    );
  }

  static async findActiveByBoutiqueSlug(
    boutique_slug: string
  ): Promise<CategorieRow[]> {
    const [rows] = await db.query<CategorieRow[]>(
      `
    SELECT DISTINCT c.*
    FROM categories c
    INNER JOIN produits p
      ON p.categorie_id = c.id
    INNER JOIN boutiques b
      ON b.id = p.boutique_id
    WHERE b.slug = ?
      AND b.status = 'active'
      AND p.status = 'active'
      AND c.status = 'active'
    ORDER BY
      c.parent_id ASC,
      c.nom ASC
    `,
      [boutique_slug]
    );

    return rows;
  }

  /**
 * Catégories actives associées à une boutique.
 *
 * La boutique_categories est la source de vérité
 * pour les catégories disponibles dans le dashboard vendeur.
 */
  static async findByBoutiqueId(
    boutique_id: number
  ): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT DISTINCT c.*
      FROM categories c
      INNER JOIN boutique_categories bc
        ON bc.categorie_id = c.id
      WHERE bc.boutique_id = ?
        AND c.status = 'active'
      ORDER BY c.parent_id ASC, c.nom ASC
      `,
      [boutique_id]
    );

    return rows;
  }


  /**
   * Vérifie si une catégorie est déjà associée
   * à une boutique.
   */
  static async isAssignedToBoutique(
    boutique_id: number,
    categorie_id: number
  ): Promise<boolean> {

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT 1
      FROM boutique_categories
      WHERE boutique_id = ?
        AND categorie_id = ?
      LIMIT 1
      `,
      [
        boutique_id,
        categorie_id,
      ]
    );

    return rows.length > 0;
  }


  /**
   * Associer une catégorie à une boutique.
   *
   * INSERT IGNORE permet de rester idempotent
   * grâce à la contrainte UNIQUE
   * (boutique_id, categorie_id).
   */
  static async assignToBoutique(
    boutique_id: number,
    categorie_id: number
  ): Promise<void> {

    await db.execute(
      `
      INSERT IGNORE INTO boutique_categories
        (boutique_id, categorie_id)
      VALUES (?, ?)
      `,
      [
        boutique_id,
        categorie_id,
      ]
    );
  }

  /**
 * Retirer une catégorie d'une boutique.
 *
 * Cette opération supprime uniquement l'association
 * boutique ↔ catégorie.
 *
 * La catégorie globale reste intacte.
 */
  static async removeFromBoutique(
    boutique_id: number,
    categorie_id: number
  ): Promise<void> {

    await db.execute(
      `
    DELETE FROM boutique_categories
    WHERE boutique_id = ?
      AND categorie_id = ?
    `,
      [
        boutique_id,
        categorie_id,
      ]
    );
  }

  /**
   * Toutes les catégories actives disponibles
   * dans le catalogue global.
   */
  static async findAllActiveGlobal(): Promise<CategorieRow[]> {

    const [rows] = await db.query<CategorieRow[]>(
      `
      SELECT *
      FROM categories
      WHERE status = 'active'
      ORDER BY parent_id ASC, nom ASC
      `
    );

    return rows;
  }

  static async countByUser(
    user_id: number
  ): Promise<number> {
    const [rows] = await db.query<CountRow[]>(
      `
    SELECT COUNT(DISTINCT p.categorie_id) AS total
    FROM produits p

    INNER JOIN boutiques b
      ON b.id = p.boutique_id

    INNER JOIN categories c
      ON c.id = p.categorie_id

    WHERE b.user_id = ?
      AND b.status = 'active'
      AND p.status = 'active'
      AND c.status = 'active'
    `,
      [user_id]
    );

    return Number(rows[0].total);
  }
}