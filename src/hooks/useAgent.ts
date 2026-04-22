import { useCallback, useRef, useState } from 'react'
import { triggerAgent } from '../lib/api.js'
import type {
  AgentState,
  ReplenishmentResult,
  LbsHotsellResult,
  PromoMatchResult,
  CrossSellResult,
  SuggestedOrderItem,
} from '../types/index.js'

const initialState: AgentState = {
  status: 'idle',
  skillStatus: {
    replenishment: 'idle',
    lbs_hotsell: 'idle',
    promo_match: 'idle',
    cross_sell: 'idle',
  },
  summary: '',
  isSummaryStreaming: false,
  suggestedOrder: [],
}

export function useAgent() {
  const [state, setState] = useState<AgentState>(initialState)
  const abortRef = useRef<AbortController | null>(null)

  const trigger = useCallback(async (storeId: string) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setState({
      ...initialState,
      status: 'running',
    })

    try {
      await triggerAgent(
        storeId,
        (event, raw) => {
          const data = raw as Record<string, unknown>
          setState(prev => {
            switch (event) {
              case 'skill_start': {
                const skill = data.skill as keyof AgentState['skillStatus']
                return {
                  ...prev,
                  skillStatus: { ...prev.skillStatus, [skill]: 'loading' },
                }
              }
              case 'skill_complete': {
                const skill = data.skill as string
                const result = data.result as unknown
                const update: Partial<AgentState> = {
                  skillStatus: { ...prev.skillStatus, [skill]: 'done' },
                }
                if (skill === 'replenishment') update.replenishment = result as ReplenishmentResult
                if (skill === 'lbs_hotsell') update.lbs_hotsell = result as LbsHotsellResult
                if (skill === 'promo_match') update.promo_match = result as PromoMatchResult
                if (skill === 'cross_sell') update.cross_sell = result as CrossSellResult
                return { ...prev, ...update }
              }
              case 'summary_start':
                return { ...prev, isSummaryStreaming: true }
              case 'summary_chunk':
                return { ...prev, summary: prev.summary + (data.text as string) }
              case 'summary_complete':
                return {
                  ...prev,
                  isSummaryStreaming: false,
                  summary: data.full_summary as string,
                  suggestedOrder: data.suggested_order as SuggestedOrderItem[],
                }
              case 'agent_complete':
                return { ...prev, status: 'done' }
              case 'error':
                return { ...prev, status: 'error', isSummaryStreaming: false }
              default:
                return prev
            }
          })
        },
        ctrl.signal,
      )
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setState(prev => ({ ...prev, status: 'error', error: (err as Error).message }))
      }
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(initialState)
  }, [])

  return { state, trigger, reset }
}
