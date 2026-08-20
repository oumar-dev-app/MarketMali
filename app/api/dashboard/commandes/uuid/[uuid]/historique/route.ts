import { NextResponse } from "next/server";

import { CommandeService } from "@/lib/services/commande.service";
import { apiHandler } from "@/lib/utils/api-handler";

export const GET = apiHandler(
async (
    req: Request,
    context: {
        params: Promise<{
            uuid: string;
        }>;
    }
) => {

    const { uuid } = await context.params;

    const historique =
        await CommandeService.getHistorique(uuid);

    return NextResponse.json({
        success: true,
        data: historique
    });

});
