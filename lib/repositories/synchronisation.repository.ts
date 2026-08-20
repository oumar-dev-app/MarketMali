import { db } from "../db";
import { ResultSetHeader } from "mysql2";


export class SynchronisationRepository {


    static async syncCategorie(
        boutiqueId: number,
        categorie: any
    ) {

        const slug = categorie.slug;


        const [result] = await db.query<ResultSetHeader>(
            `
      INSERT INTO categories
      (
        uuid,
        boutique_id,
        nom,
        slug,
        description,
        image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE

        nom = VALUES(nom),
        description = VALUES(description),
        image = VALUES(image),
        status = VALUES(status)

      `,
            [
                categorie.uuid,
                boutiqueId,
                categorie.nom,
                slug,
                categorie.description ?? null,
                categorie.image ?? null,
                categorie.status ?? "active"
            ]
        );


        return result;

    }
    static async findCategorieIdByUUID(
        boutiqueId: number,
        categorieUUID: string
    ) {

        const [rows] = await db.query<any[]>(
            `
    SELECT id
    FROM categories
    WHERE uuid = ?
    AND boutique_id = ?
    LIMIT 1
    `,
            [
                categorieUUID,
                boutiqueId
            ]
        );


        return rows.length ? rows[0].id : null;

    }

    static async syncProduit(
        boutiqueId: number,
        produit: any
    ) {

        const categorieId =
            await this.findCategorieIdByUUID(
                boutiqueId,
                produit.categorie_uuid
            );


        if (!categorieId) {
            throw new Error(
                "Catégorie introuvable pour le produit."
            );
        }


        const [result] =
            await db.query<ResultSetHeader>(
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
        image,
        status
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE

        categorie_id = VALUES(categorie_id),
        nom = VALUES(nom),
        description = VALUES(description),
        prix = VALUES(prix),
        stock = VALUES(stock),
        image = VALUES(image),
        status = VALUES(status)

      `,
                [
                    produit.uuid,
                    boutiqueId,
                    categorieId,
                    produit.nom,
                    produit.slug,
                    produit.description ?? null,
                    produit.prix ?? 0,
                    produit.stock ?? 0,
                    produit.image ?? null,
                    produit.status ?? "active"
                ]
            );


        return result;

    }



    static async syncProduits(
        boutiqueId: number,
        produits: any[]
    ) {

        const results = [];


        for (const produit of produits) {

            const result =
                await this.syncProduit(
                    boutiqueId,
                    produit
                );


            results.push(result);

        }


        return results;

    }


    static async syncCategories(
        boutiqueId: number,
        categories: any[]
    ) {

        const results = [];


        for (const categorie of categories) {

            const result = await this.syncCategorie(
                boutiqueId,
                categorie
            );

            results.push(result);

        }


        return results;

    }

    static async findProduitByUUID(
        boutiqueId: number,
        produitUUID: string
    ) {

        const [rows] = await db.query<any[]>(
            `
    SELECT id
    FROM produits
    WHERE uuid = ?
    AND boutique_id = ?
    LIMIT 1
    `,
            [
                produitUUID,
                boutiqueId
            ]
        );


        return rows.length ? rows[0] : null;

    }

    static async syncStock(
        boutiqueId: number,
        stockData: any
    ) {

        const produit =
            await this.findProduitByUUID(
                boutiqueId,
                stockData.uuid
            );


        if (!produit) {
            throw new Error(
                "Produit introuvable."
            );
        }


        const [result] =
            await db.query<ResultSetHeader>(
                `
      UPDATE produits
      SET stock = ?
      WHERE id = ?
      `,
                [
                    stockData.stock,
                    produit.id
                ]
            );


        return result;

    }

    static async syncStocks(
        boutiqueId: number,
        stocks: any[]
    ) {

        const results = [];


        for (const stock of stocks) {

            try {

                const result =
                    await this.syncStock(
                        boutiqueId,
                        stock
                    );


                results.push({
                    uuid: stock.uuid,
                    success: true,
                    result
                });


            } catch (error: any) {


                results.push({
                    uuid: stock.uuid,
                    success: false,
                    message: error.message
                });


            }

        }


        return results;

    }

    static async getCommandeProduits(
        commandeId: number
    ) {

        const [produits] = await db.query<any[]>(
            `
    SELECT
      cp.quantite,
      cp.prix,
      p.uuid,
      p.nom,
      p.image

    FROM commande_produits cp

    INNER JOIN produits p
      ON p.id = cp.produit_id

    WHERE cp.commande_id = ?
    `,
            [
                commandeId
            ]
        );


        return produits;

    }

    static async getCommandes(
        boutiqueId: number
    ) {

        const [commandes] = await db.query<any[]>(
            `
    SELECT *
    FROM commandes
    WHERE boutique_id = ?
    ORDER BY created_at DESC
    `,
            [
                boutiqueId
            ]
        );


        for (const commande of commandes) {

            commande.produits =
                await this.getCommandeProduits(
                    commande.id
                );

        }


        return commandes;

    }

    static async updateCommandeStatus(
        boutiqueId: number,
        commandeUUID: string,
        status: string
    ) {

        const [result] =
            await db.query<ResultSetHeader>(
                `
      UPDATE commandes

      SET status = ?

      WHERE uuid = ?

      AND boutique_id = ?

      `,
                [
                    status,
                    commandeUUID,
                    boutiqueId
                ]
            );


        return result;

    }


}