import {
    ResultSetHeader,
    PoolConnection,
} from "mysql2/promise";

import { db } from "../db";
import { ConflictError } from "../errors/ConflictError";
import {
    DemandeRole,
    DemandeRoleCreate,
    DemandeRoleRow,
    DemandeRoleStatut,
    DemandeRoleType,
} from "../types/demande-role";

export class DemandeRoleRepository {

    /**
     * Créer une demande.
     */
    static async create(
        data: DemandeRoleCreate
    ): Promise<number> {

        const [result] =
            await db.execute<ResultSetHeader>(
                `
                INSERT INTO demandes_roles
                (
                    uuid,
                    user_id,
                    type,
                    statut,
                    motif
                )
                VALUES (?, ?, ?, 'pending', ?)
                `,
                [
                    data.uuid,
                    data.user_id,
                    data.type,
                    data.motif ?? null,
                ]
            );

        return result.insertId;
    }

    /**
     * Vérifier si l'utilisateur possède
     * déjà une demande en attente.
     */
    static async findPendingByUserAndType(
        user_id: number,
        type: DemandeRoleType
    ): Promise<DemandeRole | null> {

        const [rows] =
            await db.query<DemandeRoleRow[]>(
                `
                SELECT *
                FROM demandes_roles
                WHERE user_id = ?
                AND type = ?
                AND statut = 'pending'
                LIMIT 1
                `,
                [
                    user_id,
                    type,
                ]
            );

        return rows.length
            ? rows[0]
            : null;
    }

    /**
     * Récupérer une demande par UUID.
     */
    static async findByUUID(
        uuid: string
    ): Promise<DemandeRole | null> {

        const [rows] =
            await db.query<DemandeRoleRow[]>(
                `
                SELECT *
                FROM demandes_roles
                WHERE uuid = ?
                LIMIT 1
                `,
                [uuid]
            );

        return rows.length
            ? rows[0]
            : null;
    }

    /**
     * Demandes d'un utilisateur.
     */
    static async findByUserId(
        user_id: number
    ): Promise<DemandeRole[]> {

        const [rows] =
            await db.query<DemandeRoleRow[]>(
                `
                SELECT *
                FROM demandes_roles
                WHERE user_id = ?
                ORDER BY created_at DESC
                `,
                [user_id]
            );

        return rows;
    }

    /**
     * Toutes les demandes pour le dashboard admin.
     */
    static async findAll(
        statut?: DemandeRoleStatut
    ): Promise<DemandeRole[]> {

        const [rows] =
            await db.query<DemandeRoleRow[]>(
                statut
                    ? `
                        SELECT
                            dr.*,
                            u.uuid AS user_uuid,
                            u.nom,
                            u.prenom,
                            u.email,
                            u.telephone
                        FROM demandes_roles dr
                        INNER JOIN users u
                            ON u.id = dr.user_id
                        WHERE dr.statut = ?
                        ORDER BY dr.created_at DESC
                    `
                    : `
                        SELECT
                            dr.*,
                            u.uuid AS user_uuid,
                            u.nom,
                            u.prenom,
                            u.email,
                            u.telephone
                        FROM demandes_roles dr
                        INNER JOIN users u
                            ON u.id = dr.user_id
                        ORDER BY dr.created_at DESC
                    `,
                statut
                    ? [statut]
                    : []
            );

        return rows;
    }

    /**
     * Approuver une demande.
     */
    static async approve(
        id: number,
        adminId: number,
        connection: PoolConnection
    ): Promise<void> {

        const [result] =
            await connection.execute<ResultSetHeader>(
                `
                UPDATE demandes_roles
                SET
                    statut = 'approved',
                    traite_par = ?,
                    traite_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND statut = 'pending'
                `,
                [
                    adminId,
                    id,
                ]
            );

        if (result.affectedRows !== 1) {
            throw new ConflictError(
                "Cette demande n'est plus en attente de traitement."
            );
        }
    }

    /**
     * Refuser une demande.
     */
    static async reject(
        id: number,
        adminId: number,
        commentaire: string | null,
        connection: PoolConnection
    ): Promise<void> {

        const [result] =
            await connection.execute<ResultSetHeader>(
                `
                UPDATE demandes_roles
                SET
                    statut = 'rejected',
                    commentaire_admin = ?,
                    traite_par = ?,
                    traite_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND statut = 'pending'
                `,
                [
                    commentaire,
                    adminId,
                    id,
                ]
            );

        if (result.affectedRows !== 1) {
            throw new ConflictError(
                "Cette demande n'est plus en attente de traitement."
            );
        }
    }
}
