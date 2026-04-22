import { motion } from 'motion/react'
import type { Store } from '../../types/index.js'
import { StoreCard } from './StoreCard.js'
import { MapPin } from 'lucide-react'

interface StoreListProps {
  stores: Store[]
  loading: boolean
  onSelectStore: (store: Store) => void
  isMobile?: boolean
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

export function StoreList({ stores, loading, onSelectStore, isMobile }: StoreListProps) {
  const aCount = stores.filter(s => s.store_grade === 'A').length
  const overdueCount = stores.filter(s => {
    const days = Math.floor((Date.now() - new Date(s.last_visit_date).getTime()) / 86400000)
    return days > 7
  }).length

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className={`bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-4 pb-4 sticky top-0 z-10 ${isMobile ? 'pt-safe' : 'pt-4'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">今日路线</span>
          <span className="font-mono text-[10px] text-zinc-600">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">拜访门店</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b] animate-pulse" />
          <span className="text-xs text-zinc-500">智能体就绪，点击门店自动触发分析</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-zinc-800">
        <div className="text-center py-3 border-r border-zinc-800">
          <div className="text-lg font-semibold text-zinc-100">{stores.length}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">今日门店</div>
        </div>
        <div className="text-center py-3 border-r border-zinc-800">
          <div className="text-lg font-semibold text-[#1bff1b]">{aCount}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">A级门店</div>
        </div>
        <div className="text-center py-3">
          <div className="text-lg font-semibold text-zinc-300">{overdueCount}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">待跟进</div>
        </div>
      </div>

      {/* Store list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-4 animate-pulse border border-zinc-800">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-2.5"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {stores.map(store => (
              <motion.div key={store.store_id} variants={itemVariants}>
                <StoreCard store={store} onSelect={onSelectStore} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom */}
      <div className={`border-t border-zinc-800 px-4 pt-3 flex items-center gap-2 ${isMobile ? 'pb-safe' : 'pb-3'}`}>
        <MapPin size={12} className="text-zinc-600" />
        <span className="font-mono text-[10px] text-zinc-600">北京市朝阳区望京/来广营片区</span>
      </div>
    </div>
  )
}
