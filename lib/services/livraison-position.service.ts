import {
  BoutiqueRepository,
} from "../repositories/boutique.repository";

import {
  LivraisonPositionRepository,
} from "../repositories/livraison-position.repository";

import {
  LivraisonRepository,
} from "../repositories/livraison.repository";

import {
  CommandeRepository,
} from "../repositories/commande.repository";

import {
  LivreurRepository,
} from "../repositories/livreur.repository";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";


export class LivraisonPositionService {

  /**
   * Mettre à jour la position GPS du livreur.
   */
  static async updatePosition(
    livraison_uuid: string,
    user_id: number,
    role: string,
    latitude: number,
    longitude: number,
    precision_gps?: number | null
  ) {

    if (role !== "livreur") {
      throw new ForbiddenError(
        "Seul un livreur peut transmettre sa position."
      );
    }

    /*
     * Vérifier les coordonnées.
     */
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new ForbiddenError(
        "Les coordonnées GPS sont invalides."
      );
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      throw new ForbiddenError(
        "La latitude est invalide."
      );
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      throw new ForbiddenError(
        "La longitude est invalide."
      );
    }

    if (
      precision_gps !== undefined &&
      precision_gps !== null &&
      (
        !Number.isFinite(precision_gps) ||
        precision_gps < 0
      )
    ) {
      throw new ForbiddenError(
        "La précision GPS est invalide."
      );
    }



    /*
     * Récupérer la livraison.
     */
    const livraison =
      await LivraisonRepository.findByUUID(
        livraison_uuid
      );

    if (!livraison) {
      throw new NotFoundError(
        "Livraison introuvable."
      );
    }

    /*
     * Le livreur connecté.
     */
    const livreur =
      await LivreurRepository.findByUserId(
        user_id
      );

    if (!livreur) {
      throw new NotFoundError(
        "Profil livreur introuvable."
      );
    }

    /*
     * Vérifier que ce livreur est
     * bien affecté à cette livraison.
     */
    if (
      livraison.livreur_id !== livreur.id
    ) {
      throw new ForbiddenError(
        "Cette livraison ne vous est pas affectée."
      );
    }

    /*
     * Une position GPS n'est utile que
     * pendant la livraison.
     */
    if (
      livraison.status !== "picked_up" &&
      livraison.status !== "in_transit"
    ) {
      throw new ForbiddenError(
        "La position GPS ne peut être transmise qu'une fois la commande récupérée."
      );
    }

    /*
     * Enregistrer / mettre à jour la position.
     */
    await LivraisonPositionRepository.upsert({
      livraison_id: livraison.id,
      livreur_id: livreur.id,
      latitude,
      longitude,
      precision_gps:
        precision_gps ?? null,
    });

    return {
      message:
        "Position du livreur mise à jour avec succès.",
      position: {
        latitude,
        longitude,
        precision_gps:
          precision_gps ?? null,
        updated_at:
          new Date(),
      },
    };
  }


  /**
   * Récupérer la position actuelle
   * d'une livraison.
   */
  static async findPosition(
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

    /*
     * Admin
     */
    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return await LivraisonPositionRepository.findByLivraisonId(
        livraison.id
      );
    }

    /*
     * Client
     */
    if (role === "client") {

      if (
        commande.client_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès au suivi de cette livraison."
        );
      }

      return await LivraisonPositionRepository.findByLivraisonId(
        livraison.id
      );
    }

    /*
     * Vendeur
     */
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
          "Vous n'avez pas accès au suivi de cette livraison."
        );
      }

      return await LivraisonPositionRepository.findByLivraisonId(
        livraison.id
      );
    }

    /*
     * Livreur
     */
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

      return await LivraisonPositionRepository.findByLivraisonId(
        livraison.id
      );
    }

    throw new ForbiddenError(
      "Accès refusé."
    );
  }
}
