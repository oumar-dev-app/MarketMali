import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

export const PATCH = apiHandler(
  async (
    req: Request,
    {
      params,
    }: {
      params: Promise<{ uuid: string }>;
    }
  ) => {

    const requester =
      await getAuthUser(req);

    const { uuid } =
      await params;

    const user =
      await UserService.unblock(
        uuid,
        requester.id,
        requester.role
      );

    return NextResponse.json({
      success: true,
      message:
        "Utilisateur débloqué avec succès.",
      data: user,
    });
  }
);