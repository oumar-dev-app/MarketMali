import { RowDataPacket } from "mysql2";

export type DemandeRoleType =
    | "vendeur"
    | "livreur";

export type DemandeRoleStatut =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export interface DemandeRole {
    id: number;
    uuid: string;
    user_id: number;
    type: DemandeRoleType;
    statut: DemandeRoleStatut;
    motif: string | null;
    commentaire_admin: string | null;
    traite_par: number | null;
    traite_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface DemandeRoleCreate {
    uuid: string;
    user_id: number;
    type: DemandeRoleType;
    motif?: string | null;
}

export interface DemandeRoleRow
    extends DemandeRole,
        RowDataPacket {}

