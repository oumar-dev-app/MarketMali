import {
    ResultSetHeader,
    RowDataPacket,
    PoolConnection,
} from "mysql2/promise";

import { db } from "../db";
import {
    User,
    UserCreate,
    UserUpdate,
} from "../types/user";

interface UserRow extends User, RowDataPacket { }

export class UserRepository {

    static async findAllActive(): Promise<User[]> {
        const [rows] = await db.query<UserRow[]>(
            `
           SELECT *
            FROM users
            WHERE status != 'deleted'
            ORDER BY created_at DESC
            `
        );

        return rows;
    }

    static async findById(id: number): Promise<User | null> {
        const [rows] = await db.query<UserRow[]>(
            `
            SELECT *
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows.length ? rows[0] : null;
    }

    static async findByUUID(uuid: string): Promise<User | null> {
        const [rows] = await db.query<UserRow[]>(
            `
            SELECT *
            FROM users
            WHERE uuid = ?
            AND status != 'deleted'
            LIMIT 1
            `,
            [uuid]
        );

        return rows.length ? rows[0] : null;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const [rows] = await db.query<UserRow[]>(
            `
            SELECT *
            FROM users
            WHERE email = ?
            AND status != 'deleted'
            LIMIT 1
            `,
            [email]
        );

        return rows.length ? rows[0] : null;
    }

    static async findByTelephone(
        telephone: string
    ): Promise<User | null> {
        const [rows] = await db.query<UserRow[]>(
            `
            SELECT *
            FROM users
            WHERE telephone = ?
            AND status != 'deleted'
            LIMIT 1
            `,
            [telephone]
        );

        return rows.length ? rows[0] : null;
    }

    static async create(
        data: UserCreate,
        connection?: PoolConnection
    ): Promise<number> {

        const executor = connection ?? db;

        const [result] =
            await executor.execute<ResultSetHeader>(
                `
            INSERT INTO users
            (
                uuid,
                nom,
                prenom,
                email,
                telephone,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
                [
                    data.uuid,
                    data.nom,
                    data.prenom,
                    data.email,
                    data.telephone ?? null,
                    data.password,
                    data.role ?? "client",
                    data.status ?? "pending",
                ]
            );

        return result.insertId;
    }

    static async createWithConnection(
        data: UserCreate,
        connection: PoolConnection
    ): Promise<number> {

        const [result] =
            await connection.execute<ResultSetHeader>(
                `
            INSERT INTO users
            (
                uuid,
                nom,
                prenom,
                email,
                telephone,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
                [
                    data.uuid,
                    data.nom,
                    data.prenom,
                    data.email,
                    data.telephone ?? null,
                    data.password,
                    data.role ?? "client",
                    data.status ?? "pending",
                ]
            );

        return result.insertId;
    }

    static async update(
        id: number,
        data: UserUpdate
    ): Promise<void> {

        const fields = Object.entries(data).filter(
            ([, value]) => value !== undefined
        );

        if (!fields.length) {
            return;
        }

        const sql = fields
            .map(([key]) => `${key} = ?`)
            .join(", ");

        const values = fields.map(([, value]) => value);

        values.push(id);

        await db.execute<ResultSetHeader>(
            `
            UPDATE users
            SET ${sql}
            WHERE id = ?
            `,
            values
        );
    }

    static async softDelete(
        id: number
    ): Promise<void> {

        await db.execute<ResultSetHeader>(
            `
        UPDATE users
        SET
            status = 'deleted',
            deleted_at = NOW()
        WHERE id = ?
        `,
            [id]
        );

    }

    static async restore(
        id: number
    ): Promise<void> {

        await db.execute<ResultSetHeader>(
            `
        UPDATE users
        SET
            status = 'active',
            deleted_at = NULL
        WHERE id = ?
        `,
            [id]
        );

    }

    static async block(
        id: number
    ): Promise<void> {

        await db.execute<ResultSetHeader>(
            `
        UPDATE users
        SET status = 'blocked'
        WHERE id = ?
        `,
            [id]
        );

    }

    static async unblock(
        id: number
    ): Promise<void> {

        await db.execute<ResultSetHeader>(
            `
        UPDATE users
        SET status = 'active'
        WHERE id = ?
        `,
            [id]
        );

    }

    static async updateRole(
        id: number,
        role: User["role"],
        connection?: PoolConnection
    ): Promise<void> {

        const executor = connection ?? db;

        const [result] =
            await executor.execute<ResultSetHeader>(
                `
                UPDATE users
                SET role = ?
                WHERE id = ?
                `,
                [
                    role,
                    id,
                ]
            );

        if (result.affectedRows !== 1) {
            throw new Error(
                "Impossible de modifier le rôle de l'utilisateur."
            );
        }
    }

    static async activate(
        id: number,
        connection?: PoolConnection
    ): Promise<void> {

        const executor = connection ?? db;

        const [result] =
            await executor.execute<ResultSetHeader>(
                `
            UPDATE users
            SET status = 'active'
            WHERE id = ?
            `,
                [id]
            );

        if (result.affectedRows !== 1) {
            throw new Error(
                "Impossible d'activer le compte de l'utilisateur."
            );
        }
    }

    static async findAdministrators(): Promise<User[]> {
        const [rows] = await db.query<UserRow[]>(
            `
        SELECT *
        FROM users
        WHERE role IN ('admin', 'super_admin')
        AND status = 'active'
        ORDER BY id ASC
        `
        );

        return rows;
    }

}