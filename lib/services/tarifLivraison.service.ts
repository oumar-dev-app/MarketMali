import { TarifLivraisonRepository } from "../repositories/tarifLivraison.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ConflictError } from "../errors/ConflictError";

export class TarifLivraisonService {

  static async findByBoutique(
    boutique_id: number,
    user_id: number,
    role: string
  ) {

    const boutique =
      await BoutiqueRepository.findById(
        boutique_id
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

    return await TarifLivraisonRepository.findByBoutiqueId(
      boutique_id
    );
  }


static async findAvailableByBoutique(
  boutique_id: number
) {

  const boutique =
    await BoutiqueRepository.findById(
      boutique_id
    );

  if (!boutique) {
    throw new NotFoundError(
      "Boutique introuvable."
    );
  }

  if (boutique.status !== "active") {
    throw new NotFoundError(
      "Boutique indisponible."
    );
  }

  return await TarifLivraisonRepository.findByBoutiqueId(
    boutique_id
  );
}

  static async create(
    boutique_id: number,
    user_id: number,
    role: string,
    zone: string,
    frais: number
  ) {

    const boutique =
      await BoutiqueRepository.findById(
        boutique_id
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

    const zoneNormalisee =
      zone.trim();

    if (!zoneNormalisee) {
      throw new ForbiddenError(
        "La zone de livraison est obligatoire."
      );
    }

    if (
      !Number.isFinite(frais) ||
      frais < 0
    ) {
      throw new ForbiddenError(
        "Les frais de livraison sont invalides."
      );
    }

    const tarifExistant =
      await TarifLivraisonRepository.findByBoutiqueAndZone(
        boutique_id,
        zoneNormalisee
      );

    if (tarifExistant) {
      throw new ConflictError(
        `Un tarif de livraison existe déjà pour la zone "${zoneNormalisee}".`
      );
    }

    const id =
      await TarifLivraisonRepository.create({
        boutique_id,
        zone: zoneNormalisee,
        frais
      });

    return await TarifLivraisonRepository.findById(
      id
    );
  }


  static async update(
    id: number,
    user_id: number,
    role: string,
    data: {
      zone?: string;
      frais?: number;
    }
  ) {

    const tarif =
      await TarifLivraisonRepository.findById(
        id
      );

    if (!tarif) {
      throw new NotFoundError(
        "Tarif de livraison introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        tarif.boutique_id
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
        "Vous n'avez pas accès à ce tarif."
      );
    }

    const updateData: {
      zone?: string;
      frais?: number;
    } = {};

    /*
     * Modification de la zone
     */
    if (data.zone !== undefined) {

      const zoneNormalisee =
        data.zone.trim();

      if (!zoneNormalisee) {
        throw new ForbiddenError(
          "La zone de livraison est obligatoire."
        );
      }

      /*
       * Vérifier qu'une autre ligne
       * n'utilise pas déjà cette zone.
       */
      const tarifExistant =
        await TarifLivraisonRepository.findByBoutiqueAndZone(
          tarif.boutique_id,
          zoneNormalisee
        );

      if (
        tarifExistant &&
        tarifExistant.id !== tarif.id
      ) {
        throw new ConflictError(
          `Un tarif de livraison existe déjà pour la zone "${zoneNormalisee}".`
        );
      }

      updateData.zone =
        zoneNormalisee;
    }

    /*
     * Modification des frais
     */
    if (data.frais !== undefined) {

      if (
        !Number.isFinite(data.frais) ||
        data.frais < 0
      ) {
        throw new ForbiddenError(
          "Les frais de livraison sont invalides."
        );
      }

      updateData.frais =
        data.frais;
    }

    /*
     * Rien à modifier
     */
    if (
      Object.keys(updateData).length === 0
    ) {
      throw new ForbiddenError(
        "Aucune donnée à modifier."
      );
    }

    await TarifLivraisonRepository.update(
      id,
      updateData
    );

    return await TarifLivraisonRepository.findById(
      id
    );
  }


  static async delete(
    id: number,
    user_id: number,
    role: string
  ) {

    const tarif =
      await TarifLivraisonRepository.findById(
        id
      );

    if (!tarif) {
      throw new NotFoundError(
        "Tarif de livraison introuvable."
      );
    }

    const boutique =
      await BoutiqueRepository.findById(
        tarif.boutique_id
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
        "Vous n'avez pas accès à ce tarif."
      );
    }

    await TarifLivraisonRepository.delete(
      id
    );

    return {
      message:
        "Tarif de livraison supprimé avec succès."
    };
  }
}