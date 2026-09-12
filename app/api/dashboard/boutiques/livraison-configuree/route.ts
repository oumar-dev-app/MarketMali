import { NextRequest, NextResponse } from "next/server";

import { BoutiqueService } from "@/lib/services/boutique.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { apiHandler } from "@/lib/utils/api-handler";

export async function POST(
  req: NextRequest
) {
  return apiHandler(async () => {
    const user =
      vendeurMiddleware(req);

    const boutique =
      await BoutiqueService.markLivraisonConfiguree(
        user.id
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Configuration des livraisons enregistrée.",
        data: boutique,
      },
      {
        status: 200,
      }
    );
  })(req);
}
