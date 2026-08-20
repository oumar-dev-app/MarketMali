import { db } from "../db";
import {
  RowDataPacket,
} from "mysql2";

interface CountRow extends RowDataPacket {
  total: number;
}

interface TopProduitRow extends RowDataPacket {
  nom: string;
  quantite_vendue: number;
  chiffre_affaires: number;
}

export class DashboardRepository {


  static async topProduits(
    user_id: number,
    role: string
  ) {

    let sql = `
    SELECT

      p.nom,

      SUM(cp.quantite) AS quantite_vendue,

      SUM(cp.quantite * cp.prix) AS chiffre_affaires

    FROM commande_produits cp

    INNER JOIN produits p
      ON p.id = cp.produit_id

    INNER JOIN commandes c
      ON c.id = cp.commande_id

    INNER JOIN boutiques b
      ON b.id = c.boutique_id

    WHERE c.status = 'delivered'
  `;


    const params: any[] = [];


    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql += `
      AND b.user_id = ?
    `;

      params.push(user_id);

    }


    sql += `

    GROUP BY p.id, p.nom

    ORDER BY chiffre_affaires DESC

    LIMIT 5

  `;


    const [rows] =
      await db.query<TopProduitRow[]>(
        sql,
        params
      );


    return rows;

  }

  static async countProduits(
    user_id: number,
    role: string
  ): Promise<number> {

    let sql = `
      SELECT COUNT(*) AS total
      FROM produits
    `;

    const params: any[] = [];

    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql = `
        SELECT COUNT(*) AS total

        FROM produits

        INNER JOIN boutiques
          ON boutiques.id = produits.boutique_id

        WHERE boutiques.user_id = ?
      `;

      params.push(user_id);

    }

    const [rows] =
      await db.query<CountRow[]>(
        sql,
        params
      );

    return rows[0].total;

  }

  static async countCategories(
    user_id: number,
    role: string
  ): Promise<number> {

    let sql = `
    SELECT COUNT(*) AS total
    FROM categories
  `;

    const params: any[] = [];

    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql = `
      SELECT COUNT(*) AS total

      FROM categories

      INNER JOIN boutiques
        ON boutiques.id = categories.boutique_id

      WHERE boutiques.user_id = ?
    `;

      params.push(user_id);

    }

    const [rows] =
      await db.query<CountRow[]>(
        sql,
        params
      );

    return rows[0].total;

  }

  static async countCommandes(
    user_id: number,
    role: string
  ): Promise<number> {

    let sql = `
    SELECT COUNT(*) AS total
    FROM commandes
  `;

    const params: any[] = [];

    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql = `
      SELECT COUNT(*) AS total

      FROM commandes

      INNER JOIN boutiques
        ON boutiques.id = commandes.boutique_id

      WHERE boutiques.user_id = ?
    `;

      params.push(user_id);

    }

    const [rows] =
      await db.query<CountRow[]>(
        sql,
        params
      );

    return rows[0].total;

  }

  static async ventesParMois(
    user_id: number,
    role: string
  ) {

    let sql = `
    SELECT
      MONTHNAME(commandes.created_at) AS mois,
      SUM(commandes.total) AS ventes
    FROM commandes
  `;

    const params: any[] = [];


    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql += `
      INNER JOIN boutiques
        ON boutiques.id = commandes.boutique_id

      WHERE boutiques.user_id = ?
    `;

      params.push(user_id);

    }


    sql += `
    GROUP BY MONTH(commandes.created_at),
             MONTHNAME(commandes.created_at)

    ORDER BY MONTH(commandes.created_at)
  `;


    const [rows] =
      await db.query(
        sql,
        params
      );


    return rows;

  }


  static async countPendingCommandes(
  user_id: number,
  role: string
): Promise<number> {

  if (
    role === "admin" ||
    role === "super_admin"
  ) {
    const [rows] =
      await db.query<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM commandes
        WHERE status = 'pending'
        `
      );

    return Number(rows[0].total);
  }

  const [rows] =
    await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM commandes c
      INNER JOIN boutiques b
        ON b.id = c.boutique_id
      WHERE b.user_id = ?
        AND c.status = 'pending'
      `,
      [user_id]
    );

  return Number(rows[0].total);
}

static async countDeliveredCommandes(
  user_id: number,
  role: string
): Promise<number> {

  if (
    role === "admin" ||
    role === "super_admin"
  ) {
    const [rows] =
      await db.query<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM commandes
        WHERE status = 'delivered'
        `
      );

    return Number(rows[0].total);
  }

  const [rows] =
    await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM commandes c
      INNER JOIN boutiques b
        ON b.id = c.boutique_id
      WHERE b.user_id = ?
        AND c.status = 'delivered'
      `,
      [user_id]
    );

  return Number(rows[0].total);
}

static async countOutOfStock(
  user_id: number,
  role: string
): Promise<number> {

  if (
    role === "admin" ||
    role === "super_admin"
  ) {
    const [rows] =
      await db.query<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM produits
        WHERE stock <= 0
        `
      );

    return Number(rows[0].total);
  }

  const [rows] =
    await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM produits p
      INNER JOIN boutiques b
        ON b.id = p.boutique_id
      WHERE b.user_id = ?
        AND p.stock <= 0
      `,
      [user_id]
    );

  return Number(rows[0].total);
}

static async sumDeliveredSales(
  user_id: number,
  role: string
): Promise<number> {

  if (
    role === "admin" ||
    role === "super_admin"
  ) {
    const [rows] =
      await db.query<RowDataPacket[]>(
        `
        SELECT COALESCE(
          SUM(total),
          0
        ) AS total
        FROM commandes
        WHERE status = 'delivered'
        `
      );

    return Number(rows[0].total);
  }

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT COALESCE(
        SUM(c.total),
        0
      ) AS total
      FROM commandes c
      INNER JOIN boutiques b
        ON b.id = c.boutique_id
      WHERE b.user_id = ?
        AND c.status = 'delivered'
      `,
      [user_id]
    );

  return Number(rows[0].total);
}

  static async countClients(
    user_id: number,
    role: string
  ): Promise<number> {

    let sql = `
    SELECT COUNT(DISTINCT c.client_id) AS total

    FROM commandes c

    INNER JOIN boutiques b
      ON b.id = c.boutique_id
  `;

    const params: any[] = [];


    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      sql += `
      WHERE b.user_id = ?
    `;

      params.push(user_id);

    }


    const [rows] =
      await db.query<any[]>(
        sql,
        params
      );


    return Number(rows[0].total);

  }

}