import { randomUUID } from "crypto";

import { db } from "../db";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { ConflictError } from "../errors/ConflictError";

import { LivreurRepository } from "../repositories/livreur.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";


export class LivreurService {

  /**
   * Vérifie que l'utilisateur a accès à la boutique.
   */
  private static async verifyBoutiqueAccess(
    boutique_id: number,
    user_id: number,
    role: string
  ) {

    const boutique =
      await BoutiqueRepository.findById(
        boutique_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    if (
      role !== "admin" &&
      role !== "super_admin" &&
      boutique.user_id !== user_id
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès à cette boutique."
      );
    }

    return boutique;
  }


  /**
   * Récupérer les livreurs d'une boutique.
   */
  static async findByBoutique(
    boutique_id: number,
    user_id: number,
    role: string
  ) {

    await this.verifyBoutiqueAccess(
      boutique_id,
      user_id,
      role
    );

    return await LivreurRepository.findByBoutiqueId(
      boutique_id
    );
  }


  /**
   * Récupérer les livreurs disponibles.
   */
  static async findAvailableByBoutique(
    boutique_id: number,
    user_id: number,
    role: string
  ) {

    await this.verifyBoutiqueAccess(
      boutique_id,
      user_id,
      role
    );

    return await LivreurRepository.findAvailableByBoutiqueId(
      boutique_id
    );
  }


  /**
   * Récupérer un livreur par UUID.
   */
  static async findByUUID(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const livreur =
      await LivreurRepository.findByUUID(
        uuid
      );

    if (!livreur) {
      throw new NotFoundError(
        "Livreur introuvable."
      );
    }

    await this.verifyBoutiqueAccess(
      livreur.boutique_id,
      user_id,
      role
    );

    return livreur;
  }


/**
 * Créer un livreur avec son compte utilisateur.
 */
static async create(
  data: {
    boutique_id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    password: string;
    vehicule?: string | null;
  },
  user_id: number,
  role: string
) {

  await this.verifyBoutiqueAccess(
    data.boutique_id,
    user_id,
    role
  );

  const nom =
    data.nom?.trim();

  const prenom =
    data.prenom?.trim();

  const telephone =
    data.telephone?.trim();

  const email =
    data.email?.trim().toLowerCase();

  const password =
    data.password;

  const vehicule =
    data.vehicule?.trim() || null;

  if (!nom) {
    throw new ForbiddenError(
      "Le nom du livreur est obligatoire."
    );
  }

  if (!prenom) {
    throw new ForbiddenError(
      "Le prénom du livreur est obligatoire."
    );
  }

  if (!telephone) {
    throw new ForbiddenError(
      "Le téléphone du livreur est obligatoire."
    );
  }

  if (!email) {
    throw new ForbiddenError(
      "L'adresse e-mail du livreur est obligatoire."
    );
  }

  if (!password || password.length < 6) {
    throw new ForbiddenError(
      "Le mot de passe du livreur doit contenir au moins 6 caractères."
    );
  }

  /*
   * Vérifier que l'e-mail n'est pas déjà utilisé.
   */
  const existingEmail =
    await UserRepository.findByEmail(
      email
    );

  if (existingEmail) {
    throw new ConflictError(
      "Cette adresse e-mail est déjà utilisée."
    );
  }

  /*
   * Vérifier que le téléphone n'est pas déjà utilisé.
   */
  const existingTelephone =
    await UserRepository.findByTelephone(
      telephone
    );

  if (existingTelephone) {
    throw new ConflictError(
      "Ce numéro de téléphone est déjà utilisé."
    );
  }

  /*
   * Hasher le mot de passe avant
   * de commencer la transaction.
   */
  const hashedPassword =
    await hashPassword(password);

  const connection =
    await db.getConnection();

  try {

    await connection.beginTransaction();

    /*
     * 1. Créer le compte utilisateur.
     */
    const userId =
      await UserRepository.create(
        {
          uuid: randomUUID(),
          nom,
          prenom,
          email,
          telephone,
          password: hashedPassword,
          role: "livreur",
          status: "active"
        },
        connection
      );

    /*
     * 2. Créer le profil livreur.
     */
    const livreurId =
      await LivreurRepository.create(
        {
          uuid: randomUUID(),
          boutique_id: data.boutique_id,
          user_id: userId,
          nom,
          prenom,
          telephone,
          vehicule
        },
        connection
      );

    await connection.commit();

    return await LivreurRepository.findById(
      livreurId
    );

  } catch (error) {

    await connection.rollback();

    throw error;

  } finally {

    connection.release();

  }
}


