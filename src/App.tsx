import { useState } from 'react'
import { useAnalysis } from './hooks/useAnalysis'
import { DeckUploader } from './components/DeckUploader'
import { AnalysisResult } from './components/AnalysisResult'

export default function App() {
  const { state, analyze, reset } = useAnalysis()
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  function handleFile(file: File) {
    setCurrentFile(file)
    void analyze(file)
  }

  function handleReset() {
    setCurrentFile(null)
    reset()
  }

  const showResult = state.status === 'analyzing' || state.status === 'done'

  return (
    <div className="flex flex-col h-dvh bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#E6EDF3]">Deck Analysis</span>
        </div>
        {currentFile && showResult && (
          <span className="text-xs text-[#7D8590] truncate max-w-[160px]" title={currentFile.name}>
            {currentFile.name}
          </span>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* IDLE */}
        {state.status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
            <div className="w-full max-w-md space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-base font-semibold text-[#E6EDF3]">Upload a Pitch Deck</h2>
                <p className="text-sm text-[#7D8590]">Get structured VC-grade feedback in seconds</p>
              </div>
              <DeckUploader onFile={handleFile} />
            </div>
          </div>
        )}

        {/* ANALYZING / DONE */}
        {showResult && (
          <div className="flex-1 overflow-hidden flex flex-col px-5 py-5">
            <AnalysisResult
              markdown={state.markdown}
              isStreaming={state.status === 'analyzing'}
              onReset={handleReset}
            />
          </div>
        )}

        {/* ERROR */}
        {state.status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
            <div className="w-full max-w-md space-y-4">
              <div className="rounded-xl px-4 py-3 bg-red-400/8 border border-red-400/20">
                <p className="text-sm text-red-400">{state.error}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full text-sm py-2.5 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00D4AA] hover:bg-[#00D4AA]/20 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
