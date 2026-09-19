import {
  PaymentInitiationInput,
  PaymentInitiationResult,
  PaymentProvider,
} from "./payment-provider";

const WAVE_API_BASE_URL = "https://api.wave.com";

export class WaveProvider implements PaymentProvider {
  readonly name = "wave";

  async initiatePayment(
    input: PaymentInitiationInput
  ): Promise<PaymentInitiationResult> {
    const apiKey = process.env.WAVE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "La clé API Wave (WAVE_API_KEY) n'est pas configurée."
      );
    }

    const response = await fetch(
      `${WAVE_API_BASE_URL}/v1/checkout/sessions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          amount: String(input.montant),
          currency: input.devise,
          client_reference: input.referenceInterne,
          success_url: input.successUrl,
          error_url: input.errorUrl,
        }),

        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API Wave :", {
        status: response.status,
        data,
      });

      throw new Error(
        "Impossible d'initialiser le paiement Wave."
      );
    }

    if (!data.wave_launch_url) {
      console.error(
        "Réponse Wave inattendue :",
        data
      );

      throw new Error(
        "Wave n'a pas retourné d'URL de paiement."
      );
    }

    return {
      provider: this.name,

      referenceExterne:
        data.id ??
        data.checkout_session_id ??
        null,

      checkoutUrl:
        data.wave_launch_url,

      metadata: data,
    };
  }
}
