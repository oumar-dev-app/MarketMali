import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/api-handler";
import { AuthService } from "@/lib/services/auth.service";

export const POST = apiHandler(async (req: Request) => {

  const body = await req.json();

  const result = await AuthService.login(body);

  return NextResponse.json(
    {
      success: true,
      message: "Connexion réussie",
      data: result,
    },
    {
      status: 200,
    }
  );

});