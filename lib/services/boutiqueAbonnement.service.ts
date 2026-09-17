import { randomUUID } from "crypto";

import { BoutiqueAbonnementRepository } from "../repositories/boutiqueAbonnement.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";

export class BoutiqueAbonnementService {
  /**
   * Suivre une boutique.
   */
  static async follow(
    userId: number,
    boutiqueUuid: string
  ) {
    const boutique =
      await BoutiqueRepository.findByUUID(boutiqueUuid);

    if (!boutique) {
      throw new Error("Boutique introuvable.");
    }

    if (boutique.status !== "active") {
      throw new Error(
        "Cette boutique n'est pas disponible actuellement."
      );
    }

    const existing =
      await BoutiqueAbonnementRepository.findByUserAndBoutique(
        userId,
        boutique.id
      );

    if (existing) {
      return existing;
    }

    return BoutiqueAbonnementRepository.create(
      randomUUID(),
      userId,
      boutique.id
    );
  }

  /**
   * Ne plus suivre une boutique.
   */
  static async unfollow(
    userId: number,
    boutiqueUuid: string
  ): Promise<void> {
    const boutique =
      await BoutiqueRepository.findByUUID(boutiqueUuid);

    if (!boutique) {
      throw new Error("Boutique introuvable.");
    }

    await BoutiqueAbonnementRepository.deleteByUserAndBoutique(
      userId,
      boutique.id
    );
  }

  /**
   * Vérifier si l'utilisateur suit une boutique.
   */
  static async isFollowing(
    userId: number,
    boutiqueUuid: string
  ): Promise<boolean> {
    const boutique =
      await BoutiqueRepository.findByUUID(boutiqueUuid);

    if (!boutique) {
      return false;
    }

    const abonnement =
      await BoutiqueAbonnementRepository.findByUserAndBoutique(
        userId,
        boutique.id
      );

    return !!abonnement;
  }

  /**
   * Récupérer les boutiques suivies par l'utilisateur.
   */
  static async findAllByUser(userId: number) {
    return BoutiqueAbonnementRepository.findAllByUser(userId);
  }

  /**
   * Nombre d'abonnés d'une boutique.
   */
  static async countByBoutique(
    boutiqueId: number
  ): Promise<number> {
    return BoutiqueAbonnementRepository.countByBoutique(
      boutiqueId
    );
  }
}
