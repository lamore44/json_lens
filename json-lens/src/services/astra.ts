import type {
  HistoryEntry,
  SnippetEntry,
  AstraFindResponse,
  AstraInsertResponse,
} from "../types/db";

// ---------------------------------------------------------------------------
// Config — all values come from .env, never hardcoded
// ---------------------------------------------------------------------------

const ENDPOINT = import.meta.env.VITE_ASTRA_ENDPOINT as string;
const TOKEN = import.meta.env.VITE_ASTRA_TOKEN as string;
const KEYSPACE = import.meta.env.VITE_ASTRA_KEYSPACE as string;

const ASTRA_PROXY_PREFIX = "/astra";

// Max chars we store for the JSON input in history (avoid huge payloads)
const MAX_HISTORY_JSON_CHARS = 5000;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  if (!ENDPOINT || !TOKEN || !KEYSPACE) {
    throw new Error(
      "Astra credentials are not configured. Check your .env file.",
    );
  }

  const base = import.meta.env.DEV
    ? `${ASTRA_PROXY_PREFIX}/api/json/v1/${KEYSPACE}`
    : `${ENDPOINT}/api/json/v1/${KEYSPACE}`;
  const headers = {
    "Content-Type": "application/json",
    Token: TOKEN,
  };

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Astra request failed before a response was received. This is usually a CORS, network, or endpoint problem. Original error: ${message}`,
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Astra API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function addHistory(
  entry: Omit<HistoryEntry, "_id" | "created_at">,
): Promise<void> {
  const doc = {
    ...entry,
    json_input: entry.json_input.slice(0, MAX_HISTORY_JSON_CHARS),
    created_at: nowISO(),
  };
  await request<AstraInsertResponse>("/json_history", "POST", {
    insertOne: { document: doc },
  });
}

export async function getHistory(limit = 30): Promise<HistoryEntry[]> {
  const res = await request<AstraFindResponse<HistoryEntry>>(
    "/json_history",
    "POST",
    {
      find: {
        sort: { created_at: -1 },
        options: { limit },
      },
    },
  );
  return res.data?.documents ?? [];
}

export async function deleteHistory(id: string): Promise<void> {
  await request(`/json_history/${id}`, "DELETE");
}

export async function clearAllHistory(): Promise<void> {
  await request<unknown>("/json_history", "POST", {
    deleteMany: { filter: {} },
  });
}

// ---------------------------------------------------------------------------
// Snippets
// ---------------------------------------------------------------------------

export async function getSnippets(): Promise<SnippetEntry[]> {
  const res = await request<AstraFindResponse<SnippetEntry>>(
    "/json_snippets",
    "POST",
    {
      find: {
        sort: { updated_at: -1 },
        options: { limit: 50 },
      },
    },
  );
  return res.data?.documents ?? [];
}

export async function saveSnippet(
  name: string,
  description: string,
  jsonContent: string,
): Promise<void> {
  const doc: Omit<SnippetEntry, "_id"> = {
    name: name.trim(),
    description: description.trim(),
    json_content: jsonContent,
    char_count: jsonContent.length,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  await request<AstraInsertResponse>("/json_snippets", "POST", {
    insertOne: { document: doc },
  });
}

export async function deleteSnippet(id: string): Promise<void> {
  await request(`/json_snippets/${id}`, "DELETE");
}

export function isAstraConfigured(): boolean {
  return Boolean(ENDPOINT && TOKEN && KEYSPACE);
}
