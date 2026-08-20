import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { TarifLivraisonService } from "@/lib/services/tarifLivraison.service";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";

type Params = {
  params: Promise<{
    id: string;
  }>;
};


export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  return apiHandler(async () => {

    const user =
      vendeurMiddleware(req);

    const { id } =
      await params;

    const tarifId =
      Number(id);

    if (
      !Number.isInteger(tarifId) ||
      tarifId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Identifiant du tarif invalide."
        },
        {
          status: 400
        }
      );
    }

    const body =
      await req.json();

    const tarif =
      await TarifLivraisonService.update(
        tarifId,
        user.id,
        user.role,
        {
          zone:
            body.zone,
          frais:
            body.frais !== undefined
              ? Number(body.frais)
              : undefined
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Tarif de livraison modifié avec succès.",
        data: tarif
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

    const { id } =
      await params;

    const tarifId =
      Number(id);

    if (
      !Number.isInteger(tarifId) ||
      tarifId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Identifiant du tarif invalide."
        },
        {
          status: 400
        }
      );
    }

    const result =
      await TarifLivraisonService.delete(
        tarifId,
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
