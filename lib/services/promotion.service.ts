import { PromotionRepository } from "../repositories/promotion.repository";
import { ProduitRepository } from "../repositories/produit.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";

import {
  CreatePromotionDTO,
  UpdatePromotionDTO,
} from "../interfaces/promotion.interface";

import { PromotionType } from "../types/promotion";

import { generateUUID } from "../utils/uuid";

import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";

export class PromotionService {

  /**
   * Vérifie que le vendeur/admin a accès à la boutique.
   */
  private static checkAccess(
    boutique: {
      user_id: number;
    },
    user_id: number,
    role: string
  ): void {

    if (
      role !== "admin" &&
      role !== "super_admin" &&
      boutique.user_id !== user_id
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès à cette boutique."
      );
    }
  }

  /**
   * Valide les dates de la promotion.
   */
  private static validateDates(
    date_debut: string,
    date_fin: string
  ): void {

    if (!date_debut || !date_fin) {
      throw new ValidationError(
        "Les dates de début et de fin sont obligatoires."
      );
    }

    const debut = new Date(date_debut);
    const fin = new Date(date_fin);

    if (
      Number.isNaN(debut.getTime()) ||
      Number.isNaN(fin.getTime())
    ) {
      throw new ValidationError(
        "Les dates de la promotion sont invalides."
      );
    }

    if (debut >= fin) {
      throw new ValidationError(
        "La date de début doit être antérieure à la date de fin."
      );
    }
  }

  /**
   * Valide les paramètres financiers d'une promotion.
   */
  private static validatePromotionValues(
    type: PromotionType,
    reduction_pourcentage: number | null | undefined,
    prix_promotionnel: number | null | undefined,
    prixProduit: number
  ): void {

    if (type !== "percentage" && type !== "special_price") {
      throw new ValidationError(
        "Le type de promotion est invalide."
      );
    }

    if (type === "percentage") {

      if (
        reduction_pourcentage === undefined ||
        reduction_pourcentage === null
      ) {
        throw new ValidationError(
          "Le pourcentage de réduction est obligatoire."
        );
      }

      if (
        !Number.isFinite(reduction_pourcentage) ||
        reduction_pourcentage <= 0 ||
        reduction_pourcentage >= 100
      ) {
        throw new ValidationError(
          "La réduction doit être comprise entre 0 et 100 %."
        );
      }

      return;
    }

    if (
      prix_promotionnel === undefined ||
      prix_promotionnel === null
    ) {
      throw new ValidationError(
        "Le prix promotionnel est obligatoire."
      );
    }

    if (
      !Number.isFinite(prix_promotionnel) ||
      prix_promotionnel <= 0
    ) {
      throw new ValidationError(
        "Le prix promotionnel doit être supérieur à 0."
      );
    }

    if (prix_promotionnel >= Number(prixProduit)) {
      throw new ValidationError(
        "Le prix promotionnel doit être inférieur au prix normal du produit."
      );
    }
  }

  /**
   * Valide la quantité limite.
   */
  private static validateQuantiteLimite(
    quantite_limite: number | null | undefined
  ): void {

    if (
      quantite_limite === undefined ||
      quantite_limite === null
    ) {
      return;
    }

    if (
      !Number.isInteger(quantite_limite) ||
      quantite_limite <= 0
    ) {
      throw new ValidationError(
        "La quantité limite doit être un entier supérieur à 0."
      );
    }
  }

  /**
   * Calculer le prix final d'un produit en promotion.
   */
  static calculatePromotionPrice(
    prixProduit: number,
    type: PromotionType,
    reduction_pourcentage: number | null,
    prix_promotionnel: number | null
  ): number {

    if (type === "special_price") {
      return Number(prix_promotionnel ?? prixProduit);
    }

    const reduction = Number(
      reduction_pourcentage ?? 0
    );

    return Number(
      (
        Number(prixProduit) *
        (1 - reduction / 100)
      ).toFixed(2)
    );
  }

  /**
   * Créer une promotion.
   */
  static async create(
    data: CreatePromotionDTO,
    user_id: number,
    role: string
  ) {

    const produit = await ProduitRepository.findById(
      data.produit_id
    );

    if (!produit) {
      throw new NotFoundError(
        "Produit introuvable."
      );
    }

    const boutique = await BoutiqueRepository.findById(
      produit.boutique_id
    );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    this.checkAccess(
      boutique,
      user_id,
      role
    );

    if (produit.status !== "active") {
      throw new ValidationError(
        "Seuls les produits actifs peuvent être mis en promotion."
      );
    }

    this.validateDates(
      data.date_debut,
      data.date_fin
    );

    this.validatePromotionValues(
      data.type,
      data.reduction_pourcentage,
      data.prix_promotionnel,
      Number(produit.prix)
    );

    this.validateQuantiteLimite(
      data.quantite_limite
    );

    const overlapping =
      await PromotionRepository.findOverlapping(
        data.produit_id,
        data.date_debut,
        data.date_fin
      );

    if (overlapping) {
      throw new ValidationError(
        "Ce produit possède déjà une promotion sur cette période."
      );
    }

    const uuid = generateUUID();

    const promotionId =
      await PromotionRepository.create({
        uuid,
        boutique_id: produit.boutique_id,
        produit_id: produit.id,
        nom: data.nom.trim(),
        type: data.type,

        reduction_pourcentage:
          data.type === "percentage"
            ? Number(data.reduction_pourcentage)
            : null,

        prix_promotionnel:
          data.type === "special_price"
            ? Number(data.prix_promotionnel)
            : null,

        date_debut: data.date_debut,
        date_fin: data.date_fin,

        quantite_limite:
          data.quantite_limite ?? null,
      });

    const promotion =
      await PromotionRepository.findById(
        promotionId
      );

    if (!promotion) {
      throw new NotFoundError(
        "La promotion n'a pas pu être récupérée."
      );
    }

    return promotion;
  }

  /**
   * Récupérer les promotions du vendeur.
   */
  static async findByUser(
    user_id: number,
    role: string
  ) {

    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return PromotionRepository.findByUserId(
        user_id
      );
    }

    return PromotionRepository.findByUserId(
      user_id
    );
  }

  /**
   * Récupérer une promotion par UUID.
   */
  static async findByUUID(
    uuid: string
  ) {

    const promotion =
      await PromotionRepository.findByUUID(
        uuid
      );

    if (!promotion) {
      throw new NotFoundError(
        "Promotion introuvable."
      );
    }

    return promotion;
  }

  /**
   * Modifier une promotion.
   */
  static async update(
    uuid: string,
    data: UpdatePromotionDTO,
    user_id: number,
    role: string
  ) {

    const promotion =
      await PromotionRepository.findByUUID(
        uuid
      );

    if (!promotion) {
      throw new NotFoundError(
        "Promotion introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        promotion.boutique_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    this.checkAccess(
      boutique,
      user_id,
      role
    );

    const type =
      data.type ?? promotion.type;

    const date_debut =
      data.date_debut ??
      this.formatDateForInput(
        promotion.date_debut
      );

    const date_fin =
      data.date_fin ??
      this.formatDateForInput(
        promotion.date_fin
      );

    const reduction =
      data.reduction_pourcentage !== undefined
        ? data.reduction_pourcentage
        : promotion.reduction_pourcentage;

    const prixPromotionnel =
      data.prix_promotionnel !== undefined
        ? data.prix_promotionnel
        : promotion.prix_promotionnel;

    this.validateDates(
      date_debut,
      date_fin
    );

    this.validatePromotionValues(
      type,
      reduction,
      prixPromotionnel,
      Number(promotion.produit_prix)
    );

    this.validateQuantiteLimite(
      data.quantite_limite !== undefined
        ? data.quantite_limite
        : promotion.quantite_limite
    );

    const overlapping =
      await PromotionRepository.findOverlapping(
        promotion.produit_id,
        date_debut,
        date_fin,
        promotion.id
      );

    if (overlapping) {
      throw new ValidationError(
        "Ce produit possède déjà une autre promotion sur cette période."
      );
    }

    await PromotionRepository.update(
      promotion.id,
      {
        ...(data.nom !== undefined && {
          nom: data.nom.trim(),
        }),

        type,

        reduction_pourcentage:
          type === "percentage"
            ? Number(reduction)
            : null,

        prix_promotionnel:
          type === "special_price"
            ? Number(prixPromotionnel)
            : null,

        date_debut,
        date_fin,

        quantite_limite:
          data.quantite_limite !== undefined
            ? data.quantite_limite
            : promotion.quantite_limite,
      }
    );

    const updated =
      await PromotionRepository.findByUUID(
        uuid
      );

    if (!updated) {
      throw new NotFoundError(
        "La promotion modifiée est introuvable."
      );
    }

    return updated;
  }

  /**
   * Supprimer une promotion.
   */
  static async delete(
    uuid: string,
    user_id: number,
    role: string
  ): Promise<void> {

    const promotion =
      await PromotionRepository.findByUUID(
        uuid
      );

    if (!promotion) {
      throw new NotFoundError(
        "Promotion introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        promotion.boutique_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    this.checkAccess(
      boutique,
      user_id,
      role
    );

    await PromotionRepository.delete(
      promotion.id
    );
  }

  /**
   * Statistiques d'une promotion.
   */
  static async getStats(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const promotion =
      await PromotionRepository.findByUUID(
        uuid
      );

    if (!promotion) {
      throw new NotFoundError(
        "Promotion introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        promotion.boutique_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    this.checkAccess(
      boutique,
      user_id,
      role
    );

    const stats =
      await PromotionRepository.getStats(
        promotion.id
      );

    const quantiteLimite =
      promotion.quantite_limite;

    const quantiteRestante =
      quantiteLimite === null
        ? null
        : Math.max(
            quantiteLimite -
              stats.quantite_vendue,
            0
          );

    return {
      ...stats,
      quantite_limite: quantiteLimite,
      quantite_restante: quantiteRestante,
    };
  }

  /**
   * Récupérer la promotion active d'un produit.
   */
  static async findActiveByProduit(
    produit_id: number
  ) {

    const promotion =
      await PromotionRepository.findActiveByProduit(
        produit_id
      );

    if (!promotion) {
      return null;
    }

    const stats =
      await PromotionRepository.getStats(
        promotion.id
      );

    if (
      promotion.quantite_limite !== null &&
      stats.quantite_vendue >=
        promotion.quantite_limite
    ) {
      return null;
    }

    return {
      ...promotion,

      prix_final:
        this.calculatePromotionPrice(
          Number(promotion.produit_prix),
          promotion.type,
          promotion.reduction_pourcentage,
          promotion.prix_promotionnel
        ),

      quantite_vendue:
        stats.quantite_vendue,

      quantite_restante:
        promotion.quantite_limite === null
          ? null
          : Math.max(
              promotion.quantite_limite -
                stats.quantite_vendue,
              0
            ),
    };
  }

  /**
   * Convertir une Date MySQL en format
   * compatible avec datetime-local.
   */
  private static formatDateForInput(
    value: Date
  ): string {

    const date = new Date(value);

    const pad = (number: number) =>
      String(number).padStart(2, "0");

    return (
      `${date.getFullYear()}-` +
      `${pad(date.getMonth() + 1)}-` +
      `${pad(date.getDate())}T` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}`
    );
  }

    /**
   * Récupérer une promotion appartenant à l'utilisateur.
   */
  static async findByUUIDForUser(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const promotion =
      await PromotionRepository.findByUUID(uuid);

    if (!promotion) {
      throw new NotFoundError(
        "Promotion introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        promotion.boutique_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    this.checkAccess(
      boutique,
      user_id,
      role
    );

    return promotion;
  }
}
