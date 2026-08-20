import { NextRequest, NextResponse } from "next/server";

import { apiHandler } from "@/lib/errors/apiHandler";
import { vendeurMiddleware } from "@/lib/middleware/vendeur.middleware";
import { BoutiqueRepository } from "@/lib/repositories/boutique.repository";
import { ApiKeyService } from "@/lib/services/apiKey.service";
import { NotFoundError } from "@/lib/errors/NotFoundError";



interface Params {

    params: Promise<{
        uuid: string;
    }>;

}



export async function PATCH(
    req: NextRequest,
    {
        params
    }: Params
) {

    return apiHandler(async () => {


        const user =
            vendeurMiddleware(req);



        const boutique =
            await BoutiqueRepository.findByUserId(
                user.id
            );


        if (!boutique) {

            throw new NotFoundError(
                "Aucune boutique trouvée."
            );

        }

        const { uuid } =
            await params;

        await ApiKeyService.revokeByUUID(
            uuid,
            boutique.id
        );



        return NextResponse.json({

            success: true,

            message:
                "API Key révoquée avec succès."

        });


    });

}