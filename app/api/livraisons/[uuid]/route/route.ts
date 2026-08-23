import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

import { LivraisonRepository } from "@/lib/repositories/livraison.repository";
import { LivraisonPositionRepository } from "@/lib/repositories/livraison-position.repository";
import { CommandeRepository } from "@/lib/repositories/commande.repository";

type Params = {
  params: Promise<{
    uuid: string;
  }>;
};

interface OSRMResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: Array<
        [number, number]
      >;
    };
  }>;
}

export const GET = apiHandler(
  async (
    req: Request,
    context: Params
  ) => {
    const user = await getAuthUser(req);

    const { uuid } =
      await context.params;

    /*
     * Vérifier la livraison.
     */
    const livraison =
      await LivraisonRepository.findByUUID(
        uuid
      );

    if (!livraison) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Livraison introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Récupérer la commande.
     */
    const commande =
      await CommandeRepository.findById(
        livraison.commande_id
      );

    if (!commande) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Commande introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Vérifier l'accès à la livraison.
     *
     * Client propriétaire
     * Vendeur propriétaire de la boutique
     * Livreur affecté
     * Admin / super_admin
     */
    if (
      user.role === "client"
    ) {
      if (
        commande.client_id !==
        user.id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Vous n'avez pas accès à cette livraison.",
          },
          {
            status: 403,
          }
        );
      }
    } else if (
      user.role === "livreur"
    ) {
      const livreur =
        livraison.livreur_id;

      /*
       * Le profil livreur sera vérifié
       * par le repository/service existant
       * via l'identité utilisateur.
       */
      const { LivreurRepository } =
        await import(
          "@/lib/repositories/livreur.repository"
        );

      const profil =
        await LivreurRepository.findByUserId(
          user.id
        );

      if (
        !profil ||
        profil.id !== livreur
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Vous n'avez pas accès à cette livraison.",
          },
          {
            status: 403,
          }
        );
      }
    } else if (
      user.role === "vendeur"
    ) {
      const { BoutiqueRepository } =
        await import(
          "@/lib/repositories/boutique.repository"
        );

      const boutique =
        await BoutiqueRepository.findById(
          commande.boutique_id
        );

      if (
        !boutique ||
        boutique.user_id !== user.id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Vous n'avez pas accès à cette livraison.",
          },
          {
            status: 403,
          }
        );
      }
    } else if (
      user.role !== "admin" &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Accès refusé.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Coordonnées destination.
     */
    if (
      commande.latitude === null ||
      commande.longitude === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Les coordonnées de destination sont indisponibles.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Position actuelle du livreur.
     */
    const position =
      await LivraisonPositionRepository.findByLivraisonId(
        livraison.id
      );

    if (!position) {
      return NextResponse.json(
        {
          success: true,
          route: null,
          message:
            "La position actuelle du livreur est indisponible.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * OSRM utilise :
     *
     * longitude,latitude
     *
     * et non latitude,longitude.
     */
    const origin =
      `${position.longitude},${position.latitude}`;

    const destination =
      `${commande.longitude},${commande.latitude}`;

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`;

    const response =
      await fetch(osrmUrl, {
        method: "GET",
        cache: "no-store",
      });

    if (!response.ok) {
      console.error(
        "Erreur OSRM :",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Impossible de calculer l'itinéraire.",
        },
        {
          status: 502,
        }
      );
    }

    const data =
      (await response.json()) as OSRMResponse;

    if (
      data.code !== "Ok" ||
      !data.routes ||
      !data.routes.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucun itinéraire routier trouvé.",
        },
        {
          status: 404,
        }
      );
    }

    const route =
      data.routes[0];

    /*
     * OSRM retourne les coordonnées
     * sous la forme [longitude, latitude].
     *
     * Leaflet attend [latitude, longitude].
     */
    const coordinates =
      route.geometry.coordinates.map(
        ([longitude, latitude]) => [
          latitude,
          longitude,
        ] as [number, number]
      );

    return NextResponse.json({
      success: true,

      route: {
        coordinates,

        distance:
          route.distance,

        duration:
          route.duration,
      },

      origin: {
        latitude:
          position.latitude,
        longitude:
          position.longitude,
      },

      destination: {
        latitude:
          commande.latitude,
        longitude:
          commande.longitude,
      },
    });
  }
);

