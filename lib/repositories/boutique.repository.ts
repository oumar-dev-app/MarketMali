import { db } from "../db";
import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";
import {
  Pool,
  PoolConnection,
} from "mysql2/promise";
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
    },
    connection: Pool | PoolConnection = db
  ): Promise<number> {

    const [result] =
      await connection.execute<ResultSetHeader>(
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
    data: BoutiqueUpdate,
    connection: Pool | PoolConnection = db
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

    await connection.execute(
      sql,
      [
        ...values,
        id
      ]
    );
  }

  static async markLivraisonConfiguree(
    id: number
  ) {
    await db.execute(
      `
    UPDATE boutiques
    SET livraison_configuree = 1
    WHERE id = ?
    `,
      [id]
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

  static async verify(
    id: number,
    verified_by: number
  ) {

    await db.execute(
      `
    UPDATE boutiques
    SET
      verified = 1,
      verified_at = CURRENT_TIMESTAMP,
      verified_by = ?
    WHERE id = ?
    `,
      [
        verified_by,
        id
      ]
    );

  }

  static async unverify(
    id: number
  ) {

    await db.execute(
      `
    UPDATE boutiques
    SET
      verified = 0,
      verified_at = NULL,
      verified_by = NULL
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

  static async hasCommandes(
    boutique_id: number
  ): Promise<boolean> {

    const [rows] =
      await db.query<RowDataPacket[]>(
        `
      SELECT 1
      FROM commandes
      WHERE boutique_id = ?
      LIMIT 1
      `,
        [boutique_id]
      );

    return rows.length > 0;
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

  static async findAllActiveWithCategories() {
    type CategoryItem = {
      id: number;
      uuid: string;
      parent_id: number | null;
      nom: string;
      slug: string;
      image: string | null;
    };

    type PrimaryCategory = {
      id: number;
      uuid: string;
      nom: string;
      slug: string;
      image: string | null;
      sous_categories: CategoryItem[];
    };

    const [rows] = await db.query<
      (BoutiqueRow & {
        categorie_id: number | null;
        categorie_uuid: string | null;
        categorie_parent_id: number | null;
        categorie_nom: string | null;
        categorie_slug: string | null;
        categorie_image: string | null;

        parent_id: number | null;
        parent_uuid: string | null;
        parent_nom: string | null;
        parent_slug: string | null;
        parent_image: string | null;
      })[]
    >(
      `
    SELECT
      b.*,

      c.id AS categorie_id,
      c.uuid AS categorie_uuid,
      c.parent_id AS categorie_parent_id,
      c.nom AS categorie_nom,
      c.slug AS categorie_slug,
      c.image AS categorie_image,

      parent_c.id AS parent_id,
      parent_c.uuid AS parent_uuid,
      parent_c.nom AS parent_nom,
      parent_c.slug AS parent_slug,
      parent_c.image AS parent_image

    FROM boutiques b

    LEFT JOIN boutique_categories bc
      ON bc.boutique_id = b.id

    LEFT JOIN categories c
      ON c.id = bc.categorie_id
      AND c.status = 'active'

    LEFT JOIN categories parent_c
      ON parent_c.id = c.parent_id
      AND parent_c.status = 'active'

    WHERE b.status = 'active'

    ORDER BY
      b.created_at DESC,
      parent_c.nom ASC,
      c.nom ASC
    `
    );

    const boutiques = new Map<
      number,
      BoutiqueRow & {
        categories: CategoryItem[];
        categories_principales: PrimaryCategory[];
      }
    >();

    for (const row of rows) {
      if (!boutiques.has(row.id)) {
        boutiques.set(row.id, {
          ...row,
          categories: [],
          categories_principales: [],
        });
      }

      const boutique = boutiques.get(row.id)!;

      if (
        row.categorie_id === null ||
        row.categorie_uuid === null ||
        row.categorie_nom === null ||
        row.categorie_slug === null
      ) {
        continue;
      }

      // Catégorie actuellement associée à la boutique
      const category: CategoryItem = {
        id: row.categorie_id,
        uuid: row.categorie_uuid,
        parent_id: row.categorie_parent_id,
        nom: row.categorie_nom,
        slug: row.categorie_slug,
        image: row.categorie_image,
      };

      // Conserver la liste plate existante
      const alreadyExists = boutique.categories.some(
        (item) => item.id === category.id
      );

      if (!alreadyExists) {
        boutique.categories.push(category);
      }

      // Si la catégorie possède un parent,
      // le parent devient la catégorie principale.
      const primaryId =
        row.parent_id !== null
          ? row.parent_id
          : row.categorie_id;

      const primaryUuid =
        row.parent_uuid !== null
          ? row.parent_uuid
          : row.categorie_uuid;

      const primaryNom =
        row.parent_nom !== null
          ? row.parent_nom
          : row.categorie_nom;

      const primarySlug =
        row.parent_slug !== null
          ? row.parent_slug
          : row.categorie_slug;

      const primaryImage =
        row.parent_image !== null
          ? row.parent_image
          : row.categorie_image;

      let primary = boutique.categories_principales.find(
        (item) => item.id === primaryId
      );

      if (!primary) {
        primary = {
          id: primaryId,
          uuid: primaryUuid,
          nom: primaryNom,
          slug: primarySlug,
          image: primaryImage,
          sous_categories: [],
        };

        boutique.categories_principales.push(primary);
      }

      // Si la catégorie est elle-même la catégorie principale,
      // elle ne doit pas apparaître comme sa propre sous-catégorie.
      const isSubcategory =
        row.parent_id !== null &&
        row.parent_id !== row.categorie_id;

      if (isSubcategory) {
        const alreadyInSubcategories =
          primary.sous_categories.some(
            (item) => item.id === category.id
          );

        if (!alreadyInSubcategories) {
          primary.sous_categories.push(category);
        }
      }
    }

    return Array.from(boutiques.values());
  }


}