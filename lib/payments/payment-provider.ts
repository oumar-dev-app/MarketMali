export interface PaymentInitiationInput {
  paiementUuid: string;
  referenceInterne: string;
  montant: number;
  devise: string;
  telephone?: string | null;
  successUrl: string;
  errorUrl: string;
}

export interface PaymentInitiationResult {
  provider: string;
  referenceExterne?: string | null;
  checkoutUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;

  initiatePayment(
    input: PaymentInitiationInput
  ): Promise<PaymentInitiationResult>;
}
