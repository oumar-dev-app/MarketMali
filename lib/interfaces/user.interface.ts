export interface UpdateUserDTO {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  image_url?: string;
}

export interface UpdateRoleDTO {
  role: string;
}