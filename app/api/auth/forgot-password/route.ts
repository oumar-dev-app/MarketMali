import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { AuthService } from "@/lib/services/auth.service";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .email("Adresse e-mail invalide")
    .toLowerCase()
    .trim(),
});

export const POST = apiHandler(
  async (req: Request) => {

    const body = await req.json();

    const validated =
      forgotPasswordSchema.parse(body);

    const result =
      await AuthService.forgotPassword(
        validated.email
      );

    /*
     * Pour le moment, le token est retourné
     * uniquement pour nos tests.
     *
     * Il sera supprimé lorsque l'envoi
     * d'e-mail sera branché.
     */
    return NextResponse.json({
      success: true,
      message:
        "Si cette adresse e-mail correspond à un compte, un lien de réinitialisation a été généré.",
    });
  }
);

