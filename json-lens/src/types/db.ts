// ---------------------------------------------------------------------------
// Shared DB types for Astra DataStax collections
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  _id: string
  json_input: string        // raw JSON string (truncated to 5000 chars for storage)
  action: 'format' | 'validate' | 'minify' | 'explain' | 'explain_error'
  is_valid: boolean
  ai_explanation: string | null
  error_message: string | null
  char_count: number
  created_at: string        // ISO timestamp
}

export interface SnippetEntry {
  _id: string
  name: string              // user-given label
  description: string       // short optional note
  json_content: string      // full JSON content
  char_count: number
  created_at: string
  updated_at: string
}

// Astra Data API response wrappers
export interface AstraFindResponse<T> {
  data: { documents: T[] }
}

export interface AstraInsertResponse {
  status: { insertedIds: string[] }
}
