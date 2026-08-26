import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

import {
  DemandeRoleService,
} from "@/lib/services/demande-role.service";

import {
  DemandeRoleType,
} from "@/lib/types/demande-role";

import { ValidationError } from "@/lib/errors/ValidationError";


export const POST = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    const body =
      await req.json();

    const type =
      body.type as DemandeRoleType;

    if (
      type !== "vendeur" &&
      type !== "livreur"
    ) {
      throw new ValidationError(
        "Le type de demande doit être vendeur ou livreur."
      );
    }

    const motif =
      typeof body.motif === "string"
        ? body.motif
        : null;

    const demande =
      await DemandeRoleService.create(
        user.id,
        type,
        motif
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Votre demande a été envoyée avec succès. Elle sera examinée par un administrateur.",
        data: demande,
      },
      {
        status: 201,
      }
    );
  }
);


export const GET = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    const demandes =
      await DemandeRoleService.findMyRequests(
        user.id
      );

    return NextResponse.json({
      success: true,
      data: demandes,
    });
  }
);
