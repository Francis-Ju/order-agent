export interface Store {
  store_id: string
  name: string
  address: string
  lat: number
  lng: number
  type: string
  owner_name: string
  phone: string
  store_grade: 'A' | 'B' | 'C'
  last_visit_date: string
  monthly_revenue: number
}

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

export type SkillName = 'replenishment' | 'lbs_hotsell' | 'promo_match' | 'cross_sell'

export type SkillStatus = 'idle' | 'loading' | 'done'

export interface AgentState {
  status: 'idle' | 'running' | 'done' | 'error'
  skillStatus: Record<SkillName, SkillStatus>
  replenishment?: ReplenishmentResult
  lbs_hotsell?: LbsHotsellResult
  promo_match?: PromoMatchResult
  cross_sell?: CrossSellResult
  summary: string
  isSummaryStreaming: boolean
  suggestedOrder: SuggestedOrderItem[]
  error?: string
}

// --- Chat types ---

type ChatApiContentPart =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

export interface ChatApiMessage {
  role: 'user' | 'assistant'
  content: string | ChatApiContentPart[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCall?: { name: SkillName; status: 'running' | 'done' }
  toolResult?: ReplenishmentResult | LbsHotsellResult | PromoMatchResult | CrossSellResult
  isStreaming?: boolean
  timestamp: number
}

export interface ChatSkillResults {
  replenishment?: ReplenishmentResult
  lbs_hotsell?: LbsHotsellResult
  promo_match?: PromoMatchResult
  cross_sell?: CrossSellResult
}

export interface ChatState {
  messages: ChatMessage[]
  apiMessages: ChatApiMessage[]
  isStreaming: boolean
  skillStatuses: Record<string, SkillStatus>
  skillResults: ChatSkillResults
  error?: string
}
