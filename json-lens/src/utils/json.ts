export interface JsonValidationResult {
  valid: boolean
  error: string | null
  errorPosition: { line: number; column: number } | null
}

export function validateJson(input: string): JsonValidationResult {
  if (!input.trim()) {
    return { valid: false, error: 'Input is empty.', errorPosition: null }
  }
  try {
    JSON.parse(input)
    return { valid: true, error: null, errorPosition: null }
  } catch (e) {
    const error = e as SyntaxError
    const errorMessage = error.message
    const position = extractErrorPosition(input, errorMessage)
    return { valid: false, error: errorMessage, errorPosition: position }
  }
}

export function formatJson(input: string): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed, null, 2)
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed)
}

function extractErrorPosition(
  input: string,
  errorMessage: string
): { line: number; column: number } | null {
  // Try to extract position from common browser error message formats
  // e.g. "at position 42" or "line 3 column 5"
  const atPositionMatch = errorMessage.match(/at position (\d+)/)
  if (atPositionMatch) {
    const pos = parseInt(atPositionMatch[1], 10)
    return charPositionToLineCol(input, pos)
  }

  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/)
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    }
  }

  return null
}

function charPositionToLineCol(
  input: string,
  pos: number
): { line: number; column: number } {
  const lines = input.substring(0, pos).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

export const EXAMPLE_JSON = `{
  "user": {
    "id": 123,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "roles": ["admin", "editor"],
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    }
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiJ9",
    "expiresAt": "2024-12-31T23:59:59Z",
    "rememberMe": false
  },
  "meta": {
    "version": "2.1.0",
    "requestId": "req_abc123",
    "timestamp": 1703980799
  }
}`
