import {
  PaymentInitiationInput,
  PaymentInitiationResult,
  PaymentProvider,
} from "./payment-provider";

export class OrangeMoneyProvider implements PaymentProvider {
  readonly name = "orange_money";

  async initiatePayment(
    input: PaymentInitiationInput
  ): Promise<PaymentInitiationResult> {

    const clientId =
      process.env.ORANGE_MONEY_CLIENT_ID;

    const clientSecret =
      process.env.ORANGE_MONEY_CLIENT_SECRET;

    const authUrl =
      process.env.ORANGE_MONEY_AUTH_URL;

    const apiBaseUrl =
      process.env.ORANGE_MONEY_API_BASE_URL;

    if (!clientId) {
      throw new Error(
        "L'identifiant Orange Money (ORANGE_MONEY_CLIENT_ID) n'est pas configuré."
      );
    }

    if (!clientSecret) {
      throw new Error(
        "Le secret Orange Money (ORANGE_MONEY_CLIENT_SECRET) n'est pas configuré."
      );
    }

    if (!authUrl) {
      throw new Error(
        "L'URL d'authentification Orange Money (ORANGE_MONEY_AUTH_URL) n'est pas configurée."
      );
    }

    if (!apiBaseUrl) {
      throw new Error(
        "L'URL API Orange Money (ORANGE_MONEY_API_BASE_URL) n'est pas configurée."
      );
    }

    /*
     * ---------------------------------------------------------
     * OAuth Orange Money
     * ---------------------------------------------------------
     *
     * Les paramètres exacts seront adaptés aux informations
     * fournies par Orange lors de l'accès API.
     */

    const credentials =
      Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString("base64");

    const tokenResponse =
      await fetch(
        authUrl,
        {
          method: "POST",

          headers: {
            Authorization:
              `Basic ${credentials}`,

            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            "grant_type=client_credentials",

          cache: "no-store",
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (!tokenResponse.ok) {

      console.error(
        "Erreur authentification Orange Money :",
        {
          status:
            tokenResponse.status,

          data:
            tokenData,
        }
      );

      throw new Error(
        "Impossible de s'authentifier auprès d'Orange Money."
      );
    }

    const accessToken =
      tokenData.access_token;

    if (!accessToken) {

      console.error(
        "Réponse OAuth Orange Money inattendue :",
        tokenData
      );

      throw new Error(
        "Orange Money n'a pas retourné de token d'accès."
      );
    }

    /*
     * ---------------------------------------------------------
     * Création du paiement
     * ---------------------------------------------------------
     *
     * IMPORTANT :
     * L'endpoint et le payload exacts seront renseignés dès
     * que les paramètres Orange Money Mali seront disponibles.
     */

    throw new Error(
      "L'API de paiement Orange Money n'est pas encore configurée."
    );
  }
}
