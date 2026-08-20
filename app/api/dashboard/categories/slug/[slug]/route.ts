import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { BoutiqueRepository } from "@/lib/repositories/boutique.repository";
import { CategorieService } from "@/lib/services/categorie.service";
import { NotFoundError } from "@/lib/errors/NotFoundError";



interface Params {

  params: Promise<{
    slug: string;
  }>;

}



export async function GET(
  req: NextRequest,
  {
    params
  }: Params
) {


  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);



    const boutique =
      await BoutiqueRepository.findByUserId(
        user.id
      );



    if (!boutique) {

      throw new NotFoundError(
        "Aucune boutique trouvée."
      );

    }



    const { slug } =
      await params;



    const categorie =
      await CategorieService.findBySlugActive(
        slug,
        boutique.id
      );



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