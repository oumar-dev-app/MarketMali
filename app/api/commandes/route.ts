import { NextRequest, NextResponse } from "next/server";

import { createCommandeSchema } from "@/lib/validation/commande.validation";
import { apiHandler } from "@/lib/errors/apiHandler";
import { CommandeService } from "@/lib/services/commande.service";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const searchParams = req.nextUrl.searchParams;

    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? "1")
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("limit") ?? "20")
      )
    );

    const search =
      searchParams.get("search") ?? "";

    const status =
      searchParams.get("status") ?? undefined;

    const commandes =
      await CommandeService.findByUser(
        user.id,
        user.role,
        page,
        limit,
        search,
        status
      );

    return NextResponse.json(
      {
        success: true,
        data: commandes,
      },
      {
        status: 200,
      }
    );
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const user = authMiddleware(req);

    const body = await req.json();

    const validation =
      createCommandeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Données de commande invalides.",
          errors: validation.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "BODY COMMANDE :",
      validation.data
    );

    console.log(
      "CLIENT ID :",
      user.id
    );

    const commande =
      await CommandeService.create(
        validation.data,
        user.id
      );

    return NextResponse.json(
      {
        success: true,
        message: "Commande créée avec succès.",
        data: commande,
      },
      {
        status: 201,
      }
    );
  });
}