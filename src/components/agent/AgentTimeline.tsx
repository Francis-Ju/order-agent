import { Check } from 'lucide-react'
import type { AgentState } from '../../types/index.js'

interface AgentTimelineProps {
  agentState: AgentState
}

interface Step {
  key: string
  label: string
}

const STEPS: Step[] = [
  { key: 'skills', label: '技能分析' },
  { key: 'summary', label: 'AI 摘要' },
  { key: 'order', label: '建议订单' },
]

function getStepState(stepKey: string, agentState: AgentState): 'pending' | 'active' | 'done' {
  const allSkillsDone = Object.values(agentState.skillStatus).every(s => s === 'done')

  if (stepKey === 'skills') {
    if (agentState.status === 'idle') return 'pending'
    if (allSkillsDone) return 'done'
    return 'active'
  }
  if (stepKey === 'summary') {
    if (!allSkillsDone) return 'pending'
    if (agentState.summary && !agentState.isSummaryStreaming) return 'done'
    if (agentState.isSummaryStreaming || allSkillsDone) return 'active'
    return 'pending'
  }
  if (stepKey === 'order') {
    if (agentState.suggestedOrder.length > 0) return 'done'
    if (agentState.summary && !agentState.isSummaryStreaming) return 'active'
    return 'pending'
  }
  return 'pending'
}

export function AgentTimeline({ agentState }: AgentTimelineProps) {
  if (agentState.status === 'idle') return null

  return (
    <div className="flex items-center gap-0 px-4 py-2.5 border-b border-zinc-800/60">
      {STEPS.map((step, idx) => {
        const state = getStepState(step.key, agentState)
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                state === 'done'
                  ? 'bg-[#1bff1b]/15 border border-[#1bff1b]/30'
                  : state === 'active'
                  ? 'bg-[#1bff1b]/10 border border-[#1bff1b]/40'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}>
                {state === 'done' ? (
                  <Check size={10} className="text-[#1bff1b]" />
                ) : state === 'active' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1bff1b] animate-pulse" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                )}
              </div>
              <span className={`font-mono text-[9px] tracking-[0.08em] transition-colors duration-300 ${
                state === 'done'
                  ? 'text-[#1bff1b]/70'
                  : state === 'active'
                  ? 'text-zinc-300'
                  : 'text-zinc-700'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-full flex-1 mb-4 transition-colors duration-500 ${
                getStepState(STEPS[idx + 1].key, agentState) !== 'pending' || state === 'done'
                  ? 'bg-[#1bff1b]/20'
                  : 'bg-zinc-800'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
