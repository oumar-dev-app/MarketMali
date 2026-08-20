import { db } from "../db";
import {
  ResultSetHeader,
  RowDataPacket,
  Pool,
  PoolConnection
} from "mysql2/promise";



export interface CommandeProduitRow extends RowDataPacket {
  id: number;
  commande_id: number;
  produit_id: number;
  quantite: number;
  prix: number;
  uuid: string;
  nom: string;
  slug: string;
  image: string | null;
  sous_total: number;
}

export class CommandeProduitRepository {



static async findByCommandeId(
  commande_id: number
): Promise<CommandeProduitRow[]> {

  const [rows] =
    await db.query<CommandeProduitRow[]>(
      `
      SELECT

        cp.id,

        cp.commande_id,

        cp.produit_id,

        cp.quantite,

        cp.prix,

        p.uuid,

        p.nom,

        p.slug,

        p.image,

        (cp.quantite * cp.prix) AS sous_total

      FROM commande_produits cp

      INNER JOIN produits p
        ON p.id = cp.produit_id

      WHERE cp.commande_id = ?
      `,
      [
        commande_id
      ]
    );

  return rows;

}



static async create(
  data: {
    commande_id: number;
    produit_id: number;
    quantite: number;
    prix: number;
  },
  connection: Pool | PoolConnection = db
): Promise<number> {

  const [result] =
    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO commande_produits
      (
        commande_id,
        produit_id,
        quantite,
        prix
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        data.commande_id,
        data.produit_id,
        data.quantite,
        data.prix
      ]
    );

  return result.insertId;
}



static async createMany(
  commande_id: number,
  produits: {
    produit_id: number;
    quantite: number;
    prix: number;
  }[],
  connection: Pool | PoolConnection = db
) {

  for (const produit of produits) {

    await this.create(
      {
        commande_id,
        produit_id: produit.produit_id,
        quantite: produit.quantite,
        prix: produit.prix
      },
      connection
    );
  }
}



  static async deleteByCommandeId(
    commande_id: number
  ) {

    await db.execute(
      `
      DELETE
      FROM commande_produits
      WHERE commande_id = ?
      `,
      [
        commande_id
      ]
    );

  }

}