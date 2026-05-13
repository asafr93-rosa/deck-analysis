import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string
  isStreaming: boolean
  onReset: () => void
}

export function AnalysisResult({ markdown, isStreaming, onReset }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [markdown, isStreaming])

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-[#E6EDF3]">Pitch Deck Analysis</h1>
          <p className="text-xs text-[#7D8590] mt-0.5">Powered by Claude Sonnet</p>
        </div>
        <button
          onClick={onReset}
          disabled={isStreaming}
          className={[
            'text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150',
            isStreaming
              ? 'border-white/5 text-[#7D8590] cursor-not-allowed'
              : 'border-white/10 text-[#7D8590] hover:border-[#00D4AA]/40 hover:text-[#00D4AA] cursor-pointer',
          ].join(' ')}
        >
          Analyze Another
        </button>
      </div>

      {/* Scrollable analysis */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="prose-analysis pb-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-[#00D4AA] animate-pulse rounded-sm ml-0.5 align-middle" />
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
