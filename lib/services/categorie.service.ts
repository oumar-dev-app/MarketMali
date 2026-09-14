import { CategorieRepository } from "../repositories/categorie.repository";
import { generateUUID } from "../utils/uuid";
import { generateSlug } from "../utils/slug";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { ProduitRepository } from "../repositories/produit.repository";
import {
  categorieResponse,
  categorieListResponse,
} from "@/lib/mappers/categorie.mapper";

import {
  CreateCategorieDTO,
  UpdateCategorieDTO,
} from "../interfaces/categorie.interface";

export class CategorieService {
  /**
   * Créer ou associer une catégorie.
   *
   * Admin / super_admin :
   *   → création globale.
   *
   * Vendeur :
   *   → si la catégorie existe déjà globalement,
   *      elle est simplement associée à sa boutique.
   *   → sinon elle est créée globalement puis associée
   *      à sa boutique.
   */
  static async create(
    data: CreateCategorieDTO,
    user_id: number,
    role: string
  ) {

    if (
      role !== "vendeur" &&
      role !== "admin" &&
      role !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas l'autorisation de gérer les catégories."
      );
    }

    const nom = data.nom.trim();

    if (!nom) {
      throw new Error(
        "Le nom de la catégorie est obligatoire."
      );
    }

    /*
     * =========================================================
     * BOUTIQUE DU VENDEUR
     * =========================================================
     */

    let boutiqueId: number | null = null;

    if (role === "vendeur") {

      const boutique =
        await BoutiqueRepository.findByUserIdActive(
          user_id
        );

      if (!boutique) {
        throw new NotFoundError(
          "Aucune boutique active n'est associée à votre compte."
        );
      }

      boutiqueId = boutique.id;
    }

    /*
     * =========================================================
     * CATÉGORIE EXISTANTE
     * =========================================================
     */

    const existing =
      await CategorieRepository.findByNomGlobal(
        nom
      );

    if (existing) {

      if (existing.status !== "active") {
        throw new Error(
          "Cette catégorie existe mais n'est pas active."
        );
      }

      /*
       * Vendeur :
       * associer simplement la catégorie existante.
       */
      if (boutiqueId !== null) {

        await CategorieRepository.assignToBoutique(
          boutiqueId,
          existing.id
        );

        return categorieResponse(
          existing
        );
      }

      /*
       * Admin / super_admin :
       * une catégorie globale existe déjà.
       */
      throw new Error(
        "Cette catégorie existe déjà sur MarketMali."
      );
    }

    /*
     * =========================================================
     * SLUG
     * =========================================================
     */

    const slug =
      generateSlug(nom);

    if (!slug) {
      throw new Error(
        "Le nom de la catégorie est invalide."
      );
    }

    const existingSlug =
      await CategorieRepository.findBySlugGlobal(
        slug
      );

    if (existingSlug) {

      if (
        boutiqueId !== null &&
        existingSlug.status === "active"
      ) {

        await CategorieRepository.assignToBoutique(
          boutiqueId,
          existingSlug.id
        );

        return categorieResponse(
          existingSlug
        );
      }

      throw new Error(
        "Une catégorie similaire existe déjà sur MarketMali."
      );
    }

    /*
     * =========================================================
     * CATÉGORIE PARENTE
     * =========================================================
     */

    if (
      data.parent_id !== null &&
      data.parent_id !== undefined
    ) {

      const parent =
        await CategorieRepository.findById(
          data.parent_id
        );

      if (!parent) {
        throw new NotFoundError(
          "La catégorie parente est introuvable."
        );
      }

      if (parent.status !== "active") {
        throw new Error(
          "La catégorie parente doit être active."
        );
      }
    }

    /*
     * =========================================================
     * CRÉATION GLOBALE
     * =========================================================
     */

    const uuid =
      generateUUID();

    const id =
      await CategorieRepository.create({
        uuid,
        parent_id:
          data.parent_id ?? null,
        nom,
        slug,
        description:
          data.description,
        image:
          data.image,
      });

    /*
     * =========================================================
     * ASSOCIATION VENDEUR
     * =========================================================
     */

    if (boutiqueId !== null) {

      await CategorieRepository.assignToBoutique(
        boutiqueId,
        id
      );
    }

    /*
     * =========================================================
     * RÉCUPÉRATION
     * =========================================================
     */

    const categorie =
      await CategorieRepository.findById(
        id
      );

    if (!categorie) {
      throw new NotFoundError(
        "Impossible de récupérer la catégorie."
      );
    }

