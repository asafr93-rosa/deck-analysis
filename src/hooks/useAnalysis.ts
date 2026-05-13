import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '../lib/systemPrompt'

type AnalysisStatus = 'idle' | 'analyzing' | 'done' | 'error'

interface AnalysisState {
  status: AnalysisStatus
  markdown: string
  error: string | null
}

const INITIAL_STATE: AnalysisState = {
  status: 'idle',
  markdown: '',
  error: null,
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE)

  const analyze = useCallback(async (file: File) => {
    setState({ status: 'analyzing', markdown: '', error: null })

    try {
      const base64 = await fileToBase64(file)

      const client = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Please analyze this pitch deck.',
              },
            ],
          },
        ],
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta
          if (delta.type === 'text_delta') {
            setState(prev => ({ ...prev, markdown: prev.markdown + delta.text }))
          }
        }
      }

      setState(prev => ({ ...prev, status: 'done' }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setState({ status: 'error', markdown: '', error: message })
    }
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return { state, analyze, reset }
}
