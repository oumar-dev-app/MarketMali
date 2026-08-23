import { UserRepository } from "../repositories/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { NotFoundError } from "../errors/NotFoundError";
import { ConflictError } from "../errors/ConflictError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { LivreurRepository } from "../repositories/livreur.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import {
  hashPassword,
  comparePassword,
} from "../utils/password";


export class UserService {


  static async findAll() {

    const users = await UserRepository.findAllActive();

    return UserMapper.toListResponse(users);

  }


  static async findByUUID(
    uuid: string
  ) {

    const user = await UserRepository.findByUUID(uuid);

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    return UserMapper.toResponse(user);

  }

  static async block(
    uuid: string,
    requesterId: number,
    requesterRole: string
  ) {

    if (
      requesterRole !== "admin" &&
      requesterRole !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Accès réservé aux administrateurs."
      );
    }

    const user =
      await UserRepository.findByUUID(uuid);

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    if (user.id === requesterId) {
      throw new ForbiddenError(
        "Vous ne pouvez pas bloquer votre propre compte."
      );
    }

    if (
      requesterRole === "admin" &&
      (
        user.role === "admin" ||
        user.role === "super_admin"
      )
    ) {
      throw new ForbiddenError(
        "Un administrateur ne peut pas modifier un administrateur ou un super-administrateur."
      );
    }

    if (user.status === "deleted") {
      throw new ForbiddenError(
        "Impossible de bloquer un utilisateur supprimé."
      );
    }

    if (user.status === "blocked") {
      throw new ConflictError(
        "Cet utilisateur est déjà bloqué."
      );
    }

    await UserRepository.block(user.id);

    const updatedUser =
      await UserRepository.findById(
        user.id
      );

    if (!updatedUser) {
      throw new NotFoundError(
        "Utilisateur introuvable après modification."
      );
    }

