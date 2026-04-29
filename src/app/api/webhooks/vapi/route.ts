import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  // Persist this payload to call_runs and audit_events once Supabase is wired.
  return NextResponse.json({
    ok: true,
    receivedType: payload?.message?.type ?? payload?.type ?? "unknown",
  });
}
