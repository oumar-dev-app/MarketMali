import { randomUUID } from "crypto";
import { db } from "../db";
import {
  DemandeRoleRepository,
} from "../repositories/demande-role.repository";

import {
  DemandeRoleType,
} from "../types/demande-role";

import { UserRepository } from "../repositories/user.repository";

import { NotificationService } from "./notification.service";

import { NotFoundError } from "../errors/NotFoundError";
import { ConflictError } from "../errors/ConflictError";
import { ForbiddenError } from "../errors/ForbiddenError";


export class DemandeRoleService {

  /**
   * Créer une demande pour devenir vendeur
   * ou livreur.
   */
static async create(
  user_id: number,
  type: DemandeRoleType,
  motif?: string | null
) {
  const user =
    await UserRepository.findById(user_id);

  if (!user) {
    throw new NotFoundError(
      "Utilisateur introuvable."
    );
  }

  /*
   * Seul un client peut demander
   * un nouveau rôle.
   */
  if (user.role !== "client") {
    throw new ForbiddenError(
      "Seul un client peut effectuer une demande de rôle."
    );
  }

  /*
   * Vérifier qu'il n'existe pas
   * déjà une demande en attente.
   */
  const existing =
    await DemandeRoleRepository.findPendingByUserAndType(
      user_id,
      type
    );

  if (existing) {
    throw new ConflictError(
      `Vous avez déjà une demande pour devenir ${type} en attente de traitement.`
    );
  }

  /*
   * Créer la demande.
   */
  const uuid = randomUUID();

  await DemandeRoleRepository.create({
    uuid,
    user_id,
    type,
    motif: motif?.trim() || null,
  });

  const typeLabel =
    type === "vendeur"
      ? "vendeur"
      : "livreur";

  /*
   * Notification destinée au client.
   *
   * À ce stade, l'utilisateur est toujours
   * client. Il doit donc être informé que
   * sa demande est simplement en cours
   * de traitement.
   */
  await NotificationService.create({
    user_id,
    type: "role_request",
    titre: "Demande envoyée",
    message:
      `Votre demande pour devenir ${typeLabel} a bien été envoyée. Elle est actuellement en cours de traitement par le super administrateur.`,
  });

  /*
   * Notification destinée aux
   * super administrateurs.
   */
  const superAdmins =
    await UserRepository.findSuperAdministrators();

  for (const admin of superAdmins) {
    await NotificationService.create({
      user_id: admin.id,
      type: "role_request",
      titre: "Nouvelle demande de rôle",
      message:
        `${user.prenom} ${user.nom} souhaite devenir ${typeLabel}.`,
    });
  }

  /*
   * Retourner la demande créée.
   */
  const demande =
    await DemandeRoleRepository.findByUUID(
      uuid
    );

  if (!demande) {
    throw new NotFoundError(
      "Impossible de récupérer la demande créée."
    );
  }

  return demande;
}


  /**
   * Récupérer les demandes d'un utilisateur.
   */
  static async findMyRequests(
    user_id: number
  ) {

    return await DemandeRoleRepository
      .findByUserId(user_id);
  }


  /**
   * Récupérer les demandes pour
   * le dashboard administrateur.
   */
  static async findAll(
    requesterRole: string,
    statut?: "pending" | "approved" | "rejected" | "cancelled"
  ) {

    if (requesterRole !== "super_admin") {
      throw new ForbiddenError(
        "Accès réservé au super administrateur."
      );
    }

    return await DemandeRoleRepository.findAll(
      statut
    );
  }

  /**
 * Approuver une demande de rôle.
 */
  static async approve(
    uuid: string,
    adminId: number,
    requesterRole: string
  ) {

    if (requesterRole !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut approuver une demande."
      );
    }
    const demande =
      await DemandeRoleRepository.findByUUID(
        uuid
      );

    if (!demande) {
      throw new NotFoundError(
        "Demande introuvable."
      );
    }

    if (demande.statut !== "pending") {
      throw new ConflictError(
        "Cette demande a déjà été traitée."
      );
    }

    const user =
      await UserRepository.findById(
        demande.user_id
      );

    if (!user) {
      throw new NotFoundError(
        "Utilisateur introuvable."
      );
    }

    if (user.role !== "client") {
      throw new ConflictError(
        "Cet utilisateur possède déjà un rôle différent de client."
      );
    }

    if (user.status !== "active") {
      throw new ConflictError(
        "Le compte de cet utilisateur n'est pas actif."
      );
    }

    const connection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      /*
/*
 * 1. Modifier le rôle de l'utilisateur.
 */
      await UserRepository.updateRole(
        demande.user_id,
        demande.type,
        connection
      );

      /*
       * 2. Activer le compte.
       */
      await UserRepository.activate(
        demande.user_id,
        connection
      );

      /*
       * 3. Marquer la demande comme approuvée.
       */
      await DemandeRoleRepository.approve(
        demande.id,
        adminId,
        connection
      );

      await connection.commit();

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }

    /*
     * Notification après validation
     * de la transaction.
     */
    await NotificationService.create({
      user_id: demande.user_id,
      type: "role_request",
      titre: "Demande de rôle approuvée",
      message:
        `Votre demande pour devenir ${demande.type} a été approuvée. Votre nouveau rôle est maintenant ${demande.type}.`,
    });

    return DemandeRoleRepository.findByUUID(
      uuid
    );
  }


  /**
   * Refuser une demande de rôle.
   */
  static async reject(
    uuid: string,
    adminId: number,
    requesterRole: string,
    commentaire?: string | null
  ) {
    if (requesterRole !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut rejeter une demande."
      );
    }

    const demande =
      await DemandeRoleRepository.findByUUID(
        uuid
      );

    if (!demande) {
      throw new NotFoundError(
        "Demande introuvable."
      );
    }

    if (demande.statut !== "pending") {
      throw new ConflictError(
        "Cette demande a déjà été traitée."
      );
    }

    const connection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      await DemandeRoleRepository.reject(
        demande.id,
        adminId,
        commentaire?.trim() || null,
        connection
      );

      await connection.commit();

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }

    await NotificationService.create({
      user_id: demande.user_id,
      type: "role_request",
      titre: "Demande de rôle refusée",
      message:
        commentaire?.trim()
          ? `Votre demande pour devenir ${demande.type} a été refusée. Motif : ${commentaire.trim()}`
          : `Votre demande pour devenir ${demande.type} a été refusée.`,
    });

    return DemandeRoleRepository.findByUUID(
      uuid
    );
  }
}
