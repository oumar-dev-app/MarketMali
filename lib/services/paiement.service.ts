import { PaiementRepository } from "../repositories/paiement.repository";
import { db } from "../db";

import {
    Paiement,
    PaiementRow
} from "../types/paiement";

import { NotFoundError } from "../errors/NotFoundError";
import { ConflictError } from "../errors/ConflictError";
import { getPaymentProvider } from "../payments/payment-provider.factory";


export class PaiementService {


    // =========================================================
    // Récupérer un paiement par UUID
    // =========================================================

    static async findByUUID(
        uuid: string
    ): Promise<Paiement> {

        const paiement =
            await PaiementRepository.findByUUID(
                uuid
            );

        if (!paiement) {

            throw new NotFoundError(
                "Paiement introuvable."
            );
        }

        return paiement;
    }


    // =========================================================
    // Récupérer le paiement d'une commande
    // =========================================================

    static async findByCommandeId(
        commande_id: number
    ): Promise<Paiement | null> {

        const paiements =
            await PaiementRepository.findByCommandeId(
                commande_id
            );

        return paiements.length
            ? paiements[0]
            : null;
    }

    // =========================================================
    // Initialiser un paiement auprès du provider
    // =========================================================

    static async initiate(
        paiement_uuid: string,
        successUrl: string,
        errorUrl: string
    ) {

        const paiement =
            await PaiementRepository.findByUUID(
                paiement_uuid
            );

        if (!paiement) {

            throw new NotFoundError(
                "Paiement introuvable."
            );
        }

        // ---------------------------------------------------------
        // Vérifier que le paiement est encore initialisable
        // ---------------------------------------------------------

        if (
            paiement.statut !==
            "pending"
        ) {

            throw new ConflictError(
                `Impossible d'initialiser un paiement avec le statut "${paiement.statut}".`
            );
        }

        // ---------------------------------------------------------
        // Le paiement cash ne passe pas par un provider externe
        // ---------------------------------------------------------

        if (
            paiement.methode ===
            "cash"
        ) {

            throw new ConflictError(
                "Le paiement comptant ne nécessite pas de paiement en ligne."
            );
        }

        // ---------------------------------------------------------
        // Récupérer le provider
        // ---------------------------------------------------------

        const provider =
            getPaymentProvider(
                paiement.methode
            );

        // ---------------------------------------------------------
        // Appel du provider externe
        //
        // IMPORTANT :
        // aucun appel externe pendant une transaction DB.
        // ---------------------------------------------------------

        const result =
            await provider.initiatePayment({
                paiementUuid:
                    paiement.uuid,

                referenceInterne:
                    paiement.reference_interne,

                montant:
                    paiement.montant,

                devise:
                    paiement.devise,

                telephone:
                    paiement.telephone,

                successUrl,

                errorUrl,
            });

        // ---------------------------------------------------------
        // Enregistrer les informations retournées par le provider
        // ---------------------------------------------------------

        const connection =
            await db.getConnection();

        try {

            await PaiementRepository.updateExternalReference(
                paiement.id,
                result.referenceExterne ??
                paiement.reference_interne,
                connection
            );

            await connection.execute(
                `
                UPDATE paiements
                SET
                    provider = ?,
                    metadata = ?
                WHERE id = ?
                `,
                [
                    result.provider,

                    result.metadata
                        ? JSON.stringify(
                            result.metadata
                        )
                        : null,

                    paiement.id
                ]
            );

        } finally {

            connection.release();
        }

        return {
            paiement_uuid:
                paiement.uuid,

            provider:
                result.provider,

            checkoutUrl:
                result.checkoutUrl,

            referenceExterne:
                result.referenceExterne ??
                null,
        };
    }


    // =========================================================
    // Marquer un paiement comme payé
    // =========================================================

