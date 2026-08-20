import { Request, Response } from "express";
import { CategorieService } from "../services/categorie.service";
import { successResponse } from "../utils/response";


export class CategorieController {


    static async create(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const categorie =
            await CategorieService.create(
                req.body,
                user.id,
                user.role
            );


        return successResponse(
            res,
            "Catégorie créée avec succès.",
            categorie,
            201
        );

    }



    static async findAll(
        req: Request,
        res: Response
    ) {

        const categories =
            await CategorieService.findAll();


        return successResponse(
            res,
            "Liste des catégories.",
            categories
        );

    }



    static async findByUUID(
        req: Request,
        res: Response
    ) {

        const categorie =
            await CategorieService.findByUUID(
                String(req.params.uuid)
            );

        return successResponse(
            res,
            "Catégorie récupérée.",
            categorie
        );

    }



    static async findByBoutique(
        req: Request,
        res: Response
    ) {

        const categories =
            await CategorieService.findByBoutique(
                Number(req.params.boutique_id)
            );


        return successResponse(
            res,
            "Catégories de la boutique.",
            categories
        );

    }



    static async update(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const categorie =
            await CategorieService.update(
                String(req.params.uuid),
                user.id,
                user.role,
                req.body
            );


        return successResponse(
            res,
            "Catégorie modifiée avec succès.",
            categorie
        );

    }



    static async delete(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const result =
            await CategorieService.delete(
                String(req.params.uuid),
                user.id,
                user.role
            );

        return successResponse(
            res,
            result.message
        );

    }



    static async block(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const result =
            await CategorieService.block(
                String(req.params.uuid),
                user.id,
                user.role
            );


        return successResponse(
            res,
            result.message
        );

    }



    static async unblock(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const result =
            await CategorieService.unblock(
                String(req.params.uuid),
                user.id,
                user.role
            );


        return successResponse(
            res,
            result.message
        );

    }



    static async activate(
        req: Request,
        res: Response
    ) {

        const user = req.user;


        const categorie =
            await CategorieService.activate(
                String(req.params.uuid),
                user.role
            );


        return successResponse(
            res,
            "Catégorie activée avec succès.",
            categorie
        );

    }



    static async findAllActive(
        req: Request,
        res: Response
    ) {

        const categories =
            await CategorieService.findAllActive();


        return successResponse(
            res,
            "Catégories actives.",
            categories
        );

    }



    static async findBySlugActive(
        req: Request,
        res: Response
    ) {

        const categorie =
            await CategorieService.findBySlugActive(
                String(req.params.slug),
                Number(req.params.boutique_id)
            );


        return successResponse(
            res,
            "Catégorie trouvée.",
            categorie
        );

    }

    static async findByBoutiqueActive(
    req: Request,
    res: Response
) {

    const categories =
        await CategorieService.findByBoutiqueActive(
            Number(req.params.boutique_id)
        );


    return successResponse(
        res,
        "Catégories actives de la boutique.",
        categories
    );

}



static async findByUser(
    req: Request,
    res: Response
) {

    const user = req.user;


    const categories =
        await CategorieService.findByUser(
            user.id,
            user.role
        );


    return successResponse(
        res,
        "Catégories utilisateur.",
        categories
    );

}


}