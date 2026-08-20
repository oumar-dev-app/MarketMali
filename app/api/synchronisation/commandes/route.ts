import { NextRequest } from "next/server";
import { requireApiKey } from "../../middleware/apiKey";
import { SynchronisationService } from "@/lib/services/synchronisation.service";
import { syncCommandeSchema } from "@/lib/validation/synchronisation.validation";
import { ValidationError } from "@/lib/errors/ValidationError";


export async function GET(
    request: NextRequest
) {

    try {

        const apiKey =
            await requireApiKey(
                request
            );


        const commandes =
            await SynchronisationService.getCommandes(
                apiKey.boutique_id
            );


        return Response.json(
            {
                success: true,

                message:
                    "Commandes récupérées avec succès.",

                data: commandes
            },
            {
                status: 200
            }
        );

    } catch (error: any) {

        return Response.json(
            {
                success: false,

                message:
                    error.message ??
                    "Erreur serveur."
            },
            {
                status:
                    error.statusCode ?? 500
            }
        );

    }

}



export async function PATCH(
    request: NextRequest
) {

    try {

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


        await SynchronisationService.updateCommandeStatus(
            apiKey.boutique_id,
            commande_uuid,
            status
        );


        return Response.json(
            {
                success: true,

                message:
                    "Statut de la commande mis à jour."
            },
            {
                status: 200
            }
        );

    } catch (error: any) {

        return Response.json(
            {
                success: false,

                message:
                    error.message ??
                    "Erreur serveur."
            },
            {
                status:
                    error.statusCode ?? 500
            }
        );

    }

}