    return UserMapper.toResponse(
      updatedUser
    );
  }


  static async unblock(
    uuid: string,
    requesterId: number,
    requesterRole: string
  ) {

    if (
      requesterRole !== "admin" &&
      requesterRole !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Accès réservé aux administrateurs."
      );
    }

    const user =
      await UserRepository.findByUUID(uuid);

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    if (user.id === requesterId) {
      throw new ForbiddenError(
        "Vous ne pouvez pas débloquer votre propre compte."
      );
    }

    if (
      requesterRole === "admin" &&
      (
        user.role === "admin" ||
        user.role === "super_admin"
      )
    ) {
      throw new ForbiddenError(
        "Un administrateur ne peut pas modifier un administrateur ou un super-administrateur."
      );
    }

    if (user.status === "deleted") {
      throw new ForbiddenError(
        "Impossible de débloquer un utilisateur supprimé."
      );
    }

    if (user.status === "active") {
      throw new ConflictError(
        "Cet utilisateur n'est pas bloqué."
      );
    }

    await UserRepository.unblock(user.id);

    const updatedUser =
      await UserRepository.findById(
        user.id
      );

    if (!updatedUser) {
      throw new NotFoundError(
        "Utilisateur introuvable après modification."
      );
    }

    return UserMapper.toResponse(
      updatedUser
    );
  }

  static async findForManagement(
    requesterRole: string
  ) {

    if (
      requesterRole !== "admin" &&
      requesterRole !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Accès réservé aux administrateurs."
      );
    }

    const users =
      await UserRepository.findAllActive();

    /*
     * Un admin ne doit pas pouvoir consulter
     * les comptes administrateurs ou super-admin.
     */
    if (requesterRole === "admin") {

      return UserMapper.toListResponse(
        users.filter(
          (user) =>
            user.role !== "admin" &&
            user.role !== "super_admin"
        )
      );
    }

    /*
     * Le super-admin peut consulter tous
     * les utilisateurs actifs.
     */
    return UserMapper.toListResponse(
      users
    );
  }

  static async findDetails(
    uuid: string,
    requesterRole: string
  ) {

    if (
      requesterRole !== "admin" &&
      requesterRole !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Accès réservé aux administrateurs."
      );
    }

    const user =
      await UserRepository.findByUUID(
        uuid
      );

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    /*
     * Un admin ne peut pas consulter
     * les comptes admin/super-admin.
     */
    if (
      requesterRole === "admin" &&
      (
        user.role === "admin" ||
        user.role === "super_admin"
      )
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès à ce compte."
      );
    }

    const response =
      UserMapper.toResponse(user);

    let boutique = null;
    let livreur = null;

    /*
     * Vendeur
     */
    if (
      user.role === "vendeur"
    ) {

      boutique =
        await BoutiqueRepository.findByUserId(
          user.id
        );
    }

    /*
     * Livreur
     */
    if (
      user.role === "livreur"
    ) {

      livreur =
        await LivreurRepository.findByUserId(
          user.id
        );

      if (livreur) {

        boutique =
          await BoutiqueRepository.findById(
            livreur.boutique_id
          );
      }
    }

    return {
      ...response,

      boutique: boutique
        ? {
          id: boutique.id,
          uuid: boutique.uuid,
          nom: boutique.nom,
          slug: boutique.slug,
          telephone: boutique.telephone,
          email: boutique.email,
          adresse: boutique.adresse,
          ville: boutique.ville,
          status: boutique.status,
        }
        : null,

      livreur: livreur
        ? {
          id: livreur.id,
          uuid: livreur.uuid,
          boutique_id:
            livreur.boutique_id,
          user_id:
            livreur.user_id,
          nom: livreur.nom,
          prenom: livreur.prenom,
          telephone:
            livreur.telephone,
          vehicule:
            livreur.vehicule,
          status:
            livreur.status,
          disponibilite:
            livreur.disponibilite,
          created_at:
            livreur.created_at,
          updated_at:
            livreur.updated_at,
        }
        : null,
    };
  }

    static async updateOwnProfile(
    userId: number,
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      image?: string | null;
    }
  ) {
    const user =
      await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    if (user.status === "deleted") {
      throw new ForbiddenError(
        "Ce compte a été supprimé."
      );
    }

    /*
     * Vérifier l'email uniquement
     * s'il est modifié.
     */
    if (
      data.email &&
      data.email !== user.email
    ) {
      const emailExists =
        await UserRepository.findByEmail(
          data.email
        );

      if (
        emailExists &&
        emailExists.id !== user.id
      ) {
        throw new ConflictError(
          "Cette adresse e-mail est déjà utilisée."
        );
      }
    }

    /*
     * Vérifier le téléphone uniquement
     * s'il est modifié.
     */
    if (
      data.telephone &&
      data.telephone !== user.telephone
    ) {
      const telephoneExists =
        await UserRepository.findByTelephone(
          data.telephone
        );

      if (
        telephoneExists &&
        telephoneExists.id !== user.id
      ) {
        throw new ConflictError(
          "Ce numéro de téléphone est déjà utilisé."
        );
      }
    }

    await UserRepository.update(
      user.id,
      data
    );

    const updatedUser =
      await UserRepository.findById(
        user.id
      );

    if (!updatedUser) {
      throw new NotFoundError(
        "Utilisateur introuvable après modification."
      );
    }

    return UserMapper.toResponse(
      updatedUser
    );
  }


  static async changeOwnPassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    const user =
      await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    if (user.status === "deleted") {
      throw new ForbiddenError(
        "Ce compte a été supprimé."
      );
    }

    const passwordCorrect =
      await comparePassword(
        oldPassword,
        user.password
      );

    if (!passwordCorrect) {
      throw new ForbiddenError(
        "Ancien mot de passe incorrect."
      );
    }

    if (oldPassword === newPassword) {
      throw new ConflictError(
        "Le nouveau mot de passe doit être différent de l'ancien."
      );
    }

    const hashedPassword =
      await hashPassword(
        newPassword
      );

    await UserRepository.update(
      user.id,
      {
        password: hashedPassword,
      }
    );
  }
}