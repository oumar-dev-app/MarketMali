import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { LivraisonService } from "@/lib/services/livraison.service";

export const GET = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    const livraisons =
      await LivraisonService.findMyHistorique(
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      message:
        livraisons.length
          ? "Historique des livraisons récupéré avec succès."
          : "Aucun historique de livraison.",
      data: livraisons,
    });
  }
);