import { randomUUID } from "crypto";

import { FavoriRepository } from "../repositories/favori.repository";
import { ProduitRepository } from "../repositories/produit.repository";

export class FavoriService {
  /**
   * Ajouter un produit aux favoris.
   */
  static async add(
    userId: number,
    produitUuid: string
  ) {
    const produit =
      await ProduitRepository.findByUUID(produitUuid);

    if (!produit || produit.status !== "active") {
      throw new Error("Produit introuvable ou indisponible.");
    }

    const existing =
      await FavoriRepository.findByUserAndProduit(
        userId,
        produit.id
      );

    if (existing) {
      return existing;
    }

    return FavoriRepository.create(
      randomUUID(),
      userId,
      produit.id
    );
  }

  /**
   * Retirer un produit des favoris.
   */
  static async remove(
    userId: number,
    produitUuid: string
  ): Promise<void> {
    const produit =
      await ProduitRepository.findByUUID(produitUuid);

    if (!produit || produit.status !== "active") {
      throw new Error("Produit introuvable ou indisponible.");
    }

    await FavoriRepository.deleteByUserAndProduit(
      userId,
      produit.id
    );
  }

  /**
   * Vérifier si un produit est dans les favoris.
   */
  static async isFavorite(
    userId: number,
    produitUuid: string
  ): Promise<boolean> {
    const produit =
      await ProduitRepository.findByUUID(produitUuid);

    if (!produit || produit.status !== "active") {
      return false;
    }

    const favori =
      await FavoriRepository.findByUserAndProduit(
        userId,
        produit.id
      );

    return !!favori;
  }

  /**
   * Récupérer les favoris de l'utilisateur.
   */
  static async findAllByUser(userId: number) {
    return FavoriRepository.findAllByUser(userId);
  }

  /**
   * Nombre de favoris d'un produit.
   */
  static async countByProduit(
    produitId: number
  ): Promise<number> {
    return FavoriRepository.countByProduit(produitId);
  }
}
