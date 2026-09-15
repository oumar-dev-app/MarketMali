import {
  NextRequest,
  NextResponse
} from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { NotFoundError } from "@/lib/errors/NotFoundError";

import { ProduitRepository } from "@/lib/repositories/produit.repository";
import { AvisService } from "@/lib/services/avis.service";


interface RouteContext {
  params: Promise<{
    uuid: string;
  }>;
}


export async function GET(
  req: NextRequest,
  context: RouteContext
) {

  return apiHandler(async () => {

    const { uuid } =
      await context.params;


    if (!uuid) {
      throw new NotFoundError(
        "Produit introuvable."
      );
    }


    /**
     * Vérifie que le produit existe.
     */
    const produit =
      await ProduitRepository.findByUUID(
        uuid
      );


    if (!produit) {
      throw new NotFoundError(
        "Produit introuvable."
      );
    }


    /**
     * Les avis publics ne sont disponibles
     * que pour un produit actif.
     */
    if (produit.status !== "active") {
      throw new NotFoundError(
        "Produit introuvable."
      );
    }


    const result =
      await AvisService.findPublishedByProduitUUID(
        uuid
      );


    return NextResponse.json(
      {
        success: true,
        data: result
      },
      {
        status: 200
      }
    );

  });

}
