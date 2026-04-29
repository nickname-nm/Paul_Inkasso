"use client";

import { useMemo, useState } from "react";
import {
  blockedAgentBehaviors,
  complianceChecklist,
} from "@/lib/compliance";
import {
  demoAgentConfigs,
  demoAuditEvents,
  demoCallRuns,
  demoCases,
} from "@/lib/demo-data";
import { formatDate, formatMoney } from "@/lib/format";
import type { AgentConfig, AuditEvent, CallRun, CaseStatus, DebtorCase } from "@/lib/types";

const statusLabels: Record<CaseStatus, string> = {
  new: "Neu",
  queued: "In Warteschlange",
  called: "Angerufen",
  payment_link_sent: "Link gesendet",
  disputed: "Bestritten",
  do_not_call: "Nicht anrufen",
  human_review: "Pruefung",
  paid: "Bezahlt",
};

const statusStyles: Record<CaseStatus, string> = {
  new: "border-white/25 text-white",
  queued: "border-white/25 text-white",
  called: "border-white/25 text-white",
  payment_link_sent: "border-accent text-accent",
  disputed: "border-yellow-300 text-yellow-200",
  do_not_call: "border-red-300 text-red-200",
  human_review: "border-yellow-300 text-yellow-200",
  paid: "border-green-300 text-green-200",
};

type Tab = "cases" | "guidelines" | "lab" | "compliance";

