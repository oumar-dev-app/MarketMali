import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(message = "Conflit") {
    super(message, 409);
  }
}