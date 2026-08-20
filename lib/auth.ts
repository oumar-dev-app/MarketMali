import { verifyToken } from "./jwt";
import { UserRepository } from "./repositories/user.repository";
import { UnauthorizedError } from "./errors/UnauthorizedError";

export async function getAuthUser(req: Request) {

  const authorization =
    req.headers.get("authorization");


  if (!authorization) {
    throw new UnauthorizedError(
      "Token manquant"
    );
  }


  const parts =
    authorization.split(" ");


  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer"
  ) {
    throw new UnauthorizedError(
      "Format du token invalide"
    );
  }


  const token = parts[1];


  const decoded = verifyToken(token) as {
    id: number;
  } | null;


  if (
    !decoded ||
    !decoded.id
  ) {
    throw new UnauthorizedError(
      "Token invalide"
    );
  }


  const user =
    await UserRepository.findById(
      decoded.id
    );


  if (!user) {
    throw new UnauthorizedError(
      "Utilisateur introuvable"
    );
  }


  if (user.status === "blocked") {
    throw new UnauthorizedError(
      "Compte bloqué"
    );
  }


  return user;
}