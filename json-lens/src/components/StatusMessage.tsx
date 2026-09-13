export type StatusKind = 'success' | 'error' | 'info'

interface StatusMessageProps {
  kind: StatusKind
  message: string
  detail?: string
}

const kindClasses: Record<StatusKind, string> = {
  success: 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300',
  error:   'bg-red-950/60 border-red-700/50 text-red-300',
  info:    'bg-indigo-950/60 border-indigo-700/50 text-indigo-300',
}

const kindDots: Record<StatusKind, string> = {
  success: 'bg-emerald-400',
  error:   'bg-red-400',
  info:    'bg-indigo-400',
}

const StatusMessage: React.FC<StatusMessageProps> = ({ kind, message, detail }) => {
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${kindClasses[kind]}`}>
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${kindDots[kind]}`} />
        <div className="min-w-0">
          <p className="font-medium leading-snug">{message}</p>
          {detail && (
            <p className="mt-1 font-mono text-[11px] opacity-70 break-all whitespace-pre-wrap leading-relaxed">
              {detail}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatusMessage
