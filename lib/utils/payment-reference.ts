import { randomBytes } from "crypto";

export function generatePaymentReference(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `MM-PAY-${date}-${random}`;
}
