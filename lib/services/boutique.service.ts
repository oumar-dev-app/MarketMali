import { BoutiqueRepository } from "../repositories/boutique.repository";
import { generateUUID } from "../utils/uuid";
import { generateSlug } from "../utils/slug";

import { db } from "../db";
import { BoutiquePaiementRepository } from "../repositories/boutiquePaiement.repository";

import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotificationService } from "./notification.service";

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

    if (user.role !== "vendeur") {
      throw new ForbiddenError(
        "Seuls les vendeurs approuvés peuvent créer une boutique."
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

    const connection = await db.getConnection();

    let id: number;

    try {
      await connection.beginTransaction();

      id = await BoutiqueRepository.create(
        {
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
          activation_expires_at: expiration,
        },
        connection
      );

      const paiements = data.paiements;

      if (paiements?.wave?.trim()) {
        await BoutiquePaiementRepository.create(
          {
            boutique_id: id,
            provider: "wave",
            numero: paiements.wave.trim(),
            actif: true,
          },
          connection
        );
      }

      if (paiements?.orange_money?.trim()) {
        await BoutiquePaiementRepository.create(
          {
            boutique_id: id,
            provider: "orange_money",
            numero: paiements.orange_money.trim(),
            actif: true,
          },
          connection
        );
      }

      if (paiements?.moov_money?.trim()) {
        await BoutiquePaiementRepository.create(
          {
            boutique_id: id,
            provider: "moov_money",
            numero: paiements.moov_money.trim(),
            actif: true,
          },
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

    const boutique =
      await BoutiqueRepository.findById(id);

    if (!boutique) {

      throw new NotFoundError(
        "Impossible de récupérer la boutique."
      );

    }

    const superAdmins =
      await UserRepository.findSuperAdministrators();

    for (const admin of superAdmins) {

      await NotificationService.create({
        user_id: admin.id,
        type: "boutique_pending",
        titre: "Nouvelle boutique à valider",
        message:
          `La boutique "${boutique.nom}" vient d'être créée par ${user.prenom} ${user.nom} et attend votre validation.`,
      });

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

    const updateData: UpdateBoutiqueDTO = {};

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

    const connection =
      await db.getConnection();

    try {
      await connection.beginTransaction();

      await BoutiqueRepository.update(
        boutique.id,
        updateData,
        connection
      );

      if (data.paiements !== undefined) {
        const paiements = data.paiements;

        const providers = [
          {
            key: "wave" as const,
            provider: "wave" as const,
          },
          {
            key: "orange_money" as const,
            provider: "orange_money" as const,
          },
          {
            key: "moov_money" as const,
            provider: "moov_money" as const,
          },
        ];

        for (const item of providers) {
          const numero =
            paiements[item.key]?.trim() ?? "";

          const existing =
            await BoutiquePaiementRepository.findByBoutiqueAndProvider(
              boutique.id,
              item.provider
            );

          if (numero) {
            if (existing) {
              await BoutiquePaiementRepository.update(
                existing.id,
                {
                  numero,
                  actif: true,
                },
                connection
              );
            } else {
              await BoutiquePaiementRepository.create(
                {
                  boutique_id: boutique.id,
                  provider: item.provider,
                  numero,
                  actif: true,
                },
                connection
              );
            }
          } else if (existing) {
            await BoutiquePaiementRepository.delete(
              existing.id,
              connection
            );
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

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

  const paiements =
    await BoutiquePaiementRepository.findByBoutiqueId(
      boutique.id
    );

  return {
    ...boutiqueResponse(boutique),

    paiements: {
      wave:
        paiements.find(
          paiement => paiement.provider === "wave"
        )?.numero ?? "",

      orange_money:
        paiements.find(
          paiement => paiement.provider === "orange_money"
        )?.numero ?? "",

      moov_money:
        paiements.find(
          paiement => paiement.provider === "moov_money"
        )?.numero ?? "",
    },
  };
}

  static async findByUser(
    user_id: number
  ) {
    const boutique =
      await BoutiqueRepository.findByUserId(user_id);

    if (!boutique) {
      return null;
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

    // Seul le super administrateur peut activer une boutique
    if (role !== "super_admin") {

      throw new ForbiddenError(
        "Seul le super administrateur peut activer une boutique."
      );

    }

    // Récupération de la boutique
    const boutique =
      await BoutiqueRepository.findByUUID(
        uuid
      );

    if (!boutique) {

      throw new NotFoundError(
        "Boutique introuvable."
      );

    }

    // Vérifier que la boutique est bien en attente
    if (boutique.status !== "pending") {

      throw new ConflictError(
        "Cette boutique n'est pas en attente d'activation."
      );

    }

    // Activation de la boutique
    await BoutiqueRepository.activate(
      boutique.id
    );


    // Récupération du vendeur propriétaire
    const vendeur =
      await UserRepository.findById(
        boutique.user_id
      );


    if (vendeur) {

      await NotificationService.create({

        user_id: vendeur.id,

        type: "boutique_activated",

        titre: "Votre boutique a été activée",

        message:
          `Bonne nouvelle ! Votre boutique "${boutique.nom}" a été activée. Elle est maintenant visible sur le marketplace.`,

      });

    }


    // Récupération de la boutique mise à jour
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

  static async verify(
    uuid: string,
    user_id: number,
    role: string
  ) {

    // Seul le super administrateur peut vérifier une boutique
    if (role !== "super_admin") {

      throw new ForbiddenError(
        "Seul le super administrateur peut vérifier une boutique."
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

    // Une boutique doit être active avant d'être vérifiée
    if (boutique.status !== "active") {

      throw new ConflictError(
        "Seule une boutique active peut être vérifiée."
      );

    }

    // Éviter une double vérification
    if (boutique.verified) {

      throw new ConflictError(
        "Cette boutique est déjà vérifiée."
      );

    }

    await BoutiqueRepository.verify(
      boutique.id,
      user_id
    );

    const updated =
      await BoutiqueRepository.findById(
        boutique.id
      );

    if (!updated) {

      throw new NotFoundError(
        "Impossible de récupérer la boutique après vérification."
      );

    }

    return boutiqueResponse(
      updated
    );

  }

  static async unverify(
    uuid: string,
    role: string
  ) {

    // Seul le super administrateur peut retirer la vérification
    if (role !== "super_admin") {

      throw new ForbiddenError(
        "Seul le super administrateur peut retirer la vérification d'une boutique."
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

    // Éviter une opération inutile
    if (!boutique.verified) {

      throw new ConflictError(
        "Cette boutique n'est pas vérifiée."
      );

    }

    await BoutiqueRepository.unverify(
      boutique.id
    );

    const updated =
      await BoutiqueRepository.findById(
        boutique.id
      );

    if (!updated) {

      throw new NotFoundError(
        "Impossible de récupérer la boutique après retrait de la vérification."
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


    if (boutique.status !== "blocked") {

      throw new ConflictError(
        "Cette boutique n'est pas bloquée."
      );

    }


    await BoutiqueRepository.activate(
      boutique.id
    );


    const vendeur =
      await UserRepository.findById(
        boutique.user_id
      );


    if (vendeur) {

      await NotificationService.create({

        user_id: vendeur.id,

        type: "boutique_activated",

        titre: "Votre boutique a été débloquée",

        message:
          `Bonne nouvelle ! Votre boutique "${boutique.nom}" a été débloquée. Elle est maintenant de nouveau visible sur le marketplace.`,

      });

    }


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


    if (boutique.status === "blocked") {

      throw new ConflictError(
        "Cette boutique est déjà bloquée."
      );

    }


    await BoutiqueRepository.block(
      boutique.id
    );


    const vendeur =
      await UserRepository.findById(
        boutique.user_id
      );


    if (vendeur) {

      await NotificationService.create({

        user_id: vendeur.id,

        type: "boutique_blocked",

        titre: "Votre boutique a été bloquée",

        message:
          `Votre boutique "${boutique.nom}" a été bloquée par l'administration. Elle n'est plus visible sur le marketplace.`,

      });

    }


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

    const hasCommandes =
      await BoutiqueRepository.hasCommandes(
        boutique.id
      );

    if (hasCommandes) {

      throw new ConflictError(
        "Cette boutique ne peut pas être supprimée car elle possède un historique de commandes. Vous pouvez la bloquer à la place."
      );
    }

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

  static async markLivraisonConfiguree(
    user_id: number
  ) {
    const boutique =
      await BoutiqueRepository.findByUserId(
        user_id
      );

    if (!boutique) {
      throw new NotFoundError(
        "Aucune boutique associée à cet utilisateur."
      );
    }

    await BoutiqueRepository.markLivraisonConfiguree(
      boutique.id
    );

    const updatedBoutique =
      await BoutiqueRepository.findById(
        boutique.id
      );

    if (!updatedBoutique) {
      throw new NotFoundError(
        "Boutique introuvable après mise à jour."
      );
    }

    return boutiqueResponse(
      updatedBoutique
    );
  }


}