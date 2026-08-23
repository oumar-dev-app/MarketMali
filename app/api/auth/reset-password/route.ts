import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { AuthService } from "@/lib/services/auth.service";
import { resetPasswordSchema } from "@/lib/validation/auth.validation";

export const POST = apiHandler(
  async (req: Request) => {
    const body = await req.json();

    const validated =
      resetPasswordSchema.parse(body);

    await AuthService.resetPassword(
      validated.token,
      validated.password
    );

    return NextResponse.json({
      success: true,
      message:
        "Votre mot de passe a été réinitialisé avec succès.",
    });
  }
);
