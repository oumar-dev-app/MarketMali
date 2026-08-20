import { NextRequest, NextResponse } from "next/server";

import { ProduitRepository } from "@/lib/repositories/produit.repository";


export async function GET(
  req: NextRequest
) {

  const { searchParams } =
    new URL(req.url);


  const q =
    searchParams.get("q") ?? "";


  const produits =
    await ProduitRepository.search(q);


  return NextResponse.json({

    success: true,

    message:
      "Recherche effectuée avec succès.",

    data: produits

  });

}
