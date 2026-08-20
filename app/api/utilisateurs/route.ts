import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export const GET = apiHandler(
  async (req: Request) => {

    const requester =
      await getAuthUser(req);

    const users =
      await UserService.findForManagement(
        requester.role
      );

    return NextResponse.json({
      success: true,
      message:
        users.length
          ? "Utilisateurs récupérés avec succès."
          : "Aucun utilisateur.",
      data: users,
    });
  }
);

