import { NextResponse } from "next/server";
import { startVapiCall } from "@/lib/integrations/vapi";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.caseId || !body.phoneNumber) {
    return NextResponse.json(
      { error: "caseId und phoneNumber sind erforderlich." },
      { status: 400 },
    );
  }

  const result = await startVapiCall({
    caseId: body.caseId,
    phoneNumber: body.phoneNumber,
    assistantId: body.assistantId,
  });

  return NextResponse.json({ ok: true, result });
}
