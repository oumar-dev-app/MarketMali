import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { CommandeRepository } from "@/lib/repositories/commande.repository";
import { LivraisonService } from "@/lib/services/livraison.service";

type Params = {
  params: Promise<{
    uuid: string;
  }>;
};

export const GET = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const commande =
      await CommandeRepository.findByUUID(uuid);

    if (!commande) {
      return NextResponse.json(
        {
          success: false,
          message: "Commande introuvable."
        },
        {
          status: 404
        }
      );
    }

    const livraison =
      await LivraisonService.findByCommande(
        commande.id,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      message:
        "Livraison récupérée avec succès.",
      data: livraison
    });
  }
);

