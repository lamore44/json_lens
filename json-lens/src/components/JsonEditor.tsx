interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  return (
    <textarea
      className="w-full min-h-[460px] font-mono text-[13px] leading-relaxed bg-[#0d1117] text-gray-200 border border-gray-700/60 rounded-xl p-4 resize-none focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40 placeholder-gray-600 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste your JSON here..."
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  )
}

export default JsonEditor
