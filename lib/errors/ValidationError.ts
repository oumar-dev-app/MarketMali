import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message = "Validation échouée") {
    super(message, 422);
  }
}