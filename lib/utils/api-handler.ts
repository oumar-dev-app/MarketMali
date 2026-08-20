import { NextResponse } from "next/server";
import { errorHandler } from "../errors/errorHandler";

type ApiHandler = (
  req: Request,
  context?: any
) => Promise<Response>;

export function apiHandler(handler: ApiHandler) {
  return async (
    req: Request,
    context?: any
  ) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const err = errorHandler(error);

      return NextResponse.json(
        {
          success: false,
          message: err.message,
          errors: err.errors ?? null,
        },
        {
          status: err.statusCode,
        }
      );
    }
  };
}