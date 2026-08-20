import { NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { BoutiqueService } from "@/lib/services/boutique.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: NextRequest
) {

  return apiHandler(async () => {

    const user =
      await getAuthUser(req);

    if (
      user.role !== "vendeur" &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Accès réservé aux vendeurs et administrateurs."
      );
    }

    if (
      user.role === "admin" ||
      user.role === "super_admin"
    ) {

      const boutiques =
        await BoutiqueService.findAll();

      return NextResponse.json(
        {
          success: true,
          message: "Boutiques récupérées avec succès.",
          data: boutiques,
        },
        {
          status: 200,
        }
      );

    }

    const boutique =
      await BoutiqueService.findByUser(
        user.id
      );

    return NextResponse.json(
      {
        success: true,
        message: "Boutique récupérée avec succès.",
        data: boutique,
      },
      {
        status: 200,
      }
    );

  })(req);

}

export async function POST(
  req: NextRequest
) {

  return apiHandler(async () => {

    const user =
      await getAuthUser(req);

    const body =
      await req.json();

    const boutique =
      await BoutiqueService.create({
        ...body,
        user_id: user.id,
      });

    return NextResponse.json(
      {
        success: true,
        message: "Boutique créée avec succès.",
        data: boutique,
      },
      {
        status: 201,
      }
    );

  })(req);

}