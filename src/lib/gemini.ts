// Backend-only Gemini API helper

function sanitizeJson(raw: string): string {
  let s = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Fix unescaped newlines/tabs inside JSON string values
  s = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  return s;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.ZITE_GEMINI_API_KEY;
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function callGeminiJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
  const raw = await callGemini(prompt, systemInstruction + '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code blocks, no extra text. Ensure all strings are properly escaped.');
  return JSON.parse(sanitizeJson(raw));
}

/**
 * Call Gemini with a file (PDF/DOCX/image) as inline base64 data.
 */
export async function callGeminiWithFile(
  fileBase64: string,
  mimeType: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const apiKey = process.env.ZITE_GEMINI_API_KEY;
  const body: any = {
    contents: [{
      parts: [
        { inlineData: { mimeType, data: fileBase64 } },
        { text: prompt },
      ],
    }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function callGeminiWithFileJSON<T = any>(
  fileBase64: string,
  mimeType: string,
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const raw = await callGeminiWithFile(
    fileBase64,
    mimeType,
    prompt,
    (systemInstruction || '') + '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code blocks, no extra text.'
  );
  return JSON.parse(sanitizeJson(raw));
}
