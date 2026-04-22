import { useState, useCallback, useRef } from 'react'
import { sendAgentChatMessage } from '../lib/api.js'
import type { ChatApiMessage } from '../types/index.js'

export interface AgentChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface AgentChatState {
  messages: AgentChatMessage[]
  apiMessages: ChatApiMessage[]
  isStreaming: boolean
  error?: string
}

const initial: AgentChatState = {
  messages: [],
  apiMessages: [],
  isStreaming: false,
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useAgentChat() {
  const [state, setState] = useState<AgentChatState>(initial)
  const abortRef = useRef<AbortController | null>(null)
  const apiMessagesRef = useRef<ChatApiMessage[]>([])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    apiMessagesRef.current = []
    setState(initial)
  }, [])

  const sendMessage = useCallback(async (storeId: string, text: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMsg: AgentChatMessage = { id: makeId(), role: 'user', content: text }
    const userApiMsg: ChatApiMessage = { role: 'user', content: text }
    const assistantId = makeId()

    const nextApiMessages = [...apiMessagesRef.current, userApiMsg]
    apiMessagesRef.current = nextApiMessages

    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: undefined,
      messages: [
        ...prev.messages,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ],
      apiMessages: nextApiMessages,
    }))

    sendAgentChatMessage(
      storeId,
      nextApiMessages,
      (event, data) => {
        const d = data as Record<string, unknown>
        if (event === 'chat_chunk') {
          setState(s => ({
            ...s,
            messages: s.messages.map(m =>
              m.id === assistantId ? { ...m, content: m.content + (d.text as string) } : m
            ),
          }))
        } else if (event === 'conversation_update') {
          const updated = d.messages as ChatApiMessage[]
          apiMessagesRef.current = updated
          setState(s => ({ ...s, apiMessages: updated }))
        } else if (event === 'chat_done') {
          setState(s => ({
            ...s,
            isStreaming: false,
            messages: s.messages.map(m =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            ),
          }))
        } else if (event === 'error') {
          setState(s => ({
            ...s,
            isStreaming: false,
            error: d.message as string,
            messages: s.messages.filter(m => m.id !== assistantId),
          }))
        }
      },
      controller.signal
    ).catch((err: unknown) => {
      if ((err as Error).name === 'AbortError') return
      setState(s => ({
        ...s,
        isStreaming: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        messages: s.messages.filter(m => m.id !== assistantId),
      }))
    })
  }, [])

  return { state, sendMessage, reset }
}
