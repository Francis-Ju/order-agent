import { useState, useCallback, useRef } from 'react'
import { sendSkillChatMessage } from '../lib/api.js'
import type { ChatApiMessage } from '../types/index.js'

export interface SkillChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface SkillChatState {
  messages: SkillChatMessage[]
  apiMessages: ChatApiMessage[]
  isStreaming: boolean
  error?: string
}

const initial: SkillChatState = {
  messages: [],
  apiMessages: [],
  isStreaming: false,
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useSkillChat() {
  const [state, setState] = useState<SkillChatState>(initial)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(initial)
  }, [])

  const sendMessage = useCallback(
    async (storeId: string, skill: string, text: string, currentApiMessages: ChatApiMessage[]) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const userMsg: SkillChatMessage = { id: makeId(), role: 'user', content: text }
      const userApiMsg: ChatApiMessage = { role: 'user', content: text }
      const newApiMessages = [...currentApiMessages, userApiMsg]

      const assistantId = makeId()

      setState(prev => ({
        ...prev,
        isStreaming: true,
        error: undefined,
        messages: [
          ...prev.messages,
          userMsg,
          { id: assistantId, role: 'assistant', content: '', isStreaming: true },
        ],
      }))

      try {
        await sendSkillChatMessage(
          storeId,
          skill,
          newApiMessages,
          (event, data) => {
            const d = data as Record<string, unknown>
            if (event === 'chat_chunk') {
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + (d.text as string) } : m
                ),
              }))
            } else if (event === 'conversation_update') {
              const updated = d.messages as ChatApiMessage[]
              setState(prev => ({ ...prev, apiMessages: updated }))
            } else if (event === 'chat_done') {
              setState(prev => ({
                ...prev,
                isStreaming: false,
                messages: prev.messages.map(m =>
                  m.id === assistantId ? { ...m, isStreaming: false } : m
                ),
              }))
            } else if (event === 'error') {
              setState(prev => ({
                ...prev,
                isStreaming: false,
                error: d.message as string,
                messages: prev.messages.filter(m => m.id !== assistantId),
              }))
            }
          },
          controller.signal
        )
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          messages: prev.messages.filter(m => m.id !== assistantId),
        }))
      }
    },
    []
  )

  return { state, sendMessage, reset }
}
