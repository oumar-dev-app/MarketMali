import { NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";
import { BoutiqueAbonnementService } from "@/lib/services/boutiqueAbonnement.service";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }
) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les abonnements aux boutiques sont réservés aux clients."
      );
    }

    const { uuid } = await params;

    const following =
      await BoutiqueAbonnementService.isFollowing(
        user.id,
        uuid
      );

    return NextResponse.json(
      {
        success: true,
        message: "Statut de l'abonnement récupéré avec succès.",
        data: {
          following,
        },
      },
      {
        status: 200,
      }
    );
  })(req);
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }
) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les abonnements aux boutiques sont réservés aux clients."
      );
    }

    const { uuid } = await params;

    const abonnement =
      await BoutiqueAbonnementService.follow(
        user.id,
        uuid
      );

    return NextResponse.json(
      {
        success: true,
        message: "Vous suivez maintenant cette boutique.",
        data: abonnement,
      },
      {
        status: 201,
      }
    );
  })(req);
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }
) {
  return apiHandler(async () => {
    const user = await getAuthUser(req);

    if (user.role !== "client") {
      throw new ForbiddenError(
        "Les abonnements aux boutiques sont réservés aux clients."
      );
    }

    const { uuid } = await params;

    await BoutiqueAbonnementService.unfollow(
      user.id,
      uuid
    );

    return NextResponse.json(
      {
        success: true,
        message: "Vous ne suivez plus cette boutique.",
      },
      {
        status: 200,
      }
    );
  })(req);
}
