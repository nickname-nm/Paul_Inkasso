# Paul Inkasso MVP

Ein schlankes MVP-Skeleton fuer einen DSGVO- und AI-Act-bewussten Voice Agent im Inkasso-Kontext.

## Stack

- Next.js + TypeScript + Tailwind
- Vercel API Routes als Business-Backend
- Vapi vorbereitet fuer Orchestration
- Twilio BYO Number als Telefonie-Pfad
- Deepgram Nova-3 fuer STT
- GPT-4.1 mini als Default-LLM
- Azure de-DE-FlorianMultilingualNeural als Default-TTS
- Stripe vorbereitet fuer Zahlungslinks
- Resend vorbereitet fuer Zahlungslink-E-Mails
- Supabase/Postgres vorbereitet fuer Auth, Sessions und Persistenz

## Lokal starten

```bash
npm install
npm run dev
```

Dann im Browser oeffnen:

```text
http://localhost:3000
```

## Environment

Lege eine `.env.local` an und kopiere die Werte aus `.env.example`.

```env
VAPI_API_KEY=
VAPI_PHONE_NUMBER_ID=
VAPI_ASSISTANT_ID=
VAPI_TRANSCRIBER_LANGUAGE=de
VAPI_LLM_MODEL=gpt-4.1-mini
VAPI_AZURE_VOICE_ID=de-DE-FlorianMultilingualNeural

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_REGION=ie1

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=

RESEND_API_KEY=
EMAIL_FROM=
```

Ohne Keys laufen die API-Routen im Mock-Modus.

## MVP-Flows

1. Faelle per CSV einfuegen oder Demo-Faelle nutzen.
2. Agent-Guidelines im Tab `Guidelines` bearbeiten.
3. Im `Agent Lab` Test-Call oder Zahlungslink-API ausloesen.
4. Ergebnisse, Timeline und Compliance-Regeln im Admin pruefen.

## Naechste Schritte

- Supabase Schema und Persistenz anschliessen.
- Supabase Auth-Seiten fuer Login/Logout ergaenzen.
- Vapi Assistant mit Tool Calls konfigurieren.
- Twilio-Nummer in Vapi importieren und `VAPI_PHONE_NUMBER_ID` setzen.
- Vapi Webhook Payloads in `call_runs` und `audit_events` speichern.
- Stripe Checkout Session oder Payment Link final implementieren.
- Resend E-Mail im Review-and-Send-Flow aktivieren.
- Auth und Rollen fuer echte Daten aktivieren.
