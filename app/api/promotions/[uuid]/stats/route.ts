import { NextRequest, NextResponse } from "next/server";

import { PromotionService } from "@/lib/services/promotion.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { apiHandler } from "@/lib/errors/apiHandler";


interface RouteContext {
  params: Promise<{
    uuid: string;
  }>;
}


/**
 * GET /api/promotions/[uuid]/stats
 *
 * Récupérer les statistiques d'une promotion.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const { uuid } = await context.params;

    const stats =
      await PromotionService.getStats(
        uuid,
        auth.id,
        auth.role
      );

    return NextResponse.json({
      success: true,
      message: "Statistiques de la promotion récupérées avec succès.",
      data: stats,
    });
  });
}
