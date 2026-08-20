import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { LivreurService } from "@/lib/services/livreur.service";


type Params = {
  params: Promise<{
    uuid: string;
  }>;
};


export async function GET(
  req: NextRequest,
  { params }: Params
) {
  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const { uuid } =
      await params;

    const livreur =
      await LivreurService.findByUUID(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Livreur récupéré avec succès.",
        data: livreur
      },
      {
        status: 200
      }
    );
  });
}


export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const { uuid } =
      await params;

    const body =
      await req.json();

    const livreur =
      await LivreurService.update(
        uuid,
        user.id,
        user.role,
        {
          nom:
            body.nom,

          prenom:
            body.prenom,

          telephone:
            body.telephone,

          vehicule:
            body.vehicule,

          status:
            body.status,

          disponibilite:
            body.disponibilite
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Livreur modifié avec succès.",
        data: livreur
      },
      {
        status: 200
      }
    );
  });
}


export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const { uuid } =
      await params;

    const result =
      await LivreurService.delete(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        ...result
      },
      {
        status: 200
      }
    );
  });
}
