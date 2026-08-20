import { NextResponse } from "next/server";
import { AppError } from "./AppError";


export async function apiHandler(
  handler: () => Promise<NextResponse>
) {

  try {

    return await handler();

  } catch (error) {


    if (error instanceof AppError) {

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.statusCode,
        }
      );
    }


    console.error(error);


    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du serveur.",
      },
      {
        status: 500,
      }
    );

  }

}