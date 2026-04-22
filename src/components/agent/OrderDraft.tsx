import { useState } from 'react'
import { motion } from 'motion/react'
import { X, CheckCircle, Minus, Plus } from 'lucide-react'
import type { SuggestedOrderItem } from '../../types/index.js'
import type { SkuSignalCount } from '../../lib/crossSkillAnalysis.js'

interface OrderDraftProps {
  items: SuggestedOrderItem[]
  crossSignals?: Map<string, SkuSignalCount>
  onClose: () => void
}

const SOURCE_LABELS: Record<SuggestedOrderItem['source'], string> = {
  replenishment: '补货',
  lbs: 'LBS',
  promo: '促销',
  cross_sell: '推荐',
}

const SOURCE_STYLES: Record<SuggestedOrderItem['source'], string> = {
  replenishment: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  lbs: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  promo: 'text-[#1bff1b]/80 border-[#1bff1b]/20 bg-[#1bff1b]/5',
  cross_sell: 'text-zinc-400 border-zinc-700 bg-zinc-800',
}

const URGENCY_BAR: Record<string, string> = {
  urgent: 'bg-red-500',
  suggested: 'bg-amber-400',
  optional: 'bg-zinc-600',
}

function sourceSummary(items: SuggestedOrderItem[]) {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item.source] = (counts[item.source] ?? 0) + 1
  }
  return counts
}

export function OrderDraft({ items, crossSignals, onClose }: OrderDraftProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map(i => [i.sku_id, i.suggested_qty]))
  )
  const [submitted, setSubmitted] = useState(false)

  const total = items.reduce((sum, item) => {
    return sum + (quantities[item.sku_id] ?? 0) * item.unit_price
  }, 0)

  const updateQty = (skuId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [skuId]: Math.max(0, (prev[skuId] ?? 0) + delta),
    }))
  }

  if (submitted) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <CheckCircle size={36} className="text-[#1bff1b] mx-auto mb-3" />
        <div className="font-medium text-zinc-100 mb-1">订单提交成功</div>
        <div className="text-xs text-zinc-500 mb-4">订单已提交至 DMS 系统</div>
        <button
          onClick={onClose}
          className="font-mono text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          返回
        </button>
      </div>
    )
  }

  const counts = sourceSummary(items)
  const promoItems = items.filter(i => i.source === 'promo')
  const promoSavings = promoItems.reduce((sum, i) => sum + (quantities[i.sku_id] ?? 0) * i.unit_price * 0.1, 0)

  return (
    <motion.div
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400">建议订单</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <X size={11} className="text-zinc-400" />
        </button>
      </div>

      {/* Summary bar */}
      <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[10px] text-zinc-500">{items.length} 个商品</span>
        {Object.entries(counts).map(([src, n]) => (
          <span
            key={src}
            className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${SOURCE_STYLES[src as SuggestedOrderItem['source']]}`}
          >
            {SOURCE_LABELS[src as SuggestedOrderItem['source']]} {n}
          </span>
        ))}
        {promoSavings > 0 && (
          <span className="ml-auto font-mono text-[10px] text-[#1bff1b]/70">
            促销省 ≈¥{promoSavings.toFixed(0)}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-zinc-800/60">
        <>
          {items.map((item, idx) => {
            const signal = crossSignals?.get(item.sku_id)
            const barColor = item.urgency ? URGENCY_BAR[item.urgency] : (
              item.source === 'promo' ? 'bg-[#1bff1b]/50' :
              item.source === 'lbs' ? 'bg-blue-500/70' : 'bg-zinc-700'
            )
            return (
              <motion.div
                key={item.sku_id}
                className="px-4 py-3 flex items-start gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.04 }}
              >
                {/* Left urgency bar */}
                <div className={`w-0.5 h-full min-h-[40px] rounded-full flex-shrink-0 ${barColor}`} />

                <div className="flex items-start justify-between gap-2 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${SOURCE_STYLES[item.source]}`}>
                        {SOURCE_LABELS[item.source]}
                      </span>
                      {item.urgency === 'urgent' && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-red-400 border-red-500/30 bg-red-500/10">
                          紧急
                        </span>
                      )}
                      {signal?.label && (
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                          signal.label === '三重推荐'
                            ? 'text-[#1bff1b] border-[#1bff1b]/30 bg-[#1bff1b]/10'
                            : 'text-zinc-300 border-zinc-600 bg-zinc-800'
                        }`}>
                          {signal.label} ★
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-zinc-200 truncate">{item.sku_name}</div>
                    <div className="font-mono text-[10px] text-zinc-600 mt-0.5">{item.spec} · ¥{item.unit_price}/箱</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQty(item.sku_id, -1)}
                      className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center active:bg-zinc-700 transition-colors"
                    >
                      <Minus size={10} className="text-zinc-400" />
                    </button>
                    <span className="font-mono text-sm text-zinc-100 w-5 text-center">
                      {quantities[item.sku_id] ?? 0}
                    </span>
                    <button
                      onClick={() => updateQty(item.sku_id, 1)}
                      className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center active:bg-zinc-700 transition-colors"
                    >
                      <Plus size={10} className="text-zinc-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </>
      </div>

      {/* Total and submit */}
      <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.1em]">合计</span>
          <span className="font-mono text-base font-semibold text-zinc-100">
            ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={() => setSubmitted(true)}
          className="w-full bg-[#1bff1b] hover:bg-[#1bff1b]/90 active:bg-[#1bff1b]/80 text-black text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          确认下单
        </button>
      </div>
    </motion.div>
  )
}
