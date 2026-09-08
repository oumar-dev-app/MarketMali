  import { CategorieRepository } from "../repositories/categorie.repository";
  import { BoutiqueRepository } from "../repositories/boutique.repository";
  import { generateUUID } from "../utils/uuid";
  import { generateSlug } from "../utils/slug";
  import { NotFoundError } from "../errors/NotFoundError";
  import { ForbiddenError } from "../errors/ForbiddenError";
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
     * Créer une catégorie globale MarketMali
     *
     * Un vendeur peut créer une nouvelle catégorie.
     * Si la catégorie existe déjà globalement, la création est refusée.
     */
    static async create(
      data: CreateCategorieDTO,
      user_id: number,
      role: string
    ) {

      // 1. Vérifier la boutique
      const boutique =
        await BoutiqueRepository.findById(
          data.boutique_id
        );

      if (!boutique) {
        throw new NotFoundError(
          "Boutique introuvable."
        );
      }

      // 2. Vérifier les droits sur la boutique
      if (
        role !== "admin" &&
        role !== "super_admin" &&
        boutique.user_id !== user_id
      ) {
        throw new ForbiddenError(
          "Vous n'avez pas accès à cette boutique."
        );
      }

      // 3. Nettoyer le nom
      const nom = data.nom.trim();

      if (!nom) {
        throw new Error(
          "Le nom de la catégorie est obligatoire."
        );
      }

      // 4. Vérifier l'existence globale
      const exists =
        await CategorieRepository.findByNomGlobal(
          nom
        );

      if (exists) {
        throw new Error(
          "Cette catégorie existe déjà sur MarketMali. Vous pouvez utiliser la catégorie existante."
        );
      }

      // 5. Générer le slug
      const slug = generateSlug(nom);

      if (!slug) {
        throw new Error(
          "Le nom de la catégorie est invalide."
        );
      }

      // 6. Vérifier également le slug global
      const existingSlug =
        await CategorieRepository.findBySlugGlobal(
          slug
        );

      if (existingSlug) {
        throw new Error(
          "Une catégorie similaire existe déjà sur MarketMali. Vous pouvez utiliser la catégorie existante."
        );
      }

      // 7. Générer UUID
      const uuid = generateUUID();

      // 8. Créer la catégorie
      const id =
        await CategorieRepository.create({
          uuid,
          boutique_id: data.boutique_id,
          nom,
          slug,
          description: data.description,
          image: data.image,
        });

      // 9. Récupérer la catégorie créée
      const categorie =
        await CategorieRepository.findById(id);

      if (!categorie) {
        throw new NotFoundError(
          "Impossible de récupérer la catégorie."
        );
      }

      return categorieResponse(categorie);
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

      const boutique =
        await BoutiqueRepository.findBySlugActive(
          slug
        );

      if (!boutique) {
        throw new NotFoundError(
          "Boutique introuvable."
        );
      }

      return await CategorieRepository.findByBoutiqueIdActive(
        boutique.id
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
     * Catégories liées à une boutique.
     *
     * Cette méthode est conservée pour compatibilité
     * avec les fonctionnalités existantes.
     */
    static async findByBoutique(
      boutique_id: number
    ) {

      const categories =
        await CategorieRepository.findByBoutiqueId(
          boutique_id
        );

      return categorieListResponse(
        categories
      );
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
    static async findBySlugActive(
      slug: string,
      boutique_id: number
    ) {

      const categorie =
        await CategorieRepository.findBySlugActive(
          slug,
          boutique_id
        );

      if (!categorie) {
        throw new NotFoundError(
          "Catégorie introuvable."
        );
      }

      return categorieResponse(
        categorie
      );
    }


    /**
     * Catégories actives d'une boutique.
     *
     * Conservée pour compatibilité.
     */
    static async findByBoutiqueActive(
      boutique_id: number
    ) {

      const categories =
        await CategorieRepository.findByBoutiqueIdActive(
          boutique_id
        );

      return categorieListResponse(
        categories
      );
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
     * Pour les vendeurs, on retourne désormais
     * toutes les catégories globales actives.
     *
     * Les admins et super_admin voient toutes les catégories.
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

        categories =
          await CategorieRepository.findAllActive();
      }

      return categorieListResponse(
        categories
      );
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

