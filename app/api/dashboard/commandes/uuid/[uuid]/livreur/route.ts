import { NextResponse } from "next/server";

import { CommandeService } from "@/lib/services/commande.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

type Params = {
  params: Promise<{
    uuid: string;
  }>;
};

export const PATCH = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const body =
      await req.json();

    const livreur_uuid =
      typeof body.livreur_uuid === "string"
        ? body.livreur_uuid.trim()
        : "";

    if (!livreur_uuid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "L'UUID du livreur est obligatoire."
        },
        {
          status: 400
        }
      );
    }

    const result =
      await CommandeService.assignLivreur(
        uuid,
        livreur_uuid,
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
  }
);


export const DELETE = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {

    const user =
      await getAuthUser(req);

    const { uuid } =
      await context.params;

    const result =
      await CommandeService.unassignLivreur(
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
  }
);

