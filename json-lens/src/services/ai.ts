const API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined
const USE_MOCK = !API_KEY

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function explainJson(json: string): Promise<string> {
  if (USE_MOCK) return mockExplainJson(json)
  return callGemini(buildExplainPrompt(json))
}

export async function explainJsonError(
  json: string,
  error: string
): Promise<string> {
  if (USE_MOCK) return mockExplainJsonError(error)
  return callGemini(buildErrorPrompt(json, error))
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildExplainPrompt(json: string): string {
  return `You are a helpful developer tool. Explain the following JSON to a developer in clear, concise language.

Describe:
- The overall structure
- Important objects and their purpose
- Arrays and what they contain
- Key primitive values
- Relationships between nested objects
- Any useful observations

Keep the explanation brief and developer-friendly. Do not repeat the JSON back verbatim.

JSON:
\`\`\`json
${json}
\`\`\``
}

function buildErrorPrompt(json: string, error: string): string {
  return `You are a helpful developer tool. A developer has invalid JSON and received this error:

Error: ${error}

JSON (possibly truncated for context):
\`\`\`
${json.slice(0, 2000)}
\`\`\`

Explain:
1. What went wrong
2. Why it happened
3. How to fix it
4. A corrected example if possible

Be concise and practical. Do not modify the user's JSON without explanation.`
}

// ---------------------------------------------------------------------------
// Gemini AI implementation
// ---------------------------------------------------------------------------

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Gemini returned an empty response.')
  return content as string
}

// ---------------------------------------------------------------------------
// Mock implementation (used when VITE_AI_API_KEY is not set)
// ---------------------------------------------------------------------------

function mockExplainJson(json: string): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return '[Mock AI] Could not parse JSON for explanation.'
  }

  const keys =
    typeof parsed === 'object' && parsed !== null
      ? Object.keys(parsed as Record<string, unknown>)
      : []

  return `⚠️ Mock AI Response (no API key configured)

This JSON ${Array.isArray(parsed) ? `is an array with ${(parsed as unknown[]).length} item(s)` : `is an object with ${keys.length} top-level key(s): ${keys.join(', ')}`}.

To get real AI explanations, set VITE_AI_API_KEY in your .env file.
See README.md for setup instructions.`
}

function mockExplainJsonError(error: string): string {
  return `⚠️ Mock AI Response (no API key configured)

The JSON parsing failed with: "${error}"

Common causes of JSON errors:
1. Trailing commas (e.g. {"a": 1,} — last comma is invalid)
2. Single quotes instead of double quotes
3. Unquoted property keys
4. Missing closing brackets or braces
5. Comments inside JSON (not supported)

To get real AI error explanations, set VITE_AI_API_KEY in your .env file.`
}
