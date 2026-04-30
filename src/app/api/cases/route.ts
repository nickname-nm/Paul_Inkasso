import { NextResponse } from "next/server";
import { demoCases } from "@/lib/demo-data";
import { createCases, listCases } from "@/lib/db/cases";
import type { DebtorCase } from "@/lib/types";

export async function GET() {
  try {
    const cases = await listCases();
    return NextResponse.json({ ok: true, source: "supabase", cases });
  } catch (error) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      warning: error instanceof Error ? error.message : "Supabase nicht erreichbar.",
      cases: demoCases,
    });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { cases?: DebtorCase[] };

  if (!body.cases?.length) {
    return NextResponse.json({ error: "cases ist erforderlich." }, { status: 400 });
  }

  try {
    const cases = await createCases(body.cases);
    return NextResponse.json({ ok: true, source: "supabase", cases });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "supabase",
        error: error instanceof Error ? error.message : "Cases konnten nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}