    return categorieResponse(
      categorie
    );
  }

  /**
   * Retourner les catégories actives d'une boutique.
   *
   * Cette méthode reste disponible pour les anciennes
   * pages qui ont encore besoin des catégories liées
   * à une boutique.
   */
  static async findByBoutiqueSlug(
    slug: string
  ) {
    const categories =
      await CategorieRepository.findActiveByBoutiqueSlug(
        slug
      );

    return categorieListResponse(
      categories
    );
  }

  /**
   * Activation d'une catégorie.
   *
   * Seul le super_admin peut activer une catégorie globale.
   */
  static async activate(
    uuid: string,
    role: string
  ) {

    if (role !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut activer une catégorie."
      );
    }

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    await CategorieRepository.activate(
      categorie.id
    );

    const updated =
      await CategorieRepository.findById(
        categorie.id
      );

    if (!updated) {
      throw new NotFoundError(
        "Impossible de récupérer la catégorie."
      );
    }

    return categorieResponse(updated);
  }


  /**
   * Supprimer une catégorie globale.
   *
   * Seul le super_admin peut effectuer cette action.
   *
   * La gestion de la suppression des produits liés
   * sera sécurisée séparément avant utilisation en production.
   */
  static async delete(
    uuid: string,
    user_id: number,
    role: string
  ) {

    if (role !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut supprimer une catégorie."
      );
    }

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    await CategorieRepository.delete(
      categorie.id
    );

    return {
      message:
        "Catégorie supprimée définitivement.",
    };
  }


  /**
   * Récupérer une catégorie par UUID.
   */
  static async findByUUID(
    uuid: string
  ) {

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    return categorieResponse(categorie);
  }


  /**
   * Modifier une catégorie globale.
   *
   * Seul le super_admin peut modifier une catégorie.
   */
  static async update(
    uuid: string,
    user_id: number,
    role: string,
    data: UpdateCategorieDTO
  ) {

    if (role !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut modifier une catégorie."
      );
    }

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    const updateData: UpdateCategorieDTO = {};

    // Modifier le nom
    if (
      data.nom !== undefined &&
      data.nom.trim() !== categorie.nom
    ) {

      const nom = data.nom.trim();

      if (!nom) {
        throw new Error(
          "Le nom de la catégorie est obligatoire."
        );
      }

      // Vérification globale par nom
      const exists =
        await CategorieRepository.findByNomGlobal(
          nom
        );

      if (
        exists &&
        exists.id !== categorie.id
      ) {
        throw new Error(
          "Cette catégorie existe déjà sur MarketMali. Vous pouvez utiliser la catégorie existante."
        );
      }

      // Nouveau slug
      const slug =
        generateSlug(nom);

      if (!slug) {
        throw new Error(
          "Le nom de la catégorie est invalide."
        );
      }

      // Vérification globale du slug
      const existingSlug =
        await CategorieRepository.findBySlugGlobal(
          slug
        );

      if (
        existingSlug &&
        existingSlug.id !== categorie.id
      ) {
        throw new Error(
          "Une catégorie similaire existe déjà sur MarketMali. Vous pouvez utiliser la catégorie existante."
        );
      }

      updateData.nom = nom;
      updateData.slug = slug;
    }

    // Description
    if (
      data.description !== undefined
    ) {
      updateData.description =
        data.description;
    }

    // Image
    if (
      data.image !== undefined
    ) {
      updateData.image =
        data.image;
    }

    // Rien à modifier
    if (
      !Object.keys(updateData).length
    ) {
      return categorieResponse(
        categorie
      );
    }

    await CategorieRepository.update(
      categorie.id,
      updateData
    );

    const updated =
      await CategorieRepository.findById(
        categorie.id
      );

    if (!updated) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    return categorieResponse(updated);
  }


  /**
   * Toutes les catégories actives de MarketMali.
   *
   * Cette méthode est utilisée notamment par
   * le formulaire de création/modification de produit.
   */
  static async findAllActive() {

    const categories =
      await CategorieRepository.findAllActive();

    return categorieListResponse(
      categories
    );
  }


  /**
   * Catégorie active par slug.
   *
   * Cette ancienne méthode reste disponible pour
   * compatibilité avec les routes existantes.
   */
  static async findBySlugActive(slug: string) {
    const categorie =
      await CategorieRepository.findBySlugGlobalActive(slug);

    if (!categorie) {
      throw new NotFoundError("Catégorie introuvable.");
    }

    return categorieResponse(categorie);
  }


  /**
   * Réactiver une catégorie.
   *
   * Seul le super_admin peut effectuer cette action.
   */
  static async unblock(
    uuid: string,
    user_id: number,
    role: string
  ) {

    if (role !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut réactiver une catégorie."
      );
    }

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    await CategorieRepository.unblock(
      categorie.id
    );

    return {
      message:
        "Catégorie réactivée avec succès.",
    };
  }


  /**
   * Récupérer une catégorie avec contrôle d'accès.
   *
   * Pour une catégorie globale, les vendeurs peuvent
   * la consulter, mais pas la modifier.
   */
  static async findByUUIDForUser(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    // Une catégorie globale peut être consultée.
    return categorie;
  }


  /**
   * Catégories visibles dans le dashboard.
   *
   * Pour les vendeurs :
   *   → uniquement les catégories associées
   *     à leur boutique active.
   *
   * Pour les admins et super_admin :
   *   → toutes les catégories globales.
   */
  static async findByUser(
    user_id: number,
    role: string
  ) {

    let categories;

    if (
      role === "admin" ||
      role === "super_admin"
    ) {

      categories =
        await CategorieRepository.findAll();

    } else {

      const boutique =
        await BoutiqueRepository.findByUserIdActive(
          user_id
        );

      if (!boutique) {
        throw new NotFoundError(
          "Aucune boutique active n'est associée à votre compte."
        );
      }

      categories =
        await CategorieRepository.findByBoutiqueId(
          boutique.id
        );
    }

    return categorieListResponse(
      categories
    );
  }

  /**
 * Toutes les catégories actives du catalogue global.
 *
 * Utilisé notamment lorsqu'un vendeur souhaite
 * ajouter à sa boutique une catégorie existante.
 */
  static async findAvailableGlobal(
    role: string
  ) {

    if (
      role !== "vendeur" &&
      role !== "admin" &&
      role !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès au catalogue des catégories."
      );
    }

    const categories =
      await CategorieRepository.findAllActiveGlobal();

    return categorieListResponse(
      categories
    );
  }

  /**
 * Retirer une catégorie de la boutique du vendeur.
 *
 * Important :
 * - la catégorie globale n'est jamais supprimée ;
 * - seule l'association boutique_categories est supprimée ;
 * - les autres boutiques ne sont pas affectées ;
 * - le retrait est refusé si des produits de la boutique
 *   utilisent encore cette catégorie.
 */
  static async removeFromBoutique(
    categorie_id: number,
    user_id: number,
    role: string
  ) {

    if (role !== "vendeur") {
      throw new ForbiddenError(
        "Seul un vendeur peut retirer une catégorie de sa boutique."
      );
    }

    /*
     * =========================================================
     * BOUTIQUE ACTIVE DU VENDEUR
     * =========================================================
     */

    const boutique =
      await BoutiqueRepository.findByUserIdActive(
        user_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Aucune boutique active n'est associée à votre compte."
      );
    }

    /*
     * =========================================================
     * CATÉGORIE
     * =========================================================
     */

    const categorie =
      await CategorieRepository.findById(
        categorie_id
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    /*
     * =========================================================
     * VÉRIFIER L'ASSOCIATION
     * =========================================================
     */

    const assigned =
      await CategorieRepository.isAssignedToBoutique(
        boutique.id,
        categorie_id
      );

    if (!assigned) {
      throw new Error(
        "Cette catégorie n'est pas associée à votre boutique."
      );
    }

    /*
     * =========================================================
     * VÉRIFIER LES PRODUITS
     * =========================================================
     */

    const productsCount =
      await ProduitRepository.countByBoutiqueAndCategorie(
        boutique.id,
        categorie_id
      );

    if (productsCount > 0) {
      throw new Error(
        productsCount === 1
          ? "Impossible de retirer cette catégorie : un produit de votre boutique l'utilise encore."
          : `Impossible de retirer cette catégorie : ${productsCount} produits de votre boutique l'utilisent encore.`
      );
    }

    /*
     * =========================================================
     * RETRAIT DE L'ASSOCIATION
     * =========================================================
     */

    await CategorieRepository.removeFromBoutique(
      boutique.id,
      categorie_id
    );

    return {
      message:
        "Catégorie retirée de votre boutique avec succès.",
    };
  }


  /**
   * Toutes les catégories, actives ou bloquées.
   *
   * Réservé aux besoins d'administration.
   */
  static async findAll() {

    const categories =
      await CategorieRepository.findAll();

    return categorieListResponse(
      categories
    );
  }


  /**
   * Bloquer une catégorie globale.
   *
   * Seul le super_admin peut effectuer cette action.
   */
  static async block(
    uuid: string,
    user_id: number,
    role: string
  ) {

    if (role !== "super_admin") {
      throw new ForbiddenError(
        "Seul le super administrateur peut bloquer une catégorie."
      );
    }

    const categorie =
      await CategorieRepository.findByUUID(
        uuid
      );

    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }

    await CategorieRepository.block(
      categorie.id
    );

    return {
      message:
        "Catégorie désactivée avec succès.",
    };
  }
}

