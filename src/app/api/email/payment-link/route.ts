import { NextResponse } from "next/server";
import { sendPaymentEmail } from "@/lib/integrations/resend";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.to || !body.debtorName || !body.caseReference || !body.paymentUrl) {
    return NextResponse.json(
      { error: "to, debtorName, caseReference und paymentUrl sind erforderlich." },
      { status: 400 },
    );
  }

  const result = await sendPaymentEmail({
    to: body.to,
    debtorName: body.debtorName,
    caseReference: body.caseReference,
    paymentUrl: body.paymentUrl,
    conversationSummary:
      body.conversationSummary ?? "Wie besprochen erhalten Sie hier die Zahlungsmoeglichkeit.",
  });

  return NextResponse.json({ ok: true, result });
}
