import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { UserMapper } from "@/lib/mappers/user.mapper";
import { UserService } from "@/lib/services/user.service";
import { updateUserSchema } from "@/lib/validation/user.validation";


export const GET = apiHandler(
  async (req: Request) => {

    const user =
      await getAuthUser(req);

    return NextResponse.json({
      success: true,
      message: "Utilisateur connecté",
      data: UserMapper.toResponse(user),
    });
  }
);


export const PATCH = apiHandler(
  async (req: Request) => {

    const authUser =
      await getAuthUser(req);

    const body =
      await req.json();

    const validated =
      updateUserSchema.parse(body);

    const user =
      await UserService.updateOwnProfile(
        authUser.id,
        validated
      );

    return NextResponse.json({
      success: true,
      message:
        "Profil mis à jour avec succès.",
      data: user,
    });
  }
);