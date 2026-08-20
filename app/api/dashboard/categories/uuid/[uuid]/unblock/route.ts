import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CategorieService } from "@/lib/services/categorie.service";
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
      await CategorieService.unblock(
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


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);


    const { uuid } =
      await params;


    const result =
      await CategorieService.unblock(
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