import Anthropic from '@anthropic-ai/sdk'
import { getDataContext, getStoreById } from '../data/loader.js'
import { runReplenishment } from '../skills/replenishment.js'
import { runLbsHotsell } from '../skills/lbs-hotsell.js'
import { runPromoMatch } from '../skills/promo-match.js'
import { runCrossSell } from '../skills/cross-sell.js'
import type { AgentResult, SuggestedOrderItem } from '../types/index.js'

const client = new Anthropic()

function buildSuggestedOrder(
  replenishment: AgentResult['replenishment'],
  lbs: AgentResult['lbs_hotsell'],
  promo: AgentResult['promo_match'],
  crossSell: AgentResult['cross_sell'],
  ctx: ReturnType<typeof getDataContext>
): SuggestedOrderItem[] {
  const orderMap = new Map<string, SuggestedOrderItem>()

  for (const item of replenishment.items) {
    const product = ctx.productMap.get(item.sku_id)
    if (!product) continue
    orderMap.set(item.sku_id, {
      sku_id: item.sku_id,
      sku_name: item.sku_name,
      spec: product.spec,
      unit_price: product.unit_price,
      suggested_qty: item.suggested_qty,
      reason: `补货预测 - ${item.urgency === 'urgent' ? '紧急' : '建议'}`,
      source: 'replenishment',
      urgency: item.urgency,
    })
  }

  for (const item of lbs.items.slice(0, 2)) {
    if (orderMap.has(item.sku_id)) continue
    const product = ctx.productMap.get(item.sku_id)
    if (!product) continue
    orderMap.set(item.sku_id, {
      sku_id: item.sku_id,
      sku_name: item.sku_name,
      spec: product.spec,
      unit_price: product.unit_price,
      suggested_qty: Math.max(1, item.avg_monthly_qty),
      reason: `周边热卖 - ${item.nearby_store_count}家门店在售`,
      source: 'lbs',
    })
  }

  // For promos with gap, add the gap quantity
  for (const item of promo.items) {
    if (item.gap_qty > 0) {
      const promoObj = ctx.promotions.find(p => p.promo_id === item.promo_id)
      if (!promoObj) continue
      for (const skuId of promoObj.sku_ids) {
        const existing = orderMap.get(skuId)
        if (existing) {
          existing.suggested_qty = Math.max(existing.suggested_qty, item.threshold_qty)
        } else {
          const product = ctx.productMap.get(skuId)
          if (!product) continue
          orderMap.set(skuId, {
            sku_id: skuId,
            sku_name: product.name,
            spec: product.spec,
            unit_price: product.unit_price,
            suggested_qty: item.threshold_qty,
            reason: `促销匹配 - ${item.promo_name}`,
            source: 'promo',
          })
        }
      }
    }
  }

  for (const item of crossSell.items.slice(0, 1)) {
    if (orderMap.has(item.sku_id)) continue
    const product = ctx.productMap.get(item.sku_id)
    if (!product) continue
    orderMap.set(item.sku_id, {
      sku_id: item.sku_id,
      sku_name: item.sku_name,
      spec: product.spec,
      unit_price: product.unit_price,
      suggested_qty: 3,
      reason: `关联推荐 - 置信度${item.confidence}%`,
      source: 'cross_sell',
    })
  }

  return Array.from(orderMap.values())
}

export async function executeAgent(
  storeId: string,
  onEvent: (event: string, data: unknown) => void
): Promise<AgentResult> {
  const ctx = getDataContext()
  const store = getStoreById(storeId)
  if (!store) throw new Error(`Store ${storeId} not found`)

  onEvent('agent_start', { store_id: storeId, store_name: store.name })

  // Start all 4 skills in parallel
  onEvent('skill_start', { skill: 'replenishment', label: '补货预测' })
  onEvent('skill_start', { skill: 'lbs_hotsell', label: '周边热卖' })
  onEvent('skill_start', { skill: 'promo_match', label: '促销匹配' })
  onEvent('skill_start', { skill: 'cross_sell', label: '关联推荐' })

  // Add simulated delays so the UI can show staggered completion
  const [replenishment, lbsHotsell, promoMatch, crossSell] = await Promise.all([
    new Promise<AgentResult['replenishment']>(resolve => setTimeout(() => resolve(runReplenishment(storeId, ctx)), 600)),
    new Promise<AgentResult['lbs_hotsell']>(resolve => setTimeout(() => resolve(runLbsHotsell(storeId, ctx)), 900)),
    new Promise<AgentResult['promo_match']>(resolve => setTimeout(() => resolve(runPromoMatch(storeId, ctx)), 1100)),
    new Promise<AgentResult['cross_sell']>(resolve => setTimeout(() => resolve(runCrossSell(storeId, ctx)), 800)),
  ])

  onEvent('skill_complete', { skill: 'replenishment', result: replenishment })
  onEvent('skill_complete', { skill: 'lbs_hotsell', result: lbsHotsell })
  onEvent('skill_complete', { skill: 'promo_match', result: promoMatch })
  onEvent('skill_complete', { skill: 'cross_sell', result: crossSell })

  onEvent('summary_start', {})

  const prompt = `你是一位资深快消品销售顾问。根据以下分析结果，用自然、专业的语言为业务员生成一段简洁的门店拜访摘要（100字以内），重点突出需要立即行动的事项。

门店：${store.name}（${store.address}）
门店类型：${store.type} | 等级：${store.store_grade}级 | 月营收约${(store.monthly_revenue / 10000).toFixed(1)}万元

【补货预测结果】
紧急补货：${replenishment.urgent_count}个商品
建议补货：${replenishment.suggested_count}个商品
${replenishment.items.filter(i => i.urgency === 'urgent').map(i => `- ${i.sku_name}：已超期${i.days_since_last - i.avg_cycle_days}天，建议补货${i.suggested_qty}箱`).join('\n')}

【周边热卖结果】
分析了${lbsHotsell.nearby_stores_analyzed}家附近门店
${lbsHotsell.items.map(i => `- ${i.sku_name}：${i.nearby_store_count}家邻近门店在售`).join('\n')}

【促销匹配结果】
${promoMatch.items.slice(0, 2).map(i => `- ${i.promo_name}${i.is_expiring_soon ? `（${i.expiry_days}天后到期！）` : ''}${i.gap_qty > 0 ? `，再加购${i.gap_qty}箱即可享受优惠` : '，已可享受优惠'}`).join('\n')}

【关联推荐结果】
${crossSell.items.map(i => `- ${i.sku_name}：${i.reason}`).join('\n')}

请生成一段流畅的拜访摘要，格式：先说补货情况，再说热卖机会，最后说促销提醒。纯文字输出，不要使用任何 Markdown 格式（不要用 ##、**、- 等符号）。`

  let summary = ''

  const stream = client.messages.stream({
    model: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      summary += chunk.delta.text
      onEvent('summary_chunk', { text: chunk.delta.text })
    }
  }

  const suggestedOrder = buildSuggestedOrder(replenishment, lbsHotsell, promoMatch, crossSell, ctx)

  onEvent('summary_complete', { full_summary: summary, suggested_order: suggestedOrder })
  onEvent('agent_complete', { store_id: storeId })

  return { store, replenishment, lbs_hotsell: lbsHotsell, promo_match: promoMatch, cross_sell: crossSell, summary, suggested_order: suggestedOrder }
}
