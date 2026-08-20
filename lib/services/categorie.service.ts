import { CategorieRepository } from "../repositories/categorie.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { generateUUID } from "../utils/uuid";
import { generateSlug } from "../utils/slug";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import {
  categorieResponse,
  categorieListResponse
} from "@/lib/mappers/categorie.mapper";


import {
  CreateCategorieDTO,
  UpdateCategorieDTO,
} from "../interfaces/categorie.interface";


export class CategorieService {


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



    // 2. Vérifier les droits
    if (
      role !== "admin" &&
      role !== "super_admin" &&
      boutique.user_id !== user_id
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès à cette boutique."
      );
    }



    // 3. Générer slug
    let slug =
      generateSlug(data.nom);



    // 4. Vérifier doublon
    const exists =
      await CategorieRepository.findBySlug(
        slug,
        data.boutique_id
      );



    if (exists) {
      slug = `${slug}-${Date.now()}`;
    }



    // 5. Générer UUID
    const uuid =
      generateUUID();

    console.log("BOUTIQUE ID RECU :", data.boutique_id);

    // 6. Création
    const id =
      await CategorieRepository.create({
        uuid,
        boutique_id: data.boutique_id,
        nom: data.nom,
        slug,
        description: data.description,
        image: data.image,
      });



    // 7. Retour
    const categorie =
      await CategorieRepository.findById(id);



    if (!categorie) {
      throw new NotFoundError(
        "Impossible de récupérer la catégorie."
      );
    }



    return categorieResponse(categorie);

  }

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

  static async activate(
    uuid: string,
    role: string
  ) {

    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Seuls les administrateurs peuvent activer une catégorie."
      );
    }


    const categorie =
      await CategorieRepository.findByUUID(uuid);


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

  static async delete(
    uuid: string,
    user_id: number,
    role: string
  ) {

    const categorie =
      await this.findByUUIDForUser(
        uuid,
        user_id,
        role
      );


    await CategorieRepository.delete(
      categorie.id
    );


    return {
      message:
        "Catégorie supprimée définitivement."
    };

  }

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





  static async findByBoutique(
    boutique_id: number
  ) {

    const categories =
      await CategorieRepository.findByBoutiqueId(
        boutique_id
      );

    return categorieListResponse(categories);

  }





  static async update(
    uuid: string,
    user_id: number,
    role: string,
    data: UpdateCategorieDTO
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



    const boutique =
      await BoutiqueRepository.findById(
        categorie.boutique_id
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
        "Vous n'avez pas accès à cette catégorie."
      );
    }



    const updateData: UpdateCategorieDTO = {};



    if (
      data.nom &&
      data.nom !== categorie.nom
    ) {

      let slug =
        generateSlug(data.nom);



      const exists =
        await CategorieRepository.findBySlug(
          slug,
          categorie.boutique_id
        );

      if (
        exists &&
        exists.id !== categorie.id
      ) {
        slug = `${slug}-${Date.now()}`;
      }



      updateData.nom = data.nom;
      updateData.slug = slug;

    }



    if (data.description !== undefined)
      updateData.description = data.description;


    if (data.image !== undefined)
      updateData.image = data.image;



    if (!Object.keys(updateData).length) {
      return categorie;
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

  static async findAllActive() {

    const categories =
      await CategorieRepository.findAllActive();

    return categorieListResponse(categories);

  }

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


    return categorieResponse(categorie);

  }
  static async findByBoutiqueActive(
    boutique_id: number
  ) {

    const categories =
      await CategorieRepository.findByBoutiqueIdActive(
        boutique_id
      );

    return categorieListResponse(categories);

  }

  static async unblock(
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


    const boutique =
      await BoutiqueRepository.findById(
        categorie.boutique_id
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
        "Vous n'avez pas accès."
      );
    }


    await CategorieRepository.unblock(
      categorie.id
    );


    return {
      message:
        "Catégorie réactivée avec succès."
    };

  }

  static async findByUUIDForUser(
    uuid: string,
    user_id: number,
    role: string
  ) {

    // 1. Trouver la catégorie
    const categorie =
      await CategorieRepository.findByUUID(uuid);


    if (!categorie) {
      throw new NotFoundError(
        "Catégorie introuvable."
      );
    }



    // 2. Admin et super admin ont tous les droits
    if (
      role === "admin" ||
      role === "super_admin"
    ) {
      return categorie;
    }



    // 3. Vérifier la boutique associée
    const boutique =
      await BoutiqueRepository.findById(
        categorie.boutique_id
      );


    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }



    // 4. Vérifier le propriétaire
    if (
      boutique.user_id !== user_id
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès à cette catégorie."
      );
    }



    return categorie;

  }

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
        await CategorieRepository.findByUserId(
          user_id
        );
    }

    return categorieListResponse(categories);

  }

  static async findAll() {

    const categories =
      await CategorieRepository.findAll();


    return categorieListResponse(categories);

  }



  static async block(
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



    const boutique =
      await BoutiqueRepository.findById(
        categorie.boutique_id
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
        "Vous n'avez pas accès."
      );
    }



    await CategorieRepository.block(
      categorie.id
    );



    return {
      message:
        "Catégorie désactivée avec succès."
    };

  }


}