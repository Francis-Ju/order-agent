import type { AgentState } from '../types/index.js'

export interface SkuSignalCount {
  sku_id: string
  sku_name: string
  skills: string[]
  label: '三重推荐' | '双重推荐' | null
}

export function analyzeCrossSkillSignals(state: AgentState): Map<string, SkuSignalCount> {
  const map = new Map<string, SkuSignalCount>()

  const addSignal = (sku_id: string, sku_name: string, skill: string) => {
    const existing = map.get(sku_id)
    if (existing) {
      if (!existing.skills.includes(skill)) {
        existing.skills.push(skill)
      }
    } else {
      map.set(sku_id, { sku_id, sku_name, skills: [skill], label: null })
    }
  }

  state.replenishment?.items.forEach(i => addSignal(i.sku_id, i.sku_name, 'replenishment'))
  state.lbs_hotsell?.items.forEach(i => addSignal(i.sku_id, i.sku_name, 'lbs_hotsell'))
  state.cross_sell?.items.forEach(i => addSignal(i.sku_id, i.sku_name, 'cross_sell'))

  // Promos expose sku_ids — use a lookup map from previously seen SKU names
  if (state.promo_match) {
    const skuNameMap = new Map<string, string>()
    state.replenishment?.items.forEach(i => skuNameMap.set(i.sku_id, i.sku_name))
    state.lbs_hotsell?.items.forEach(i => skuNameMap.set(i.sku_id, i.sku_name))
    state.cross_sell?.items.forEach(i => skuNameMap.set(i.sku_id, i.sku_name))

    state.promo_match.items.forEach(promo => {
      promo.sku_ids.forEach(skuId => {
        const name = skuNameMap.get(skuId) ?? skuId
        addSignal(skuId, name, 'promo_match')
      })
    })
  }

  for (const entry of map.values()) {
    if (entry.skills.length >= 3) {
      entry.label = '三重推荐'
    } else if (entry.skills.length === 2) {
      entry.label = '双重推荐'
    }
  }

  return map
}
