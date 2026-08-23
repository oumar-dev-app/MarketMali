import {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { db } from "../db";

interface PasswordResetTokenRow extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export class PasswordResetTokenRepository {

  /**
   * Créer un nouveau token de réinitialisation
   */
  static async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<number> {

    const [result] =
      await db.execute<ResultSetHeader>(
        `
        INSERT INTO password_reset_tokens
        (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
        `,
        [
          userId,
          tokenHash,
          expiresAt,
        ]
      );

    return result.insertId;
  }


  /**
   * Rechercher un token valide
   */
  static async findValidToken(
    tokenHash: string
  ): Promise<PasswordResetTokenRow | null> {

    const [rows] =
      await db.query<PasswordResetTokenRow[]>(
        `
        SELECT
          id,
          user_id,
          token_hash,
          expires_at,
          used_at,
          created_at
        FROM password_reset_tokens
        WHERE token_hash = ?
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
        `,
        [tokenHash]
      );

    return rows.length
      ? rows[0]
      : null;
  }


  /**
   * Marquer un token comme utilisé
   */
  static async markAsUsed(
    id: number
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ?
      `,
      [id]
    );
  }


  /**
   * Invalider les anciens tokens
   * d'un utilisateur
   */
  static async invalidateUserTokens(
    userId: number
  ): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ?
        AND used_at IS NULL
      `,
      [userId]
    );
  }


  /**
   * Supprimer les tokens expirés
   */
  static async deleteExpired(): Promise<void> {

    await db.execute<ResultSetHeader>(
      `
      DELETE FROM password_reset_tokens
      WHERE expires_at <= NOW()
         OR used_at IS NOT NULL
      `
    );
  }
}
