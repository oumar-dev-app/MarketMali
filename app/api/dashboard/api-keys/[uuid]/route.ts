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



export async function GET(
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


        const apiKey =
            await ApiKeyService.findByUUID(
                uuid
            );



        if (apiKey.boutique_id !== boutique.id) {

            throw new NotFoundError(
                "API Key introuvable."
            );

        }



        return NextResponse.json({

            success: true,

            data: {

                uuid: apiKey.uuid,

                name: apiKey.name,

                status: apiKey.status,

                last_used_at: apiKey.last_used_at,

                expires_at: apiKey.expires_at,

                created_at: apiKey.created_at

            }

        });


    });

}