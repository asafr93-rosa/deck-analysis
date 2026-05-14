import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

const MAX_SIZE = 32 * 1024 * 1024

export function DeckUploader({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      flashError('Only PDF files are supported.')
      return
    }
    if (file.size > MAX_SIZE) {
      flashError('File is too large. Maximum size is 32 MB.')
      return
    }
    setFileError(null)
    onFile(file)
  }

  function flashError(msg: string) {
    setFileError(msg)
    setTimeout(() => setFileError(null), 3500)
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  function onDragLeave() { setDragging(false) }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (!disabled) handleFiles(e.dataTransfer.files)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  const hasError = fileError !== null

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-5',
          'rounded-2xl border-2 border-dashed px-8 py-14 cursor-pointer',
          'transition-all duration-200',
          disabled
            ? 'opacity-50 cursor-not-allowed border-[#B8C8E0]'
            : hasError
            ? 'border-red-300 bg-red-50'
            : dragging
            ? 'border-[#1B3A6B] bg-[#D6E0EE]/40'
            : 'border-[#B8C8E0] bg-white hover:border-[#1B3A6B] hover:bg-[#D6E0EE]/20',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />

        {/* Icon */}
        <div
          className={[
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200',
            hasError ? 'bg-red-100' : 'bg-[#D6E0EE]',
          ].join(' ')}
        >
          {hasError ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          {hasError ? (
            <p className="text-sm font-semibold text-red-600">{fileError}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#1B3A6B]">
                {dragging ? 'Release to upload' : 'Drag & drop your pitch deck here'}
              </p>
              <p className="text-xs text-[#4A5568]">PDF only · max 32 MB</p>
            </>
          )}
        </div>

        {/* CTA button */}
        {!hasError && (
          <button
            onClick={e => { e.stopPropagation(); !disabled && inputRef.current?.click() }}
            disabled={disabled}
            className="mt-1 px-8 py-3 bg-[#1B3A6B] text-white text-sm font-semibold rounded-xl hover:bg-[#152e56] active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            Analyze Deck
          </button>
        )}
      </div>
    </div>
  )
}
