import { AppError } from "./AppError";

export class InternalServerError extends AppError {
  constructor(message = "Erreur interne du serveur") {
    super(message, 500);
  }
}