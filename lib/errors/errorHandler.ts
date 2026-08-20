import { ZodError } from "zod";
import { AppError } from "./AppError";

export function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return {
      success: false,
      statusCode: 422,
      message: "Erreur de validation",
      errors: error.issues,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  console.error(error);

  return {
    success: false,
    statusCode: 500,
    message: "Erreur interne du serveur",
  };
}   