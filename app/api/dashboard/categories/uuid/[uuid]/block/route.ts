import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CategorieService } from "@/lib/services/categorie.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {


    // 1. Vérifier utilisateur connecté
    const user =
      vendeurMiddleware(req);



    // 2. Récupérer UUID
    const { uuid } =
      await params;



    // 3. Désactivation
    const result =
      await CategorieService.block(
        uuid,
        user.id,
        user.role
      );



    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      }
    );

  });

}