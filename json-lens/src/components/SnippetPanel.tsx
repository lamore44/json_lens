import { useState, useEffect, useCallback } from 'react'
import type { SnippetEntry } from '../types/db'
import { getSnippets, deleteSnippet } from '../services/astra'

interface SnippetPanelProps {
  onLoad: (json: string) => void
  refreshTrigger: number   // increment from parent to force a reload
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const SnippetPanel: React.FC<SnippetPanelProps> = ({ onLoad, refreshTrigger }) => {
  const [snippets, setSnippets] = useState<SnippetEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSnippets()
      setSnippets(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this snippet?')) return
    setDeletingId(id)
    try {
      await deleteSnippet(id)
      setSnippets(prev => prev.filter(s => s._id !== id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Saved Snippets
          {snippets.length > 0 && (
            <span className="ml-1.5 text-gray-700">({snippets.length})</span>
          )}
        </span>
        <button
          onClick={load}
          disabled={loading}
          className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center text-xs text-gray-600">
          <span className="inline-block w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {/* Empty */}
      {!loading && !error && snippets.length === 0 && (
        <p className="text-xs text-gray-600 italic text-center py-6">
          No snippets yet. Use "Save Snippet" to bookmark JSON.
        </p>
      )}

      {/* List */}
      {!loading && snippets.length > 0 && (
        <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
          {snippets.map(snippet => (
            <div
              key={snippet._id}
              className="group flex items-start gap-2.5 bg-gray-900/60 hover:bg-gray-800/60 border border-gray-800/50 rounded-lg px-3 py-2 transition-colors"
            >
              {/* Icon */}
              <span className="mt-1 text-indigo-500/60 text-[11px] shrink-0">⟨/⟩</span>

              <div className="flex-1 min-w-0">
                {/* Name + time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-gray-300 truncate">{snippet.name}</span>
                  <span className="text-[10px] text-gray-700 shrink-0">{timeAgo(snippet.updated_at)}</span>
                </div>
                {/* Description */}
                {snippet.description && (
                  <p className="mt-0.5 text-[10px] text-gray-600 truncate">{snippet.description}</p>
                )}
                {/* Char count */}
                <p className="text-[10px] text-gray-700">{snippet.char_count.toLocaleString()} chars</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onLoad(snippet.json_content)}
                  className="text-[10px] text-indigo-500 hover:text-indigo-300 transition-colors"
                  title="Load snippet into editor"
                >
                  Load
                </button>
                <span className="text-gray-700">·</span>
                <button
                  onClick={() => handleDelete(snippet._id)}
                  disabled={deletingId === snippet._id}
                  className="text-[10px] text-red-700 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Delete snippet"
                >
                  {deletingId === snippet._id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SnippetPanel
