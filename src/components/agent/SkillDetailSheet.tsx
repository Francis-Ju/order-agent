import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence as _AP } from 'motion/react'
const AnimatePresence = _AP as unknown as React.ElementType
import { X, TrendingUp, ChevronRight, Send, MessageSquare } from 'lucide-react'
import type {
  SkillName,
  ReplenishmentResult,
  LbsHotsellResult,
  PromoMatchResult,
  CrossSellResult,
  AgentState,
} from '../../types/index.js'
import type { SkuSignalCount } from '../../lib/crossSkillAnalysis.js'
import { useSkillChat } from '../../hooks/useSkillChat.js'

interface SkillDetailSheetProps {
  skill: SkillName | null
  storeId: string
  agentState: AgentState
  crossSignals: Map<string, SkuSignalCount>
  onClose: () => void
}

const SKILL_LABELS: Record<SkillName, string> = {
  replenishment: '补货预测',
  lbs_hotsell: '周边热卖',
  promo_match: '促销匹配',
  cross_sell: '关联推荐',
}

function MultiSignalBadge({ label }: { label: '三重推荐' | '双重推荐' }) {
  return (
    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
      label === '三重推荐'
        ? 'text-[#1bff1b] border-[#1bff1b]/30 bg-[#1bff1b]/10'
        : 'text-zinc-300 border-zinc-600 bg-zinc-800'
    }`}>
      {label} ★
    </span>
  )
}

function ReplenishmentDetail({
  result,
  crossSignals,
}: {
  result: ReplenishmentResult
  crossSignals: Map<string, SkuSignalCount>
}) {
  const urgencyConfig = {
    urgent: { bar: 'bg-red-500', text: 'text-red-400', label: '紧急' },
    suggested: { bar: 'bg-amber-400', text: 'text-amber-400', label: '建议' },
    optional: { bar: 'bg-zinc-600', text: 'text-zinc-500', label: '可选' },
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-600 uppercase tracking-[0.1em] pb-1 border-b border-zinc-800">
        <span className="flex-1">商品</span>
        <span className="w-20 text-right">距上次订货</span>
        <span className="w-10 text-right">建议量</span>
      </div>
      {result.items.map(item => {
        const cfg = urgencyConfig[item.urgency]
        const signal = crossSignals.get(item.sku_id)
        return (
          <div key={item.sku_id} className="flex items-center gap-3">
            <div className={`w-0.5 h-8 rounded-full flex-shrink-0 ${cfg.bar}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-200 truncate">{item.sku_name}</span>
                {signal?.label && <MultiSignalBadge label={signal.label} />}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`font-mono text-[9px] px-1 py-0 rounded ${cfg.text}`}>{cfg.label}</span>
                <span className="font-mono text-[9px] text-zinc-600">
                  均期 {item.avg_cycle_days}天 · 已过 {item.days_since_last}天
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-zinc-300 w-10 text-right flex-shrink-0">
              +{item.suggested_qty}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function LbsDetail({
  result,
  crossSignals,
}: {
  result: LbsHotsellResult
  crossSignals: Map<string, SkuSignalCount>
}) {
  if (result.items.length === 0) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="text-2xl">🏆</div>
        <div className="text-sm font-medium text-zinc-300">品类覆盖完整</div>
        <div className="text-xs text-zinc-600">周边门店在售商品本店均已引进</div>
        <div className="font-mono text-[10px] text-zinc-700 mt-2">
          分析了 {result.nearby_stores_analyzed} 家周边门店
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="font-mono text-[9px] text-zinc-600 pb-1 border-b border-zinc-800">
        分析 {result.nearby_stores_analyzed} 家周边门店，发现 {result.items.length} 个可引进商品
      </div>
      {result.items.map(item => {
        const pct = Math.round(item.penetration_rate * 100)
        const signal = crossSignals.get(item.sku_id)
        return (
          <div key={item.sku_id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-[11px] text-zinc-200 truncate">{item.sku_name}</span>
                {signal?.label && <MultiSignalBadge label={signal.label} />}
              </div>
              <span className="font-mono text-[11px] text-zinc-400 ml-2 flex-shrink-0">
                {item.nearby_store_count}/{result.nearby_stores_analyzed} 家
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/70 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-blue-400 w-8 text-right flex-shrink-0">
                {pct}%
              </span>
            </div>
            <div className="font-mono text-[9px] text-zinc-600">
              {item.brand} · 月均 {item.avg_monthly_qty} 箱
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PromoDetail({ result }: { result: PromoMatchResult }) {
  return (
    <div className="space-y-3">
      {result.items.map(item => {
        const pct = Math.min(100, Math.round((item.current_qty / item.threshold_qty) * 100))
        const isExpiring = item.is_expiring_soon

        return (
          <div key={item.promo_id} className={`rounded-xl p-3 border ${
            isExpiring
              ? 'bg-[#1bff1b]/5 border-[#1bff1b]/20'
              : 'bg-zinc-800/60 border-zinc-800'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-200 truncate">{item.promo_name}</span>
                  {isExpiring && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1bff1b]/10 border border-[#1bff1b]/20 text-[#1bff1b]/80 flex-shrink-0">
                      {item.expiry_days}天后到期
                    </span>
                  )}
                </div>
                <div className="font-mono text-[9px] text-zinc-600 mt-0.5">{item.description}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isExpiring ? 'bg-[#1bff1b]/60' : 'bg-zinc-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-zinc-400 flex-shrink-0 w-16 text-right">
                  {item.current_qty}/{item.threshold_qty} 箱
                </span>
              </div>
              {item.gap_qty > 0 && (
                <div className={`font-mono text-[10px] ${isExpiring ? 'text-[#1bff1b]/80' : 'text-zinc-500'}`}>
                  再加购 {item.gap_qty} 箱即可{item.can_qualify ? '享受' : '满足'}优惠
                </div>
              )}
              {item.gap_qty === 0 && (
                <div className="font-mono text-[10px] text-[#1bff1b]/70">✓ 已满足条件</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CrossSellDetail({
  result,
  crossSignals,
}: {
  result: CrossSellResult
  crossSignals: Map<string, SkuSignalCount>
}) {
  return (
    <div className="space-y-3">
      {result.items.map(item => {
        const signal = crossSignals.get(item.sku_id)
        return (
          <div key={item.sku_id} className="bg-zinc-800/60 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={10} className="text-zinc-500 flex-shrink-0" />
              <span className="font-mono text-[9px] text-zinc-600 truncate">
                因购买 {item.trigger_skus.join('、')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-zinc-600 flex-shrink-0" />
              <span className="text-[11px] font-medium text-zinc-200 flex-1 truncate">{item.sku_name}</span>
              {signal?.label && <MultiSignalBadge label={signal.label} />}
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="font-mono text-[9px] text-zinc-600">
                置信度 <span className="text-zinc-300">{item.confidence}%</span>
              </div>
              <div className="font-mono text-[9px] text-zinc-600">
                提升度 <span className="text-zinc-300">{item.lift.toFixed(1)}x</span>
              </div>
              <div className="font-mono text-[9px] text-zinc-600 flex-1 truncate">{item.reason}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChatSection({
  storeId,
  skill,
}: {
  storeId: string
  skill: SkillName
}) {
  const { state, sendMessage, reset } = useSkillChat()
  const [inputText, setInputText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reset()
    setInputText('')
    setExpanded(false)
  }, [skill, reset])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || state.isStreaming) return
    if (!expanded) setExpanded(true)
    setInputText('')
    sendMessage(storeId, skill, text, state.apiMessages)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-800 mt-4">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <MessageSquare size={11} className="text-zinc-600" />
        <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.1em]">追问</span>
      </div>

      {/* Chat messages */}
      {expanded && state.messages.length > 0 && (
        <div
          ref={scrollRef}
          className="px-4 pb-2 space-y-2 max-h-48 overflow-y-auto scrollbar-hide"
        >
          {state.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
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
          {state.error && (
            <div className="text-[10px] text-red-400 text-center">{state.error}</div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-safe">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={state.isStreaming}
          placeholder="有疑问？直接问..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-500 disabled:opacity-40 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={state.isStreaming || !inputText.trim()}
          className="w-7 h-7 rounded-full bg-[#1bff1b] flex items-center justify-center disabled:opacity-30 disabled:bg-zinc-700 transition-all active:scale-95"
        >
          <Send size={12} className="text-black" />
        </button>
      </div>
    </div>
  )
}

export function SkillDetailSheet({ skill, storeId, agentState, crossSignals, onClose }: SkillDetailSheetProps) {
  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 80) {
      onClose()
    }
  }

  const getResult = () => {
    if (!skill) return null
    if (skill === 'replenishment') return agentState.replenishment
    if (skill === 'lbs_hotsell') return agentState.lbs_hotsell
    if (skill === 'promo_match') return agentState.promo_match
    if (skill === 'cross_sell') return agentState.cross_sell
    return null
  }

  const result = getResult()

  return (
    <AnimatePresence>
      {skill && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col"
            style={{ maxHeight: '82%' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 flex-shrink-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                {skill ? SKILL_LABELS[skill] : ''} 详情
              </span>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
              >
                <X size={11} className="text-zinc-400" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-4">
                {result && skill === 'replenishment' && (
                  <ReplenishmentDetail result={result as ReplenishmentResult} crossSignals={crossSignals} />
                )}
                {result && skill === 'lbs_hotsell' && (
                  <LbsDetail result={result as LbsHotsellResult} crossSignals={crossSignals} />
                )}
                {result && skill === 'promo_match' && (
                  <PromoDetail result={result as PromoMatchResult} />
                )}
                {result && skill === 'cross_sell' && (
                  <CrossSellDetail result={result as CrossSellResult} crossSignals={crossSignals} />
                )}
              </div>

              {/* Chat section */}
              {skill && <ChatSection storeId={storeId} skill={skill} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
