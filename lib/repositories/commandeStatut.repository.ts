import { db } from "../db";
import {
  RowDataPacket,
  ResultSetHeader,
  Pool,
  PoolConnection
} from "mysql2/promise";
import { CommandeStatus } from "../types/commande";

export interface CommandeStatutRow
  extends RowDataPacket {

  id: number;
  commande_id: number;
  status: CommandeStatus;
  commentaire: string | null;
  created_at: Date;

}

export class CommandeStatutRepository {

  static async create(
    commande_id: number,
    status: CommandeStatus,
    commentaire?: string,
    connection: Pool | PoolConnection = db
  ) {

    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO commande_statuts
      (
        commande_id,
        status,
        commentaire
      )
      VALUES (?, ?, ?)
      `,
      [
        commande_id,
        status,
        commentaire ?? null
      ]
    );

  }

  static async findByCommandeId(
    commande_id: number
  ): Promise<CommandeStatutRow[]> {

    const [rows] =
      await db.query<CommandeStatutRow[]>(
        `
        SELECT *
        FROM commande_statuts
        WHERE commande_id = ?
        ORDER BY created_at ASC
        `,
        [commande_id]
      );

    return rows;

  }

}