import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitService } from "@/lib/services/produit.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);



    const { uuid } =
      await params;



    const result =
      await ProduitService.unblock(
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