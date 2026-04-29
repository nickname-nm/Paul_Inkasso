type StartVapiCallInput = {
  caseId: string;
  phoneNumber: string;
  assistantId?: string;
};

const defaultAssistantOverrides = {
  transcriber: {
    provider: "deepgram",
    model: "nova-3",
    language: process.env.VAPI_TRANSCRIBER_LANGUAGE ?? "de",
  },
  model: {
    provider: "openai",
    model: process.env.VAPI_LLM_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
  },
  voice: {
    provider: "azure",
    voiceId: process.env.VAPI_AZURE_VOICE_ID ?? "de-DE-FlorianMultilingualNeural",
  },
};

export async function startVapiCall(input: StartVapiCallInput) {
  if (!process.env.VAPI_API_KEY || !process.env.VAPI_PHONE_NUMBER_ID) {
    return {
      provider: "vapi",
      mode: "mock",
      callId: `mock_vapi_${input.caseId}`,
      stack: defaultAssistantOverrides,
      message:
        "VAPI_API_KEY oder VAPI_PHONE_NUMBER_ID fehlt. Mock-Call mit Ziel-Stack wurde erzeugt.",
    };
  }

  const response = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId: input.assistantId ?? process.env.VAPI_ASSISTANT_ID,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: input.phoneNumber,
      },
      assistantOverrides: defaultAssistantOverrides,
      metadata: {
        caseId: input.caseId,
        telephony: "twilio-byo-number",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vapi call failed with status ${response.status}`);
  }

  return response.json();
}
