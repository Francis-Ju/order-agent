import type { PromoMatchResult, PromoMatchItem } from '../types/index.js'

const TODAY = new Date().toISOString().split('T')[0]

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000)
}

export function runPromoMatch(storeId: string, ctx: ReturnType<typeof import('../data/loader.js').getDataContext>): PromoMatchResult {
  const storeProfiles = ctx.storeSkuProfiles.get(storeId) ?? []
  const storeSkuSet = new Set(storeProfiles.map(p => p.sku_id))

  // Only active promotions
  const activePromos = ctx.promotions.filter(p => {
    const start = new Date(p.start_date)
    const end = new Date(p.end_date)
    const now = new Date(TODAY)
    return now >= start && now <= end
  })

  const items: PromoMatchItem[] = []

  for (const promo of activePromos) {
    // Check if store carries any of the promo SKUs (or should carry them - LBS hot items count)
    const relevantSkus = promo.sku_ids.filter(skuId => storeSkuSet.has(skuId))

    // Also check nearby hot-sell items for promos
    const isRelevant = relevantSkus.length > 0 ||
      // Include promos for items that are very popular nearby (penetration logic simplified here)
      promo.sku_ids.some(skuId => {
        const profile = storeProfiles.find(p => p.sku_id === skuId)
        return profile !== undefined
      })

    if (!isRelevant && promo.sku_ids.some(id => !storeSkuSet.has(id))) {
      // Promo on new items - still show if it's for hot-sell items
      const nearbyPopular = promo.sku_ids.filter(skuId => {
        // Check if other stores order this
        let count = 0
        for (const [sid, profiles] of ctx.storeSkuProfiles.entries()) {
          if (sid === storeId) continue
          if (profiles.some(p => p.sku_id === skuId)) count++
        }
        return count >= 2
      })
      if (nearbyPopular.length === 0) continue
    }

    const expiryDays = daysUntil(promo.end_date)
    const isExpiringSoon = expiryDays <= 5

    // Calculate current store quantity for promo SKUs
    const currentQty = promo.sku_ids.reduce((total, skuId) => {
      const profile = storeProfiles.find(p => p.sku_id === skuId)
      return total + (profile?.avg_order_qty ?? 0)
    }, 0)

    const gapQty = Math.max(0, promo.threshold - currentQty)

    items.push({
      promo_id: promo.promo_id,
      promo_name: promo.name,
      sku_ids: promo.sku_ids,
      type: promo.type,
      expiry_days: expiryDays,
      is_expiring_soon: isExpiringSoon,
      current_qty: currentQty,
      threshold_qty: promo.threshold,
      gap_qty: gapQty,
      can_qualify: currentQty >= promo.threshold,
      description: promo.description,
    })
  }

  // Sort: expiring soon first, then by gap (closest to qualifying)
  items.sort((a, b) => {
    if (a.is_expiring_soon !== b.is_expiring_soon) return a.is_expiring_soon ? -1 : 1
    return a.gap_qty - b.gap_qty
  })

  return {
    items: items.slice(0, 5),
    expiring_soon_count: items.filter(i => i.is_expiring_soon).length,
  }
}
