import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { LivreurService } from "@/lib/services/livreur.service";


type Params = {
  params: Promise<{
    uuid: string;
  }>;
};


export async function PATCH(
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

    const disponibilite =
      body.disponibilite;

    if (
      disponibilite !== "available" &&
      disponibilite !== "unavailable"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Disponibilité invalide."
        },
        {
          status: 400
        }
      );
    }

    const livreur =
      await LivreurService.updateDisponibilite(
        uuid,
        disponibilite,
        user.id,
        user.role
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Disponibilité du livreur mise à jour.",
        data: livreur
      },
      {
        status: 200
      }
    );
  });
}
