export interface AuthPayload {
  id: number;
  role:
    | "super_admin"
    | "admin"
    | "vendeur"
    | "client"
    | "livreur";
}

export interface AuthUser {
  id: number;
  role:
    | "super_admin"
    | "admin"
    | "vendeur"
    | "client"
    | "livreur";
}
