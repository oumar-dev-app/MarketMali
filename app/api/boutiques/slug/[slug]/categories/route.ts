import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { CategorieService } from "@/lib/services/categorie.service";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ slug: string }>
  }
) {

  return apiHandler(async () => {

    const { slug } =
      await context.params;

    const categories =
      await CategorieService.findByBoutiqueSlug(
        slug
      );

    return NextResponse.json(
      {
        success: true,
        message: "Catégories récupérées avec succès.",
        data: categories,
      },
      {
        status: 200,
      }
    );

  })(req);

}