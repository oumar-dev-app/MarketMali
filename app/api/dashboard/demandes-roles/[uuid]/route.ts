import {
  NextRequest,
  NextResponse,
} from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

import {
  DemandeRoleService,
} from "@/lib/services/demande-role.service";


export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      uuid: string;
    }>;
  }
) {

  return apiHandler(async () => {

    const user =
      authMiddleware(req);

    const { uuid } =
      await context.params;

    const body =
      await req.json();

    const action =
      body.action;

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action invalide. Utilisez approve ou reject.",
        },
        {
          status: 400,
        }
      );
    }

    let demande;

    if (action === "approve") {

      demande =
        await DemandeRoleService.approve(
          uuid,
          user.id,
          user.role
        );

    } else {

      demande =
        await DemandeRoleService.reject(
          uuid,
          user.id,
          user.role,
          typeof body.commentaire === "string"
            ? body.commentaire
            : null
        );

    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "La demande a été approuvée."
          : "La demande a été refusée.",
      data: demande,
    });

  });
}
