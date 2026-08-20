import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { TarifLivraisonService } from "@/lib/services/tarifLivraison.service";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return apiHandler(async () => {

    const { id } = await context.params;

    const boutique_id =
      Number(id);

    if (
      !Number.isInteger(boutique_id) ||
      boutique_id <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Boutique invalide."
        },
        {
          status: 400
        }
      );
    }

    const tarifs =
      await TarifLivraisonService.findAvailableByBoutique(
        boutique_id
      );

    return NextResponse.json(
      {
        success: true,
        data: tarifs
      },
      {
        status: 200
      }
    );
  });
}