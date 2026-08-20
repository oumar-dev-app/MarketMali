import { TarifLivraisonRepository } from "../repositories/tarifLivraison.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

export class TarifLivraisonService {

  static async findByBoutique(
    boutique_id: number,
    user_id: number,
    role: string
  ) {

    const boutique =
      await BoutiqueRepository.findById(boutique_id);

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
      await BoutiqueRepository.findById(boutique_id);

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

    const id =
      await TarifLivraisonRepository.create({
        boutique_id,
        zone: zoneNormalisee,
        frais
      });

    return await TarifLivraisonRepository.findById(id);
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
      await TarifLivraisonRepository.findById(id);

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

    if (data.zone !== undefined) {
      const zoneNormalisee =
        data.zone.trim();

      if (!zoneNormalisee) {
        throw new ForbiddenError(
          "La zone de livraison est obligatoire."
        );
      }

      updateData.zone =
        zoneNormalisee;
    }

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
      await TarifLivraisonRepository.findById(id);

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
