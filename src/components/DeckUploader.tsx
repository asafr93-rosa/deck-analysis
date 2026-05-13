import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

const MAX_SIZE = 32 * 1024 * 1024 // 32 MB

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
    setTimeout(() => setFileError(null), 3000)
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

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
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        'relative flex flex-col items-center justify-center gap-4',
        'rounded-2xl border-2 border-dashed px-8 py-14 cursor-pointer',
        'transition-colors duration-150',
        disabled
          ? 'opacity-50 cursor-not-allowed border-white/10'
          : hasError
          ? 'border-red-400/50 bg-red-400/5'
          : dragging
          ? 'border-[#00D4AA]/50 bg-[#00D4AA]/5'
          : 'border-white/10 bg-white/[0.02] hover:border-[#00D4AA]/40 hover:bg-[#00D4AA]/5',
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
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#161B22] border border-white/8">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={hasError ? '#F87171' : '#00D4AA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>

      <div className="text-center space-y-1">
        {hasError ? (
          <p className="text-sm font-medium text-red-400">{fileError}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-[#E6EDF3]">
              {dragging ? 'Drop to analyze' : 'Drop your pitch deck here'}
            </p>
            <p className="text-xs text-[#7D8590]">or click to browse · PDF only · max 32 MB</p>
          </>
        )}
      </div>
    </div>
  )
}
