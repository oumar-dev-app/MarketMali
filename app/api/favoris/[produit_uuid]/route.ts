import { NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { FavoriService } from "@/lib/services/favori.service";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ produit_uuid: string }>;
  }
) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les favoris sont réservés aux clients."
      );
    }

    const { produit_uuid } = await params;

    const favorite =
      await FavoriService.isFavorite(
        user.id,
        produit_uuid
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Statut du favori récupéré avec succès.",
        data: {
          favorite,
        },
      },
      {
        status: 200,
      }
    );
  })(req);
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ produit_uuid: string }>;
  }
) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les favoris sont réservés aux clients."
      );
    }

    const { produit_uuid } = await params;

    await FavoriService.remove(
      user.id,
      produit_uuid
    );

    return NextResponse.json(
      {
        success: true,
        message: "Produit retiré des favoris.",
      },
      {
        status: 200,
      }
    );
  })(req);
}
