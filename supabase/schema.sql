create extension if not exists "pgcrypto";

create type case_status as enum (
  'new',
  'queued',
  'called',
  'payment_link_sent',
  'disputed',
  'do_not_call',
  'human_review',
  'paid'
);

create table if not exists debtor_cases (
  id uuid primary key default gen_random_uuid(),
  case_reference text not null unique,
  debtor_name text not null,
  phone text not null,
  email text not null,
  amount_cents integer not null check (amount_cents >= 0),
  creditor_name text not null,
  due_date date not null,
  reason text not null,
  status case_status not null default 'new',
  last_contact_at timestamptz,
  next_action text not null default 'Erstanruf vorbereiten',
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_configs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null default 1,
  is_active boolean not null default false,
  voice_provider text not null default 'vapi',
  telephony text not null,
  transcriber text not null,
  model text not null,
  tts_voice text not null,
  temperature numeric not null default 0.2,
  guidelines text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists call_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references debtor_cases(id) on delete cascade,
  agent_config_id uuid references agent_configs(id),
  provider_call_id text,
  status text not null default 'planned',
  started_at timestamptz not null default now(),
  duration_seconds integer,
  outcome text,
  transcript_summary text,
  recording_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references debtor_cases(id) on delete cascade,
  label text not null,
  detail text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

alter table debtor_cases enable row level security;
alter table agent_configs enable row level security;
alter table call_runs enable row level security;
alter table audit_events enable row level security;

-- MVP policy: authenticated users can read/write internal data.
-- Tighten this with roles before using real debtor data.
create policy "authenticated manage debtor cases"
  on debtor_cases for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated manage agent configs"
  on agent_configs for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated manage call runs"
  on call_runs for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated manage audit events"
  on audit_events for all
  to authenticated
  using (true)
  with check (true);
