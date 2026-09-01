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
import { LivraisonSecuriteService } from "./livraison-securite.service";
import { CommandeStatutRepository } from "../repositories/commandeStatut.repository";
import { LivraisonSecuriteRepository } from "../repositories/livraison-securite.repository";


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

    /*
    * Seul le livreur ou l'administration
    * peut modifier le statut d'une livraison.
    */
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

    /*
    * Le livreur ne peut jamais confirmer
    * définitivement la livraison.
    *
    * Seul le client peut passer à delivered
    * via confirmDeliveryByClient().
    */
    if (
      status === "delivered" &&
      role === "livreur"
    ) {
      throw new ForbiddenError(
        "Le livreur ne peut pas confirmer définitivement la livraison. Le client doit confirmer la réception."
      );
    }

    /*
    * Transitions autorisées.
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
    * Cohérence avec le statut global
    * de la commande.
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

    /*
    * Une confirmation finale ne peut être
    * effectuée que par confirmDeliveryByClient().
    */
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
    let deliveryOtp: string | null = null;

    try {

      await connection.beginTransaction();

      /*
      * 1. Mettre à jour le statut de livraison.
      */
      await LivraisonRepository.updateStatus(
        livraison.id,
        status,
        commentaire?.trim() || null,
        connection
      );

      /*
      * 2. Générer l'OTP lorsque le livreur
      * déclare avoir remis le colis au client.
      *
      * Important :
      * le statut a déjà été changé en
      * delivery_pending_confirmation,
      * ce qui permet à generateDeliveryOtp()
      * de valider correctement l'état.
      */
      if (
        status ===
        "delivery_pending_confirmation"
      ) {

        const securite =
          await LivraisonSecuriteService.generateDeliveryOtp(
            livraison.id,
            connection
          );

        deliveryOtp =
          securite.otp;
      }

      /*
      * 3. Synchroniser le statut global
      * de la commande.
      */
      let commandeStatus:
        CommandeStatus | null = null;

      if (
        status === "in_transit"
      ) {
        commandeStatus =
          "shipped";
      }

      /*
      * delivered n'est normalement jamais
      * atteint par updateStatus() pour un livreur.
      *
      * Le client passe à delivered via
      * confirmDeliveryByClient().
      */
      if (
        status === "delivered"
      ) {
        commandeStatus =
          "delivered";
      }

      if (commandeStatus) {

        await CommandeRepository.updateStatus(
          commande.id,
          commandeStatus,
          connection
        );
      }

      /*
      * 4. Libérer le livreur uniquement
      * lorsque la livraison est réellement
      * terminée ou annulée.
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
        * En cas d'annulation, retirer
        * également le livreur de la commande.
        */
        if (
          status === "cancelled"
        ) {

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
    const messages:
      Record<
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
          `Le livreur indique avoir remis votre commande #${commande.id}. Veuillez confirmer sa réception avec le code de confirmation reçu.`
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

    let notificationMessage =
      notification.message;

    /*
     * Ajouter l'OTP uniquement lorsque
     * le livreur déclare la remise du colis.
     */
    if (
      status ===
      "delivery_pending_confirmation" &&
      deliveryOtp
    ) {
      notificationMessage +=
        ` Votre code de confirmation est : ${deliveryOtp}.` +
        ` Il est valable pendant 10 minutes.` +
        ` Ne communiquez ce code qu'après avoir reçu votre commande.`;
    }

    await NotificationService.create({
      user_id: commande.client_id,
      commande_id: commande.id,
      type: "order_status",
      titre:
        notification.titre,
      message:
        commentaire?.trim()
          ? `${notificationMessage} Motif : ${commentaire.trim()}`
          : notificationMessage
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

  static async verifyPickupQr(
    uuid: string,
    user_id: number,
    role: string,
    qrToken: string
  ) {

    if (role !== "livreur") {
      throw new ForbiddenError(
        "Seul le livreur peut récupérer une commande."
      );
    }

    const token = qrToken.trim();

    if (!token) {
      throw new ForbiddenError(
        "Token QR invalide."
      );
    }

    /*
     * Vérifier que le livreur existe.
     */
    const livreur =
      await LivreurRepository.findByUserId(
        user_id
      );

    if (!livreur) {
      throw new ForbiddenError(
        "Profil livreur introuvable."
      );
    }

    /*
     * Récupérer la livraison.
     */
    const livraison =
      await LivraisonRepository.findByUUID(
        uuid
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    /*
     * Vérifier que la livraison
     * est bien affectée au livreur connecté.
     */
    if (
      livraison.livreur_id !== livreur.id
    ) {
      throw new ForbiddenError(
        "Cette livraison n'est pas affectée à ce livreur."
      );
    }

    /*
     * Récupérer la commande.
     */
    const commande =
      await CommandeRepository.findById(
        livraison.commande_id
      );

    if (!commande) {
      throw new NotFoundError(
        "Commande introuvable."
      );
    }

    /*
     * La commande doit être prête
     * avant la récupération du colis.
     */
    if (
      commande.status !== "preparing"
    ) {
      throw new ForbiddenError(
        "La commande doit être en préparation avant la récupération du colis."
      );
    }

    /*
     * Le QR ne peut être utilisé
     * que lorsque la livraison est assigned.
     */
    if (
      livraison.status !== "assigned"
    ) {
      throw new ForbiddenError(
        "Cette livraison n'est plus en attente de récupération."
      );
    }

    /*
     * Transaction :
     *
     * - validation du QR
     * - consommation du QR
     * - passage à picked_up
     *
     * doivent être effectués ensemble.
     */
    const connection =
      await db.getConnection();

    try {

      await connection.beginTransaction();

      /*
       * Vérifier et consommer le QR.
       *
       * Toute la logique cryptographique
       * est centralisée dans LivraisonSecuriteService.
       */
      const securite =
        await LivraisonSecuriteService.verifyPickupQr(
          token,
          connection
        );

      /*
       * Vérifier que le QR correspond
       * bien à cette livraison.
       */
      if (
        securite.livraison_id !==
        livraison.id
      ) {
        throw new ForbiddenError(
          "Ce QR ne correspond pas à cette livraison."
        );
      }

      /*
       * Passage automatique à picked_up.
       */
      await LivraisonRepository.updateStatus(
        livraison.id,
        "picked_up",
        "Colis récupéré par le livreur après validation du QR.",
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
     * Notification au client.
     */
    await NotificationService.create({
      user_id: commande.client_id,
      commande_id: commande.id,
      type: "order_status",
      titre:
        `Commande #${commande.id} récupérée`,
      message:
        `Votre commande #${commande.id} a été récupérée par le livreur.`
    });

    return {
      success: true,
      message:
        "QR validé. Le colis a été récupéré avec succès.",
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
    role: string,
    method: "otp",
    otp?: string
  ) {

    if (role !== "client") {
      throw new ForbiddenError(
        "Seul le client peut confirmer la réception de la commande."
      );
    }

    if (method !== "otp") {
      throw new ForbiddenError(
        "La confirmation de réception doit être effectuée avec le code OTP."
      );
    }

    /*
    * Vérifier les droits du client
    * et récupérer la livraison + commande.
    */
    const {
      livraison,
      commande
    } = await this.verifyAccess(
      uuid,
      user_id,
      role
    );

    /*
    * La confirmation finale n'est possible
    * que lorsque le livreur a déclaré la remise.
    */
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
      /*
      * Confirmation finale par OTP.
      *
      * Le QR de récupération est réservé
      * au livreur et ne peut pas être utilisé
      * pour confirmer la réception client.
      */
      if (!otp?.trim()) {
        throw new ForbiddenError(
          "Le code OTP est requis pour confirmer la réception."
        );
      }

      await LivraisonSecuriteService.verifyOtp(
        otp,
        livraison.id,
        connection
      );

      /*
      * 1. Livraison définitivement confirmée.
      */
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
      * 3. Historique de la commande.
      */
      await CommandeStatutRepository.create(
        commande.id,
        "delivered",
        "Réception confirmée par le client.",
        connection
      );

      /*
      * 4. Libérer le livreur.
      */
      const livreur =
        await LivreurRepository.findById(
          livraison.livreur_id,
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
          `Le client a confirmé la réception de la commande #${commande.id}.`
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

