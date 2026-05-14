interface Props {
  stages: string[]
  activeStage: number
}

export function LoadingScreen({ stages, activeStage }: Props) {
  return (
    <div className="animate-fade-in flex flex-col items-center py-20">
      {/* Animated icon with soft wash */}
      <div className="relative flex items-center justify-center mb-14">
        <div
          className="absolute rounded-full"
          style={{
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, #D6E0EE 0%, rgba(214,224,238,0) 70%)',
          }}
        />
        <div className="relative animate-bounce-float">
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B3A6B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="9" y1="11" x2="13" y2="11" />
            <line x1="11" y1="9" x2="11" y2="13" />
          </svg>
        </div>
      </div>

      {/* Stage list */}
      <div className="w-full max-w-[300px] space-y-3.5">
        {stages.map((stage, i) => {
          const isDone    = i < activeStage
          const isActive  = i === activeStage
          const isPending = i > activeStage

          return (
            <div
              key={stage}
              className="flex items-center gap-3.5 transition-opacity duration-500"
              style={{ opacity: isPending ? 0.25 : 1 }}
            >
              {/* Indicator */}
              <div
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-400',
                  isDone || isActive ? 'bg-[#1B3A6B]' : 'bg-[#B8C8E0]',
                ].join(' ')}
              >
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
                ) : null}
              </div>

              {/* Label */}
              <span
                className={[
                  'text-sm leading-snug transition-all duration-300',
                  isActive  ? 'text-[#1B3A6B] font-semibold' : '',
                  isDone    ? 'text-[#4A5568]' : '',
                  isPending ? 'text-[#4A5568]' : '',
                ].join(' ')}
                style={isActive ? { animation: 'fade-in-up 0.4s ease both' } : undefined}
              >
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
