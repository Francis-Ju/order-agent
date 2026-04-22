import { motion } from 'motion/react'
import { ShoppingCart } from 'lucide-react'

interface SummaryCardProps {
  summary: string
  isStreaming: boolean
  suggestedOrderCount: number
  crossHighlight?: string
  onShowOrder: () => void
}

export function SummaryCard({
  summary,
  isStreaming,
  suggestedOrderCount,
  crossHighlight,
  onShowOrder,
}: SummaryCardProps) {
  return (
    <motion.div
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#1bff1b]/15 border border-[#1bff1b]/30 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b]" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400">AI 拜访摘要</span>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1 h-1 bg-[#1bff1b]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-[#1bff1b]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-[#1bff1b]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      <p className={`text-zinc-300 text-xs leading-relaxed ${isStreaming ? 'streaming-cursor' : ''}`}>
        {summary}
      </p>

      {!isStreaming && crossHighlight && (
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1bff1b]/5 border border-[#1bff1b]/15">
          <span className="text-[#1bff1b] text-[10px]">★</span>
          <span className="font-mono text-[10px] text-[#1bff1b]/80">{crossHighlight}</span>
        </div>
      )}

      {!isStreaming && suggestedOrderCount > 0 && (
        <button
          onClick={onShowOrder}
          className="mt-4 w-full bg-[#1bff1b] hover:bg-[#1bff1b]/90 active:bg-[#1bff1b]/80 text-black text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart size={13} />
          <span>查看建议订单（{suggestedOrderCount} 个商品）</span>
        </button>
      )}
    </motion.div>
  )
}
