import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { getDataContext, getStoreById } from '../data/loader.js'
import { runReplenishment } from '../skills/replenishment.js'
import { runLbsHotsell } from '../skills/lbs-hotsell.js'
import { runPromoMatch } from '../skills/promo-match.js'
import { runCrossSell } from '../skills/cross-sell.js'
import type { ReplenishmentResult, LbsHotsellResult, PromoMatchResult, CrossSellResult } from '../types/index.js'

const client = new Anthropic()

const SKILL_LABELS: Record<string, string> = {
  replenishment: '补货预测',
  lbs_hotsell: '周边热卖',
  promo_match: '促销匹配',
  cross_sell: '关联推荐',
}

function buildSkillContext(skill: string, result: unknown): string {
  if (skill === 'replenishment') {
    const r = result as ReplenishmentResult
    const lines = r.items.map(item =>
      `  • ${item.sku_name}：${item.urgency === 'urgent' ? '紧急' : item.urgency === 'suggested' ? '建议' : '可选'}，已${item.days_since_last}天未订（均期${item.avg_cycle_days}天），建议补货${item.suggested_qty}箱`
    )
    return `补货预测结果：
- 紧急：${r.urgent_count} 个商品，建议：${r.suggested_count} 个商品
${lines.join('\n')}`
  }

  if (skill === 'lbs_hotsell') {
    const r = result as LbsHotsellResult
    const lines = r.items.map(item =>
      `  • ${item.sku_name}（${item.brand}）：周边 ${item.nearby_store_count}/${r.nearby_stores_analyzed} 家在售，渗透率 ${Math.round(item.penetration_rate * 100)}%，月均 ${item.avg_monthly_qty} 箱`
    )
    return `周边热卖分析（分析了 ${r.nearby_stores_analyzed} 家3km内门店）：
${r.items.length === 0 ? '本店品类覆盖完整，无明显缺失' : lines.join('\n')}`
  }

  if (skill === 'promo_match') {
    const r = result as PromoMatchResult
    const lines = r.items.map(item =>
      `  • ${item.promo_name}${item.is_expiring_soon ? `（${item.expiry_days}天后到期！）` : ''}：${item.description}，${item.gap_qty > 0 ? `还需加购 ${item.gap_qty} 箱` : '已满足条件'}`
    )
    return `促销匹配结果（${r.expiring_soon_count} 个即将到期）：
${lines.join('\n')}`
  }

  if (skill === 'cross_sell') {
    const r = result as CrossSellResult
    const lines = r.items.map(item =>
      `  • ${item.sku_name}（${item.brand}）：置信度 ${item.confidence}%，提升度 ${item.lift.toFixed(1)}x，${item.reason}`
    )
    return `关联推荐结果：
${lines.join('\n')}`
  }

  return ''
}

export const skillChatRouter = Router()

skillChatRouter.post('/', async (req, res) => {
  const { store_id, skill, messages = [] } = req.body as {
    store_id: string
    skill: string
    messages: Anthropic.MessageParam[]
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const ctx = getDataContext()
    const store = getStoreById(store_id)
    if (!store) {
      send('error', { message: `Store ${store_id} not found` })
      res.end()
      return
    }

    let result: unknown
    if (skill === 'replenishment') result = runReplenishment(store_id, ctx)
    else if (skill === 'lbs_hotsell') result = runLbsHotsell(store_id, ctx)
    else if (skill === 'promo_match') result = runPromoMatch(store_id, ctx)
    else if (skill === 'cross_sell') result = runCrossSell(store_id, ctx)
    else {
      send('error', { message: `Unknown skill: ${skill}` })
      res.end()
      return
    }

    const skillLabel = SKILL_LABELS[skill] ?? skill
    const skillContext = buildSkillContext(skill, result)

    const systemPrompt = `你是一位快消品销售顾问，正在解答业务员关于门店「${store.name}」的${skillLabel}分析结果的问题。

${skillContext}

请根据上述数据，用简洁专业的中文回答问题。语气像有经验的同事，不使用Markdown格式，每次回复控制在150字以内。`

    const stream = client.messages.stream({
      model: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        send('chat_chunk', { text: event.delta.text })
      }
    }

    const finalMsg = await stream.finalMessage()
    const updatedMessages: Anthropic.MessageParam[] = [
      ...messages,
      { role: 'assistant', content: finalMsg.content },
    ]

    send('conversation_update', { messages: updatedMessages })
    send('chat_done', {})
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    send('error', { message })
  }

  res.end()
})
