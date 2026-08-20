import { NextRequest, NextResponse } from "next/server";
import { BoutiqueService } from "@/lib/services/boutique.service";
import { getAuthUser } from "@/lib/auth";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { apiHandler } from "@/lib/utils/api-handler";
import { createBoutiqueSchema } from "@/lib/validation/boutique.validation";
import { CreateBoutiqueDTO } from "@/lib/interfaces/boutique.interface";

export async function GET(req: NextRequest) {

  return apiHandler(async () => {

    const boutiques =
      await BoutiqueService.findAllActive();

    return NextResponse.json(
      {
        success: true,
        message: "Boutiques récupérées avec succès.",
        data: boutiques,
      },
      {
        status: 200,
      }
    );

  })(req);

}


export async function POST(req: NextRequest) {

  return apiHandler(async () => {


    const user =
      await getAuthUser(req);


    if (
      user.role !== "vendeur" &&
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      throw new ForbiddenError(
        "Seuls les vendeurs peuvent créer une boutique."
      );
    }


    const body = await req.json();

    const data = createBoutiqueSchema.parse(body);
    console.log("Utilisateur connecté :", user);
    const boutiqueData: CreateBoutiqueDTO = {
      ...data,
      user_id: user.id,
    };
    const boutique =
      await BoutiqueService.create(boutiqueData);

    return NextResponse.json(
      {
        success: true,
        message: "Boutique créée avec succès.",
        data: boutique,
      },
      {
        status: 201,
      }
    );


  })(req);

}