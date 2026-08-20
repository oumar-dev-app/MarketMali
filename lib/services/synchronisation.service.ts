import { SynchronisationRepository } from "../repositories/synchronisation.repository";


export class SynchronisationService {


  static async syncCategories(
    boutiqueId: number,
    categories: any[]
  ) {

    return await SynchronisationRepository.syncCategories(
      boutiqueId,
      categories
    );

  }



  static async syncProduits(
    boutiqueId: number,
    produits: any[]
  ) {

    return await SynchronisationRepository.syncProduits(
      boutiqueId,
      produits
    );

  }



  static async syncStocks(
    boutiqueId: number,
    stocks: any[]
  ) {

    return await SynchronisationRepository.syncStocks(
      boutiqueId,
      stocks
    );

  }



  static async getCommandes(
    boutiqueId: number
  ) {

    return await SynchronisationRepository.getCommandes(
      boutiqueId
    );

  }



  static async updateCommandeStatus(
    boutiqueId: number,
    commandeUUID: string,
    status: string
  ) {

    return await SynchronisationRepository.updateCommandeStatus(
      boutiqueId,
      commandeUUID,
      status
    );

  }


}