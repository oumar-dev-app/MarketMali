import { NextRequest } from "next/server";
import { authMiddleware } from "./auth.middleware";
import { ForbiddenError } from "../errors/ForbiddenError";
import { AuthPayload } from "../types/auth";


export function adminMiddleware(
  req: NextRequest
): AuthPayload {

  const user = authMiddleware(req);


  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    throw new ForbiddenError(
      "Accès réservé aux administrateurs."
    );
  }


  return user;
}