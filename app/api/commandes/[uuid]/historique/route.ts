import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CommandeService } from "@/lib/services/commande.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const { uuid } = await params;

    await CommandeService.findByUUIDForUser(
      uuid,
      user.id,
      user.role
    );

    const historique =
      await CommandeService.getHistorique(uuid);

    return NextResponse.json({
      success: true,
      data: historique,
    });
  });
}