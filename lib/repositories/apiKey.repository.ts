import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export interface ApiKeyRow extends RowDataPacket {

    id: number;

    uuid: string;

    boutique_id: number;

    name: string;

    key_value: string;

    status: "active" | "revoked";

    last_used_at: Date | null;

    expires_at: Date | null;

    created_at: Date;

    updated_at: Date;

}



export class ApiKeyRepository {


    static async findByKey(
        key: string
    ): Promise<ApiKeyRow | null> {


        const [rows] =
            await db.query<ApiKeyRow[]>(
                `
                SELECT *
                FROM api_keys
                WHERE key_value = ?
                LIMIT 1
                `,
                [
                    key
                ]
            );


        return rows.length
            ? rows[0]
            : null;

    }



    static async create(
        data: {
            uuid: string;
            boutique_id: number;
            name: string;
            key_value: string;
            expires_at?: Date | null;
        }
    ) {


        const [result] =
            await db.execute<ResultSetHeader>(
                `
                INSERT INTO api_keys
                (
                    uuid,
                    boutique_id,
                    name,
                    key_value,
                    expires_at
                )

                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    data.uuid,
                    data.boutique_id,
                    data.name,
                    data.key_value,
                    data.expires_at ?? null
                ]
            );


        return result.insertId;

    }



    static async findByUUID(
        uuid: string
    ): Promise<ApiKeyRow | null> {

        const [rows] =
            await db.query<ApiKeyRow[]>(
                `
            SELECT *
            FROM api_keys
            WHERE uuid = ?
            LIMIT 1 
            `,
                [uuid]
            );

        return rows.length
            ? rows[0]
            : null;

    }

    static async updateKey(
        id: number,
        key: string
    ) {

        await db.execute(
            `
        UPDATE api_keys
        SET
            key_value = ?,
            status = 'active',
            last_used_at = NULL
        WHERE id = ?
        `,
            [
                key,
                id
            ]
        );

    }


    static async findByBoutique(
        boutiqueId: number
    ): Promise<ApiKeyRow[]> {


        const [rows] =
            await db.query<ApiKeyRow[]>(
                `
                SELECT
                id,
                uuid,
                boutique_id,
                name,
                status,
                last_used_at,
                expires_at,
                created_at,
                updated_at
                FROM api_keys
                WHERE boutique_id = ?
                ORDER BY created_at DESC
                `,
                [
                    boutiqueId
                ]
            );


        return rows;

    }



    static async revoke(
        id: number
    ) {


        await db.execute(
            `
            UPDATE api_keys
            SET status = 'revoked'
            WHERE id = ?
            `,
            [
                id
            ]
        );

    }



    static async updateLastUsed(
        id: number
    ) {


        await db.execute(
            `
            UPDATE api_keys
            SET last_used_at = NOW()
            WHERE id = ?
            `,
            [
                id
            ]
        );

    }


}