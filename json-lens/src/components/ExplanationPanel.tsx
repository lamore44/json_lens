import StatusMessage from './StatusMessage'
import type { StatusKind } from './StatusMessage'

export type PanelState = 'empty' | 'valid' | 'invalid' | 'loading'

interface ExplanationPanelProps {
  state: PanelState
  validationMessage: string | null
  validationDetail: string | null
  aiExplanation: string | null
  aiError: string | null
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  state,
  validationMessage,
  validationDetail,
  aiExplanation,
  aiError,
}) => {
  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] gap-3 text-gray-600">
        <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2h2M12 3v10m0 0l-3-3m3 3l3-3" />
        </svg>
        <p className="text-sm italic">Paste JSON and click Validate or Format.</p>
      </div>
    )
  }

  const validationKind: StatusKind = state === 'valid' ? 'success' : 'error'

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Validation status */}
      {validationMessage && (
        <StatusMessage
          kind={validationKind}
          message={validationMessage}
          detail={validationDetail ?? undefined}
        />
      )}

      {/* Loading indicator */}
      {state === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
          <span className="inline-block w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Gemini is thinking…
        </div>
      )}

      {/* AI error */}
      {aiError && (
        <StatusMessage
          kind="error"
          message="AI request failed"
          detail={aiError}
        />
      )}

      {/* AI explanation */}
      {aiExplanation && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">AI Explanation</span>
            <span className="text-[10px] text-gray-700">· Gemini 2.5 Flash Lite</span>
          </div>
          <div className="bg-[#0d1117] border border-gray-700/50 rounded-xl p-4 text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap">
            {aiExplanation}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplanationPanel
