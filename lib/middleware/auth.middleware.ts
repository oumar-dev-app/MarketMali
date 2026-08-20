import { NextRequest } from "next/server";
import { verifyToken } from "../jwt";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { AuthPayload } from "../types/auth";


export function authMiddleware(
  req: NextRequest
): AuthPayload {

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new UnauthorizedError(
      "Token manquant."
    );
  }


  const parts = authHeader.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer"
  ) {
    throw new UnauthorizedError(
      "Format du token invalide."
    );
  }


  const token = parts[1];


  console.log("Authorization Header:", authHeader);
  console.log("Token extrait:", token);

  const payload = verifyToken(token) as AuthPayload;


  if (!payload.id || !payload.role) {
    throw new UnauthorizedError(
      "Token invalide."
    );
  }


  return payload;
}