import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

export const POST = apiHandler(async (req: Request) => {

  await getAuthUser(req);

  return NextResponse.json({
    success: true,
    message: "Déconnexion réussie",
  });

});