import { User } from "../types/user";


export interface UserResponse {
  id: number;
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: User["role"];
  image: string | null;
  email_verified: boolean;
  status: User["status"];
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}


export class UserMapper {

  static toResponse(
    user: User
  ): UserResponse {

    return {
      id: user.id,
      uuid: user.uuid,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      image: user.image,
      email_verified: Boolean(user.email_verified),
      status: user.status,
      deleted_at: user.deleted_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }


  static toListResponse(
    users: User[]
  ): UserResponse[] {

    return users.map(
      (user) => this.toResponse(user)
    );
  }

}