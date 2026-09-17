import { NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { FavoriService } from "@/lib/services/favori.service";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les favoris sont réservés aux clients."
      );
    }

    const favoris =
      await FavoriService.findAllByUser(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Favoris récupérés avec succès.",
        data: favoris,
      },
      {
        status: 200,
      }
    );
  })(req);
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les favoris sont réservés aux clients."
      );
    }

    const body = await req.json();

    if (
      typeof body.produit_uuid !== "string" ||
      !body.produit_uuid.trim()
    ) {
      throw new Error(
        "Le champ produit_uuid est obligatoire."
      );
    }

    const favori = await FavoriService.add(
      user.id,
      body.produit_uuid.trim()
    );

    return NextResponse.json(
      {
        success: true,
        message: "Produit ajouté aux favoris.",
        data: favori,
      },
      {
        status: 201,
      }
    );
  })(req);
}
