import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../lib/api.js'
import type {
  ChatMessage,
  ChatApiMessage,
  ChatState,
  SkillName,
  SkillStatus,
  ReplenishmentResult,
  LbsHotsellResult,
  PromoMatchResult,
  CrossSellResult,
} from '../types/index.js'

const SKILL_NAMES: SkillName[] = ['replenishment', 'lbs_hotsell', 'promo_match', 'cross_sell']

const initialState: ChatState = {
  messages: [],
  apiMessages: [],
  isStreaming: false,
  skillStatuses: Object.fromEntries(SKILL_NAMES.map(k => [k, 'idle' as SkillStatus])),
  skillResults: {},
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useChat() {
  const [state, setState] = useState<ChatState>(initialState)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(initialState)
  }, [])

  const _runStream = useCallback(
    async (storeId: string, apiMessages: ChatApiMessage[]) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      // Placeholder for the streaming assistant message
      const assistantMsgId = makeId()
      setState(prev => ({
        ...prev,
        isStreaming: true,
        error: undefined,
        messages: [
          ...prev.messages,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            timestamp: Date.now(),
          },
        ],
      }))

      try {
        await sendChatMessage(
          storeId,
          apiMessages,
          (event, data) => {
            const d = data as Record<string, unknown>

            if (event === 'chat_chunk') {
              const text = d.text as string
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + text }
                    : m
                ),
              }))
            } else if (event === 'tool_call_start') {
              const skill = d.skill as SkillName
              const toolMsgId = makeId()
              setState(prev => ({
                ...prev,
                skillStatuses: { ...prev.skillStatuses, [skill]: 'loading' },
                messages: [
                  ...prev.messages.filter(m => m.id !== assistantMsgId),
                  {
                    id: toolMsgId,
                    role: 'tool',
                    content: skill,
                    toolCall: { name: skill, status: 'running' },
                    timestamp: Date.now(),
                  },
                  // re-add the streaming assistant message at the end
                  ...prev.messages.filter(m => m.id === assistantMsgId),
                ],
              }))
            } else if (event === 'tool_call_result') {
              const skill = d.skill as SkillName
              const result = d.data as ReplenishmentResult | LbsHotsellResult | PromoMatchResult | CrossSellResult
              setState(prev => ({
                ...prev,
                skillStatuses: { ...prev.skillStatuses, [skill]: 'done' },
                skillResults: { ...prev.skillResults, [skill]: result },
                messages: prev.messages.map(m =>
                  m.role === 'tool' && m.toolCall?.name === skill && m.toolCall.status === 'running'
                    ? { ...m, toolCall: { name: skill, status: 'done' }, toolResult: result }
                    : m
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
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                ),
              }))
            } else if (event === 'error') {
              setState(prev => ({
                ...prev,
                isStreaming: false,
                error: d.message as string,
                messages: prev.messages.filter(m => m.id !== assistantMsgId),
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
          messages: prev.messages.filter(m => m.id !== assistantMsgId),
        }))
      }
    },
    []
  )

  const initChat = useCallback(
    (storeId: string) => {
      const userMsg: ChatApiMessage = {
        role: 'user',
        content: '我来拜访了，请分析一下这家门店的情况。',
      }
      _runStream(storeId, [userMsg])
    },
    [_runStream]
  )

  const sendMessage = useCallback(
    (storeId: string, text: string) => {
      const userChatMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      const userApiMsg: ChatApiMessage = { role: 'user', content: text }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userChatMsg],
      }))

      // Build api messages: existing + new user message
      const newApiMessages = [...state.apiMessages, userApiMsg]
      _runStream(storeId, newApiMessages)
    },
    [state.apiMessages, _runStream]
  )

  return { state, initChat, sendMessage, reset }
}
