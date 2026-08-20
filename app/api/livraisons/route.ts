import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { LivraisonService } from "@/lib/services/livraison.service";

export const GET = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    const livraisons =
      await LivraisonService.findMyLivraisons(
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      message:
        livraisons.length
          ? "Livraisons récupérées avec succès."
          : "Aucune livraison.",
      data: livraisons,
    });
  }
);

