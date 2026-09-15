import { AvisRepository } from "../repositories/avis.repository";

import { generateUUID } from "../utils/uuid";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { ValidationError } from "../errors/ValidationError";
import { ConflictError } from "../errors/ConflictError";


export interface CreateAvisDTO {
  commande_produit_id: number;
  note: number;
  commentaire?: string | null;
}


export class AvisService {

  /**
   * Valide la note.
   */
  private static validateNote(
    note: number
  ): void {

    if (
      typeof note !== "number" ||
      !Number.isInteger(note)
    ) {
      throw new ValidationError(
        "La note doit être un nombre entier."
      );
    }

    if (note < 1 || note > 5) {
      throw new ValidationError(
        "La note doit être comprise entre 1 et 5."
      );
    }
  }


  /**
   * Valide le commentaire.
   */
  private static validateCommentaire(
    commentaire?: string | null
  ): string | null {

    if (
      commentaire === undefined ||
      commentaire === null
    ) {
      return null;
    }

    const value = commentaire.trim();

    if (value.length === 0) {
      return null;
    }

    if (value.length > 2000) {
      throw new ValidationError(
        "Le commentaire ne peut pas dépasser 2000 caractères."
      );
    }

    return value;
  }


  /**
   * Crée un avis après vérification de l'achat.
   */
  static async create(
    data: CreateAvisDTO,
    client_id: number
  ) {

    if (
      !Number.isInteger(data.commande_produit_id) ||
      data.commande_produit_id <= 0
    ) {
      throw new ValidationError(
        "La ligne de commande est invalide."
      );
    }


    this.validateNote(data.note);

    const commentaire =
      this.validateCommentaire(
        data.commentaire
      );


    /**
     * Vérifie que cette ligne de commande
     * appartient bien au client connecté.
     */
    const purchase =
      await AvisRepository.findPurchaseForReview(
        data.commande_produit_id,
        client_id
      );


    if (!purchase) {
      throw new NotFoundError(
        "Achat introuvable."
      );
    }


    /**
     * Un avis n'est possible qu'après
     * la livraison effective de la commande.
     */
    if (
      purchase.commande_status !==
      "delivered"
    ) {
      throw new ForbiddenError(
        "Vous pourrez laisser un avis après la livraison de votre commande."
      );
    }


    /**
     * Une ligne de commande ne peut recevoir
     * qu'un seul avis.
     */
    const existing =
      await AvisRepository.findByCommandeProduitId(
        data.commande_produit_id
      );


    if (existing) {
      throw new ConflictError(
        "Vous avez déjà laissé un avis pour ce produit."
      );
    }


    /**
     * Les IDs produit/boutique sont volontairement
     * récupérés depuis la base et non depuis le client.
     */
    const uuid =
      generateUUID();


    const id =
      await AvisRepository.create({
        uuid,
        commande_produit_id:
          purchase.commande_produit_id,
        client_id:
          purchase.client_id,
        produit_id:
          purchase.produit_id,
        boutique_id:
          purchase.boutique_id,
        note:
          data.note,
        commentaire,
        status:
          "published"
      });


    return {
      id,
      uuid,
      commande_produit_id:
        purchase.commande_produit_id,
      produit_id:
        purchase.produit_id,
      boutique_id:
        purchase.boutique_id,
      note:
        data.note,
      commentaire,
      status:
        "published"
    };
  }


  /**
   * Récupère les avis publiés d'un produit.
   */
  static async findByProduitId(
    produit_id: number
  ) {

    if (
      !Number.isInteger(produit_id) ||
      produit_id <= 0
    ) {
      throw new ValidationError(
        "Produit invalide."
      );
    }

    return AvisRepository.findPublishedByProduitId(
      produit_id
    );
  }


  /**
   * Récupère un avis par UUID.
   */
  static async findByUUID(
    uuid: string
  ) {

    if (!uuid) {
      throw new ValidationError(
        "UUID de l'avis obligatoire."
      );
    }

    const avis =
      await AvisRepository.findByUUID(uuid);


    if (!avis) {
      throw new NotFoundError(
        "Avis introuvable."
      );
    }


    return avis;
  }

  /**
 * Récupère les avis publiés d'un produit
 * à partir de son UUID.
 */
  static async findPublishedByProduitUUID(
    produit_uuid: string
  ) {

    if (!produit_uuid) {
      throw new ValidationError(
        "UUID du produit obligatoire."
      );
    }

    return AvisRepository.findPublishedByProduitUUID(
      produit_uuid
    );
  }

  /**
 * Vérifie si le client a déjà laissé un avis
 * pour une ligne de commande précise.
 */
  static async findByCommandeProduitId(
    commande_produit_id: number,
    client_id: number
  ) {

    if (
      !Number.isInteger(commande_produit_id) ||
      commande_produit_id <= 0
    ) {
      throw new ValidationError(
        "La ligne de commande est invalide."
      );
    }

    const avis =
      await AvisRepository.findByCommandeProduitIdAndClientId(
        commande_produit_id,
        client_id
      );

    return avis;
  }

}
