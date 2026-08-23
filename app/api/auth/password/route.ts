import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { changePasswordSchema } from "@/lib/validation/user.validation";


export const PATCH = apiHandler(
  async (req: Request) => {

    const authUser =
      await getAuthUser(req);

    const body =
      await req.json();

    const validated =
      changePasswordSchema.parse(body);

    await UserService.changeOwnPassword(
      authUser.id,
      validated.oldPassword,
      validated.newPassword
    );

    return NextResponse.json({
      success: true,
      message:
        "Mot de passe modifié avec succès.",
    });
  }
);