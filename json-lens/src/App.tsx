import { useState, useCallback } from 'react'
import JsonEditor from './components/JsonEditor'
import Toolbar from './components/Toolbar'
import ExplanationPanel from './components/ExplanationPanel'
import HistoryPanel from './components/HistoryPanel'
import SnippetPanel from './components/SnippetPanel'
import SaveSnippetModal from './components/SaveSnippetModal'
import type { PanelState } from './components/ExplanationPanel'
import { validateJson, formatJson, minifyJson, EXAMPLE_JSON } from './utils/json'
import { explainJson, explainJsonError } from './services/ai'
import { addHistory, isAstraConfigured } from './services/astra'

const MAX_AI_INPUT_LENGTH = 20000
const ASTRA_OK = isAstraConfigured()

type SideTab = 'results' | 'history' | 'snippets'

function App() {
  // ── Editor state ──────────────────────────────────────────────────────────
  const [json, setJson] = useState('')
  const [panelState, setPanelState] = useState<PanelState>('empty')
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [validationDetail, setValidationDetail] = useState<string | null>(null)
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── DB / UI state ─────────────────────────────────────────────────────────
  const [sideTab, setSideTab] = useState<SideTab>('results')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [historyTrigger, setHistoryTrigger] = useState(0)
  const [snippetTrigger, setSnippetTrigger] = useState(0)

  // Derived
  const isInvalid = panelState === 'invalid'
  const hasInput  = json.trim().length > 0

  // ── Helper: save to history silently ─────────────────────────────────────
  const saveToHistory = useCallback(
    async (
      action: Parameters<typeof addHistory>[0]['action'],
      isValid: boolean,
      aiExp: string | null = null,
      errMsg: string | null = null,
    ) => {
      if (!ASTRA_OK || !json.trim()) return
      try {
        await addHistory({
          json_input:     json,
          action,
          is_valid:       isValid,
          ai_explanation: aiExp,
          error_message:  errMsg,
          char_count:     json.length,
        })
        // refresh history tab counter silently
        setHistoryTrigger(n => n + 1)
      } catch {
        // history save is non-critical — swallow errors
      }
    },
    [json],
  )

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFormat = useCallback(() => {
    if (!json.trim()) return
    try {
      const formatted = formatJson(json)
      setJson(formatted)
      setPanelState('valid')
      setValidationMessage('Valid JSON — formatted successfully.')
      setValidationDetail(null)
      setAiExplanation(null)
      setAiError(null)
      saveToHistory('format', true)
    } catch {
      const result = validateJson(json)
      setPanelState('invalid')
      setValidationMessage('Invalid JSON — cannot format.')
      setValidationDetail(buildErrorDetail(result.error, result.errorPosition))
      setAiExplanation(null)
      setAiError(null)
      saveToHistory('format', false, null, result.error)
    }
  }, [json, saveToHistory])

  const handleValidate = useCallback(() => {
    if (!json.trim()) return
    const result = validateJson(json)
    if (result.valid) {
      setPanelState('valid')
      setValidationMessage('Valid JSON ✓')
      setValidationDetail(null)
    } else {
      setPanelState('invalid')
      setValidationMessage('Invalid JSON')
      setValidationDetail(buildErrorDetail(result.error, result.errorPosition))
    }
    setAiExplanation(null)
    setAiError(null)
    saveToHistory('validate', result.valid, null, result.error)
  }, [json, saveToHistory])

  const handleMinify = useCallback(() => {
    if (!json.trim()) return
    try {
      const minified = minifyJson(json)
      setJson(minified)
      setPanelState('valid')
      setValidationMessage('Valid JSON — minified successfully.')
      setValidationDetail(null)
      setAiExplanation(null)
      setAiError(null)
      saveToHistory('minify', true)
    } catch {
      const result = validateJson(json)
      setPanelState('invalid')
      setValidationMessage('Invalid JSON — cannot minify.')
      setValidationDetail(buildErrorDetail(result.error, result.errorPosition))
      setAiExplanation(null)
      setAiError(null)
      saveToHistory('minify', false, null, result.error)
    }
  }, [json, saveToHistory])

  const handleCopy = useCallback(async () => {
    if (!json) return
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = json
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert('Could not copy to clipboard. Please copy manually.')
      }
    }
  }, [json])

  const handleLoadExample = useCallback(() => {
    setJson(EXAMPLE_JSON)
    setPanelState('empty')
    setValidationMessage(null)
    setValidationDetail(null)
    setAiExplanation(null)
    setAiError(null)
  }, [])

  const handleExplain = useCallback(async () => {
    if (!json.trim() || isInvalid || isAiLoading) return
    if (json.length > MAX_AI_INPUT_LENGTH) {
      setAiError(`Input is too large for AI (${json.length.toLocaleString()} chars). Trim below ${MAX_AI_INPUT_LENGTH.toLocaleString()} chars.`)
      return
    }
    setIsAiLoading(true)
    setPanelState('loading')
    setAiExplanation(null)
    setAiError(null)
    setSideTab('results')
    try {
      const explanation = await explainJson(json)
      setPanelState('valid')
      setValidationMessage('Valid JSON ✓')
      setValidationDetail(null)
      setAiExplanation(explanation)
      saveToHistory('explain', true, explanation)
    } catch (e) {
      setPanelState('valid')
      setAiError((e as Error).message ?? 'Unknown AI error')
    } finally {
      setIsAiLoading(false)
    }
  }, [json, isInvalid, isAiLoading, saveToHistory])

  const handleExplainError = useCallback(async () => {
    if (!json.trim() || isAiLoading) return
    const result = validateJson(json)
    if (result.valid) return
    if (json.length > MAX_AI_INPUT_LENGTH) {
      setAiError(`Input is too large for AI (${json.length.toLocaleString()} chars).`)
      return
    }
    setIsAiLoading(true)
    setAiExplanation(null)
    setAiError(null)
    setSideTab('results')
    try {
      const explanation = await explainJsonError(json, result.error ?? 'Unknown error')
      setPanelState('invalid')
      setAiExplanation(explanation)
      saveToHistory('explain_error', false, explanation, result.error)
    } catch (e) {
      setAiError((e as Error).message ?? 'Unknown AI error')
    } finally {
      setIsAiLoading(false)
    }
  }, [json, isAiLoading, saveToHistory])

  // Load from history or snippet into editor
  const handleLoadFromDB = useCallback((jsonContent: string) => {
    setJson(jsonContent)
    setPanelState('empty')
    setValidationMessage(null)
    setValidationDetail(null)
    setAiExplanation(null)
    setAiError(null)
    setSideTab('results')
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-gray-800/60 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold">
              {'{'}
            </div>
            <div>
              <span className="text-base font-semibold text-white tracking-tight">JSON Lens</span>
              <span className="ml-2 text-xs text-gray-600">Format · Validate · Explain with AI</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {ASTRA_OK && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-700 border border-gray-800 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/70" />
                Astra DB connected
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-700 border border-gray-800 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              Gemini 2.5 Flash Lite
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">

          {/* Toolbar */}
          <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl px-4 py-3">
            <Toolbar
              onFormat={handleFormat}
              onValidate={handleValidate}
              onMinify={handleMinify}
              onCopy={handleCopy}
              onLoadExample={handleLoadExample}
              onExplain={handleExplain}
              onExplainError={handleExplainError}
              onSaveSnippet={ASTRA_OK ? () => setShowSaveModal(true) : undefined}
              isAiLoading={isAiLoading}
              hasInput={hasInput}
              isInvalid={isInvalid}
              copied={copied}
            />
          </div>

          {/* Editor + Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">

            {/* JSON Editor */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Input</span>
                {json.length > 0 && (
                  <span className="text-[10px] text-gray-700">{json.length.toLocaleString()} chars</span>
                )}
              </div>
              <JsonEditor value={json} onChange={setJson} />
            </div>

            {/* Side Panel */}
            <div className="flex flex-col gap-1.5">
              {/* Tab bar */}
              <div className="flex items-center gap-1 px-1">
                {(['results', 'history', 'snippets'] as SideTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSideTab(tab)}
                    className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-md transition-colors ${
                      sideTab === tab
                        ? 'bg-gray-800 text-gray-300'
                        : 'text-gray-600 hover:text-gray-400'
                    } ${!ASTRA_OK && tab !== 'results' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    disabled={!ASTRA_OK && tab !== 'results'}
                    title={!ASTRA_OK && tab !== 'results' ? 'Astra DB not configured' : undefined}
                  >
                    {tab}
                  </button>
                ))}
                {!ASTRA_OK && (
                  <span className="ml-auto text-[9px] text-gray-700 italic">DB not configured</span>
                )}
              </div>

              {/* Panel content */}
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4">
                {sideTab === 'results' && (
                  <ExplanationPanel
                    state={panelState}
                    validationMessage={validationMessage}
                    validationDetail={validationDetail}
                    aiExplanation={aiExplanation}
                    aiError={aiError}
                  />
                )}
                {sideTab === 'history' && ASTRA_OK && (
                  <HistoryPanel
                    onLoad={handleLoadFromDB}
                    refreshTrigger={historyTrigger}
                  />
                )}
                {sideTab === 'snippets' && ASTRA_OK && (
                  <SnippetPanel
                    onLoad={handleLoadFromDB}
                    refreshTrigger={snippetTrigger}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800/40 px-6 py-2.5 text-center text-[10px] text-gray-700">
        JSON Lens — Gemini 2.5 Flash Lite · Astra DataStax
      </footer>

      {/* ── Save Snippet Modal ── */}
      {showSaveModal && (
        <SaveSnippetModal
          json={json}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => {
            setSnippetTrigger(n => n + 1)
            setSideTab('snippets')
          }}
        />
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildErrorDetail(
  error: string | null,
  position: { line: number; column: number } | null,
): string | null {
  if (!error) return null
  if (position) return `${error}\n→ Line ${position.line}, Column ${position.column}`
  return error
}

export default App
