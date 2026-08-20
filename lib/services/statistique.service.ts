import { ProduitRepository } from "../repositories/produit.repository";
import { CategorieRepository } from "../repositories/categorie.repository";
import { CommandeRepository } from "../repositories/commande.repository";

export class StatistiqueService {

  static async dashboard(user_id: number) {

    const [
      nombre_produits,
      nombre_categories,
      nombre_commandes,
      commandes_en_attente,
      commandes_livrees,
      produits_en_rupture,
      chiffre_affaires
    ] = await Promise.all([
      ProduitRepository.countByUser(user_id),
      CategorieRepository.countByUser(user_id),
      CommandeRepository.countByUser(user_id),
      CommandeRepository.countPendingByUser(user_id),
      CommandeRepository.countDeliveredByUser(user_id),
      ProduitRepository.countOutOfStockByUser(user_id),
      CommandeRepository.sumDeliveredByUser(user_id)
    ]);

    return {
      nombre_produits,
      nombre_categories,
      nombre_commandes,
      commandes_en_attente,
      commandes_livrees,
      produits_en_rupture,
      chiffre_affaires
    };

  }
  

}