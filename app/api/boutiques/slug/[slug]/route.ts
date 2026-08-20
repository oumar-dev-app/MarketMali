import { NextRequest, NextResponse } from "next/server";

import { BoutiqueService } from "@/lib/services/boutique.service";
import { apiHandler } from "@/lib/utils/api-handler";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ slug: string }>
  }
) {
  return apiHandler(async () => {

    const { slug } =
      await context.params;

    const boutique =
      await BoutiqueService.findBySlugActive(
        slug
      );

    return NextResponse.json(
      {
        success: true,
        message: "Boutique récupérée avec succès.",
        data: boutique,
      },
      {
        status: 200,
      }
    );

  })(req);
}