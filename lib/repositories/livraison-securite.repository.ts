import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";

import { db } from "../db";

export interface LivraisonSecurite {
  id: number;
  livraison_id: number;

  qr_token_hash: string;
  qr_created_at: Date | null;
  qr_used_at: Date | null;

  otp_hash: string | null;
  otp_created_at: Date | null;
  otp_expires_at: Date | null;
  otp_used_at: Date | null;

  created_at: Date | null;
  updated_at: Date | null;
}

export interface LivraisonSecuriteRow
  extends LivraisonSecurite,
    RowDataPacket {}

export class LivraisonSecuriteRepository {

  /**
   * Créer les données de sécurité.
   *
   * Lors de la création d'une livraison,
   * seul le QR est généré.
   *
   * L'OTP sera généré plus tard,
   * lorsque la livraison sera remise au client.
   */
  static async create(
    data: {
      livraison_id: number;
      qr_token_hash: string;
    },
    connection?: PoolConnection
  ): Promise<number> {

    const executor =
      connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
        INSERT INTO livraison_securites (
          livraison_id,
          qr_token_hash
        )
        VALUES (?, ?)
        `,
        [
          data.livraison_id,
          data.qr_token_hash,
        ]
      );

    return result.insertId;
  }

  /**
   * Récupérer les données de sécurité
   * d'une livraison.
   */
  static async findByLivraisonId(
    livraison_id: number,
    connection?: PoolConnection
  ): Promise<LivraisonSecuriteRow | null> {

    const executor =
      connection ?? db;

    const [rows] =
      await executor.query<LivraisonSecuriteRow[]>(
        `
        SELECT *
        FROM livraison_securites
        WHERE livraison_id = ?
        LIMIT 1
        `,
        [livraison_id]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Récupérer une sécurité à partir
   * du hash du QR.
   */
  static async findByQrTokenHash(
    qr_token_hash: string,
    connection?: PoolConnection
  ): Promise<LivraisonSecuriteRow | null> {

    const executor =
      connection ?? db;

    const [rows] =
      await executor.query<LivraisonSecuriteRow[]>(
        `
        SELECT *
        FROM livraison_securites
        WHERE qr_token_hash = ?
        LIMIT 1
        `,
        [qr_token_hash]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Consommer le QR.
   *
   * L'opération est atomique :
   * un QR déjà utilisé ne peut pas
   * être consommé une deuxième fois.
   */
  static async markQrAsUsed(
    id: number,
    connection?: PoolConnection
  ): Promise<boolean> {

    const executor =
      connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
        UPDATE livraison_securites
        SET qr_used_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND qr_used_at IS NULL
        `,
        [id]
      );

    return result.affectedRows === 1;
  }

  /**
   * Générer ou remplacer l'OTP.
   */
  static async updateOtp(
    id: number,
    data: {
      otp_hash: string;
      otp_expires_at: Date;
    },
    connection?: PoolConnection
  ): Promise<void> {

    const executor =
      connection ?? db;

    await executor.execute<ResultSetHeader>(
      `
      UPDATE livraison_securites
      SET
        otp_hash = ?,
        otp_created_at = CURRENT_TIMESTAMP,
        otp_expires_at = ?,
        otp_used_at = NULL
      WHERE id = ?
      `,
      [
        data.otp_hash,
        data.otp_expires_at,
        id,
      ]
    );
  }

  /**
   * Récupérer une sécurité à partir
   * du hash de l'OTP.
   */
  static async findByOtpHash(
    otp_hash: string,
    connection?: PoolConnection
  ): Promise<LivraisonSecuriteRow | null> {

    const executor =
      connection ?? db;

    const [rows] =
      await executor.query<LivraisonSecuriteRow[]>(
        `
        SELECT *
        FROM livraison_securites
        WHERE otp_hash = ?
        LIMIT 1
        `,
        [otp_hash]
      );

    return rows.length
      ? rows[0]
      : null;
  }

  /**
   * Consommer l'OTP.
   */
  static async markOtpAsUsed(
    id: number,
    connection?: PoolConnection
  ): Promise<boolean> {

    const executor =
      connection ?? db;

    const [result] =
      await executor.execute<ResultSetHeader>(
        `
        UPDATE livraison_securites
        SET otp_used_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND otp_used_at IS NULL
        `,
        [id]
      );

    return result.affectedRows === 1;
  }

  /**
   * Régénérer uniquement le QR.
   *
   * Utilisé lors d'une réaffectation
   * à un nouveau livreur.
   *
   * L'ancien QR devient immédiatement invalide.
   */
  static async updateQr(
    id: number,
    qr_token_hash: string,
    connection?: PoolConnection
  ): Promise<void> {

    const executor =
      connection ?? db;

    await executor.execute<ResultSetHeader>(
      `
      UPDATE livraison_securites
      SET
        qr_token_hash = ?,
        qr_created_at = CURRENT_TIMESTAMP,
        qr_used_at = NULL
      WHERE id = ?
      `,
      [
        qr_token_hash,
        id,
      ]
    );
  }
}