  /**
   * Modifier un livreur.
   */
  static async update(
    uuid: string,
    user_id: number,
    role: string,
    data: {
      nom?: string;
      prenom?: string;
      telephone?: string;
      vehicule?: string | null;
      status?: "active" | "inactive" | "suspended";
      disponibilite?: "available" | "unavailable";
    }
  ) {

    const livreur =
      await LivreurRepository.findByUUID(
        uuid
      );

    if (!livreur) {
      throw new NotFoundError(
        "Livreur introuvable."
      );
    }

    await this.verifyBoutiqueAccess(
      livreur.boutique_id,
      user_id,
      role
    );

    const updateData: {
      nom?: string;
      prenom?: string;
      telephone?: string;
      vehicule?: string | null;
      status?: "active" | "inactive" | "suspended";
      disponibilite?: "available" | "unavailable";
    } = {};

    if (data.nom !== undefined) {

      const nom =
        data.nom.trim();

      if (!nom) {
        throw new ForbiddenError(
          "Le nom du livreur est obligatoire."
        );
      }

      updateData.nom = nom;
    }

    if (data.prenom !== undefined) {

      const prenom =
        data.prenom.trim();

      if (!prenom) {
        throw new ForbiddenError(
          "Le prénom du livreur est obligatoire."
        );
      }

      updateData.prenom = prenom;
    }

    if (data.telephone !== undefined) {

      const telephone =
        data.telephone.trim();

      if (!telephone) {
        throw new ForbiddenError(
          "Le téléphone du livreur est obligatoire."
        );
      }

      updateData.telephone =
        telephone;
    }

    if (data.vehicule !== undefined) {

      updateData.vehicule =
        data.vehicule?.trim() || null;
    }

    if (data.status !== undefined) {

      updateData.status =
        data.status;

      /*
       * Un livreur inactif ou suspendu
       * ne peut pas rester disponible.
       */
      if (
        data.status === "inactive" ||
        data.status === "suspended"
      ) {
        updateData.disponibilite =
          "unavailable";
      }
    }

    if (data.disponibilite !== undefined) {

      /*
       * Un livreur inactif/suspendu
       * ne peut jamais devenir disponible.
       */
      if (
        data.disponibilite === "available" &&
        (
          data.status === "inactive" ||
          data.status === "suspended" ||
          livreur.status === "inactive" ||
          livreur.status === "suspended"
        )
      ) {
        throw new ForbiddenError(
          "Un livreur inactif ou suspendu ne peut pas être disponible."
        );
      }

      updateData.disponibilite =
        data.disponibilite;
    }

    await LivreurRepository.update(
      livreur.id,
      updateData
    );

    return await LivreurRepository.findByUUID(
      uuid
    );
  }


  /**
   * Supprimer un livreur.
   */
  static async delete(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const livreur =
      await LivreurRepository.findByUUID(
        uuid
      );

    if (!livreur) {
      throw new NotFoundError(
        "Livreur introuvable."
      );
    }

    await this.verifyBoutiqueAccess(
      livreur.boutique_id,
      user_id,
      role
    );

    await LivreurRepository.delete(
      livreur.id
    );

    return {
      message:
        "Livreur supprimé avec succès."
    };
  }


  /**
   * Modifier uniquement la disponibilité.
   */
  static async updateDisponibilite(
    uuid: string,
    disponibilite:
      "available" |
      "unavailable",
    user_id: number,
    role: string
  ) {

    const livreur =
      await LivreurRepository.findByUUID(
        uuid
      );

    if (!livreur) {
      throw new NotFoundError(
        "Livreur introuvable."
      );
    }

    await this.verifyBoutiqueAccess(
      livreur.boutique_id,
      user_id,
      role
    );

    if (
      disponibilite === "available" &&
      (
        livreur.status === "inactive" ||
        livreur.status === "suspended"
      )
    ) {
      throw new ForbiddenError(
        "Un livreur inactif ou suspendu ne peut pas être disponible."
      );
    }

    await LivreurRepository.updateDisponibilite(
      livreur.id,
      disponibilite
    );

    return await LivreurRepository.findByUUID(
      uuid
    );
  }
}

