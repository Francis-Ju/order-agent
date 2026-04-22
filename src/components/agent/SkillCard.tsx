import { motion } from 'motion/react'
import type {
  SkillName,
  SkillStatus,
  ReplenishmentResult,
  LbsHotsellResult,
  PromoMatchResult,
  CrossSellResult,
} from '../../types/index.js'

type SkillResult = ReplenishmentResult | LbsHotsellResult | PromoMatchResult | CrossSellResult

interface SkillCardProps {
  skillKey: SkillName
  label: string
  status: SkillStatus
  result?: SkillResult
  onShowDetail?: (skill: SkillName) => void
}

function ReplenishmentContent({ result }: { result: ReplenishmentResult }) {
  return (
    <div className="mt-2 space-y-1.5">
      {result.urgent_count > 0 && (
        <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
          紧急 {result.urgent_count}
        </span>
      )}
      {result.suggested_count > 0 && (
        <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 ml-1">
          建议 {result.suggested_count}
        </span>
      )}
      {result.items.slice(0, 2).map(item => (
        <div key={item.sku_id} className="text-[10px] text-zinc-600 truncate">
          · {item.sku_name.replace(/^.*?([^·]+)$/, '$1').split(' ').pop()}
        </div>
      ))}
    </div>
  )
}

function LbsContent({ result }: { result: LbsHotsellResult }) {
  if (result.items.length === 0) {
    return (
      <div className="mt-2">
        <div className="font-mono text-[10px] text-zinc-600">周边 {result.nearby_stores_analyzed} 家门店</div>
        <div className="text-[10px] text-[#1bff1b]/60 mt-1">品类覆盖完整 ✓</div>
      </div>
    )
  }
  return (
    <div className="mt-2 space-y-1">
      <div className="font-mono text-[10px] text-zinc-600">周边 {result.nearby_stores_analyzed} 家门店</div>
      {result.items.slice(0, 2).map(item => (
        <div key={item.sku_id} className="text-[10px] text-zinc-500 truncate">
          · {item.brand} — {item.nearby_store_count}家在售
        </div>
      ))}
    </div>
  )
}

function PromoContent({ result }: { result: PromoMatchResult }) {
  return (
    <div className="mt-2 space-y-1">
      {result.expiring_soon_count > 0 && (
        <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1bff1b]/10 border border-[#1bff1b]/20 text-[#1bff1b]/80">
          {result.expiring_soon_count} 个即将到期
        </span>
      )}
      {result.items.slice(0, 2).map(item => (
        <div key={item.promo_id} className="text-[10px] text-zinc-500 truncate">
          · {item.promo_name.split(' ').slice(-1)[0]}
        </div>
      ))}
    </div>
  )
}

function CrossSellContent({ result }: { result: CrossSellResult }) {
  return (
    <div className="mt-2 space-y-1">
      {result.items.slice(0, 2).map(item => (
        <div key={item.sku_id} className="text-[10px] text-zinc-500 truncate">
          · {item.brand} ({item.confidence}%)
        </div>
      ))}
    </div>
  )
}

export function SkillCard({ skillKey, label, status, result, onShowDetail }: SkillCardProps) {
  const isLoading = status === 'loading'
  const isDone = status === 'done'
  const isClickable = isDone && onShowDetail

  return (
    <motion.div
      layout
      onClick={isClickable ? () => onShowDetail(skillKey) : undefined}
      className={`rounded-2xl p-3 transition-all duration-500 border ${
        isLoading
          ? 'bg-[#1bff1b]/5 border-[#1bff1b]/20 shadow-[0_0_12px_0] shadow-[#1bff1b]/10'
          : isDone
          ? 'bg-zinc-900 border-zinc-800 cursor-pointer active:bg-zinc-800'
          : 'bg-zinc-900 border-zinc-800 opacity-40'
      }`}
      whileTap={isClickable ? { scale: 0.97 } : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-400">{label}</span>
        <div>
          {isLoading && (
            <div className="w-3 h-3 border-2 border-[#1bff1b]/60 border-t-transparent rounded-full animate-spin" />
          )}
          {isDone && (
            <div className="flex items-center gap-1">
              {onShowDetail && (
                <span className="font-mono text-[9px] text-zinc-600">查看</span>
              )}
              <div className="w-4 h-4 rounded-full bg-[#1bff1b]/15 flex items-center justify-center">
                <span className="text-[#1bff1b] text-[10px] font-bold">✓</span>
              </div>
            </div>
          )}
          {status === 'idle' && (
            <div className="w-3 h-3 rounded-full border border-zinc-700" />
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mt-2 space-y-1.5 animate-pulse">
          <div className="h-2 bg-[#1bff1b]/10 rounded w-3/4" />
          <div className="h-2 bg-[#1bff1b]/5 rounded w-1/2" />
        </div>
      )}

      {isDone && result && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {skillKey === 'replenishment' && <ReplenishmentContent result={result as ReplenishmentResult} />}
          {skillKey === 'lbs_hotsell' && <LbsContent result={result as LbsHotsellResult} />}
          {skillKey === 'promo_match' && <PromoContent result={result as PromoMatchResult} />}
          {skillKey === 'cross_sell' && <CrossSellContent result={result as CrossSellResult} />}
        </motion.div>
      )}
    </motion.div>
  )
}
