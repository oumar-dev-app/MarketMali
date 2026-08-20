import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./errors/UnauthorizedError";

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new UnauthorizedError("Token invalide.");
  }
}