import type { ChatMessage, SkillName, ReplenishmentResult, LbsHotsellResult, PromoMatchResult, CrossSellResult } from '../../types/index.js'

const SKILL_LABELS: Record<SkillName, string> = {
  replenishment: '补货预测',
  lbs_hotsell: '周边热卖',
  promo_match: '促销匹配',
  cross_sell: '关联推荐',
}

const SKILL_ICONS: Record<SkillName, string> = {
  replenishment: '📦',
  lbs_hotsell: '🔥',
  promo_match: '🎁',
  cross_sell: '🔗',
}

function ToolSummary({ skill, result }: { skill: SkillName; result: unknown }) {
  if (skill === 'replenishment') {
    const r = result as ReplenishmentResult
    return (
      <span className="font-mono text-[10px] text-zinc-400">
        紧急 {r.urgent_count} · 建议 {r.suggested_count} · 共 {r.items.length} 项
      </span>
    )
  }
  if (skill === 'lbs_hotsell') {
    const r = result as LbsHotsellResult
    return (
      <span className="font-mono text-[10px] text-zinc-400">
        {r.items.length} 个热卖商品 · 分析了 {r.nearby_stores_analyzed} 家门店
      </span>
    )
  }
  if (skill === 'promo_match') {
    const r = result as PromoMatchResult
    return (
      <span className="font-mono text-[10px] text-zinc-400">
        {r.items.length} 个促销 · {r.expiring_soon_count} 个即将到期
      </span>
    )
  }
  if (skill === 'cross_sell') {
    const r = result as CrossSellResult
    return (
      <span className="font-mono text-[10px] text-zinc-400">
        {r.items.length} 个关联推荐
      </span>
    )
  }
  return null
}

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.role === 'tool') {
    const skill = message.content as SkillName
    const isRunning = message.toolCall?.status === 'running'
    return (
      <div className="flex items-center gap-2 py-1 px-3 mx-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <span className="text-base">{SKILL_ICONS[skill]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-300 text-xs font-medium">{SKILL_LABELS[skill]}</span>
            {isRunning && (
              <div className="w-2.5 h-2.5 border border-[#1bff1b]/60 border-t-transparent rounded-full animate-spin" />
            )}
            {!isRunning && (
              <span className="text-[#1bff1b] text-[10px]">✓</span>
            )}
          </div>
          {!isRunning && message.toolResult && (
            <ToolSummary skill={skill} result={message.toolResult} />
          )}
          {isRunning && (
            <span className="font-mono text-[10px] text-zinc-600 animate-pulse">分析中...</span>
          )}
        </div>
      </div>
    )
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[75%] bg-zinc-700 rounded-2xl rounded-br-sm px-3.5 py-2.5">
          <p className="text-zinc-100 text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  // assistant
  const isEmpty = !message.content && message.isStreaming
  return (
    <div className="flex justify-start px-4">
      <div className="max-w-[85%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
        {isEmpty ? (
          <div className="flex gap-1 items-center py-0.5">
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-0.5 h-3.5 bg-zinc-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </p>
        )}
      </div>
    </div>
  )
}
