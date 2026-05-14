import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string
  onReset: () => void
}

interface ParsedResult {
  overview: string
  whatWorks: string[]
  needsWork: string[]
  missing: string[]
  score: number
  verdict: 'pass' | 'watch' | 'invest'
}

function extractBullets(section: string): string[] {
  return section
    .split('\n')
    .filter(l => /^[\s]*[-*+]\s/.test(l) || /^[\s]*\d+\.\s/.test(l))
    .map(l => l.replace(/^[\s]*(?:[-*+]|\d+\.)\s+/, '').trim())
    .map(l => l.replace(/\*\*(.*?)\*\*/g, '$1'))
    .filter(Boolean)
}

function parseResult(md: string): ParsedResult {
  const parts = md.split(/(?=^## )/m)

  function find(keywords: string[]): string {
    for (const kw of keywords) {
      const hit = parts.find(p => p.toLowerCase().includes(kw.toLowerCase()))
      if (hit) return hit
    }
    return ''
  }

  const overviewSec = find(['overview', 'company overview'])
  const worksSec    = find(['what works', 'works well', '✅'])
  const needsSec    = find(['improvement', 'needs work', '⚠️'])
  const missingSec  = find(['missing', '❓'])
  const verdictSec  = find(['verdict', '🏁', 'final verdict'])

  // Score — handles integers and decimals: **74 / 100** or **72.4 / 100** or **72.4/100**
  const scoreMatch = md.match(/\*\*(\d{1,3}(?:[.,]\d+)?)\s*\/\s*100\*\*/)
  const score = scoreMatch
    ? Math.min(100, Math.max(0, Math.round(parseFloat(scoreMatch[1].replace(',', '.')))))
    : 0

  // Verdict type
  let verdict: ParsedResult['verdict'] = 'watch'
  const verdictText = verdictSec.toLowerCase()
  if (verdictSec.includes('🔴') || (verdictText.includes('pass') && !verdictText.includes('bypass'))) verdict = 'pass'
  else if (verdictSec.includes('🟢') || verdictText.includes('invest') || verdictText.includes('progress')) verdict = 'invest'

  return {
    overview:  overviewSec.replace(/^## [^\n]+\n/, '').trim(),
    whatWorks: extractBullets(worksSec),
    needsWork: extractBullets(needsSec),
    missing:   extractBullets(missingSec),
    score,
    verdict,
  }
}

function scoreColor(n: number): string {
  if (n < 50) return '#E53E3E'
  if (n < 70) return '#F6AD55'
  return '#1B3A6B'
}

const VERDICT_CONFIG = {
  pass:   { emoji: '🔴', label: 'Pass',   bg: '#FFF5F5', text: '#C53030', border: '#FEB2B2' },
  watch:  { emoji: '🟡', label: 'Watch',  bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  invest: { emoji: '🟢', label: 'Invest', bg: '#F0FFF4', text: '#276749', border: '#9AE6B4' },
}

/* ── Structured result view ───────────────────────────────────── */

export function AnalysisResult({ markdown, onReset }: Props) {
  const parsed = parseResult(markdown)
  const hasBlocks = parsed.whatWorks.length > 0 || parsed.needsWork.length > 0 || parsed.missing.length > 0

  return (
    <div className="animate-fade-in pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[#1B3A6B]">Analysis Complete</h2>
        <button
          onClick={onReset}
          className="text-sm px-4 py-2 rounded-xl border border-[#B8C8E0] text-[#4A5568] hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors cursor-pointer"
        >
          Analyze Another
        </button>
      </div>

      {/* Company overview pill */}
      {parsed.overview && (
        <div className="rounded-2xl bg-[#D6E0EE] px-5 py-4 mb-5">
          <p className="text-sm text-[#1B3A6B] leading-relaxed">{parsed.overview}</p>
        </div>
      )}

      {hasBlocks ? (
        <div className="space-y-4">
          {parsed.whatWorks.length > 0 && (
            <Block
              emoji="✅"
              title="What Works"
              items={parsed.whatWorks}
              accentColor="#38A169"
            />
          )}
          {parsed.needsWork.length > 0 && (
            <Block
              emoji="⚠️"
              title="Needs Work"
              items={parsed.needsWork}
              accentColor="#F6AD55"
            />
          )}
          {parsed.missing.length > 0 && (
            <Block
              emoji="❓"
              title="What's Missing"
              items={parsed.missing}
              accentColor="#94A3B8"
            />
          )}

          {/* Final score */}
          <ScoreBlock score={parsed.score} verdict={parsed.verdict} />
        </div>
      ) : (
        /* Fallback: raw markdown when parsing found nothing */
        <>
          <div className="rounded-2xl bg-[#D6E0EE] px-6 py-5 mb-4 prose-analysis">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
          {parsed.score > 0 && <ScoreBlock score={parsed.score} verdict={parsed.verdict} />}
        </>
      )}
    </div>
  )
}

/* ── Block ────────────────────────────────────────────────────── */

interface BlockProps {
  emoji: string
  title: string
  items: string[]
  accentColor: string
}

function Block({ emoji, title, items, accentColor }: BlockProps) {
  return (
    <div
      className="rounded-2xl bg-[#D6E0EE] px-5 py-4 shadow-sm"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <h3 className="text-sm font-semibold text-[#1B3A6B] mb-3">
        {emoji}&nbsp; {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[#4A5568] leading-relaxed">
            <span
              className="shrink-0 rounded-full mt-[6px]"
              style={{ width: 6, height: 6, backgroundColor: accentColor }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Score block ──────────────────────────────────────────────── */

interface ScoreBlockProps {
  score: number
  verdict: ParsedResult['verdict']
}

function ScoreBlock({ score, verdict }: ScoreBlockProps) {
  const vc    = VERDICT_CONFIG[verdict]
  const color = scoreColor(score)

  return (
    <div className="rounded-2xl bg-[#D6E0EE] px-5 py-10 text-center shadow-sm">
      <p className="text-[10px] font-semibold text-[#4A5568] uppercase tracking-[0.14em] mb-3">
        Investment Score
      </p>
      <div
        className="font-bold leading-none mb-2"
        style={{ fontSize: 88, color, lineHeight: 1 }}
      >
        {score}
      </div>
      <p className="text-[#4A5568] text-xs mb-6">out of 100</p>
      <div
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border"
        style={{ background: vc.bg, color: vc.text, borderColor: vc.border }}
      >
        {vc.emoji}&nbsp;{vc.label}
      </div>
    </div>
  )
}

/* ── Prose styles for fallback markdown ───────────────────────── */
