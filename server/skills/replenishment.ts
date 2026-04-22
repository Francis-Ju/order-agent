import type { ReplenishmentResult, ReplenishmentItem } from '../types/index.js'

const TODAY = new Date().toISOString().split('T')[0]

function daysSince(date: string): number {
  return Math.floor((new Date(TODAY).getTime() - new Date(date).getTime()) / 86400000)
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function runReplenishment(storeId: string, ctx: ReturnType<typeof import('../data/loader.js').getDataContext>): ReplenishmentResult {
  const profiles = ctx.storeSkuProfiles.get(storeId) ?? []

  // Only analyze SKUs ordered at least 2 times (to establish a cycle)
  const eligible = profiles.filter(p => p.order_count >= 2)

  const items: ReplenishmentItem[] = []

  for (const profile of eligible) {
    const product = ctx.productMap.get(profile.sku_id)
    if (!product) continue

    const daysSinceLast = daysSince(profile.last_order_date)
    const urgencyScore = profile.avg_order_cycle_days > 0
      ? daysSinceLast / profile.avg_order_cycle_days
      : 0

    // Only include items that are at least 80% through their cycle
    if (urgencyScore < 0.8) continue

    const urgency = urgencyScore >= 1.2 ? 'urgent' : urgencyScore >= 0.9 ? 'suggested' : 'optional'

    const daysUntilStockout = Math.max(0, profile.avg_order_cycle_days - daysSinceLast)
    const predictedStockout = addDays(TODAY, daysUntilStockout)

    items.push({
      sku_id: profile.sku_id,
      sku_name: product.name,
      urgency,
      urgency_score: Math.round(urgencyScore * 100) / 100,
      suggested_qty: profile.avg_order_qty,
      last_order_date: profile.last_order_date,
      avg_cycle_days: profile.avg_order_cycle_days,
      days_since_last: daysSinceLast,
      predicted_stockout: urgency === 'urgent' ? TODAY : predictedStockout,
    })
  }

  // Sort by urgency score descending
  items.sort((a, b) => b.urgency_score - a.urgency_score)

  return {
    items: items.slice(0, 8),
    urgent_count: items.filter(i => i.urgency === 'urgent').length,
    suggested_count: items.filter(i => i.urgency === 'suggested').length,
  }
}
