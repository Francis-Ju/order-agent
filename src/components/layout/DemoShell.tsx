import type { ReactNode } from 'react'
import type { AgentState } from '../../types/index.js'

interface DemoShellProps {
  children: ReactNode
  agentState: AgentState
}

const SKILL_LABELS = {
  replenishment: '补货预测',
  lbs_hotsell: '周边热卖',
  promo_match: '促销匹配',
  cross_sell: '关联推荐',
}

const ARCH_LAYERS = [
  { label: '用户界面层', desc: 'H5 / 企业微信' },
  { label: '意图识别层', desc: '主动触发 / NLP' },
  { label: '编排层', desc: 'Promise.all 并行' },
  { label: '技能层', desc: '4 个 Agent Skills' },
  { label: '上下文层', desc: '5 类企业上下文' },
  { label: '基座模型层', desc: 'Claude Sonnet 4.6' },
]

export function DemoShell({ children, agentState }: DemoShellProps) {
  const skillDone = Object.values(agentState.skillStatus).filter(s => s === 'done').length
  const skillLoading = Object.values(agentState.skillStatus).filter(s => s === 'loading').length

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8 gap-10">
      {/* Left sidebar - Architecture */}
      <div className="hidden xl:flex flex-col gap-2 w-52">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">
          GEA 架构
        </div>
        {ARCH_LAYERS.map((layer, i) => (
          <div
            key={i}
            className={`border rounded-lg px-3 py-2 transition-all duration-300 ${
              i === 2 && agentState.status === 'running'
                ? 'border-[#1bff1b]/30 bg-[#1bff1b]/5 shadow-[0_0_8px_0] shadow-[#1bff1b]/10'
                : i === 3 && skillLoading > 0
                ? 'border-[#1bff1b]/20 bg-[#1bff1b]/5'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <div className="text-zinc-300 text-xs font-medium">{layer.label}</div>
            <div className="font-mono text-[10px] text-zinc-600 mt-0.5">{layer.desc}</div>
          </div>
        ))}
        {agentState.status === 'running' && (
          <div className="mt-2 text-center">
            <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.1em]">已完成技能</div>
            <div className="text-[#1bff1b] text-2xl font-semibold mt-0.5">{skillDone}/4</div>
          </div>
        )}
      </div>

      {/* Center - Phone */}
      {children}

      {/* Right sidebar - Skills */}
      <div className="hidden lg:flex flex-col gap-2 w-56">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">
          技能层状态
        </div>
        {(Object.entries(SKILL_LABELS) as Array<[keyof typeof SKILL_LABELS, string]>).map(([key, label]) => {
          const status = agentState.skillStatus[key]
          return (
            <div
              key={key}
              className={`rounded-lg p-3 border transition-all duration-500 ${
                status === 'idle'
                  ? 'bg-zinc-900 border-zinc-800 opacity-40'
                  : status === 'loading'
                  ? 'bg-[#1bff1b]/5 border-[#1bff1b]/20 shadow-[0_0_8px_0] shadow-[#1bff1b]/10'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-400">{label}</span>
                {status === 'loading' && (
                  <div className="w-3 h-3 border-2 border-[#1bff1b]/60 border-t-transparent rounded-full animate-spin" />
                )}
                {status === 'done' && <span className="text-[#1bff1b] text-xs">✓</span>}
                {status === 'idle' && <span className="text-zinc-700 text-xs">—</span>}
              </div>
              {status === 'done' && key === 'replenishment' && agentState.replenishment && (
                <div className="mt-1 font-mono text-[10px] text-zinc-600">
                  紧急 {agentState.replenishment.urgent_count} · 建议 {agentState.replenishment.suggested_count}
                </div>
              )}
              {status === 'done' && key === 'lbs_hotsell' && agentState.lbs_hotsell && (
                <div className="mt-1 font-mono text-[10px] text-zinc-600">
                  {agentState.lbs_hotsell.items.length} 个热卖商品
                </div>
              )}
              {status === 'done' && key === 'promo_match' && agentState.promo_match && (
                <div className="mt-1 font-mono text-[10px] text-zinc-600">
                  {agentState.promo_match.expiring_soon_count} 个即将到期
                </div>
              )}
              {status === 'done' && key === 'cross_sell' && agentState.cross_sell && (
                <div className="mt-1 font-mono text-[10px] text-zinc-600">
                  {agentState.cross_sell.items.length} 个关联推荐
                </div>
              )}
            </div>
          )
        })}

        {agentState.status === 'running' && skillLoading > 0 && (
          <div className="mt-2 text-center font-mono text-[10px] text-zinc-600 animate-pulse">
            并行执行中...
          </div>
        )}
        {agentState.status === 'done' && (
          <div className="mt-2 p-2 rounded-lg bg-[#1bff1b]/5 border border-[#1bff1b]/20 text-center">
            <div className="font-mono text-[10px] text-[#1bff1b]">✓ 分析完成</div>
          </div>
        )}
      </div>
    </div>
  )
}
