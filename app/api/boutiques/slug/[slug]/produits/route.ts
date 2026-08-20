import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { ProduitService } from "@/lib/services/produit.service";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ slug: string }>
  }
) {

  return apiHandler(async () => {

    const { slug } =
      await context.params;

    const produits =
      await ProduitService.findByBoutiqueSlug(
        slug
      );

    return NextResponse.json(
      {
        success: true,
        message: "Produits récupérés avec succès.",
        data: produits,
      },
      {
        status: 200,
      }
    );

  })(req);

}