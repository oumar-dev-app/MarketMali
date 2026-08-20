import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message = "Non autorisé") {
    super(message, 401);
  }
}