import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "Accès interdit") {
    super(message, 403);
  }
}