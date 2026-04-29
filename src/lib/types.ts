export type CaseStatus =
  | "new"
  | "queued"
  | "called"
  | "payment_link_sent"
  | "disputed"
  | "do_not_call"
  | "human_review"
  | "paid";

export type DebtorCase = {
  id: string;
  caseReference: string;
  debtorName: string;
  phone: string;
  email: string;
  amountCents: number;
  creditorName: string;
  dueDate: string;
  reason: string;
  status: CaseStatus;
  lastContactAt?: string;
  nextAction: string;
  riskFlags: string[];
};

export type AgentConfig = {
  id: string;
  name: string;
  version: number;
  isActive: boolean;
  voiceProvider: "vapi" | "retell";
  telephony: string;
  transcriber: string;
  ttsVoice: string;
  model: string;
  temperature: number;
  updatedAt: string;
  guidelines: string;
};

export type CallRun = {
  id: string;
  caseId: string;
  agentConfigId: string;
  status: "planned" | "running" | "completed" | "failed";
  startedAt: string;
  durationSeconds?: number;
  outcome?: string;
  transcriptSummary?: string;
  recordingUrl?: string;
};

export type AuditEvent = {
  id: string;
  caseId: string;
  label: string;
  detail: string;
  createdAt: string;
};
