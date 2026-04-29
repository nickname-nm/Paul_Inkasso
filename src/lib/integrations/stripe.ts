type CreatePaymentLinkInput = {
  caseReference: string;
  debtorEmail: string;
  amountCents: number;
  description: string;
};

export async function createPaymentLink(input: CreatePaymentLinkInput) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      mode: "mock",
      url: `https://pay.example.com/${input.caseReference}`,
      message: "STRIPE_SECRET_KEY fehlt. Mock-Zahlungslink wurde erzeugt.",
    };
  }

  // MVP placeholder: replace with Stripe SDK once product/price strategy is fixed.
  return {
    mode: "configured",
    url: `https://dashboard.stripe.com/search?query=${encodeURIComponent(input.caseReference)}`,
    message:
      "Stripe-Key ist gesetzt. Implementiere hier Checkout Session oder Payment Link mit deiner finalen PSP-Logik.",
  };
}
