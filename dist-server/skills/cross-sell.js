export function runCrossSell(storeId, ctx) {
    const storeProfiles = ctx.storeSkuProfiles.get(storeId) ?? [];
    const storeSkuSet = new Set(storeProfiles.map(p => p.sku_id));
    const items = [];
    for (const profile of storeProfiles) {
        const associations = ctx.coOccurrenceMatrix.get(profile.sku_id);
        if (!associations)
            continue;
        for (const [targetSku, coCount] of associations.entries()) {
            if (storeSkuSet.has(targetSku))
                continue; // Already carries this
            const product = ctx.productMap.get(targetSku);
            if (!product)
                continue;
            const triggerCount = ctx.skuOrderCount.get(profile.sku_id) ?? 1;
            const targetCount = ctx.skuOrderCount.get(targetSku) ?? 1;
            const confidence = coCount / triggerCount;
            const expectedRandom = targetCount / ctx.totalOrders;
            const lift = expectedRandom > 0 ? confidence / expectedRandom : 1;
            // Only include meaningful associations
            if (confidence < 0.4 || lift < 1.0)
                continue;
            // Check if we already have this target SKU from another trigger
            const existing = items.find(i => i.sku_id === targetSku);
            if (existing) {
                if (confidence > existing.confidence) {
                    existing.confidence = Math.round(confidence * 100);
                    existing.lift = Math.round(lift * 10) / 10;
                    if (!existing.trigger_skus.includes(profile.sku_id)) {
                        existing.trigger_skus.push(profile.sku_id);
                    }
                }
                continue;
            }
            const triggerProduct = ctx.productMap.get(profile.sku_id);
            const reason = `购买${triggerProduct?.name ?? profile.sku_id}的门店中，${Math.round(confidence * 100)}%同时订购此商品`;
            items.push({
                sku_id: targetSku,
                sku_name: product.name,
                brand: product.brand,
                confidence: Math.round(confidence * 100),
                lift: Math.round(lift * 10) / 10,
                trigger_skus: [profile.sku_id],
                reason,
            });
        }
    }
    items.sort((a, b) => b.confidence - a.confidence);
    return { items: items.slice(0, 3) };
}
