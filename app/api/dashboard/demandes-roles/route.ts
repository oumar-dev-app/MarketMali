import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { authMiddleware } from "@/lib/middleware/auth.middleware";

import {
  DemandeRoleService,
} from "@/lib/services/demande-role.service";


export async function GET(
  req: NextRequest
) {

  return apiHandler(async () => {

    const user =
      authMiddleware(req);

    const searchParams =
      req.nextUrl.searchParams;

    const statut =
      searchParams.get("statut") as
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | null;

    const demandes =
      await DemandeRoleService.findAll(
        user.role,
        statut ?? undefined
      );

    return NextResponse.json({
      success: true,
      data: demandes,
    });

  });
}
