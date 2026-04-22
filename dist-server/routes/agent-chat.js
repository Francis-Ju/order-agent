import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDataContext, getStoreById } from '../data/loader.js';
import { runReplenishment } from '../skills/replenishment.js';
import { runLbsHotsell } from '../skills/lbs-hotsell.js';
import { runPromoMatch } from '../skills/promo-match.js';
import { runCrossSell } from '../skills/cross-sell.js';
const client = new Anthropic();
function buildFullContext(replenishment, lbs, promo, crossSell) {
    const reprLines = replenishment.items.map(i => `  · ${i.sku_name}：${i.urgency === 'urgent' ? '紧急' : '建议'}，${i.days_since_last}天未订（均期${i.avg_cycle_days}天），建议补${i.suggested_qty}箱`);
    const lbsLines = lbs.items.length === 0
        ? ['  品类覆盖完整，无明显缺失']
        : lbs.items.map(i => `  · ${i.sku_name}（${i.brand}）：周边${i.nearby_store_count}/${lbs.nearby_stores_analyzed}家在售，月均${i.avg_monthly_qty}箱`);
    const promoLines = promo.items.map(i => `  · ${i.promo_name}${i.is_expiring_soon ? `（${i.expiry_days}天后到期）` : ''}：${i.description}，${i.gap_qty > 0 ? `还需加购${i.gap_qty}箱` : '已满足条件'}`);
    const crossLines = crossSell.items.map(i => `  · ${i.sku_name}（${i.brand}）：置信度${i.confidence}%，${i.reason}`);
    return `【补货预测】紧急${replenishment.urgent_count}个，建议${replenishment.suggested_count}个
${reprLines.join('\n')}

【周边热卖】分析了${lbs.nearby_stores_analyzed}家门店
${lbsLines.join('\n')}

【促销匹配】共${promo.items.length}个促销，${promo.expiring_soon_count}个即将到期
${promoLines.join('\n')}

【关联推荐】
${crossLines.join('\n')}`;
}
export const agentChatRouter = Router();
agentChatRouter.post('/', async (req, res) => {
    const { store_id, messages = [] } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    try {
        const ctx = getDataContext();
        const store = getStoreById(store_id);
        if (!store) {
            send('error', { message: `Store ${store_id} not found` });
            res.end();
            return;
        }
        const replenishment = runReplenishment(store_id, ctx);
        const lbs = runLbsHotsell(store_id, ctx);
        const promo = runPromoMatch(store_id, ctx);
        const crossSell = runCrossSell(store_id, ctx);
        const today = new Date();
        const daysSinceVisit = Math.floor((today.getTime() - new Date(store.last_visit_date).getTime()) / 86400000);
        const systemPrompt = `你是一位资深快消品销售顾问，已完成对门店「${store.name}」的全面分析。

门店信息：${store.type}，${store.store_grade}级，月营收约${(store.monthly_revenue / 10000).toFixed(1)}万元，已${daysSinceVisit}天未拜访。

分析结果：
${buildFullContext(replenishment, lbs, promo, crossSell)}

请根据以上数据回答业务员的问题。语气像经验丰富的同事，简洁专业，不使用Markdown格式，每次控制在200字以内。`;
        const stream = client.messages.stream({
            model: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'claude-sonnet-4-6',
            max_tokens: 512,
            system: systemPrompt,
            messages,
        });
        for await (const event of stream) {
            if (event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta') {
                send('chat_chunk', { text: event.delta.text });
            }
        }
        const finalMsg = await stream.finalMessage();
        const updated = [
            ...messages,
            { role: 'assistant', content: finalMsg.content },
        ];
        send('conversation_update', { messages: updated });
        send('chat_done', {});
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send('error', { message });
    }
    res.end();
});
