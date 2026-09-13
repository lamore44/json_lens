import { useState } from 'react'
import { saveSnippet } from '../services/astra'

interface SaveSnippetModalProps {
  json: string
  onClose: () => void
  onSaved: () => void
}

const SaveSnippetModal: React.FC<SaveSnippetModalProps> = ({ json, onClose, onSaved }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the snippet.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveSnippet(name, description, json)
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[#0f1117] border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-5"
        onKeyDown={handleKeyDown}
      >
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Save Snippet</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 bg-[#0d1117] border border-gray-800/60 rounded-lg px-3 py-2">
          <p className="font-mono text-[10px] text-gray-600 truncate">{json.slice(0, 100)}</p>
          <p className="text-[10px] text-gray-700 mt-0.5">{json.length.toLocaleString()} characters</p>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. User API Response"
            autoFocus
            maxLength={80}
            className="w-full bg-gray-900 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
            Description <span className="text-gray-700">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short note about this snippet"
            maxLength={200}
            className="w-full bg-gray-900 border border-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="mb-3 text-[11px] text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-400 hover:text-gray-200 border border-gray-700/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 border border-indigo-600/80 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 border border-white/50 border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveSnippetModal
