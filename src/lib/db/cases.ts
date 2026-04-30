import { createClient } from "@/utils/supabase/server";
import type { DebtorCase } from "@/lib/types";

type DebtorCaseRow = {
  id: string;
  case_reference: string;
  debtor_name: string;
  phone: string;
  email: string;
  amount_cents: number;
  creditor_name: string;
  due_date: string;
  reason: string;
  status: DebtorCase["status"];
  last_contact_at: string | null;
  next_action: string;
  risk_flags: string[];
};

export function mapCaseRow(row: DebtorCaseRow): DebtorCase {
  return {
    id: row.id,
    caseReference: row.case_reference,
    debtorName: row.debtor_name,
    phone: row.phone,
    email: row.email,
    amountCents: row.amount_cents,
    creditorName: row.creditor_name,
    dueDate: row.due_date,
    reason: row.reason,
    status: row.status,
    lastContactAt: row.last_contact_at ?? undefined,
    nextAction: row.next_action,
    riskFlags: row.risk_flags,
  };
}

export async function listCases() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("debtor_cases")
    .select(
      "id, case_reference, debtor_name, phone, email, amount_cents, creditor_name, due_date, reason, status, last_contact_at, next_action, risk_flags",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCaseRow(row as DebtorCaseRow));
}

export async function createCases(cases: DebtorCase[]) {
  const supabase = await createClient();

  const rows = cases.map((item) => ({
    case_reference: item.caseReference,
    debtor_name: item.debtorName,
    phone: item.phone,
    email: item.email,
    amount_cents: item.amountCents,
    creditor_name: item.creditorName,
    due_date: item.dueDate,
    reason: item.reason,
    status: item.status,
    last_contact_at: item.lastContactAt ?? null,
    next_action: item.nextAction,
    risk_flags: item.riskFlags,
  }));

  const { data, error } = await supabase
    .from("debtor_cases")
    .insert(rows)
    .select(
      "id, case_reference, debtor_name, phone, email, amount_cents, creditor_name, due_date, reason, status, last_contact_at, next_action, risk_flags",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCaseRow(row as DebtorCaseRow));
}
