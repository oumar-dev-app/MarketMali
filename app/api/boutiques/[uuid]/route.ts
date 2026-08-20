import { NextRequest, NextResponse } from "next/server";

import { BoutiqueService } from "@/lib/services/boutique.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";


export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ uuid: string }>
  }
) {
  return apiHandler(async () => {

    const { uuid } = await context.params;

    const boutique =
      await BoutiqueService.findByUUIDActive(
        uuid
      );

    return NextResponse.json(
      {
        success: true,
        message: "Boutique récupérée avec succès.",
        data: boutique,
      },
      {
        status: 200,
      }
    );

  })(req);
}



export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ uuid: string }>
  }
) {

  return apiHandler(async () => {


    const user =
      await getAuthUser(req);


    const { uuid } =
      await context.params;


    const body =
      await req.json();


    const boutique =
      await BoutiqueService.update(
        uuid,
        user.id,
        user.role,
        body
      );


    return NextResponse.json(
      {
        success: true,
        message:
          "Boutique modifiée avec succès.",
        data: boutique,
      },
      {
        status: 200,
      }
    );


  })(req);

}



export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ uuid: string }>
  }
) {

  return apiHandler(async () => {


    const user =
      await getAuthUser(req);


    const { uuid } =
      await context.params;


    const result =
      await BoutiqueService.delete(
        uuid,
        user.id,
        user.role
      );


    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      {
        status: 200,
      }
    );


  })(req);

}