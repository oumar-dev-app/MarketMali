import { NextRequest, NextResponse } from "next/server";

import { PromotionService } from "@/lib/services/promotion.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { apiHandler } from "@/lib/errors/apiHandler";


/**
 * GET /api/promotions
 *
 * Récupérer les promotions de la boutique
 * appartenant au vendeur connecté.
 */
export async function GET(request: NextRequest) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const promotions = await PromotionService.findByUser(
      auth.id,
      auth.role
    );

    return NextResponse.json({
      success: true,
      message: "Promotions récupérées avec succès.",
      data: promotions,
    });
  });
}


/**
 * POST /api/promotions
 *
 * Créer une nouvelle promotion.
 */
export async function POST(request: NextRequest) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const body = await request.json();

    const promotion = await PromotionService.create(
      body,
      auth.id,
      auth.role
    );

    return NextResponse.json(
      {
        success: true,
        message: "Promotion créée avec succès.",
        data: promotion,
      },
      {
        status: 201,
      }
    );
  });
}