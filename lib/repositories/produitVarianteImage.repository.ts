import {
    ResultSetHeader,
    RowDataPacket,
    Pool,
    PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

export interface ProduitVarianteImageRow
    extends RowDataPacket {
    id: number;
    uuid: string;
    variante_id: number;
    image_url: string;
    ordre: number;
    created_at: Date;
    updated_at: Date;
}

export class ProduitVarianteImageRepository {

    static async findById(
        id: number,
        connection: Pool | PoolConnection = db
    ): Promise<ProduitVarianteImageRow | null> {

        const [rows] =
            await connection.query<
                ProduitVarianteImageRow[]
            >(
                `
                SELECT
                    id,
                    uuid,
                    variante_id,
                    image_url,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variante_images
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );

        return rows.length
            ? rows[0]
            : null;
    }

    static async findByUUID(
        uuid: string,
        connection: Pool | PoolConnection = db
    ): Promise<ProduitVarianteImageRow | null> {

        const [rows] =
            await connection.query<
                ProduitVarianteImageRow[]
            >(
                `
                SELECT
                    id,
                    uuid,
                    variante_id,
                    image_url,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variante_images
                WHERE uuid = ?
                LIMIT 1
                `,
                [uuid]
            );

        return rows.length
            ? rows[0]
            : null;
    }

    static async findByVarianteId(
        variante_id: number,
        connection: Pool | PoolConnection = db
    ): Promise<ProduitVarianteImageRow[]> {

        const [rows] =
            await connection.query<
                ProduitVarianteImageRow[]
            >(
                `
                SELECT
                    id,
                    uuid,
                    variante_id,
                    image_url,
                    ordre,
                    created_at,
                    updated_at
                FROM produit_variante_images
                WHERE variante_id = ?
                ORDER BY ordre ASC, id ASC
                `,
                [variante_id]
            );

        return rows;
    }

    static async create(
        data: {
            uuid: string;
            variante_id: number;
            image_url: string;
            ordre?: number;
        },
        connection: Pool | PoolConnection = db
    ): Promise<number> {

        const [result] =
            await connection.execute<ResultSetHeader>(
                `
                INSERT INTO produit_variante_images (
                    uuid,
                    variante_id,
                    image_url,
                    ordre
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    data.uuid,
                    data.variante_id,
                    data.image_url,
                    data.ordre ?? 0,
                ]
            );

        return result.insertId;
    }

    static async createMany(
        images: Array<{
            uuid: string;
            variante_id: number;
            image_url: string;
            ordre?: number;
        }>,
        connection: Pool | PoolConnection = db
    ): Promise<void> {

        if (!images.length) {
            return;
        }

        const values = images.map((image) => [
            image.uuid,
            image.variante_id,
            image.image_url,
            image.ordre ?? 0,
        ]);

        await connection.query(
            `
            INSERT INTO produit_variante_images (
                uuid,
                variante_id,
                image_url,
                ordre
            )
            VALUES ?
            `,
            [values]
        );
    }

    static async delete(
        id: number,
        connection: Pool | PoolConnection = db
    ): Promise<void> {

        await connection.execute(
            `
            DELETE FROM produit_variante_images
            WHERE id = ?
            `,
            [id]
        );
    }

    static async deleteByVarianteId(
        variante_id: number,
        connection: Pool | PoolConnection = db
    ): Promise<void> {

        await connection.execute(
            `
            DELETE FROM produit_variante_images
            WHERE variante_id = ?
            `,
            [variante_id]
        );
    }
}
