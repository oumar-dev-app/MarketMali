import { NextRequest } from "next/server";
import { ApiKeyService } from "@/lib/services/apiKey.service";
import { UnauthorizedError } from "@/lib/errors/UnauthorizedError";


export async function requireApiKey(
    request: NextRequest
) {


    const authorization =
        request.headers.get(
            "authorization"
        );



    if (!authorization) {

        throw new UnauthorizedError(
            "API Key manquante."
        );

    }



    const parts =
        authorization.split(" ");



    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        throw new UnauthorizedError(
            "Format Authorization invalide."
        );

    }



    const apiKey =
        parts[1];



    const keyData =
        await ApiKeyService.validate(
            apiKey
        );



    return keyData;

}