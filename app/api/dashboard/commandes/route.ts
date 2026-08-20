import { NextResponse } from "next/server";

import { CommandeService } from "@/lib/services/commande.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";

export const GET = apiHandler(
  async (req: Request) => {

    const user = await getAuthUser(req);

    const { searchParams } = new URL(req.url);

    const page =
      Number(searchParams.get("page")) || 1;

    const limit =
      Number(searchParams.get("limit")) || 10;

    const search =
      searchParams.get("search") || "";

    const status =
      searchParams.get("status") || undefined;

    const result =
      await CommandeService.findByUser(
        user.id,
        user.role,
        page,
        limit,
        search,
        status
      );

    /*
     * Le service vendeur retourne :
     *
     * {
     *   data: [...],
     *   pagination: {...}
     * }
     *
     * Le frontend attend :
     *
     * {
     *   data: [...],
     *   pagination: {...}
     * }
     *
     * On normalise donc la réponse ici.
     */

    if (
      result &&
      !Array.isArray(result) &&
      "data" in result
    ) {
      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        statistics: result.statistics
      });
    }
    /*
     * Cas admin / super_admin / client
     */
    return NextResponse.json({
      success: true,
      data: Array.isArray(result)
        ? result
        : []
    });
  }
);