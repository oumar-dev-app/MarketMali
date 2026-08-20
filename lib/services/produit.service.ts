import { ProduitRepository } from "../repositories/produit.repository";
import { BoutiqueRepository } from "../repositories/boutique.repository";
import { CategorieRepository } from "../repositories/categorie.repository";

import { generateUUID } from "../utils/uuid";
import { generateSlug } from "../utils/slug";

import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

import {
    produitResponse,
    produitListResponse,
} from "@/lib/mappers/produit.mapper";

import {
    CreateProduitDTO,
    UpdateProduitDTO
} from "../interfaces/produit.interface";



export class ProduitService {



 static async create(
    data: CreateProduitDTO,
    user_id: number,
    role: string
) {

    const boutique =
        await BoutiqueRepository.findByUserId(
            user_id
        );


    if (!boutique) {

        throw new NotFoundError(
            "Boutique introuvable."
        );

    }


    if (
        role !== "admin" &&
        role !== "super_admin" &&
        boutique.user_id !== user_id
    ) {

        throw new ForbiddenError(
            "Vous n'avez pas accès à cette boutique."
        );

    }


    const categorie =
        await CategorieRepository.findById(
            data.categorie_id
        );


    if (!categorie) {

        throw new NotFoundError(
            "Catégorie introuvable."
        );

    }


    if (
        categorie.boutique_id !== boutique.id
    ) {

        throw new ForbiddenError(
            "Cette catégorie n'appartient pas à votre boutique."
        );

    }


    let slug =
        generateSlug(data.nom);


    const exists =
        await ProduitRepository.findBySlug(
            slug,
            boutique.id
        );


    if (exists) {

        slug =
            `${slug}-${Date.now()}`;

    }


    const uuid =
        generateUUID();


    const id =
        await ProduitRepository.create({

            uuid,

            boutique_id:
                boutique.id,

            categorie_id:
                data.categorie_id,

            nom:
                data.nom,

            slug,

            description:
                data.description,

            prix:
                data.prix,

            stock:
                data.stock,

            image:
                data.image

        });



    const produit =
        await ProduitRepository.findById(
            id
        );


    if (!produit) {

        throw new NotFoundError(
            "Produit introuvable après création."
        );

    }


    return produitResponse(produit);

}

static async delete(
    uuid: string,
    user_id: number,
    role: string
) {

    const produit =
        await ProduitRepository.findByUUID(
            uuid
        );


    if (!produit) {

        throw new NotFoundError(
            "Produit introuvable."
        );

    }


    const boutique =
        await BoutiqueRepository.findById(
            produit.boutique_id
        );


    if (!boutique) {

        throw new NotFoundError(
            "Boutique introuvable."
        );

    }


    if (
        role !== "admin" &&
        role !== "super_admin" &&
        boutique.user_id !== user_id
    ) {

        throw new ForbiddenError(
            "Vous n'avez pas accès."
        );

    }


    await ProduitRepository.delete(
        produit.id
    );


    return {
        message:
            "Produit supprimé avec succès."
    };

}

    static async findByUUID(
        uuid: string
    ) {
        const produit =
            await ProduitRepository.findByUUID(
                uuid
            );

        if (!produit) {

            throw new NotFoundError(
                "Produit introuvable."
            );
        }

        return produitResponse(produit);
    }

    static async findByUser(
        user_id: number,
        role: string
    ) {


        let produits;

        if (
            role === "admin" ||
            role === "super_admin"
        ) {
            produits =
                await ProduitRepository.findAll();
        } else {
            produits =
                await ProduitRepository.findByUserId(
                    user_id
                );
        }

        return produitListResponse(produits);

    }

