import { PaymentProvider } from "./payment-provider";
import { WaveProvider } from "./wave.provider";
import { OrangeMoneyProvider } from "./orange-money.provider";

export function getPaymentProvider(
  methode: string
): PaymentProvider {

  switch (methode) {

    case "wave":
      return new WaveProvider();

    case "orange_money":
      return new OrangeMoneyProvider();

    default:
      throw new Error(
        `Le fournisseur de paiement "${methode}" n'est pas encore disponible.`
      );
  }
}