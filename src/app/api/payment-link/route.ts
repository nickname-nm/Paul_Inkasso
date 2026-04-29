import { NextResponse } from "next/server";
import { createPaymentLink } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.caseReference || !body.debtorEmail || !body.amountCents) {
    return NextResponse.json(
      { error: "caseReference, debtorEmail und amountCents sind erforderlich." },
      { status: 400 },
    );
  }

  const result = await createPaymentLink({
    caseReference: body.caseReference,
    debtorEmail: body.debtorEmail,
    amountCents: body.amountCents,
    description: body.description ?? "Inkasso Zahlung",
  });

  return NextResponse.json({ ok: true, result });
}
