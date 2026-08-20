import { NextRequest, NextResponse } from "next/server";

import { requireApiKey } from "@/app/api/middleware/apiKey";
import { SynchronisationService } from "@/lib/services/synchronisation.service";
import { syncCommandeSchema } from "@/lib/validation/synchronisation.validation";
import { ValidationError } from "@/lib/errors/ValidationError";
import { apiHandler } from "@/lib/errors/apiHandler";


export async function POST(
    request: NextRequest
) {

    return apiHandler(async () => {


        const apiKey =
            await requireApiKey(
                request
            );


        const body =
            await request.json();



        const validation =
            syncCommandeSchema.safeParse(
                body
            );


        if (!validation.success) {

            throw new ValidationError(
                "Données de commande invalides."
            );

        }



        const {
            commande_uuid,
            status
        } = validation.data;



        const result =
            await SynchronisationService.updateCommandeStatus(
                apiKey.boutique_id,
                commande_uuid,
                status
            );



        return NextResponse.json(
            {
                success:true,

                message:
                    "Statut commande mis à jour.",

                data:result
            }
        );


    });

}