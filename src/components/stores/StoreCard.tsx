import { ChevronRight, Clock, TrendingUp } from 'lucide-react'
import type { Store } from '../../types/index.js'

interface StoreCardProps {
  store: Store
  onSelect: (store: Store) => void
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

export function StoreCard({ store, onSelect }: StoreCardProps) {
  const days = daysSince(store.last_visit_date)
  const isOverdue = days > 7

  const gradeBadge = {
    A: 'text-[#1bff1b] border border-[#1bff1b]/40 bg-[#1bff1b]/10',
    B: 'text-zinc-300 border border-zinc-700 bg-zinc-800',
    C: 'text-zinc-500 border border-zinc-800 bg-zinc-900',
  }[store.store_grade]

  return (
    <button
      onClick={() => onSelect(store)}
      className="w-full text-left bg-zinc-900 rounded-2xl p-4 border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${gradeBadge}`}>
              {store.store_grade}
            </span>
            <h3 className="font-medium text-zinc-100 text-sm truncate">{store.name}</h3>
          </div>
          <p className="text-xs text-zinc-500 truncate mb-2.5">{store.address}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock size={10} className={isOverdue ? 'text-amber-500' : 'text-zinc-700'} />
              <span className={`text-[11px] ${isOverdue ? 'text-amber-500' : 'text-zinc-600'}`}>
                {days}天前拜访
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-zinc-700" />
              <span className="text-[11px] text-zinc-600">
                ¥{(store.monthly_revenue / 10000).toFixed(1)}万/月
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center ml-2">
          <div className="w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 bg-[#1bff1b]/5 border border-[#1bff1b]/10 rounded-lg px-2.5 py-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b] animate-pulse" />
        <span className="font-mono text-[10px] text-[#1bff1b]/70">点击进入 → 智能体自动分析</span>
      </div>
    </button>
  )
}
