import { PoolConnection } from "mysql2/promise";

import { db } from "../db";

import {
  LivraisonRepository,
  LivraisonStatus,
} from "../repositories/livraison.repository";



import { CommandeRepository } from "../repositories/commande.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { LivreurRepository } from "../repositories/livreur.repository";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

import { CommandeStatus } from "../types/commande";
import { NotificationService } from "./notification.service";
import { CommandeStatutRepository } from "../repositories/commandeStatut.repository";


export class LivraisonService {

  /**
   * Récupérer une livraison par UUID.
   */
  static async findByUUID(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const livraison =
      await LivraisonRepository.findByUUID(
        uuid
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    const commande =
      await CommandeRepository.findById(
        livraison.commande_id
      );

    if (!commande) {
      throw new NotFoundError(
        "Commande introuvable."
      );
    }

    // Administrateurs
    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return livraison;
    }

    // Client
    if (role === "client") {

      if (
        commande.client_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return livraison;
    }

    // Vendeur
    if (role === "vendeur") {

      const boutique =
        await BoutiqueRepository.findById(
          commande.boutique_id
        );

      if (
        !boutique ||
        boutique.user_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return livraison;
    }

    // Livreur
    if (role === "livreur") {

      const livreur =
        await LivreurRepository.findByUserId(
          user_id
        );

      if (
        !livreur ||
        livreur.id !== livraison.livreur_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return livraison;
    }

    throw new ForbiddenError(
      "Accès refusé."
    );
  }


  /**
   * Récupérer la livraison d'une commande.
   */
  static async findByCommande(
    commande_id: number,
    user_id: number,
    role: string
  ) {

    const livraison =
      await LivraisonRepository.findByCommandeId(
        commande_id
      );

    if (!livraison) {
      throw new NotFoundError(
        "Aucune livraison n'est associée à cette commande."
      );
    }

    return await this.findByUUID(
      livraison.uuid,
      user_id,
      role
    );
  }


  /**
   * Vérifier les droits sur une livraison.
   */
  private static async verifyAccess(
    livraison_uuid: string,
    user_id: number,
    role: string
  ) {

    const livraison =
      await LivraisonRepository.findByUUID(
        livraison_uuid
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    const commande =
      await CommandeRepository.findById(
        livraison.commande_id
      );

    if (!commande) {
      throw new NotFoundError(
        "Commande introuvable."
      );
    }

    // Admin
    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return {
        livraison,
        commande
      };
    }

    // Vendeur
    if (role === "vendeur") {

      const boutique =
        await BoutiqueRepository.findById(
          commande.boutique_id
        );

      if (
        !boutique ||
        boutique.user_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return {
        livraison,
        commande
      };
    }

    // Livreur
    if (role === "livreur") {

      const livreur =
        await LivreurRepository.findByUserId(
          user_id
        );


      if (
        !livreur ||
        livreur.id !== livraison.livreur_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return {
        livraison,
        commande
      };
    }

    // Client
    if (role === "client") {

      if (
        commande.client_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette livraison."
        );
      }

      return {
        livraison,
        commande
      };
    }

    throw new ForbiddenError(
      "Accès refusé."
    );
  }

  /**
 * Récupérer les livraisons du livreur connecté.
 */
  static async findMyLivraisons(
    user_id: number,
    role: string
  ) {
    if (role !== "livreur") {
      throw new ForbiddenError(
        "Accès réservé aux livreurs."
      );
    }

    const livreur =
      await LivreurRepository.findByUserId(
        user_id
      );

    if (!livreur) {
      throw new NotFoundError(
        "Profil livreur introuvable."
      );
    }

    return await LivraisonRepository.findActiveByLivreurId(
      livreur.id
    );
  }

  /**
 * Récupérer l'historique des livraisons
 * du livreur connecté.
 */
  static async findMyHistorique(
    user_id: number,
    role: string
  ) {

    if (role !== "livreur") {
      throw new ForbiddenError(
        "Accès réservé aux livreurs."
      );
    }

    const livreur =
      await LivreurRepository.findByUserId(
        user_id
      );

    if (!livreur) {
      throw new NotFoundError(
        "Profil livreur introuvable."
      );
    }

    return await LivraisonRepository.findByLivreurId(
      livreur.id
    );
  }

  /**
   * Récupérer les livraisons accessibles
   * depuis le dashboard vendeur/admin.
   */
  static async findForDashboard(
    user_id: number,
    role: string
  ) {

    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return await LivraisonRepository.findAll();
    }

    if (role === "vendeur") {

      const boutique =
        await BoutiqueRepository.findByUserId(
          user_id
        );

      if (!boutique) {
        throw new NotFoundError(
          "Aucune boutique associée à cet utilisateur."
        );
      }

      return await LivraisonRepository.findByBoutiqueId(
        boutique.id
      );
    }

    throw new ForbiddenError(
      "Accès refusé."
    );
  }


  /**
   * Mettre à jour le statut de la livraison.
   */
  static async updateStatus(
    uuid: string,
    user_id: number,
    role: string,
    status: LivraisonStatus,
    commentaire?: string
  ) {

    const {
      livraison,
      commande
    } =
      await this.verifyAccess(
        uuid,
        user_id,
        role
      );

    // Seul le livreur ou l'administration
    // peut modifier le statut d'une livraison.
    const isAdmin =
      role === "admin" ||
      role === "super_admin";

    const isLivreur =
      role === "livreur";

    if (!isLivreur && !isAdmin) {
      throw new ForbiddenError(
        "Vous n'êtes pas autorisé à modifier cette livraison."
      );
    }

    if (
      status === "delivered" &&
      role === "livreur"
    ) {
      throw new ForbiddenError(
        "Le livreur ne peut pas confirmer définitivement la livraison. Le client doit confirmer la réception."
      );
    }
    /*
     * Vérifier les transitions.
     */
    const transitions:
      Record<
        LivraisonStatus,
        LivraisonStatus[]
      > = {

      assigned: [
        "picked_up",
        "cancelled"
      ],

      picked_up: [
        "in_transit",
        "cancelled"
      ],

      in_transit: [
        "delivery_pending_confirmation",
        "cancelled"
      ],

      delivery_pending_confirmation: [],

      delivered: [],

      cancelled: []
    };

    const currentStatus =
      livraison.status;

    const allowedTransitions =
      transitions[currentStatus];

    if (
      !allowedTransitions.includes(status)
    ) {
      throw new ForbiddenError(
        `Transition impossible : ${currentStatus} → ${status}.`
      );
    }
    /*
     * Une livraison ne peut être
     * validée que si la commande
     * est dans un état cohérent.
     */
    /*
   * Vérifier la cohérence avec le statut
   * global de la commande.
   */

    if (
      status === "picked_up" &&
      commande.status !== "preparing"
    ) {
      throw new ForbiddenError(
        "La commande doit être en préparation avant la récupération."
      );
    }

    if (
      status === "in_transit" &&
      commande.status !== "preparing"
    ) {
      throw new ForbiddenError(
        "La commande doit être en préparation avant le départ du livreur."
      );
    }

    if (
      status === "delivered" &&
      commande.status !== "shipped"
    ) {
      throw new ForbiddenError(
        "La commande doit être expédiée avant d'être livrée."
      );
    }

    const connection:
      PoolConnection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      /*
       * 1. Mettre à jour la livraison.
       */
      await LivraisonRepository.updateStatus(
        livraison.id,
        status,
        commentaire?.trim() || null,
        connection
      );

      /*
       * 2. Synchroniser le statut
       * global de la commande.
       */
      let commandeStatus:
        CommandeStatus | null = null;

      if (
        status === "in_transit"
      ) {
        commandeStatus =
          "shipped";
      }

      if (
        status === "delivered"
      ) {
        commandeStatus =
          "delivered";
      }

      /*
       * Une livraison annulée ne signifie
       * pas automatiquement que la commande
       * est annulée.
       */
      if (commandeStatus) {

        await CommandeRepository.updateStatus(
          commande.id,
          commandeStatus,
          connection
        );
      }

      /*
       * 3. Si la livraison est terminée,
       * libérer le livreur.
       */
      if (
        status === "delivered" ||
        status === "cancelled"
      ) {

        const livreur =
          await LivreurRepository.findById(
            livraison.livreur_id
          );

        if (
          livreur &&
          livreur.status === "active"
        ) {

          await LivreurRepository.updateDisponibilite(
            livreur.id,
            "available",
            connection
          );
        }

        /*
         * Si la livraison est annulée,
         * le livreur n'est plus affecté à la commande.
         */
        if (status === "cancelled") {

          await CommandeRepository.unassignLivreur(
            commande.id,
            connection
          );
        }
      }

      await connection.commit();

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();
    }

    /*
     * Notification client.
     */
    const messages: Record<
      LivraisonStatus,
      {
        titre: string;
        message: string;
      }
    > = {

      assigned: {
        titre:
          `Livraison de la commande #${commande.id} assignée`,
        message:
          `Un livreur a été affecté à votre commande #${commande.id}.`
      },

      picked_up: {
        titre:
          `Commande #${commande.id} récupérée`,
        message:
          `Votre commande #${commande.id} a été récupérée par le livreur.`
      },

      in_transit: {
        titre:
          `Commande #${commande.id} en cours de livraison`,
        message:
          `Votre commande #${commande.id} est actuellement en cours de livraison.`
      },

      delivery_pending_confirmation: {
        titre:
          `Confirmation de réception de la commande #${commande.id}`,
        message:
          `Le livreur indique avoir remis votre commande #${commande.id}. Veuillez confirmer sa réception.`
      },

      delivered: {
        titre:
          `Commande #${commande.id} livrée`,
        message:
          `Votre commande #${commande.id} a été livrée avec succès.`
      },

      cancelled: {
        titre:
          `Livraison de la commande #${commande.id} annulée`,
        message:
          `La livraison de votre commande #${commande.id} a été annulée.`
      }
    };

    const notification =
      messages[status];

    await NotificationService.create({
      user_id: commande.client_id,
      commande_id: commande.id,
      type: "order_status",
      titre:
        notification.titre,
      message:
        commentaire?.trim()
          ? `${notification.message} Motif : ${commentaire.trim()}`
          : notification.message
    });

    return {
      message:
        "Statut de la livraison mis à jour avec succès.",
      livraison:
        await LivraisonRepository.findByUUID(
          uuid
        )
    };
  }
  /**
 * Confirmation finale de la livraison par le client.
 *
 * Le livreur peut déclarer la remise du colis,
 * mais seul le client peut confirmer définitivement
 * la réception.
 */
  static async confirmDeliveryByClient(
    uuid: string,
    user_id: number,
    role: string
  ) {

    if (role !== "client") {
      throw new ForbiddenError(
        "Seul le client peut confirmer la réception de la commande."
      );
    }

    const {
      livraison,
      commande
    } = await this.verifyAccess(
      uuid,
      user_id,
      role
    );

    if (
      livraison.status !==
      "delivery_pending_confirmation"
    ) {
      throw new ForbiddenError(
        "Cette livraison n'est pas en attente de confirmation."
      );
    }

    const connection:
      PoolConnection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      await LivraisonRepository.updateStatus(
        livraison.id,
        "delivered",
        null,
        connection
      );

      /*
       * 2. Commande définitivement livrée.
       */
      await CommandeRepository.updateStatus(
        commande.id,
        "delivered",
        connection
      );

      /*
       * 3. Ajouter l'historique de la commande.
       */
      await CommandeStatutRepository.create(
        commande.id,
        "delivered",
        "Réception confirmée par le client.",
        connection
      );

      /*
       * 3. Libérer le livreur.
       */
      const livreur =
        await LivreurRepository.findById(
          livraison.livreur_id
        );

      if (
        livreur &&
        livreur.status === "active"
      ) {
        await LivreurRepository.updateDisponibilite(
          livreur.id,
          "available",
          connection
        );
      }

      await connection.commit();

    } catch (error) {

      await connection.rollback();

      throw error;

    } finally {

      connection.release();

    }

    /*
     * Notification du client.
     */
    await NotificationService.create({
      user_id: commande.client_id,
      commande_id: commande.id,
      type: "order_status",
      titre:
        `Réception confirmée - commande #${commande.id}`,
      message:
        `Vous avez confirmé la réception de votre commande #${commande.id}.`
    });

    /*
     * Notification du vendeur.
     */
    const boutique =
      await BoutiqueRepository.findById(
        commande.boutique_id
      );

    if (boutique) {

      await NotificationService.create({
        user_id: boutique.user_id,
        commande_id: commande.id,
        type: "order_status",
        titre:
          `Commande #${commande.id} livrée`,
        message:
          `Le client a confirmé la réception de la commande #${commande.id}. La commande est maintenant définitivement livrée.`
      });

    }

    return {
      message:
        "Réception de la commande confirmée avec succès.",
      livraison:
        await LivraisonRepository.findByUUID(
          uuid
        )
    };
  }
}

