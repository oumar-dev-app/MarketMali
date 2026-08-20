import { DashboardRepository } from "../repositories/dashboard.repository";
import { CommandeRepository } from "../repositories/commande.repository";
import { ProduitRepository } from "../repositories/produit.repository";
import { ForbiddenError } from "../errors/ForbiddenError";

export class DashboardService {

  private static verifyDashboardAccess(
    role: string
  ) {

    if (
      role !== "admin" &&
      role !== "super_admin" &&
      role !== "vendeur"
    ) {
      throw new ForbiddenError(
        "Vous n'avez pas accès au dashboard commercial."
      );
    }
  }

  static async statistiques(
    user_id: number,
    role: string
  ) {

    this.verifyDashboardAccess(role);

    const [
      nombre_clients,
      nombre_produits,
      nombre_categories,
      nombre_commandes,
      commandes_en_attente,
      commandes_livrees,
      produits_en_rupture,
      chiffre_affaires
    ] = await Promise.all([

      DashboardRepository.countClients(
        user_id,
        role
      ),

      DashboardRepository.countProduits(
        user_id,
        role
      ),

      DashboardRepository.countCategories(
        user_id,
        role
      ),

      DashboardRepository.countCommandes(
        user_id,
        role
      ),

      DashboardRepository.countPendingCommandes(
        user_id,
        role
      ),

      DashboardRepository.countDeliveredCommandes(
        user_id,
        role
      ),

      DashboardRepository.countOutOfStock(
        user_id,
        role
      ),

      DashboardRepository.sumDeliveredSales(
        user_id,
        role
      )

    ]);

    return {
      nombre_clients,
      nombre_produits,
      nombre_categories,
      nombre_commandes,
      commandes_en_attente,
      commandes_livrees,
      produits_en_rupture,
      chiffre_affaires
    };
  }

  static async ventes(
    user_id: number,
    role: string
  ) {

    this.verifyDashboardAccess(role);

    return await DashboardRepository.ventesParMois(
      user_id,
      role
    );
  }

  static async topProduits(
    user_id: number,
    role: string
  ) {

    this.verifyDashboardAccess(role);

    return await DashboardRepository.topProduits(
      user_id,
      role
    );
  }
}