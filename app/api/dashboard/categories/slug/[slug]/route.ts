import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { CategorieService } from "@/lib/services/categorie.service";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  req: NextRequest,
  {
    params,
  }: Params
) {
  return apiHandler(async () => {

    vendeurMiddleware(req);

    const { slug } = await params;

    const categorie =
      await CategorieService.findBySlugActive(slug);

    return NextResponse.json(
      {
        success: true,
        data: categorie,
      },
      {
        status: 200,
      }
    );
  });
}