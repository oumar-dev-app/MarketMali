import { NextRequest, NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth";
import { BoutiqueService } from "@/lib/services/boutique.service";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      uuid: string;
    }>;
  }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        {
          status: 401,
        }
      );
    }

    const { uuid } = await context.params;

    const boutique =
      await BoutiqueService.verify(
        uuid,
        user.id,
        user.role
      );

    return NextResponse.json({
      success: true,
      message: "Boutique vérifiée avec succès.",
      data: boutique,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Une erreur est survenue.",
      },
      {
        status:
          error?.statusCode ||
          error?.status ||
          500,
      }
    );
  }
}
