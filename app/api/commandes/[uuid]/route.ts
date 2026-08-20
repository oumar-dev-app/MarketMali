import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { CommandeService } from "@/lib/services/commande.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { authMiddleware } from "@/lib/middleware/auth.middleware";



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {

    const user =
      authMiddleware(req);

    const { uuid } =
      await params;
    console.log("UUID reçu dans API :", uuid);
    const commande =
      await CommandeService.findByUUIDForUser(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      data: commande,
    });

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


    const result =
      await CommandeService.updateStatus(
        uuid,
        user.id,
        user.role,
        body.status,
        body.commentaire
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
      await CommandeService.delete(
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