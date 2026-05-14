import { useEffect, useState } from 'react'
import { useAnalysis } from './hooks/useAnalysis'
import { DeckUploader } from './components/DeckUploader'
import { LoadingScreen } from './components/LoadingScreen'
import { AnalysisResult } from './components/AnalysisResult'

const STAGES = [
  'Reading deck...',
  'Evaluating market fit...',
  'Scoring criteria...',
  'Generating insights...',
]
const STAGE_DELAYS = [0, 5000, 11000, 18000]

export default function App() {
  const { state, analyze, reset } = useAnalysis()
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    if (state.status !== 'analyzing') return
    setActiveStage(0)
    const timers = STAGE_DELAYS.slice(1).map((delay, i) =>
      setTimeout(() => setActiveStage(i + 1), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [state.status])

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center px-5 py-12">
        <div className="w-full max-w-[680px]">

          {state.status === 'idle' && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <p className="text-xs font-semibold text-[#4A5568] tracking-[0.12em] uppercase mb-5">
                  HiCenter · Deck Analyzer
                </p>
                <h1 className="text-[34px] font-bold text-[#1B3A6B] leading-tight mb-3">
                  Evaluate Any Pitch Deck
                </h1>
                <p className="text-[#4A5568] text-base max-w-md mx-auto">
                  Upload a PDF and get structured VC-grade feedback in seconds.
                </p>
              </div>
              <DeckUploader onFile={file => void analyze(file)} />
            </div>
          )}

          {state.status === 'analyzing' && (
            <LoadingScreen stages={STAGES} activeStage={activeStage} />
          )}

          {state.status === 'done' && (
            <AnalysisResult markdown={state.markdown} onReset={reset} />
          )}

          {state.status === 'error' && (
            <div className="animate-fade-in text-center space-y-5 pt-20">
              <div className="rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-semibold hover:bg-[#152e56] transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
