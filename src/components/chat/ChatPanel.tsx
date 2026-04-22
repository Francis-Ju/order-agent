import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Store } from '../../types/index.js'
import { useChat } from '../../hooks/useChat.js'
import { ChatBubble } from './ChatBubble.js'
import { ChatInput } from './ChatInput.js'

interface ChatPanelProps {
  store: Store
  onBack: () => void
  onStateChange?: (state: ReturnType<typeof useChat>['state']) => void
}

const GRADE_STYLES = {
  A: 'text-[#1bff1b] border-[#1bff1b]/30 bg-[#1bff1b]/10',
  B: 'text-zinc-300 border-zinc-600 bg-zinc-800',
  C: 'text-zinc-500 border-zinc-700 bg-zinc-900',
}

function formatRevenue(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(0)}万`
  return `${n.toLocaleString()}`
}

export function ChatPanel({ store, onBack, onStateChange }: ChatPanelProps) {
  const { state, initChat, sendMessage, reset } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    initChat(store.store_id)
  }, [store.store_id, initChat])

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [state.messages])

  const handleBack = () => {
    reset()
    onBack()
  }

  const daysSinceVisit = Math.floor(
    (new Date().getTime() - new Date(store.last_visit_date).getTime()) / 86400000
  )

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="bg-zinc-950/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={14} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-medium text-zinc-100 text-sm truncate">{store.name}</h2>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${GRADE_STYLES[store.store_grade]}`}>
                {store.store_grade}级
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] text-zinc-600">{store.type}</span>
              <span className="text-zinc-800">·</span>
              <span className="font-mono text-[10px] text-zinc-600">¥{formatRevenue(store.monthly_revenue)}/月</span>
              <span className="text-zinc-800">·</span>
              <span className={`font-mono text-[10px] ${daysSinceVisit > 7 ? 'text-amber-500/80' : 'text-zinc-600'}`}>
                {daysSinceVisit}天未拜访
              </span>
            </div>
          </div>
          {state.isStreaming && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#1bff1b]/30 bg-[#1bff1b]/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b] animate-pulse" />
              <span className="font-mono text-[10px] text-[#1bff1b]">分析中</span>
            </div>
          )}
        </div>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-hide"
      >
        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-[#1bff1b]/60 rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-zinc-600">正在连接AI助手...</span>
          </div>
        )}
        {state.messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {state.error && (
          <div className="mx-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{state.error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={text => sendMessage(store.store_id, text)}
          disabled={state.isStreaming}
        />
      </div>
    </div>
  )
}
