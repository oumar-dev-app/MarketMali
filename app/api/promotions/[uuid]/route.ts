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
 * GET /api/promotions/[uuid]
 *
 * Récupérer une promotion.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const { uuid } = await context.params;

    const promotion =
      await PromotionService.findByUUIDForUser(
        uuid,
        auth.id,
        auth.role
      );

    return NextResponse.json({
      success: true,
      message: "Promotion récupérée avec succès.",
      data: promotion,
    });
  });
}


/**
 * PUT /api/promotions/[uuid]
 *
 * Modifier une promotion.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const { uuid } = await context.params;

    const body = await request.json();

    const promotion =
      await PromotionService.update(
        uuid,
        body,
        auth.id,
        auth.role
      );

    return NextResponse.json({
      success: true,
      message: "Promotion modifiée avec succès.",
      data: promotion,
    });
  });
}


/**
 * DELETE /api/promotions/[uuid]
 *
 * Supprimer une promotion.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return apiHandler(async () => {

    const auth = await vendeurMiddleware(request);

    const { uuid } = await context.params;

    await PromotionService.delete(
      uuid,
      auth.id,
      auth.role
    );

    return NextResponse.json({
      success: true,
      message: "Promotion supprimée avec succès.",
    });
  });
}
