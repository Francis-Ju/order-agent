export interface Store {
  store_id: string
  name: string
  address: string
  lat: number
  lng: number
  type: '便利店' | '中型超市' | '大型超市' | '批发部' | '社区店' | '连锁便利店' | '新零售'
  owner_name: string
  phone: string
  store_grade: 'A' | 'B' | 'C'
  last_visit_date: string
  monthly_revenue: number
}

export interface Product {
  sku_id: string
  name: string
  category: '食用油' | '调味品' | '米面' | '休食' | '日化'
  brand: string
  spec: string
  unit: string
  unit_price: number
}

export interface OrderItem {
  sku_id: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Order {
  order_id: string
  store_id: string
  order_date: string
  items: OrderItem[]
  total_amount: number
}

export interface Promotion {
  promo_id: string
  name: string
  type: '买赠' | '满减' | '折扣' | '搭赠' | '量贩装特价'
  sku_ids: string[]
  start_date: string
  end_date: string
  threshold: number
  reward: string
  description: string
}

export interface StoreSkuProfile {
  store_id: string
  sku_id: string
  order_count: number
  avg_order_cycle_days: number
  avg_order_qty: number
  last_order_date: string
  total_ordered: number
}

// Skill result types
export interface ReplenishmentItem {
  sku_id: string
  sku_name: string
  urgency: 'urgent' | 'suggested' | 'optional'
  urgency_score: number
  suggested_qty: number
  last_order_date: string
  avg_cycle_days: number
  days_since_last: number
  predicted_stockout: string
}

export interface ReplenishmentResult {
  items: ReplenishmentItem[]
  urgent_count: number
  suggested_count: number
}

export interface LbsHotsellItem {
  sku_id: string
  sku_name: string
  brand: string
  category: string
  nearby_store_count: number
  total_nearby_stores: number
  penetration_rate: number
  avg_monthly_qty: number
}

export interface LbsHotsellResult {
  items: LbsHotsellItem[]
  nearby_stores_analyzed: number
}

export interface PromoMatchItem {
  promo_id: string
  promo_name: string
  sku_ids: string[]
  type: string
  expiry_days: number
  is_expiring_soon: boolean
  current_qty: number
  threshold_qty: number
  gap_qty: number
  can_qualify: boolean
  description: string
}

export interface PromoMatchResult {
  items: PromoMatchItem[]
  expiring_soon_count: number
}

export interface CrossSellItem {
  sku_id: string
  sku_name: string
  brand: string
  confidence: number
  lift: number
  trigger_skus: string[]
  reason: string
}

export interface CrossSellResult {
  items: CrossSellItem[]
}

export interface AgentResult {
  store: Store
  replenishment: ReplenishmentResult
  lbs_hotsell: LbsHotsellResult
  promo_match: PromoMatchResult
  cross_sell: CrossSellResult
  summary: string
  suggested_order: SuggestedOrderItem[]
}

export interface SuggestedOrderItem {
  sku_id: string
  sku_name: string
  spec: string
  unit_price: number
  suggested_qty: number
  reason: string
  source: 'replenishment' | 'lbs' | 'promo' | 'cross_sell'
  urgency?: 'urgent' | 'suggested' | 'optional'
}
