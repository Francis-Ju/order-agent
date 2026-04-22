import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { getDataContext, getStoreById } from '../data/loader.js'
import { runReplenishment } from '../skills/replenishment.js'
import { runLbsHotsell } from '../skills/lbs-hotsell.js'
import { runPromoMatch } from '../skills/promo-match.js'
import { runCrossSell } from '../skills/cross-sell.js'

const client = new Anthropic()

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'run_replenishment',
    description: '分析门店补货需求，基于历史订单周期预测哪些商品即将缺货，返回建议补货列表',
    input_schema: {
      type: 'object' as const,
      properties: { store_id: { type: 'string', description: '门店ID' } },
      required: ['store_id'],
    },
  },
  {
    name: 'run_lbs_hotsell',
    description: '分析周边门店热销商品，找出该门店未在售但周边门店普遍在售的商品机会',
    input_schema: {
      type: 'object' as const,
      properties: { store_id: { type: 'string', description: '门店ID' } },
      required: ['store_id'],
    },
  },
  {
    name: 'run_promo_match',
    description: '匹配当前可参与的促销活动，找出门店可以利用的促销机会和即将到期的优惠',
    input_schema: {
      type: 'object' as const,
      properties: { store_id: { type: 'string', description: '门店ID' } },
      required: ['store_id'],
    },
  },
  {
    name: 'run_cross_sell',
    description: '基于关联规则分析，推荐门店可以增加的关联商品以提升客单价',
    input_schema: {
      type: 'object' as const,
      properties: { store_id: { type: 'string', description: '门店ID' } },
      required: ['store_id'],
    },
  },
]

async function executeTool(
  toolName: string,
  storeId: string,
  ctx: ReturnType<typeof getDataContext>
): Promise<unknown> {
  switch (toolName) {
    case 'run_replenishment': return runReplenishment(storeId, ctx)
    case 'run_lbs_hotsell': return runLbsHotsell(storeId, ctx)
    case 'run_promo_match': return runPromoMatch(storeId, ctx)
    case 'run_cross_sell': return runCrossSell(storeId, ctx)
    default: throw new Error(`Unknown tool: ${toolName}`)
  }
}

export const chatRouter = Router()

chatRouter.post('/', async (req, res) => {
  const { store_id, messages = [] } = req.body as {
    store_id: string
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

    const today = new Date()
    const daysSinceVisit = Math.floor(
      (today.getTime() - new Date(store.last_visit_date).getTime()) / 86400000
    )

    const systemPrompt = `你是一位资深快消品销售顾问AI助手，正在协助业务员拜访门店「${store.name}」。

门店信息：
- 门店类型：${store.type}
- 等级：${store.store_grade}级
- 月营收：约${(store.monthly_revenue / 10000).toFixed(1)}万元
- 已${daysSinceVisit}天未拜访

你的职责：
1. 进入门店时，先简短问候，然后立即主动调用所有分析工具全面了解门店情况
2. 工具调用完成后，用自然对话方式综合呈现发现，重点突出需要立即行动的事项
3. 回答业务员追问时，可再次调用相关工具获取更多信息
4. 帮助生成和调整建议订单

请用简洁专业的中文回复，语气像经验丰富的同事在旁边给建议。不要使用Markdown格式（不要用##、**、-等符号）。每次回复控制在200字以内。`

    const conversation: Anthropic.MessageParam[] = messages as Anthropic.MessageParam[]
    let maxIterations = 5

    while (maxIterations-- > 0) {
      const stream = client.messages.stream({
        model: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: conversation,
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
      conversation.push({ role: 'assistant', content: finalMsg.content })

      if (finalMsg.stop_reason === 'end_turn' || finalMsg.stop_reason === 'max_tokens') {
        break
      }

      if (finalMsg.stop_reason === 'tool_use') {
        const toolBlocks = finalMsg.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
        )

        const toolResults = await Promise.all(
          toolBlocks.map(async (block) => {
            const skillName = block.name.replace('run_', '')
            send('tool_call_start', { skill: skillName })

            const input = block.input as { store_id?: string }
            const result = await executeTool(block.name, input.store_id ?? store_id, ctx)
            send('tool_call_result', { skill: skillName, data: result })

            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: JSON.stringify(result),
            }
          })
        )

        conversation.push({ role: 'user', content: toolResults })
      }
    }

    send('conversation_update', { messages: conversation })
    send('chat_done', {})
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    send('error', { message })
  }

  res.end()
})
