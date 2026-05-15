const WEBHOOK_URL = 'https://hook.eu2.make.com/lm4fgtv03sdhjmggal8mjq9a54h5o712'

export async function uploadFileForLink(file: File): Promise<string | null> {
  try {
    const serverRes = await fetch('https://api.gofile.io/getServer')
    if (!serverRes.ok) return null
    const serverData = await serverRes.json() as { status: string; data: { server: string } }
    if (serverData.status !== 'ok') return null

    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch(`https://${serverData.data.server}.gofile.io/uploadFile`, {
      method: 'POST',
      body: formData,
    })
    if (!uploadRes.ok) return null
    const uploadData = await uploadRes.json() as { status: string; data: { downloadPage: string } }
    if (uploadData.status !== 'ok') return null

    return uploadData.data.downloadPage
  } catch {
    return null
  }
}

function extractSection(md: string, keywords: string[]): string {
  const parts = md.split(/(?=^## )/m)
  for (const kw of keywords) {
    const hit = parts.find(p => p.toLowerCase().includes(kw.toLowerCase()))
    if (hit) return hit.replace(/^## [^\n]+\n/, '').trim()
  }
  return ''
}

function extractBullets(section: string): string[] {
  return section
    .split('\n')
    .filter(l => /^[\s]*[-*+]\s/.test(l) || /^[\s]*\d+\.\s/.test(l))
    .map(l => l.replace(/^[\s]*(?:[-*+]|\d+\.)\s+/, '').trim())
    .map(l => l.replace(/\*\*(.*?)\*\*/g, '$1'))
    .filter(Boolean)
}

function parseScorecard(md: string): Record<string, number> {
  const criterionMap: Record<string, string> = {
    'the problem':         'the_problem',
    'market size':         'market_size',
    'your solution':       'your_solution_and_technical_fit',
    'your advantage':      'your_advantage',
    'competitive':         'competitive_landscape',
    'strategy':            'strategy',
    'traction':            'traction',
    'your team':           'your_team',
    'funding':             'funding',
    'pitch quality':       'pitch_quality_and_clarity',
  }

  const scorecard: Record<string, number> = {}
  const rows = md.split('\n').filter(l => l.startsWith('|') && !l.includes('---'))

  for (const row of rows) {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 3) continue
    const criterionRaw = cells[0].toLowerCase().replace(/[^a-z\s]/g, '').trim()
    const scoreStr = cells[2].replace(/\s/g, '')
    const matchKey = Object.keys(criterionMap).find(k => criterionRaw.includes(k))
    if (matchKey && /^\d+$/.test(scoreStr)) {
      scorecard[criterionMap[matchKey]] = parseInt(scoreStr)
    }
  }

  return scorecard
}

function parseScore(md: string): number {
  const match = md.match(/\*\*(\d{1,3}(?:[.,]\d+)?)\s*\/\s*100\*\*/)
  if (!match) return 0
  return Math.min(100, Math.max(0, Math.round(parseFloat(match[1].replace(',', '.')))))
}

function parseVerdict(md: string): '🔴 Pass' | '🟡 Watch' | '🟢 Invest' {
  if (md.includes('🔴')) return '🔴 Pass'
  if (md.includes('🟢')) return '🟢 Invest'
  return '🟡 Watch'
}

export async function fireWebhook(params: {
  fileName: string
  fileUrl: string | null
  markdown: string
}) {
  try {
    const { fileName, fileUrl, markdown } = params
    const score = parseScore(markdown)
    const verdictSection = extractSection(markdown, ['final verdict', 'verdict', '🏁'])

    const payload = {
      file_name: fileName,
      file_url: fileUrl ?? 'unavailable',
      analyzed_at: new Date().toISOString(),
      company_overview: extractSection(markdown, ['company overview', 'overview']),
      strengths: extractBullets(extractSection(markdown, ['what works', 'works well', '✅'])),
      areas_for_improvement: extractBullets(extractSection(markdown, ['needs improvement', 'needs work', '⚠️'])),
      missing_sections: extractBullets(extractSection(markdown, ['missing', '❓'])),
      total_score: score,
      verdict: parseVerdict(verdictSection),
      final_verdict_text: verdictSection,
      scorecard: parseScorecard(markdown),
      full_analysis: markdown,
    }

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Webhook failure is non-critical — don't surface to user
  }
}
