import { ApiKeyRepository } from "../repositories/apiKey.repository";
import { generateUUID } from "../utils/uuid";
import { randomBytes } from "crypto";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { NotFoundError } from "../errors/NotFoundError";


export class ApiKeyService {



    private static generateKey() {

        const token =
            randomBytes(32)
                .toString("hex");


        return `MK_live_${token}`;

    }




    static async create(

        data: {
            boutique_id: number;
            name: string;
            expires_at?: Date | null;
        }

    ) {


        const key =
            this.generateKey();


        const uuid =
            generateUUID();



        const id =
            await ApiKeyRepository.create({

                uuid,

                boutique_id:
                    data.boutique_id,

                name:
                    data.name,

                key_value:
                    key,

                expires_at:
                    data.expires_at ?? null

            });



        return {

            id,

            uuid,

            key

        };


    }


    static async revokeByUUID(
    uuid: string,
    boutiqueId: number
) {

    const apiKey =
        await ApiKeyRepository.findByUUID(
            uuid
        );


    if (!apiKey) {

        throw new NotFoundError(
            "API Key introuvable."
        );

    }


    if (apiKey.boutique_id !== boutiqueId) {

        throw new NotFoundError(
            "API Key introuvable."
        );

    }


    await ApiKeyRepository.revoke(
        apiKey.id
    );


    return true;

}

    static async findByUUID(
        uuid: string
    ) {

        const apiKey =
            await ApiKeyRepository.findByUUID(
                uuid
            );


        if (!apiKey) {

            throw new NotFoundError(
                "API Key introuvable."
            );

        }


        return {

            uuid: apiKey.uuid,

            boutique_id: apiKey.boutique_id,

            name: apiKey.name,

            status: apiKey.status,

            last_used_at: apiKey.last_used_at,

            expires_at: apiKey.expires_at,

            created_at: apiKey.created_at

        };

    }



    static async validate(
        key: string
    ) {


        const apiKey =
            await ApiKeyRepository.findByKey(
                key
            );



        if (!apiKey) {

            throw new UnauthorizedError(
                "API Key invalide."
            );

        }



        if (apiKey.status !== "active") {


            throw new UnauthorizedError(
                "API Key désactivée."
            );

        }



        if (
            apiKey.expires_at &&
            new Date(apiKey.expires_at) < new Date()
        ) {

            throw new UnauthorizedError(
                "API Key expirée."
            );

        }



        await ApiKeyRepository.updateLastUsed(
            apiKey.id
        );



        return apiKey;

    }





    static async listByBoutique(
        boutiqueId: number
    ) {

        return await ApiKeyRepository.findByBoutique(
            boutiqueId
        );

    }

    static async regenerate(
    uuid: string,
    boutiqueId: number
) {

    const apiKey =
        await ApiKeyRepository.findByUUID(
            uuid
        );


    if (!apiKey) {

        throw new NotFoundError(
            "API Key introuvable."
        );

    }


    if (apiKey.boutique_id !== boutiqueId) {

        throw new NotFoundError(
            "API Key introuvable."
        );

    }


    const newKey =
        this.generateKey();


    await ApiKeyRepository.updateKey(
        apiKey.id,
        newKey
    );


    return {

        uuid: apiKey.uuid,

        key: newKey

    };

}





    static async revoke(
        id: number
    ) {

        return await ApiKeyRepository.revoke(
            id
        );

    }



}