import { BoutiqueRepository } from "../repositories/boutique.repository";
import { generateUUID } from "../utils/uuid";
import { generateSlug } from "../utils/slug";

import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

import { UserRepository } from "../repositories/user.repository";

import {
  boutiqueResponse,
  boutiqueListResponse,
} from "../mappers/boutique.mapper";


import {
  CreateBoutiqueDTO,
  UpdateBoutiqueDTO,
} from "../interfaces/boutique.interface";



export class BoutiqueService {



  static async create(
    data: CreateBoutiqueDTO
  ) {


    const user =
      await UserRepository.findById(
        data.user_id
      );


    if (!user) {

      throw new NotFoundError(
        "Utilisateur introuvable."
      );

    }



    if (
      user.role !== "vendeur" &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {

      throw new ForbiddenError(
        "Vous n'avez pas l'autorisation de créer une boutique."
      );

    }



    const existing =
      await BoutiqueRepository.findByUserId(
        data.user_id
      );


    if (existing) {

      throw new ConflictError(
        "Cet utilisateur possède déjà une boutique."
      );

    }



    let slug =
      generateSlug(data.nom);



    const slugExists =
      await BoutiqueRepository.findBySlug(
        slug
      );


    if (slugExists) {

      slug =
        `${slug}-${Date.now()}`;

    }



    const uuid =
      generateUUID();



    const expiration =
      new Date();


    expiration.setDate(
      expiration.getDate() + 30
    );



    const id =
      await BoutiqueRepository.create({

        uuid,

        user_id: data.user_id,

        nom: data.nom,

        slug,

        description: data.description,

        logo: data.logo,

        telephone: data.telephone,

        email: data.email,

        adresse: data.adresse,

        ville: data.ville,

        activation_expires_at:
          expiration

      });



    const boutique =
      await BoutiqueRepository.findById(id);



    if (!boutique) {

      throw new NotFoundError(
        "Impossible de récupérer la boutique."
      );

    }


    return boutiqueResponse(
      boutique
    );

  }





  static async findAll() {

    const boutiques =
      await BoutiqueRepository.findAll();


    return boutiqueListResponse(
      boutiques
    );

  }





  static async findAllActive() {

    const boutiques =
      await BoutiqueRepository.findAllActive();


    return boutiqueListResponse(
      boutiques
    );

  }





  static async findByUUID(
    uuid: string
  ) {

    const boutique =
      await BoutiqueRepository.findByUUID(
        uuid
      );


    if (!boutique) {

      throw new NotFoundError(
        "Boutique introuvable."
      );

    }


    return boutiqueResponse(
      boutique
    );

  }





  static async findBySlugActive(
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


    return boutiqueResponse(
      boutique
    );

  }





  static async update(
    uuid: string,
    user_id: number,
    role: string,
    data: UpdateBoutiqueDTO
  ) {

    const boutique =
      await this.verifyOwnership(
        uuid,
        user_id,
        role
      );


    const updateData:
      UpdateBoutiqueDTO = {};



    if (
      data.nom &&
      data.nom !== boutique.nom
    ) {

      let slug =
        generateSlug(data.nom);



      const exists =
        await BoutiqueRepository.findBySlug(
          slug
        );



      if (
        exists &&
        exists.id !== boutique.id
      ) {

        slug =
          `${slug}-${Date.now()}`;

      }



      updateData.nom =
        data.nom;


      updateData.slug =
        slug;

    }




    if (data.description !== undefined)
      updateData.description =
        data.description;


    if (data.logo !== undefined)
      updateData.logo =
        data.logo;


    if (data.telephone !== undefined)
      updateData.telephone =
        data.telephone;


    if (data.email !== undefined)
      updateData.email =
        data.email;


    if (data.adresse !== undefined)
      updateData.adresse =
        data.adresse;


    if (data.ville !== undefined)
      updateData.ville =
        data.ville;



    await BoutiqueRepository.update(
      boutique.id,
      updateData
    );



    const updated =
      await BoutiqueRepository.findById(
        boutique.id
      );



    if (!updated) {

      throw new NotFoundError(
        "Boutique introuvable."
      );

    }



    return boutiqueResponse(
      updated
    );

  }

  static async findByUUIDForDashboard(
  uuid: string,
  user_id: number,
  role: string
) {

  const boutique =
    await this.verifyOwnership(
      uuid,
      user_id,
      role
    );

  return boutiqueResponse(
    boutique
  );

}


  static async findByUser(
    user_id: number
  ) {
    const boutique =
      await BoutiqueRepository.findByUserId(user_id);

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    return boutiqueResponse(
      boutique
    );
  }



  static async verifyOwnership(
    uuid: string,
    user_id: number,
    role: string
  ) {


    const boutique =
      await BoutiqueRepository.findByUUID(
        uuid
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
        "Vous n'avez pas accès à cette boutique."
      );

    }



    return boutique;

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
        "Accès refusé."
      );

    }



    const boutique =
      await BoutiqueRepository.findByUUID(
        uuid
      );


    if (!boutique) {

      throw new NotFoundError(
        "Boutique introuvable."
      );

    }



    await BoutiqueRepository.activate(
      boutique.id
    );



    const updated =
      await BoutiqueRepository.findById(
        boutique.id
      );


    if (!updated) {

      throw new NotFoundError(
        "Impossible de récupérer la boutique."
      );

    }


    return boutiqueResponse(
      updated
    );

  }





  static async unblock(
    uuid: string,
    role: string
  ) {

    return this.activate(
      uuid,
      role
    );

  }





  static async block(
    uuid: string,
    role: string
  ) {


    if (
      role !== "admin" &&
      role !== "super_admin"
    ) {

      throw new ForbiddenError(
        "Accès refusé."
      );

    }



    const boutique =
      await BoutiqueRepository.findByUUID(
        uuid
      );


    if (!boutique) {

      throw new NotFoundError(
        "Boutique introuvable."
      );

    }



    await BoutiqueRepository.block(
      boutique.id
    );


    return {

      message:
        "Boutique bloquée avec succès."

    };

  }


  static async findByUUIDActive(
    uuid: string
  ) {

    const boutique =
      await BoutiqueRepository.findByUUIDActive(uuid);

    if (!boutique) {
      throw new NotFoundError(
        "Boutique introuvable."
      );
    }

    return boutiqueResponse(
      boutique
    );
  }


  static async delete(
    uuid: string,
    user_id: number,
    role: string
  ) {


    const boutique =
      await this.verifyOwnership(
        uuid,
        user_id,
        role
      );


    await BoutiqueRepository.delete(
      boutique.id
    );


    return {

      message:
        "Boutique supprimée définitivement."

    };


  }





  static async blockExpired() {

    const count =
      await BoutiqueRepository.blockExpired();


    return {

      message:
        `${count} boutique(s) expirée(s) bloquée(s).`

    };

  }


}