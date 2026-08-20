import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { UserMapper } from "@/lib/mappers/user.mapper";

export const GET = apiHandler(async (req: Request) => {

  const user = await getAuthUser(req);

  return NextResponse.json({
    success: true,
    message: "Utilisateur connecté",
    data: UserMapper.toResponse(user),
  });

});