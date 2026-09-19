import crypto from "crypto";

export interface WaveWebhookEventData {
  id?: string;
  amount?: string | number;
  client_reference?: string | null;
  currency?: string;
  payment_status?: string;
  transaction_id?: string | null;
  [key: string]: unknown;
}

export interface WaveWebhookEvent {
  id?: string;
  type?: string;
  data?: WaveWebhookEventData;
  [key: string]: unknown;
}


/**
 * Vérifie la signature d'un webhook Wave.
 *
 * Wave signe :
 *
 * timestamp + rawBody
 *
 * avec HMAC-SHA256.
 *
 * Format du header :
 *
 * Wave-Signature: t=timestamp,v1=signature
 */
export function verifyWaveWebhookSignature(
  waveSignature: string,
  rawBody: string,
  webhookSecret: string
): boolean {

  const parts =
    waveSignature
      .split(",")
      .map((part) => part.trim());

  // ---------------------------------------------------------
  // Timestamp
  // ---------------------------------------------------------

  const timestampPart =
    parts.find(
      (part) =>
        part.startsWith("t=")
    );

  if (!timestampPart) {
    return false;
  }

  const timestamp =
    timestampPart.slice(2);

  if (!/^\d+$/.test(timestamp)) {
    return false;
  }

  const timestampSeconds =
    Number(timestamp);

  if (
    !Number.isFinite(
      timestampSeconds
    )
  ) {
    return false;
  }

  // ---------------------------------------------------------
  // Protection contre les rejeux
  //
  // Wave recommande une fenêtre de 5 minutes.
  // ---------------------------------------------------------

  const nowSeconds =
    Math.floor(
      Date.now() / 1000
    );

  const age =
    nowSeconds -
    timestampSeconds;

  const MAX_AGE_SECONDS = 5 * 60;

  if (
    age < 0 ||
    age > MAX_AGE_SECONDS
  ) {
    return false;
  }

  // ---------------------------------------------------------
  // Récupérer toutes les signatures v1
  //
  // Plusieurs signatures peuvent exister pendant
  // une rotation de secret.
  // ---------------------------------------------------------

  const signatures =
    parts
      .filter(
        (part) =>
          part.startsWith("v1=")
      )
      .map(
        (part) =>
          part.slice(3)
      )
      .filter(Boolean);

  if (!signatures.length) {
    return false;
  }

  // ---------------------------------------------------------
  // Calculer la signature attendue
  // ---------------------------------------------------------

  const payload =
    timestamp + rawBody;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        webhookSecret
      )
      .update(payload, "utf8")
      .digest("hex");

  // ---------------------------------------------------------
  // Comparaison sécurisée
  // ---------------------------------------------------------

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "utf8"
    );

  return signatures.some(
    (signature) => {

      const receivedBuffer =
        Buffer.from(
          signature,
          "utf8"
        );

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        return false;
      }

      return crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );
    }
  );
}