export default function Home() {
  const [cases, setCases] = useState<DebtorCase[]>(demoCases);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(demoAgentConfigs);
  const [callRuns] = useState<CallRun[]>(demoCallRuns);
  const [auditEvents] = useState<AuditEvent[]>(demoAuditEvents);
  const [activeTab, setActiveTab] = useState<Tab>("cases");
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id ?? "");
  const [selectedAgentId, setSelectedAgentId] = useState(agentConfigs[0]?.id ?? "");
  const [csvText, setCsvText] = useState("");
  const [apiResult, setApiResult] = useState("Noch kein API-Test gestartet.");

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const selectedAgent =
    agentConfigs.find((item) => item.id === selectedAgentId) ?? agentConfigs[0];

  const stats = useMemo(() => {
    return {
      total: cases.length,
      open: cases.filter((item) => ["new", "queued", "human_review"].includes(item.status))
        .length,
      paymentLinks: cases.filter((item) => item.status === "payment_link_sent").length,
      disputed: cases.filter((item) => item.status === "disputed").length,
    };
  }, [cases]);

  function updateSelectedGuidelines(value: string) {
    setAgentConfigs((current) =>
      current.map((config) =>
        config.id === selectedAgent.id
          ? { ...config, guidelines: value, updatedAt: new Date().toISOString() }
          : config,
      ),
    );
  }

  function importCsv() {
    const rows = csvText
      .trim()
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));

    const [, ...records] = rows;
    if (records.length === 0) return;

    const importedCases = records.map((row, index): DebtorCase => {
      const [caseReference, debtorName, phone, email, amount, creditorName, dueDate, reason] =
        row;

      return {
        id: `import_${Date.now()}_${index}`,
        caseReference: caseReference || `IMPORT-${index + 1}`,
        debtorName: debtorName || "Unbekannt",
        phone: phone || "",
        email: email || "",
        amountCents: Math.round(Number(amount || 0) * 100),
        creditorName: creditorName || "Unbekannter Glaeubiger",
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        reason: reason || "Importierter Fall",
        status: "new",
        nextAction: "Import pruefen",
        riskFlags: [],
      };
    });

    setCases((current) => [...importedCases, ...current]);
    setSelectedCaseId(importedCases[0].id);
    setCsvText("");
  }

  async function startMockCall() {
    if (!selectedCase) return;

    setApiResult("Starte Call ueber /api/calls/start ...");

    const response = await fetch("/api/calls/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: selectedCase.id,
        phoneNumber: selectedCase.phone,
        assistantId: selectedAgent?.id,
      }),
    });

    const result = await response.json();
    setApiResult(JSON.stringify(result, null, 2));
  }

  async function createMockPaymentLink() {
    if (!selectedCase) return;

    setApiResult("Erzeuge Zahlungslink ueber /api/payment-link ...");

    const response = await fetch("/api/payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseReference: selectedCase.caseReference,
        debtorEmail: selectedCase.email,
        amountCents: selectedCase.amountCents,
        description: selectedCase.reason,
      }),
    });

    const result = await response.json();
    setApiResult(JSON.stringify(result, null, 2));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/15 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase text-accent">Paul Inkasso</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Voice Agent MVP</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/70">
              Case-Import, Agent-Guidelines, Call-Start, Zahlungslink und Audit-Doku in einem
              schlanken Startsystem. Externe Keys koennen spaeter in .env.local gesetzt werden.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Faelle" value={stats.total} />
            <Metric label="Offen" value={stats.open} />
            <Metric label="Links" value={stats.paymentLinks} />
            <Metric label="Widerspruch" value={stats.disputed} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-2">
          <TabButton active={activeTab === "cases"} onClick={() => setActiveTab("cases")}>
            Cases
          </TabButton>
          <TabButton
            active={activeTab === "guidelines"}
            onClick={() => setActiveTab("guidelines")}
          >
            Guidelines
          </TabButton>
          <TabButton active={activeTab === "lab"} onClick={() => setActiveTab("lab")}>
            Agent Lab
          </TabButton>
          <TabButton
            active={activeTab === "compliance"}
            onClick={() => setActiveTab("compliance")}
          >
            Compliance
          </TabButton>
        </nav>

        {activeTab === "cases" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="border border-white/15">
              <div className="flex flex-col gap-3 border-b border-white/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Falluebersicht</h2>
                  <p className="text-sm text-white/60">Demo-Daten heute, CSV/API morgen.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead className="bg-white text-left text-black">
                    <tr>
                      <th className="p-3">Fall</th>
                      <th className="p-3">Schuldner</th>
                      <th className="p-3">Betrag</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Naechste Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((item) => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer border-t border-white/10 ${
                          item.id === selectedCase?.id ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                        onClick={() => setSelectedCaseId(item.id)}
                      >
                        <td className="p-3 font-bold">{item.caseReference}</td>
                        <td className="p-3">
                          <div>{item.debtorName}</div>
                          <div className="text-xs text-white/50">{item.email}</div>
                        </td>
                        <td className="p-3">{formatMoney(item.amountCents)}</td>
                        <td className="p-3">
                          <StatusPill status={item.status} />
                        </td>
                        <td className="p-3 text-white/70">{item.nextAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="border border-white/15 p-4">
              {selectedCase && (
                <>
                  <p className="text-sm uppercase text-accent">{selectedCase.caseReference}</p>
                  <h2 className="mt-2 text-2xl font-bold">{selectedCase.debtorName}</h2>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <Info label="Telefon" value={selectedCase.phone} />
                    <Info label="E-Mail" value={selectedCase.email} />
                    <Info label="Glaeubiger" value={selectedCase.creditorName} />
                    <Info label="Faellig seit" value={formatDate(selectedCase.dueDate)} />
                    <Info label="Grund" value={selectedCase.reason} />
                    <Info label="Letzter Kontakt" value={formatDate(selectedCase.lastContactAt)} />
                  </dl>
                  <div className="mt-5 flex flex-col gap-2">
                    <button className="h-12 bg-accent px-4 font-bold text-white" onClick={startMockCall}>
                      Test-Call starten
                    </button>
                    <button
                      className="h-12 border border-white/25 px-4 font-bold text-white"
                      onClick={createMockPaymentLink}
                    >
                      Zahlungslink testen
                    </button>
                  </div>
                  <div className="mt-5 border-t border-white/15 pt-4">
                    <h3 className="font-bold">Timeline</h3>
                    <div className="mt-3 space-y-3">
                      {auditEvents
                        .filter((event) => event.caseId === selectedCase.id)
                        .map((event) => (
                          <div key={event.id} className="border-l-2 border-accent pl-3 text-sm">
                            <div className="font-bold">{event.label}</div>
                            <div className="text-white/60">{event.detail}</div>
                          </div>
                        ))}
                      {callRuns
                        .filter((call) => call.caseId === selectedCase.id)
                        .map((call) => (
                          <div key={call.id} className="border-l-2 border-white pl-3 text-sm">
                            <div className="font-bold">Call abgeschlossen</div>
                            <div className="text-white/60">{call.transcriptSummary}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </aside>

            <section className="border border-white/15 p-4 lg:col-span-2">
              <h2 className="text-xl font-bold">CSV Import</h2>
              <p className="mt-1 text-sm text-white/60">
                Erwartete Spalten: case_reference, debtor_name, phone, email, amount, creditor_name,
                due_date, reason
              </p>
              <textarea
                className="mt-3 min-h-32 w-full border border-white/15 bg-black p-3 font-mono text-sm text-white outline-none focus:border-accent"
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                placeholder="case_reference,debtor_name,phone,email,amount,creditor_name,due_date,reason"
              />
              <button className="mt-3 h-12 bg-white px-4 font-bold text-black" onClick={importCsv}>
                CSV importieren
              </button>
            </section>
          </div>
        )}

        {activeTab === "guidelines" && selectedAgent && (
          <section className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-white/15 p-4">
              <h2 className="text-xl font-bold">Agent-Versionen</h2>
              <div className="mt-4 space-y-2">
                {agentConfigs.map((config) => (
                  <button
                    key={config.id}
                    className={`w-full border p-3 text-left ${
                      config.id === selectedAgent.id
                        ? "border-accent bg-accent text-white"
                        : "border-white/15"
                    }`}
                    onClick={() => setSelectedAgentId(config.id)}
                  >
                    <div className="font-bold">{config.name}</div>
                    <div className="text-sm opacity-75">Version {config.version}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-white/15 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-sm text-white/60">
                    {selectedAgent.telephony} · {selectedAgent.transcriber} ·{" "}
                    {selectedAgent.model} · {selectedAgent.ttsVoice} · Temp{" "}
                    {selectedAgent.temperature}
                  </p>
                </div>
                <span className="border border-white/20 px-3 py-2 text-sm">
                  Updated {formatDate(selectedAgent.updatedAt)}
                </span>
              </div>
              <textarea
                className="mt-4 min-h-96 w-full border border-white/15 bg-black p-3 font-mono text-sm leading-6 text-white outline-none focus:border-accent"
                value={selectedAgent.guidelines}
                onChange={(event) => updateSelectedGuidelines(event.target.value)}
              />
            </div>
          </section>
        )}

        {activeTab === "lab" && (
          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="border border-white/15 p-4">
              <h2 className="text-xl font-bold">Agent Lab</h2>
              <label className="mt-4 block text-sm text-white/60">Testfall</label>
              <select
                className="mt-2 h-12 w-full border border-white/15 bg-black px-3 text-white"
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.caseReference} · {item.debtorName}
                  </option>
                ))}
              </select>
              <label className="mt-4 block text-sm text-white/60">Agent Config</label>
              <select
                className="mt-2 h-12 w-full border border-white/15 bg-black px-3 text-white"
                value={selectedAgentId}
                onChange={(event) => setSelectedAgentId(event.target.value)}
              >
                {agentConfigs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} v{item.version}
                  </option>
                ))}
              </select>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button className="h-12 bg-accent px-4 font-bold text-white" onClick={startMockCall}>
                  Call API testen
                </button>
                <button
                  className="h-12 border border-white/25 px-4 font-bold text-white"
                  onClick={createMockPaymentLink}
                >
                  Payment API testen
                </button>
              </div>
            </div>
            <pre className="min-h-80 overflow-auto border border-white/15 bg-white p-4 text-sm text-black">
              {apiResult}
            </pre>
          </section>
        )}

        {activeTab === "compliance" && (
          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <Checklist title="MVP Pflichtregeln" items={complianceChecklist} />
            <Checklist title="Blockierte Agent-Verhalten" items={blockedAgentBehaviors} />
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-28 border border-white/15 p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase text-white/60">{label}</div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-11 border px-4 font-bold ${
        active ? "border-accent bg-accent text-white" : "border-white/20 text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: CaseStatus }) {
  return (
    <span className={`inline-flex border px-2 py-1 text-xs font-bold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-white/50">{label}</dt>
      <dd className="break-words text-white">{value}</dd>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-white/15 p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="border-l-2 border-accent pl-3 text-sm leading-6 text-white/75">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
