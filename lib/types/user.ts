export type UserRole =
    | "super_admin"
    | "admin"
    | "vendeur"
    | "client"
    | "livreur";
export type UserStatus =
    | "active"
    | "pending"
    | "blocked"
    | "deleted";

export interface User {
    id: number;
    uuid: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    password: string;
    role: UserRole;
    image: string | null;
    email_verified: boolean;
    status: UserStatus;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface UserCreate {
    uuid: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    password: string;
    role?: UserRole;
    status?: UserStatus;
}

export interface UserUpdate {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string | null;
    image?: string | null;
    role?: UserRole;
    status?: UserStatus;
    email_verified?: boolean;
    deleted_at?: Date | null;
}