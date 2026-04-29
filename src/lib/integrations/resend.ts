type SendPaymentEmailInput = {
  to: string;
  debtorName: string;
  caseReference: string;
  paymentUrl: string;
  conversationSummary: string;
};

export async function sendPaymentEmail(input: SendPaymentEmailInput) {
  const subject = `Ihre Zahlungsmoeglichkeit zu ${input.caseReference}`;
  const text = [
    `Hallo ${input.debtorName},`,
    "",
    "vielen Dank fuer das Gespraech.",
    input.conversationSummary,
    "",
    `Hier ist der vereinbarte Zahlungslink: ${input.paymentUrl}`,
    "",
    "Wenn Sie die Forderung bestreiten oder Fragen haben, antworten Sie bitte direkt auf diese E-Mail.",
  ].join("\n");

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return {
      mode: "mock",
      subject,
      text,
      message: "RESEND_API_KEY oder EMAIL_FROM fehlt. E-Mail wurde nicht versendet.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: input.to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed with status ${response.status}`);
  }

  return response.json();
}