    static async markAsPaid(
        paiement_uuid: string
    ) {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            // -----------------------------------------------------
            // Verrouiller le paiement pendant la transaction
            // -----------------------------------------------------

            const [rows] =
                await connection.query<PaiementRow[]>(
                    `
                SELECT *
                FROM paiements
                WHERE uuid = ?
                LIMIT 1
                FOR UPDATE
                `,
                    [
                        paiement_uuid
                    ]
                );

            if (!rows.length) {

                throw new NotFoundError(
                    "Paiement introuvable."
                );
            }

            const paiement =
                rows[0];

            // -----------------------------------------------------
            // Déjà payé
            // -----------------------------------------------------

            if (
                paiement.statut ===
                "paid"
            ) {

                await connection.commit();

                return {
                    message:
                        "Le paiement est déjà marqué comme payé."
                };
            }

            // -----------------------------------------------------
            // Vérifier que le paiement peut être confirmé
            // -----------------------------------------------------

            if (
                paiement.statut !==
                "pending"
            ) {

                throw new ConflictError(
                    `Impossible de confirmer un paiement avec le statut "${paiement.statut}".`
                );
            }

            // -----------------------------------------------------
            // 1. Paiement → paid
            // -----------------------------------------------------

            await PaiementRepository.updateStatus(
                paiement.id,
                "paid",
                connection
            );

            // -----------------------------------------------------
            // 2. Commande → paiement paid
            // -----------------------------------------------------

            await connection.execute(
                `
            UPDATE commandes
            SET statut_paiement = ?
            WHERE id = ?
            `,
                [
                    "paid",
                    paiement.commande_id
                ]
            );

            await connection.commit();

            return {
                message:
                    "Paiement confirmé avec succès."
            };

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    }


    // =========================================================
    // Marquer un paiement comme échoué
    // =========================================================
    static async markAsFailed(
        paiement_uuid: string
    ) {

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            // -----------------------------------------------------
            // Verrouiller le paiement pendant la transaction
            // -----------------------------------------------------

            const [rows] =
                await connection.query<PaiementRow[]>(
                    `
                SELECT *
                FROM paiements
                WHERE uuid = ?
                LIMIT 1
                FOR UPDATE
                `,
                    [
                        paiement_uuid
                    ]
                );

            if (!rows.length) {

                throw new NotFoundError(
                    "Paiement introuvable."
                );
            }

            const paiement =
                rows[0];

            // -----------------------------------------------------
            // Déjà échoué
            // -----------------------------------------------------

            if (
                paiement.statut ===
                "failed"
            ) {

                await connection.commit();

                return {
                    message:
                        "Le paiement est déjà marqué comme échoué."
                };
            }

            // -----------------------------------------------------
            // Vérifier que le paiement peut être marqué échoué
            // -----------------------------------------------------

            if (
                paiement.statut !==
                "pending"
            ) {

                throw new ConflictError(
                    `Impossible de faire échouer un paiement avec le statut "${paiement.statut}".`
                );
            }

            // -----------------------------------------------------
            // 1. Paiement → failed
            // -----------------------------------------------------

            await PaiementRepository.updateStatus(
                paiement.id,
                "failed",
                connection
            );

            // -----------------------------------------------------
            // 2. Commande → paiement failed
            // -----------------------------------------------------

            await connection.execute(
                `
            UPDATE commandes
            SET statut_paiement = ?
            WHERE id = ?
            `,
                [
                    "failed",
                    paiement.commande_id
                ]
            );

            await connection.commit();

            return {
                message:
                    "Paiement marqué comme échoué."
            };

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }
    }


    // =========================================================
    // Annuler un paiement
    // =========================================================

    static async cancel(
        paiement_uuid: string
    ) {

        const paiement =
            await PaiementRepository.findByUUID(
                paiement_uuid
            );

        if (!paiement) {

            throw new NotFoundError(
                "Paiement introuvable."
            );
        }

        if (
            paiement.statut !==
            "pending"
        ) {

            throw new ConflictError(
                `Impossible d'annuler un paiement avec le statut "${paiement.statut}".`
            );
        }

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            await PaiementRepository.updateStatus(
                paiement.id,
                "cancelled",
                connection
            );

            await connection.execute(
                `
                UPDATE commandes
                SET statut_paiement = ?
                WHERE id = ?
                `,
                [
                    "cancelled",
                    paiement.commande_id
                ]
            );

            await connection.commit();

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }

        return {
            message:
                "Paiement annulé avec succès."
        };
    }


    // =========================================================
    // Rembourser un paiement
    // =========================================================

    static async refund(
        paiement_uuid: string
    ) {

        const paiement =
            await PaiementRepository.findByUUID(
                paiement_uuid
            );

        if (!paiement) {

            throw new NotFoundError(
                "Paiement introuvable."
            );
        }

        if (
            paiement.statut !==
            "paid"
        ) {

            throw new ConflictError(
                "Seul un paiement confirmé peut être remboursé."
            );
        }

        const connection =
            await db.getConnection();

        try {

            await connection.beginTransaction();

            await PaiementRepository.updateStatus(
                paiement.id,
                "refunded",
                connection
            );

            await connection.execute(
                `
                UPDATE commandes
                SET statut_paiement = ?
                WHERE id = ?
                `,
                [
                    "refunded",
                    paiement.commande_id
                ]
            );

            await connection.commit();

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }

        return {
            message:
                "Paiement remboursé avec succès."
        };
    }
}
