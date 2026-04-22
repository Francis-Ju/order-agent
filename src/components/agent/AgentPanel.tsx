import React, { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowLeft, Zap, Send, MessageSquare } from 'lucide-react'
import type { Store, AgentState, SkillName } from '../../types/index.js'
import { SkillCard } from './SkillCard.js'
import { SummaryCard } from './SummaryCard.js'
import { OrderDraft } from './OrderDraft.js'
import { AgentTimeline } from './AgentTimeline.js'
import { SkillDetailSheet } from './SkillDetailSheet.js'
import { analyzeCrossSkillSignals } from '../../lib/crossSkillAnalysis.js'
import { useAgentChat } from '../../hooks/useAgentChat.js'

interface AgentPanelProps {
  store: Store
  agentState: AgentState
  onBack: () => void
  isMobile?: boolean
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

export function AgentPanel({ store, agentState, onBack, isMobile }: AgentPanelProps) {
  const [showOrder, setShowOrder] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null)
  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const { state: chatState, sendMessage: sendChat, reset: resetChat } = useAgentChat()

  const crossSignals = useMemo(() => analyzeCrossSkillSignals(agentState), [agentState])

  useEffect(() => {
    resetChat()
  }, [store.store_id, resetChat])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatState.messages])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || chatState.isStreaming || agentState.status !== 'done') return
    setInputText('')
    sendChat(store.store_id, text)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const tripleCount = useMemo(() => {
    let count = 0
    for (const s of crossSignals.values()) {
      if (s.label === '三重推荐') count++
    }
    return count
  }, [crossSignals])

  const doubleCount = useMemo(() => {
    let count = 0
    for (const s of crossSignals.values()) {
      if (s.label === '双重推荐') count++
    }
    return count
  }, [crossSignals])

  const crossHighlight = useMemo(() => {
    if (tripleCount > 0) {
      const names = Array.from(crossSignals.values())
        .filter(s => s.label === '三重推荐')
        .map(s => s.sku_name)
        .slice(0, 2)
        .join('、')
      return `${names} 被 3 个技能同时推荐`
    }
    if (doubleCount > 0) {
      return `${doubleCount} 个商品被多个技能同时推荐`
    }
    return undefined
  }, [tripleCount, doubleCount, crossSignals])

  const statusConfig = {
    idle: { label: '待触发', cls: 'text-zinc-500 border-zinc-800 bg-zinc-900' },
    running: { label: '分析中', cls: 'text-[#1bff1b] border-[#1bff1b]/30 bg-[#1bff1b]/5' },
    done: { label: '已完成', cls: 'text-zinc-300 border-zinc-700 bg-zinc-800' },
    error: { label: '出错了', cls: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
  }[agentState.status]

  const daysSinceVisit = Math.floor(
    (Date.now() - new Date(store.last_visit_date).getTime()) / 86400000
  )

  return (
    <div className="flex flex-col h-full bg-[#09090b] relative overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-950/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-20">
        <div className={`flex items-center gap-3 px-4 pb-2 ${isMobile ? 'pt-safe' : 'pt-3'}`}>
          <button
            onClick={onBack}
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
              <span className="font-mono text-[10px] text-zinc-600">月营收 ¥{formatRevenue(store.monthly_revenue)}</span>
              <span className="text-zinc-800">·</span>
              <span className={`font-mono text-[10px] ${daysSinceVisit > 7 ? 'text-amber-500/80' : 'text-zinc-600'}`}>
                {daysSinceVisit}天未拜访
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${statusConfig.cls}`}>
            <Zap size={10} fill={agentState.status === 'running' ? 'currentColor' : 'none'} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Timeline */}
        <AgentTimeline agentState={agentState} />

        {/* Running banner */}
        {agentState.status === 'running' && (
          <div className="px-4 py-2 flex items-center gap-2 border-t border-[#1bff1b]/10 bg-[#1bff1b]/5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b] animate-pulse" />
            <span className="font-mono text-[11px] text-[#1bff1b]/80">主动型智能体已触发，正在并行分析...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={chatScrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-hide pb-20">
        <div className="grid grid-cols-2 gap-2.5">
          <SkillCard
            skillKey="replenishment"
            label="补货预测"
            status={agentState.skillStatus.replenishment}
            result={agentState.replenishment}
            onShowDetail={setSelectedSkill}
          />
          <SkillCard
            skillKey="lbs_hotsell"
            label="周边热卖"
            status={agentState.skillStatus.lbs_hotsell}
            result={agentState.lbs_hotsell}
            onShowDetail={setSelectedSkill}
          />
          <SkillCard
            skillKey="promo_match"
            label="促销匹配"
            status={agentState.skillStatus.promo_match}
            result={agentState.promo_match}
            onShowDetail={setSelectedSkill}
          />
          <SkillCard
            skillKey="cross_sell"
            label="关联推荐"
            status={agentState.skillStatus.cross_sell}
            result={agentState.cross_sell}
            onShowDetail={setSelectedSkill}
          />
        </div>

        {(agentState.summary || agentState.isSummaryStreaming) && (
          <SummaryCard
            summary={agentState.summary}
            isStreaming={agentState.isSummaryStreaming}
            suggestedOrderCount={agentState.suggestedOrder.length}
            crossHighlight={crossHighlight}
            onShowOrder={() => setShowOrder(true)}
          />
        )}

        {showOrder && agentState.suggestedOrder.length > 0 && (
          <OrderDraft
            items={agentState.suggestedOrder}
            crossSignals={crossSignals}
            onClose={() => setShowOrder(false)}
          />
        )}

        {/* Global chat messages */}
        {chatState.messages.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={10} className="text-zinc-600" />
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-[0.1em]">追问</span>
            </div>
            {chatState.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-zinc-700 text-zinc-100 rounded-br-sm'
                    : 'bg-zinc-800/80 border border-zinc-700 text-zinc-200 rounded-bl-sm'
                }`}>
                  {msg.content || (msg.isStreaming && (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ))}
                  {msg.content && msg.isStreaming && (
                    <span className="inline-block w-0.5 h-3 bg-zinc-400 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              </div>
            ))}
            {chatState.error && (
              <div className="text-[10px] text-red-400 text-center">{chatState.error}</div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom chat input — only when analysis is done */}
      {agentState.status === 'done' && (
        <div className={`absolute bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 px-3 pt-2.5 ${isMobile ? 'pb-safe' : 'pb-2.5'}`}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={chatState.isStreaming}
              placeholder="对整体分析有疑问？直接问..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-500 disabled:opacity-40 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={chatState.isStreaming || !inputText.trim()}
              className="w-7 h-7 rounded-full bg-[#1bff1b] flex items-center justify-center disabled:opacity-30 disabled:bg-zinc-700 transition-all active:scale-95"
            >
              <Send size={12} className="text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Skill detail bottom sheet */}
      <SkillDetailSheet
        skill={selectedSkill}
        storeId={store.store_id}
        agentState={agentState}
        crossSignals={crossSignals}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  )
}