    static async update(
        uuid: string,
        user_id: number,
        role: string,
        data: UpdateProduitDTO
    ) {

        const produit =
            await ProduitRepository.findByUUID(
                uuid
            );
        if (!produit) {

            throw new NotFoundError(
                "Produit introuvable."
            );
        }
        const boutique =
            await BoutiqueRepository.findById(
                produit.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique.user_id !== user_id
        ) {

            throw new ForbiddenError(
                "Vous n'avez pas accès."
            );
        }

        const updateData: any = {};

        if (
            data.nom &&
            data.nom !== produit.nom
        ) {

            let slug =
                generateSlug(
                    data.nom
                );

            const exists =
                await ProduitRepository.findBySlug(
                    slug,
                    produit.boutique_id
                );

            if (
                exists &&
                exists.id !== produit.id
            ) {

                slug =
                    `${slug}-${Date.now()}`;

            }

            updateData.nom =
                data.nom;

            updateData.slug =
                slug;

        }

        if (data.description !== undefined)
            updateData.description =
                data.description;

        if (data.prix !== undefined)
            updateData.prix =
                data.prix;

        if (data.stock !== undefined)
            updateData.stock =
                data.stock;

        if (data.image !== undefined)
            updateData.image =
                data.image;

        if (!Object.keys(updateData).length)
            return produitResponse(produit);

        await ProduitRepository.update(
            produit.id,
            updateData
        );

        const updated =
            await ProduitRepository.findById(
                produit.id
            );

        if (!updated) {
            throw new NotFoundError(
                "Produit introuvable après modification."
            );
        }

        return produitResponse(updated);

    }

    static async findByUUIDActive(
        uuid: string
    ) {

        const produit =
            await ProduitRepository.findByUUID(uuid);

        if (!produit || produit.status !== "active") {
            throw new NotFoundError(
                "Produit introuvable."
            );
        }

        return produitResponse(produit);

    }

    static async findAll() {

        const produits =
            await ProduitRepository.findAll();

        return produitListResponse(
            produits
        );

    }
    static async findByBoutiqueSlug(
        slug: string
    ) {

        const boutique =
            await BoutiqueRepository.findBySlugActive(
                slug
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        return await ProduitRepository.findByBoutiqueIdActive(
            boutique.id
        );

    }

    static async block(
        uuid: string,
        user_id: number,
        role: string
    ) {


        const produit =
            await ProduitRepository.findByUUID(
                uuid
            );


        if (!produit)
            throw new NotFoundError(
                "Produit introuvable."
            );



        const boutique =
            await BoutiqueRepository.findById(
                produit.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }


        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique.user_id !== user_id
        ) {

            throw new ForbiddenError(
                "Vous n'avez pas accès."
            );

        }


        await ProduitRepository.block(
            produit.id
        );


        return {
            message:
                "Produit désactivé avec succès."
        };

    }

    static async findByUUIDForUser(
        uuid: string,
        user_id: number,
        role: string
    ) {

        const produit =
            await ProduitRepository.findByUUID(uuid);

        if (!produit) {
            throw new NotFoundError(
                "Produit introuvable."
            );
        }

        // Les administrateurs ont accès à tout
        if (
            role === "admin" ||
            role === "super_admin"
        ) {
            return produitResponse(produit);
        }

        // Vérifier la boutique du produit
        const boutique =
            await BoutiqueRepository.findById(
                produit.boutique_id
            );

        if (!boutique) {
            throw new NotFoundError(
                "Boutique introuvable."
            );
        }

        // Vérifier le propriétaire
        if (
            boutique.user_id !== user_id
        ) {
            throw new ForbiddenError(
                "Vous n'avez pas accès à ce produit."
            );
        }

        return produitResponse(produit);
    }

    static async findBySlugActive(
        slug: string,
        boutique_id: number
    ) {

        const produit =
            await ProduitRepository.findBySlugActive(
                slug,
                boutique_id
            );


        if (!produit) {

            throw new NotFoundError(
                "Produit introuvable."
            );

        }

        return produitResponse(produit);

    }

    static async findAllActive() {

        const produits =
            await ProduitRepository.findAllActive();

        return produitListResponse(
            produits
        );

    }

    static async unblock(
        uuid: string,
        user_id: number,
        role: string
    ) {


        const produit =
            await ProduitRepository.findByUUID(
                uuid
            );



        if (!produit)
            throw new NotFoundError(
                "Produit introuvable."
            );



        const boutique =
            await BoutiqueRepository.findById(
                produit.boutique_id
            );



        if (
            role !== "admin" &&
            role !== "super_admin" &&
            boutique?.user_id !== user_id
        ) {

            throw new ForbiddenError(
                "Vous n'avez pas accès."
            );

        }



        await ProduitRepository.unblock(
            produit.id
        );



        return {
            message:
                "Produit réactivé avec succès."
        };

    }
    static async search(
        search?: string
    ) {

        const produits =
            await ProduitRepository.search(
                search
            );

        return produits;

    }


}