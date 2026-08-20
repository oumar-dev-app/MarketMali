import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CategorieService } from "@/lib/services/categorie.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);


    const { uuid } =
      await params;


    const categorie =
      await CategorieService.findByUUIDForUser(
        uuid,
        user.id,
        user.role
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




export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);



    const { uuid } =
      await params;



    const body =
      await req.json();



    const categorie =
      await CategorieService.update(
        uuid,
        user.id,
        user.role,
        {
          nom: body.nom,
          description: body.description,
          image: body.image,
        }
      );



    return NextResponse.json(
      {
        success: true,
        message:
          "Catégorie modifiée avec succès.",
        data: categorie,
      },
      {
        status: 200,
      }
    );

  });

}




export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {


    const user =
      vendeurMiddleware(req);



    const { uuid } =
      await params;



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