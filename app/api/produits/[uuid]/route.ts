import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { ProduitService } from "@/lib/services/produit.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";



export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {

  return apiHandler(async () => {


    const { uuid } =
      await params;



    const produit =
      await ProduitService.findByUUIDActive(uuid);



    return NextResponse.json(
      {
        success: true,
        data: produit,
      },
      {
        status: 200,
      }
    );

  });

}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  return apiHandler(async () => {

    const user = vendeurMiddleware(req);

    const { uuid } = await params;

    const body = await req.json();

    const produit = await ProduitService.update(
      uuid,
      user.id,
      user.role,
      {
        nom: body.nom,
        description: body.description,
        prix: body.prix,
        stock: body.stock,
        image: body.image,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Produit modifié avec succès.",
        data: produit,
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

    const user = vendeurMiddleware(req);

    const { uuid } = await params;

    const result =
      await ProduitService.block(
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