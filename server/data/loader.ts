import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Store, Product, Order, Promotion, StoreSkuProfile } from '../types/index.js'

const __fileDir = dirname(fileURLToPath(import.meta.url))

// In production the JSON files are copied to dist-server/data/ next to this file.
// Fall back to the source directory when running in dev (tsx) or when the copy step was skipped.
const DATA_DIR = existsSync(join(__fileDir, 'stores.json'))
  ? __fileDir
  : join(process.cwd(), 'server', 'data')

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8')) as T
}

let storesData: Store[]
let productsData: Product[]
let ordersData: Order[]
let promotionsData: Promotion[]
let storeSkuProfiles: Map<string, StoreSkuProfile[]>
let productMap: Map<string, Product>
let coOccurrenceMatrix: Map<string, Map<string, number>>
let skuOrderCount: Map<string, number>
let totalOrders: number

function daysBetween(date1: string, date2: string): number {
  return Math.floor((new Date(date2).getTime() - new Date(date1).getTime()) / 86400000)
}

function buildStoreSkuProfiles(stores: Store[], orders: Order[]): Map<string, StoreSkuProfile[]> {
  const profileMap = new Map<string, Map<string, { dates: string[]; qtys: number[] }>>()

  for (const order of orders) {
    if (!profileMap.has(order.store_id)) {
      profileMap.set(order.store_id, new Map())
    }
    const storeMap = profileMap.get(order.store_id)!
    for (const item of order.items) {
      if (!storeMap.has(item.sku_id)) {
        storeMap.set(item.sku_id, { dates: [], qtys: [] })
      }
      const entry = storeMap.get(item.sku_id)!
      entry.dates.push(order.order_date)
      entry.qtys.push(item.quantity)
    }
  }

  const result = new Map<string, StoreSkuProfile[]>()

  for (const [storeId, skuMap] of profileMap.entries()) {
    const profiles: StoreSkuProfile[] = []
    for (const [skuId, { dates, qtys }] of skuMap.entries()) {
      const sorted = dates.slice().sort()
      const totalOrdered = qtys.reduce((a, b) => a + b, 0)
      const avgQty = totalOrdered / qtys.length
      const cycles: number[] = []
      for (let i = 1; i < sorted.length; i++) {
        cycles.push(daysBetween(sorted[i - 1], sorted[i]))
      }
      const avgCycle = cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 30

      profiles.push({
        store_id: storeId,
        sku_id: skuId,
        order_count: dates.length,
        avg_order_cycle_days: Math.round(avgCycle),
        avg_order_qty: Math.round(avgQty),
        last_order_date: sorted[sorted.length - 1],
        total_ordered: totalOrdered,
      })
    }
    result.set(storeId, profiles)
  }

  return result
}

function buildCoOccurrenceMatrix(orders: Order[]): { matrix: Map<string, Map<string, number>>; skuCount: Map<string, number> } {
  const matrix = new Map<string, Map<string, number>>()
  const skuCount = new Map<string, number>()

  for (const order of orders) {
    const skus = order.items.map(i => i.sku_id)
    for (const sku of skus) {
      skuCount.set(sku, (skuCount.get(sku) ?? 0) + 1)
    }
    for (let i = 0; i < skus.length; i++) {
      for (let j = 0; j < skus.length; j++) {
        if (i === j) continue
        if (!matrix.has(skus[i])) matrix.set(skus[i], new Map())
        const row = matrix.get(skus[i])!
        row.set(skus[j], (row.get(skus[j]) ?? 0) + 1)
      }
    }
  }

  return { matrix, skuCount }
}

export function loadData() {
  storesData = loadJson<Store[]>('stores.json')
  productsData = loadJson<Product[]>('products.json')
  ordersData = loadJson<Order[]>('orders.json')
  promotionsData = loadJson<Promotion[]>('promotions.json')
  productMap = new Map(productsData.map(p => [p.sku_id, p]))
  storeSkuProfiles = buildStoreSkuProfiles(storesData, ordersData)
  const { matrix, skuCount } = buildCoOccurrenceMatrix(ordersData)
  coOccurrenceMatrix = matrix
  skuOrderCount = skuCount
  totalOrders = ordersData.length

  console.log(`📦 Data loaded: ${storesData.length} stores, ${productsData.length} products, ${ordersData.length} orders`)
}

export function getDataContext() {
  return {
    stores: storesData,
    products: productsData,
    orders: ordersData,
    promotions: promotionsData,
    storeSkuProfiles,
    productMap,
    coOccurrenceMatrix,
    skuOrderCount,
    totalOrders,
  }
}

export function getStoreById(id: string): Store | undefined {
  return storesData?.find(s => s.store_id === id)
}

export function getAllStores(): Store[] {
  return storesData ?? []
}
