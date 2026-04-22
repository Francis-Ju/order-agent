import type { LbsHotsellResult, LbsHotsellItem } from '../types/index.js'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function runLbsHotsell(storeId: string, ctx: ReturnType<typeof import('../data/loader.js').getDataContext>): LbsHotsellResult {
  const targetStore = ctx.stores.find(s => s.store_id === storeId)
  if (!targetStore) return { items: [], nearby_stores_analyzed: 0 }

  // Find nearby stores within 3km
  const nearbyStores = ctx.stores.filter(s => {
    if (s.store_id === storeId) return false
    const dist = haversineKm(targetStore.lat, targetStore.lng, s.lat, s.lng)
    return dist <= 3.0
  })

  if (nearbyStores.length === 0) return { items: [], nearby_stores_analyzed: 0 }

  // Get SKUs this store already orders
  const thisStoreSkus = new Set(
    (ctx.storeSkuProfiles.get(storeId) ?? []).map(p => p.sku_id)
  )

  // Count how many nearby stores sell each SKU (that this store doesn't have)
  const nearbySkuCount = new Map<string, { count: number; totalQty: number }>()

  for (const nearbyStore of nearbyStores) {
    const nearbyProfiles = ctx.storeSkuProfiles.get(nearbyStore.store_id) ?? []
    for (const profile of nearbyProfiles) {
      if (thisStoreSkus.has(profile.sku_id)) continue
      const existing = nearbySkuCount.get(profile.sku_id) ?? { count: 0, totalQty: 0 }
      nearbySkuCount.set(profile.sku_id, {
        count: existing.count + 1,
        totalQty: existing.totalQty + profile.avg_order_qty,
      })
    }
  }

  const items: LbsHotsellItem[] = []

  for (const [skuId, { count, totalQty }] of nearbySkuCount.entries()) {
    const product = ctx.productMap.get(skuId)
    if (!product) continue

    const penetrationRate = count / nearbyStores.length
    if (penetrationRate < 0.3) continue // At least 30% of nearby stores

    items.push({
      sku_id: skuId,
      sku_name: product.name,
      brand: product.brand,
      category: product.category,
      nearby_store_count: count,
      total_nearby_stores: nearbyStores.length,
      penetration_rate: Math.round(penetrationRate * 100),
      avg_monthly_qty: Math.round(totalQty / nearbyStores.length),
    })
  }

  items.sort((a, b) => b.penetration_rate - a.penetration_rate)

  return {
    items: items.slice(0, 5),
    nearby_stores_analyzed: nearbyStores.length,
  }
}
