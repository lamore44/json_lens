import { useState, useEffect, useCallback } from 'react'
import type { HistoryEntry } from '../types/db'
import { getHistory, deleteHistory, clearAllHistory } from '../services/astra'

interface HistoryPanelProps {
  onLoad: (json: string) => void
  refreshTrigger: number   // increment from parent to force a reload
}

const ACTION_LABELS: Record<HistoryEntry['action'], string> = {
  format:        'Formatted',
  validate:      'Validated',
  minify:        'Minified',
  explain:       'AI Explained',
  explain_error: 'AI Error Explained',
}

const ACTION_COLORS: Record<HistoryEntry['action'], string> = {
  format:        'text-indigo-400',
  validate:      'text-sky-400',
  minify:        'text-purple-400',
  explain:       'text-emerald-400',
  explain_error: 'text-amber-400',
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

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onLoad, refreshTrigger }) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory(30)
      setEntries(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load, refreshTrigger])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteHistory(id)
      setEntries(prev => prev.filter(e => e._id !== id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return
    setClearing(true)
    try {
      await clearAllHistory()
      setEntries([])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          History
          {entries.length > 0 && (
            <span className="ml-1.5 text-gray-700">({entries.length})</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            ↻ Refresh
          </button>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="text-[10px] text-red-700 hover:text-red-500 transition-colors disabled:opacity-40"
              title="Clear all history"
            >
              Clear all
            </button>
          )}
        </div>
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
      {!loading && !error && entries.length === 0 && (
        <p className="text-xs text-gray-600 italic text-center py-6">
          No history yet. Actions will be saved automatically.
        </p>
      )}

      {/* List */}
      {!loading && entries.length > 0 && (
        <div className="flex flex-col gap-1 overflow-y-auto max-h-72">
          {entries.map(entry => (
            <div
              key={entry._id}
              className="group flex items-start gap-2.5 bg-gray-900/60 hover:bg-gray-800/60 border border-gray-800/50 rounded-lg px-3 py-2 transition-colors"
            >
              {/* Status dot */}
              <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${entry.is_valid ? 'bg-emerald-500/70' : 'bg-red-500/70'}`} />

              <div className="flex-1 min-w-0">
                {/* Action + time */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-medium ${ACTION_COLORS[entry.action]}`}>
                    {ACTION_LABELS[entry.action]}
                  </span>
                  <span className="text-[10px] text-gray-700 shrink-0">{timeAgo(entry.created_at)}</span>
                </div>
                {/* JSON preview */}
                <p className="mt-0.5 font-mono text-[10px] text-gray-600 truncate">
                  {entry.json_input.slice(0, 80)}
                </p>
                {/* Char count */}
                <p className="text-[10px] text-gray-700">{entry.char_count.toLocaleString()} chars</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onLoad(entry.json_input)}
                  className="text-[10px] text-indigo-500 hover:text-indigo-300 transition-colors"
                  title="Load this JSON"
                >
                  Load
                </button>
                <span className="text-gray-700">·</span>
                <button
                  onClick={() => handleDelete(entry._id)}
                  disabled={deletingId === entry._id}
                  className="text-[10px] text-red-700 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === entry._id ? '…' : 'Del'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryPanel
