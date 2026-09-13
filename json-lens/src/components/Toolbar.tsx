interface ToolbarProps {
  onFormat: () => void
  onValidate: () => void
  onMinify: () => void
  onCopy: () => void
  onLoadExample: () => void
  onExplain: () => void
  onExplainError: () => void
  onSaveSnippet?: () => void   // optional — only shown when Astra is configured
  isAiLoading: boolean
  hasInput: boolean
  isInvalid: boolean
  copied: boolean
}

const btn =
  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer'

const primaryBtn = `${btn} bg-indigo-600 hover:bg-indigo-500 border-indigo-600/80 text-white focus:ring-indigo-500`
const secondaryBtn = `${btn} bg-gray-800 hover:bg-gray-700 border-gray-700/80 text-gray-300 focus:ring-gray-600`
const successBtn = `${btn} bg-emerald-700 hover:bg-emerald-600 border-emerald-600/80 text-white focus:ring-emerald-500`
const warningBtn = `${btn} bg-amber-700/80 hover:bg-amber-600 border-amber-600/60 text-amber-100 focus:ring-amber-500`

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onValidate,
  onMinify,
  onCopy,
  onLoadExample,
  onExplain,
  onExplainError,
  onSaveSnippet,
  isAiLoading,
  hasInput,
  isInvalid,
  copied,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Main actions */}
      <div className="flex flex-wrap gap-1.5">
        <button className={primaryBtn} onClick={onFormat} disabled={!hasInput} title="Pretty-print JSON">
          Format
        </button>
        <button className={secondaryBtn} onClick={onValidate} disabled={!hasInput} title="Validate JSON syntax">
          Validate
        </button>
        <button className={secondaryBtn} onClick={onMinify} disabled={!hasInput} title="Remove all whitespace">
          Minify
        </button>
        <button
          className={copied ? successBtn : secondaryBtn}
          onClick={onCopy}
          disabled={!hasInput}
          title="Copy to clipboard"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button className={secondaryBtn} onClick={onLoadExample} title="Load sample JSON">
          Load Example
        </button>
        {onSaveSnippet && (
          <button className={secondaryBtn} onClick={onSaveSnippet} disabled={!hasInput} title="Save as snippet to Astra DB">
            Save Snippet
          </button>
        )}
      </div>

      {/* AI actions — compact strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mr-1">AI</span>
        <button
          className={primaryBtn}
          onClick={onExplain}
          disabled={!hasInput || isInvalid || isAiLoading}
          title="Ask AI to explain this JSON"
        >
          {isAiLoading && !isInvalid ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 border border-white/60 border-t-transparent rounded-full animate-spin" />
              Thinking…
            </span>
          ) : (
            'Explain'
          )}
        </button>
        {isInvalid && (
          <button
            className={warningBtn}
            onClick={onExplainError}
            disabled={isAiLoading}
            title="Ask AI to explain the parse error"
          >
            {isAiLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 border border-amber-200/60 border-t-transparent rounded-full animate-spin" />
                Thinking…
              </span>
            ) : (
              'Explain Error'
            )}
          </button>
        )}
        <span className="text-[10px] text-gray-600 italic">
          JSON is sent to AI when using these features.
        </span>
      </div>
    </div>
  )
}

export default Toolbar
