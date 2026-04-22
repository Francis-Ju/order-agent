import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function daysAgo(days: number): string {
  const d = new Date('2026-04-20')
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

// ─── PRODUCTS (32 SKUs) ────────────────────────────────────────────────────

const products = [
  // 食用油 (9)
  { sku_id: 'P001', name: '金龙鱼 1:1:1调和油 5L', category: '食用油', brand: '金龙鱼', spec: '5L/桶', unit: '箱', unit_price: 89.9 },
  { sku_id: 'P002', name: '金龙鱼 精制菜籽油 5L', category: '食用油', brand: '金龙鱼', spec: '5L/桶', unit: '箱', unit_price: 79.9 },
  { sku_id: 'P003', name: '欧丽薇兰 特级初榨橄榄油 750ml', category: '食用油', brand: '欧丽薇兰', spec: '750ml/瓶', unit: '箱', unit_price: 78.0 },
  { sku_id: 'P004', name: '胡姬花 古法花生油 5L', category: '食用油', brand: '胡姬花', spec: '5L/桶', unit: '箱', unit_price: 109.0 },
  { sku_id: 'P012', name: '欧丽薇兰 纯正橄榄油 500ml', category: '食用油', brand: '欧丽薇兰', spec: '500ml/瓶', unit: '箱', unit_price: 49.9 },
  { sku_id: 'P013', name: '金龙鱼 1:1:1调和油 1.8L', category: '食用油', brand: '金龙鱼', spec: '1.8L/桶', unit: '箱', unit_price: 38.9 },
  { sku_id: 'P014', name: '金龙鱼 零反式脂肪调和油 5L', category: '食用油', brand: '金龙鱼', spec: '5L/桶', unit: '箱', unit_price: 98.9 },
  { sku_id: 'P015', name: '金龙鱼 稻米油 5L', category: '食用油', brand: '金龙鱼', spec: '5L/桶', unit: '箱', unit_price: 115.0 },
  { sku_id: 'P016', name: '福临门 葵花籽油 5L', category: '食用油', brand: '福临门', spec: '5L/桶', unit: '箱', unit_price: 75.9 },
  // 米面 (7)
  { sku_id: 'P005', name: '金龙鱼 东北香米 10kg', category: '米面', brand: '金龙鱼', spec: '10kg/袋', unit: '袋', unit_price: 69.0 },
  { sku_id: 'P006', name: '香满园 泰粮大米 5kg', category: '米面', brand: '香满园', spec: '5kg/袋', unit: '袋', unit_price: 39.9 },
  { sku_id: 'P007', name: '香满园 水饺粉 2kg', category: '米面', brand: '香满园', spec: '2kg/袋', unit: '袋', unit_price: 19.9 },
  { sku_id: 'P011', name: '金龙鱼 低筋面粉 2.5kg', category: '米面', brand: '金龙鱼', spec: '2.5kg/袋', unit: '袋', unit_price: 15.9 },
  { sku_id: 'P017', name: '金龙鱼 挂面 1.5kg', category: '米面', brand: '金龙鱼', spec: '1.5kg/袋', unit: '袋', unit_price: 12.9 },
  { sku_id: 'P018', name: '金龙鱼 丝苗米 5kg', category: '米面', brand: '金龙鱼', spec: '5kg/袋', unit: '袋', unit_price: 45.9 },
  { sku_id: 'P019', name: '益海嘉里 有机五常大米 5kg', category: '米面', brand: '益海嘉里', spec: '5kg/袋', unit: '袋', unit_price: 89.9 },
  // 调味品 (9)
  { sku_id: 'P008', name: '海天 老抽酱油 500ml', category: '调味品', brand: '海天', spec: '500ml/瓶', unit: '箱', unit_price: 15.9 },
  { sku_id: 'P009', name: '外婆菜 香辣下饭菜 80g', category: '调味品', brand: '外婆菜', spec: '80g/袋', unit: '箱', unit_price: 5.9 },
  { sku_id: 'P010', name: '老干妈 风味豆豉 280g', category: '调味品', brand: '老干妈', spec: '280g/瓶', unit: '箱', unit_price: 12.5 },
  { sku_id: 'P020', name: '太太乐 鸡精 200g', category: '调味品', brand: '太太乐', spec: '200g/袋', unit: '箱', unit_price: 13.9 },
  { sku_id: 'P021', name: '加加 味极鲜酱油 500ml', category: '调味品', brand: '加加', spec: '500ml/瓶', unit: '箱', unit_price: 11.9 },
  { sku_id: 'P022', name: '千禾 0添加酱油 500ml', category: '调味品', brand: '千禾', spec: '500ml/瓶', unit: '箱', unit_price: 26.9 },
  { sku_id: 'P023', name: '金龙鱼 芝麻香油 250ml', category: '调味品', brand: '金龙鱼', spec: '250ml/瓶', unit: '箱', unit_price: 19.9 },
  { sku_id: 'P024', name: '李锦记 蚝油 500ml', category: '调味品', brand: '李锦记', spec: '500ml/瓶', unit: '箱', unit_price: 18.9 },
  { sku_id: 'P025', name: '恒顺 米醋 500ml', category: '调味品', brand: '恒顺', spec: '500ml/瓶', unit: '箱', unit_price: 9.9 },
  // 休食 (4)
  { sku_id: 'P026', name: '花椒山 花椒油 250ml', category: '调味品', brand: '花椒山', spec: '250ml/瓶', unit: '箱', unit_price: 29.9 },
  { sku_id: 'P027', name: '三只松鼠 混合坚果 500g', category: '休食', brand: '三只松鼠', spec: '500g/袋', unit: '箱', unit_price: 49.9 },
  { sku_id: 'P028', name: '良品铺子 坚果礼盒 600g', category: '休食', brand: '良品铺子', spec: '600g/盒', unit: '箱', unit_price: 89.9 },
  { sku_id: 'P029', name: '奥利奥 原味饼干 300g', category: '休食', brand: '奥利奥', spec: '300g/袋', unit: '箱', unit_price: 16.9 },
  { sku_id: 'P030', name: '卡夫 花生夹心饼干 250g', category: '休食', brand: '卡夫', spec: '250g/袋', unit: '箱', unit_price: 12.9 },
  // 日化 (2)
  { sku_id: 'P031', name: '立白 天然洗洁精 1.5kg', category: '日化', brand: '立白', spec: '1.5kg/瓶', unit: '箱', unit_price: 19.9 },
  { sku_id: 'P032', name: '蓝月亮 洗手液 300ml×3', category: '日化', brand: '蓝月亮', spec: '300ml×3/组', unit: '箱', unit_price: 39.9 },
]

// ─── STORES (8) ────────────────────────────────────────────────────────────

const stores = [
  {
    store_id: 'S001',
    name: '华联超市(望京店)',
    address: '北京市朝阳区望京街道望京西路43号',
    lat: 39.9942, lng: 116.4744,
    type: '中型超市',
    owner_name: '张明', phone: '13901234567',
    store_grade: 'A',
    last_visit_date: '2026-04-15',
    monthly_revenue: 45000,
  },
  {
    store_id: 'S002',
    name: '永辉mini(望京北)',
    address: '北京市朝阳区望京北路12号',
    lat: 39.9988, lng: 116.4712,
    type: '连锁便利店',
    owner_name: '王芳', phone: '13812345678',
    store_grade: 'B',
    last_visit_date: '2026-04-14',
    monthly_revenue: 18000,
  },
  {
    store_id: 'S003',
    name: '物美大卖场(花家地)',
    address: '北京市朝阳区花家地南里15号',
    lat: 39.9901, lng: 116.4801,
    type: '大型超市',
    owner_name: '李建国', phone: '13698765432',
    store_grade: 'A',
    last_visit_date: '2026-04-16',
    monthly_revenue: 85000,
  },
  {
    store_id: 'S004',
    name: '每日鲜社区店(望京东)',
    address: '北京市朝阳区望京东园408楼底商',
    lat: 39.9934, lng: 116.4823,
    type: '社区店',
    owner_name: '赵小燕', phone: '13701234501',
    store_grade: 'B',
    last_visit_date: '2026-04-13',
    monthly_revenue: 15000,
  },
  {
    store_id: 'S005',
    name: '兴达粮油批发(阜通)',
    address: '北京市朝阳区阜通西大街6号',
    lat: 39.9868, lng: 116.4756,
    type: '批发部',
    owner_name: '孙大勇', phone: '13512345678',
    store_grade: 'A',
    last_visit_date: '2026-04-12',
    monthly_revenue: 120000,
  },
  {
    store_id: 'S006',
    name: '7-Eleven(望京SOHO店)',
    address: '北京市朝阳区望京中环南路2号望京SOHO',
    lat: 39.9912, lng: 116.4765,
    type: '连锁便利店',
    owner_name: '周丽', phone: '13311234567',
    store_grade: 'C',
    last_visit_date: '2026-04-10',
    monthly_revenue: 22000,
  },
  {
    store_id: 'S007',
    name: '盒马NB(酒仙桥店)',
    address: '北京市朝阳区酒仙桥北路9号',
    lat: 39.9790, lng: 116.4950,
    type: '新零售',
    owner_name: '陈志强', phone: '13011234567',
    store_grade: 'A',
    last_visit_date: '2026-04-17',
    monthly_revenue: 68000,
  },
  {
    store_id: 'S008',
    name: '京客隆(来广营店)',
    address: '北京市朝阳区来广营西路62号',
    lat: 40.0120, lng: 116.4680,
    type: '大型超市',
    owner_name: '王经理', phone: '10012345678',
    store_grade: 'A',
    last_visit_date: '2026-04-15',
    monthly_revenue: 95000,
  },
]

// ─── PROMOTIONS (10) ───────────────────────────────────────────────────────

const promotions = [
  {
    promo_id: 'PROMO001',
    name: '外婆菜 本月买十送一',
    type: '买赠',
    sku_ids: ['P009'],
    start_date: '2026-04-01',
    end_date: '2026-04-23',
    threshold: 10,
    reward: '赠1箱同款外婆菜',
    description: '外婆菜香辣下饭菜购满10箱赠1箱，活动3天后到期',
  },
  {
    promo_id: 'PROMO002',
    name: '金龙鱼调和油 满3箱减30元',
    type: '满减',
    sku_ids: ['P001'],
    start_date: '2026-04-15',
    end_date: '2026-05-15',
    threshold: 3,
    reward: '减30元',
    description: '金龙鱼调和油5L，满3箱立减30元',
  },
  {
    promo_id: 'PROMO003',
    name: '欧丽薇兰橄榄油 搭赠礼品袋',
    type: '搭赠',
    sku_ids: ['P003', 'P012'],
    start_date: '2026-04-10',
    end_date: '2026-05-10',
    threshold: 5,
    reward: '赠精美礼品袋1个',
    description: '欧丽薇兰橄榄油满5箱赠礼品袋，适合节日礼品装',
  },
  {
    promo_id: 'PROMO004',
    name: '香满园大米 限时9.5折',
    type: '折扣',
    sku_ids: ['P006'],
    start_date: '2026-04-01',
    end_date: '2026-04-22',
    threshold: 8,
    reward: '9.5折优惠',
    description: '香满园泰粮大米满8袋享9.5折，2天后到期',
  },
  {
    promo_id: 'PROMO005',
    name: '胡姬花花生油 新品买赠',
    type: '买赠',
    sku_ids: ['P004'],
    start_date: '2026-04-18',
    end_date: '2026-05-31',
    threshold: 3,
    reward: '赠胡姬花500ml试用装×1',
    description: '新品推广价，满3箱赠胡姬花500ml试用装',
  },
  {
    promo_id: 'PROMO006',
    name: '零反式脂肪油 上市特惠',
    type: '折扣',
    sku_ids: ['P014'],
    start_date: '2026-04-15',
    end_date: '2026-05-01',
    threshold: 3,
    reward: '9折优惠',
    description: '金龙鱼零反式脂肪调和油新品上市，满3箱享9折',
  },
  {
    promo_id: 'PROMO007',
    name: '千禾0添加酱油 品鉴特惠',
    type: '买赠',
    sku_ids: ['P022'],
    start_date: '2026-04-10',
    end_date: '2026-05-05',
    threshold: 6,
    reward: '赠千禾酱油200ml×1',
    description: '千禾0添加酱油满6瓶赠200ml品鉴装',
  },
  {
    promo_id: 'PROMO008',
    name: '金龙鱼挂面 满6袋减20元',
    type: '满减',
    sku_ids: ['P017'],
    start_date: '2026-04-15',
    end_date: '2026-05-20',
    threshold: 6,
    reward: '减20元',
    description: '金龙鱼挂面满6袋减20元，夏日凉面季特惠',
  },
  {
    promo_id: 'PROMO009',
    name: '稻米油高端新品推广',
    type: '折扣',
    sku_ids: ['P015'],
    start_date: '2026-04-10',
    end_date: '2026-04-22',
    threshold: 3,
    reward: '8.8折优惠',
    description: '金龙鱼稻米油新品上市，首批满3箱享8.8折，2天后到期',
  },
  {
    promo_id: 'PROMO010',
    name: '老干妈 量贩装特价',
    type: '量贩装特价',
    sku_ids: ['P010'],
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    threshold: 12,
    reward: '9折优惠',
    description: '老干妈风味豆豉满12箱享9折，月底清库存特惠',
  },
]

// ─── ORDERS ────────────────────────────────────────────────────────────────

function buildOrders() {
  const orders: any[] = []
  let orderId = 1

  const makeOrder = (storeId: string, daysBack: number, items: Array<{ sku_id: string; qty: number }>) => {
    const date = daysAgo(daysBack)
    const orderItems = items.map(i => {
      const p = products.find(p => p.sku_id === i.sku_id)!
      return {
        sku_id: i.sku_id,
        quantity: i.qty,
        unit_price: p.unit_price,
        amount: Math.round(p.unit_price * i.qty * 100) / 100,
      }
    })
    orders.push({
      order_id: `ORD-${String(orderId++).padStart(4, '0')}`,
      store_id: storeId,
      order_date: date,
      items: orderItems,
      total_amount: Math.round(orderItems.reduce((s, i) => s + i.amount, 0) * 100) / 100,
    })
  }

  // ── S001 华联超市(望京店) ──────────────────────────────────────────────
  // Story: 紧急断货 + P009三重推荐（LBS+促销+关联推荐）
  // P001: every 14 days, last=18d → urgency 1.29 URGENT
  // P008: every 28 days, last=32d → urgency 1.14 SUGGESTED
  // P018: every 28 days, last=32d → urgency 1.14 SUGGESTED
  // P024 in 5 orders → triggers P024→P023 cross-sell (conf ~0.60)
  // P017+P025 together in 4 orders → feeds S008 cross-sell pool
  makeOrder('S001', 18, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P005', qty: 8 }, { sku_id: 'P018', qty: 4 }, { sku_id: 'P024', qty: 3 }])
  makeOrder('S001', 32, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P017', qty: 5 }, { sku_id: 'P025', qty: 4 }])
  makeOrder('S001', 46, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P005', qty: 7 }, { sku_id: 'P016', qty: 4 }, { sku_id: 'P024', qty: 3 }, { sku_id: 'P017', qty: 4 }, { sku_id: 'P025', qty: 3 }])
  makeOrder('S001', 60, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P006', qty: 5 }, { sku_id: 'P020', qty: 4 }, { sku_id: 'P017', qty: 3 }, { sku_id: 'P025', qty: 3 }])
  makeOrder('S001', 74, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P004', qty: 3 }, { sku_id: 'P005', qty: 6 }, { sku_id: 'P021', qty: 4 }, { sku_id: 'P024', qty: 2 }])
  makeOrder('S001', 88, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P002', qty: 4 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P017', qty: 4 }, { sku_id: 'P025', qty: 4 }, { sku_id: 'P026', qty: 3 }])
  makeOrder('S001', 102, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P005', qty: 8 }, { sku_id: 'P010', qty: 3 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S001', 116, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P011', qty: 4 }, { sku_id: 'P020', qty: 4 }, { sku_id: 'P024', qty: 3 }])
  makeOrder('S001', 130, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P005', qty: 6 }, { sku_id: 'P018', qty: 3 }, { sku_id: 'P017', qty: 3 }, { sku_id: 'P025', qty: 3 }, { sku_id: 'P026', qty: 2 }])
  makeOrder('S001', 144, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P021', qty: 4 }, { sku_id: 'P016', qty: 4 }])
  makeOrder('S001', 158, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P004', qty: 3 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P029', qty: 3 }])
  makeOrder('S001', 172, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P005', qty: 8 }, { sku_id: 'P010', qty: 3 }, { sku_id: 'P014', qty: 2 }])
  makeOrder('S001', 186, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P006', qty: 5 }, { sku_id: 'P018', qty: 4 }, { sku_id: 'P015', qty: 2 }, { sku_id: 'P019', qty: 2 }])
  makeOrder('S001', 200, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P002', qty: 4 }, { sku_id: 'P014', qty: 2 }])
  makeOrder('S001', 214, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P005', qty: 7 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P016', qty: 3 }, { sku_id: 'P019', qty: 2 }])
  makeOrder('S001', 228, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P024', qty: 3 }, { sku_id: 'P017', qty: 4 }, { sku_id: 'P025', qty: 3 }, { sku_id: 'P026', qty: 3 }])

  // ── S002 永辉mini(望京北) ──────────────────────────────────────────────
  // Story: 临门一脚促销冲刺
  // PROMO001(P009, threshold=10, 3天): avg P009 = 9/order → gap=1
  // PROMO004(P006, threshold=8, 2天): avg P006 = 7/order → gap=1
  // P001+P009 co-occur → contributes to S001 cross-sell pool
  makeOrder('S002', 7,  [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P010', qty: 4 }])
  makeOrder('S002', 14, [{ sku_id: 'P009', qty: 10 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P013', qty: 4 }, { sku_id: 'P027', qty: 2 }])
  makeOrder('S002', 21, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P008', qty: 5 }])
  makeOrder('S002', 28, [{ sku_id: 'P009', qty: 8 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S002', 35, [{ sku_id: 'P001', qty: 2 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P013', qty: 5 }])
  makeOrder('S002', 42, [{ sku_id: 'P009', qty: 10 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P008', qty: 4 }, { sku_id: 'P020', qty: 3 }])
  makeOrder('S002', 49, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S002', 56, [{ sku_id: 'P009', qty: 8 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P013', qty: 4 }, { sku_id: 'P029', qty: 4 }])
  makeOrder('S002', 63, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P010', qty: 4 }])
  makeOrder('S002', 70, [{ sku_id: 'P009', qty: 10 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P020', qty: 3 }])
  makeOrder('S002', 77, [{ sku_id: 'P001', qty: 2 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P013', qty: 5 }])
  makeOrder('S002', 84, [{ sku_id: 'P009', qty: 8 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P010', qty: 3 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S002', 91, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P013', qty: 4 }])
  makeOrder('S002', 98, [{ sku_id: 'P009', qty: 10 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P008', qty: 4 }, { sku_id: 'P027', qty: 2 }])
  makeOrder('S002', 105, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P010', qty: 3 }])
  makeOrder('S002', 112, [{ sku_id: 'P009', qty: 8 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P013', qty: 5 }, { sku_id: 'P020', qty: 4 }])
  makeOrder('S002', 119, [{ sku_id: 'P001', qty: 2 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P008', qty: 5 }])
  makeOrder('S002', 126, [{ sku_id: 'P009', qty: 10 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P029', qty: 3 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S002', 133, [{ sku_id: 'P001', qty: 3 }, { sku_id: 'P009', qty: 9 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P013', qty: 4 }])
  makeOrder('S002', 140, [{ sku_id: 'P009', qty: 8 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P031', qty: 3 }])

  // ── S003 物美大卖场(花家地) ─────────────────────────────────────────────
  // Story: 新品引进机会（P014/P015/P019/P022/P023出现在LBS）
  // P024+P023 co-occur in S003 orders → feeds cross-sell pool
  // P017+P025+P026 together → feeds S008 cross-sell pool
  makeOrder('S003', 12, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }])
  makeOrder('S003', 26, [{ sku_id: 'P002', qty: 4 }, { sku_id: 'P005', qty: 6 }, { sku_id: 'P017', qty: 5 }, { sku_id: 'P025', qty: 4 }, { sku_id: 'P026', qty: 3 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S003', 40, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P006', qty: 7 }, { sku_id: 'P010', qty: 5 }, { sku_id: 'P024', qty: 3 }, { sku_id: 'P023', qty: 3 }])
  makeOrder('S003', 54, [{ sku_id: 'P004', qty: 4 }, { sku_id: 'P005', qty: 8 }, { sku_id: 'P017', qty: 4 }, { sku_id: 'P025', qty: 3 }, { sku_id: 'P026', qty: 3 }, { sku_id: 'P028', qty: 2 }])
  makeOrder('S003', 68, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P002', qty: 3 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }])
  makeOrder('S003', 82, [{ sku_id: 'P003', qty: 4 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P016', qty: 5 }, { sku_id: 'P017', qty: 5 }, { sku_id: 'P025', qty: 4 }, { sku_id: 'P026', qty: 3 }])
  makeOrder('S003', 96, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P005', qty: 7 }, { sku_id: 'P020', qty: 5 }, { sku_id: 'P024', qty: 3 }, { sku_id: 'P023', qty: 3 }])
  makeOrder('S003', 110, [{ sku_id: 'P002', qty: 4 }, { sku_id: 'P007', qty: 6 }, { sku_id: 'P021', qty: 5 }, { sku_id: 'P027', qty: 3 }, { sku_id: 'P029', qty: 4 }])
  makeOrder('S003', 124, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P006', qty: 8 }, { sku_id: 'P008', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }])
  makeOrder('S003', 138, [{ sku_id: 'P004', qty: 3 }, { sku_id: 'P005', qty: 6 }, { sku_id: 'P017', qty: 5 }, { sku_id: 'P025', qty: 4 }, { sku_id: 'P026', qty: 3 }])
  makeOrder('S003', 152, [{ sku_id: 'P001', qty: 5 }, { sku_id: 'P011', qty: 5 }, { sku_id: 'P016', qty: 4 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S003', 166, [{ sku_id: 'P001', qty: 4 }, { sku_id: 'P006', qty: 6 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P024', qty: 3 }, { sku_id: 'P023', qty: 3 }])
  makeOrder('S003', 180, [{ sku_id: 'P002', qty: 4 }, { sku_id: 'P007', qty: 5 }, { sku_id: 'P017', qty: 4 }, { sku_id: 'P025', qty: 3 }, { sku_id: 'P026', qty: 3 }])
  makeOrder('S003', 194, [{ sku_id: 'P001', qty: 6 }, { sku_id: 'P018', qty: 5 }, { sku_id: 'P008', qty: 6 }, { sku_id: 'P032', qty: 4 }])

  // ── S004 每日鲜社区店(望京东) ──────────────────────────────────────────
  // Story: 高频小单快跑，3个高频SKU同时进入补货窗口
  // P009: 7-day cycle, last=9d → urgency 1.29 URGENT
  // P013: 10-day cycle, last=11d → urgency 1.10 SUGGESTED
  // P006: 14-day cycle, last=15d → urgency 1.07 SUGGESTED
  // P001+P009 co-occur → contributes to cross-sell pool
  // P010+P009 co-occur → contributes to cross-sell pool
  makeOrder('S004', 9,  [{ sku_id: 'P009', qty: 6 }, { sku_id: 'P013', qty: 3 }])
  makeOrder('S004', 11, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P027', qty: 2 }])
  makeOrder('S004', 15, [{ sku_id: 'P006', qty: 5 }, { sku_id: 'P009', qty: 6 }, { sku_id: 'P010', qty: 3 }])
  makeOrder('S004', 16, [{ sku_id: 'P001', qty: 2 }, { sku_id: 'P009', qty: 7 }])
  makeOrder('S004', 21, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P006', qty: 4 }])
  makeOrder('S004', 23, [{ sku_id: 'P009', qty: 5 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P008', qty: 3 }])
  makeOrder('S004', 25, [{ sku_id: 'P006', qty: 5 }, { sku_id: 'P013', qty: 3 }])
  makeOrder('S004', 30, [{ sku_id: 'P009', qty: 6 }, { sku_id: 'P001', qty: 2 }, { sku_id: 'P020', qty: 3 }])
  makeOrder('S004', 31, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P006', qty: 5 }])
  makeOrder('S004', 37, [{ sku_id: 'P009', qty: 7 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P017', qty: 3 }])
  makeOrder('S004', 39, [{ sku_id: 'P006', qty: 4 }, { sku_id: 'P013', qty: 3 }])
  makeOrder('S004', 44, [{ sku_id: 'P009', qty: 5 }, { sku_id: 'P001', qty: 2 }, { sku_id: 'P008', qty: 3 }])
  makeOrder('S004', 45, [{ sku_id: 'P013', qty: 5 }, { sku_id: 'P006', qty: 5 }])
  makeOrder('S004', 51, [{ sku_id: 'P009', qty: 6 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P020', qty: 3 }])
  makeOrder('S004', 53, [{ sku_id: 'P006', qty: 5 }, { sku_id: 'P013', qty: 4 }])
  makeOrder('S004', 58, [{ sku_id: 'P009', qty: 7 }, { sku_id: 'P001', qty: 2 }, { sku_id: 'P027', qty: 2 }])
  makeOrder('S004', 59, [{ sku_id: 'P013', qty: 3 }, { sku_id: 'P006', qty: 4 }])
  makeOrder('S004', 65, [{ sku_id: 'P009', qty: 6 }, { sku_id: 'P010', qty: 3 }, { sku_id: 'P008', qty: 3 }])
  makeOrder('S004', 67, [{ sku_id: 'P006', qty: 5 }, { sku_id: 'P013', qty: 4 }])
  makeOrder('S004', 72, [{ sku_id: 'P009', qty: 5 }, { sku_id: 'P001', qty: 2 }, { sku_id: 'P017', qty: 3 }])
  makeOrder('S004', 73, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P006', qty: 5 }])
  makeOrder('S004', 79, [{ sku_id: 'P009', qty: 7 }, { sku_id: 'P010', qty: 4 }, { sku_id: 'P020', qty: 3 }])
  makeOrder('S004', 81, [{ sku_id: 'P006', qty: 5 }, { sku_id: 'P013', qty: 3 }])
  makeOrder('S004', 86, [{ sku_id: 'P009', qty: 6 }, { sku_id: 'P001', qty: 2 }, { sku_id: 'P008', qty: 4 }])

  // ── S005 兴达粮油批发(阜通) ────────────────────────────────────────────
  // Story: 批发大单组合，LBS返回0（批发部已覆盖所有品类）
  // Carries ALL 32 SKUs → no LBS recommendations
  // P001+P009, P024+P023, P017+P025+P026 all co-occur here → critical for cross-sell pool
  makeOrder('S005', 15, [{ sku_id: 'P001', qty: 20 }, { sku_id: 'P002', qty: 15 }, { sku_id: 'P005', qty: 30 }, { sku_id: 'P009', qty: 25 }, { sku_id: 'P010', qty: 15 }, { sku_id: 'P013', qty: 12 }, { sku_id: 'P018', qty: 20 }, { sku_id: 'P021', qty: 10 }, { sku_id: 'P024', qty: 10 }, { sku_id: 'P023', qty: 10 }, { sku_id: 'P029', qty: 15 }, { sku_id: 'P031', qty: 10 }])
  makeOrder('S005', 30, [{ sku_id: 'P001', qty: 18 }, { sku_id: 'P004', qty: 12 }, { sku_id: 'P006', qty: 25 }, { sku_id: 'P009', qty: 22 }, { sku_id: 'P017', qty: 15 }, { sku_id: 'P025', qty: 12 }, { sku_id: 'P026', qty: 10 }])
  makeOrder('S005', 45, [{ sku_id: 'P001', qty: 22 }, { sku_id: 'P003', qty: 10 }, { sku_id: 'P005', qty: 28 }, { sku_id: 'P009', qty: 28 }, { sku_id: 'P010', qty: 18 }, { sku_id: 'P024', qty: 12 }, { sku_id: 'P023', qty: 12 }])
  makeOrder('S005', 60, [{ sku_id: 'P002', qty: 15 }, { sku_id: 'P006', qty: 30 }, { sku_id: 'P008', qty: 20 }, { sku_id: 'P009', qty: 20 }, { sku_id: 'P017', qty: 18 }, { sku_id: 'P025', qty: 15 }, { sku_id: 'P026', qty: 12 }, { sku_id: 'P014', qty: 8 }, { sku_id: 'P015', qty: 6 }])
  makeOrder('S005', 75, [{ sku_id: 'P001', qty: 20 }, { sku_id: 'P004', qty: 10 }, { sku_id: 'P005', qty: 25 }, { sku_id: 'P009', qty: 24 }, { sku_id: 'P020', qty: 20 }, { sku_id: 'P024', qty: 10 }, { sku_id: 'P023', qty: 10 }])
  makeOrder('S005', 90, [{ sku_id: 'P001', qty: 25 }, { sku_id: 'P006', qty: 35 }, { sku_id: 'P010', qty: 20 }, { sku_id: 'P009', qty: 30 }, { sku_id: 'P017', qty: 16 }, { sku_id: 'P025', qty: 12 }, { sku_id: 'P026', qty: 10 }])
  makeOrder('S005', 105, [{ sku_id: 'P002', qty: 18 }, { sku_id: 'P005', qty: 30 }, { sku_id: 'P007', qty: 20 }, { sku_id: 'P009', qty: 25 }, { sku_id: 'P022', qty: 12 }, { sku_id: 'P024', qty: 12 }, { sku_id: 'P023', qty: 12 }])
  makeOrder('S005', 120, [{ sku_id: 'P001', qty: 20 }, { sku_id: 'P003', qty: 8 }, { sku_id: 'P006', qty: 28 }, { sku_id: 'P009', qty: 22 }, { sku_id: 'P016', qty: 15 }, { sku_id: 'P014', qty: 8 }, { sku_id: 'P015', qty: 6 }])
  makeOrder('S005', 135, [{ sku_id: 'P001', qty: 22 }, { sku_id: 'P005', qty: 25 }, { sku_id: 'P010', qty: 18 }, { sku_id: 'P009', qty: 28 }, { sku_id: 'P017', qty: 14 }, { sku_id: 'P025', qty: 12 }, { sku_id: 'P026', qty: 10 }])
  makeOrder('S005', 150, [{ sku_id: 'P004', qty: 15 }, { sku_id: 'P006', qty: 32 }, { sku_id: 'P008', qty: 25 }, { sku_id: 'P009', qty: 26 }, { sku_id: 'P019', qty: 10 }, { sku_id: 'P024', qty: 10 }, { sku_id: 'P023', qty: 10 }])
  makeOrder('S005', 165, [{ sku_id: 'P001', qty: 20 }, { sku_id: 'P002', qty: 15 }, { sku_id: 'P005', qty: 25 }, { sku_id: 'P009', qty: 22 }, { sku_id: 'P012', qty: 8 }, { sku_id: 'P027', qty: 12 }, { sku_id: 'P028', qty: 6 }, { sku_id: 'P030', qty: 10 }, { sku_id: 'P032', qty: 8 }])
  makeOrder('S005', 180, [{ sku_id: 'P001', qty: 18 }, { sku_id: 'P006', qty: 30 }, { sku_id: 'P011', qty: 20 }, { sku_id: 'P009', qty: 25 }, { sku_id: 'P017', qty: 16 }, { sku_id: 'P025', qty: 14 }, { sku_id: 'P026', qty: 12 }])

  // ── S006 7-Eleven(望京SOHO) ────────────────────────────────────────────
  // Story: 品类结构优化 — 只有6个SKU，Agent发现大量品类缺口
  // Carries: P008, P010, P013, P022, P027, P029
  // P013+P006 co-occur in S002,S004 → shows P006 cross-sell for S006
  // P010+P009 co-occur in S002,S004,S005,S008 → shows P009 cross-sell for S006
  makeOrder('S006', 14, [{ sku_id: 'P013', qty: 3 }, { sku_id: 'P027', qty: 3 }, { sku_id: 'P010', qty: 4 }])
  makeOrder('S006', 28, [{ sku_id: 'P008', qty: 4 }, { sku_id: 'P013', qty: 4 }, { sku_id: 'P022', qty: 3 }])
  makeOrder('S006', 42, [{ sku_id: 'P010', qty: 5 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P029', qty: 5 }])
  makeOrder('S006', 56, [{ sku_id: 'P013', qty: 3 }, { sku_id: 'P008', qty: 4 }, { sku_id: 'P022', qty: 4 }])
  makeOrder('S006', 70, [{ sku_id: 'P010', qty: 5 }, { sku_id: 'P027', qty: 3 }, { sku_id: 'P013', qty: 4 }])
  makeOrder('S006', 84, [{ sku_id: 'P008', qty: 5 }, { sku_id: 'P029', qty: 6 }, { sku_id: 'P022', qty: 3 }])
  makeOrder('S006', 98, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P010', qty: 5 }, { sku_id: 'P027', qty: 4 }])
  makeOrder('S006', 112, [{ sku_id: 'P008', qty: 4 }, { sku_id: 'P022', qty: 4 }, { sku_id: 'P029', qty: 5 }])
  makeOrder('S006', 126, [{ sku_id: 'P013', qty: 3 }, { sku_id: 'P027', qty: 3 }, { sku_id: 'P010', qty: 4 }])
  makeOrder('S006', 140, [{ sku_id: 'P008', qty: 5 }, { sku_id: 'P013', qty: 4 }, { sku_id: 'P022', qty: 3 }])
  makeOrder('S006', 154, [{ sku_id: 'P010', qty: 5 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P029', qty: 5 }])
  makeOrder('S006', 168, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P008', qty: 4 }, { sku_id: 'P022', qty: 4 }])
  makeOrder('S006', 182, [{ sku_id: 'P010', qty: 4 }, { sku_id: 'P027', qty: 3 }, { sku_id: 'P013', qty: 3 }])
  makeOrder('S006', 196, [{ sku_id: 'P008', qty: 5 }, { sku_id: 'P029', qty: 5 }, { sku_id: 'P022', qty: 3 }])
  makeOrder('S006', 210, [{ sku_id: 'P013', qty: 4 }, { sku_id: 'P010', qty: 5 }, { sku_id: 'P027', qty: 4 }])
  makeOrder('S006', 224, [{ sku_id: 'P008', qty: 4 }, { sku_id: 'P022', qty: 3 }, { sku_id: 'P029', qty: 5 }])

  // ── S007 盒马NB(酒仙桥) ────────────────────────────────────────────────
  // Story: 高端升级 — 尚未引进P014/P015/P019/P022, LBS+促销双重推荐
  // PROMO009 (P015稻米油, 2天后到期, threshold=3) → gap=3
  // P024+P023 co-occur → contributes to cross-sell pool (S001 sees P024→P023)
  makeOrder('S007', 10, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P001', qty: 5 }, { sku_id: 'P008', qty: 8 }, { sku_id: 'P010', qty: 6 }])
  makeOrder('S007', 20, [{ sku_id: 'P012', qty: 4 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P029', qty: 5 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S007', 30, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P032', qty: 3 }])
  makeOrder('S007', 40, [{ sku_id: 'P012', qty: 4 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S007', 50, [{ sku_id: 'P003', qty: 6 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P029', qty: 5 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S007', 60, [{ sku_id: 'P012', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P028', qty: 3 }, { sku_id: 'P032', qty: 4 }])
  makeOrder('S007', 70, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S007', 80, [{ sku_id: 'P012', qty: 4 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P029', qty: 5 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S007', 90, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P032', qty: 3 }])
  makeOrder('S007', 100, [{ sku_id: 'P012', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S007', 110, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P029', qty: 5 }, { sku_id: 'P032', qty: 3 }])
  makeOrder('S007', 120, [{ sku_id: 'P012', qty: 4 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P028', qty: 3 }, { sku_id: 'P027', qty: 3 }])
  makeOrder('S007', 130, [{ sku_id: 'P003', qty: 6 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P031', qty: 4 }, { sku_id: 'P029', qty: 4 }])
  makeOrder('S007', 140, [{ sku_id: 'P012', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P032', qty: 3 }])
  makeOrder('S007', 150, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P029', qty: 5 }])
  makeOrder('S007', 160, [{ sku_id: 'P012', qty: 4 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P031', qty: 3 }])
  makeOrder('S007', 170, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P024', qty: 5 }, { sku_id: 'P023', qty: 5 }, { sku_id: 'P032', qty: 3 }, { sku_id: 'P029', qty: 4 }])
  makeOrder('S007', 180, [{ sku_id: 'P012', qty: 5 }, { sku_id: 'P024', qty: 4 }, { sku_id: 'P023', qty: 4 }, { sku_id: 'P027', qty: 4 }, { sku_id: 'P028', qty: 2 }, { sku_id: 'P002', qty: 1 }, { sku_id: 'P004', qty: 1 }, { sku_id: 'P005', qty: 1 }, { sku_id: 'P006', qty: 1 }, { sku_id: 'P007', qty: 1 }, { sku_id: 'P009', qty: 1 }, { sku_id: 'P011', qty: 1 }, { sku_id: 'P013', qty: 1 }, { sku_id: 'P016', qty: 1 }, { sku_id: 'P017', qty: 1 }, { sku_id: 'P018', qty: 1 }, { sku_id: 'P020', qty: 1 }, { sku_id: 'P021', qty: 1 }, { sku_id: 'P025', qty: 1 }, { sku_id: 'P026', qty: 1 }])

  // ── S008 京客隆(来广营) ────────────────────────────────────────────────
  // Story: 稳健运营 + 夏日增量发现
  // P005: 14-day cycle, last=16d → urgency 1.14 SUGGESTED
  // P017+P025 cross-sell NOT triggered (S008 doesn't carry P025) → Agent discovers gap
  // P001+P009 co-occur → contributes to cross-sell pool
  // P024+P023: S008 has P024 but NOT P023 → P024→P023 cross-sell shows up
  makeOrder('S008', 16, [{ sku_id: 'P001', qty: 12 }, { sku_id: 'P005', qty: 15 }, { sku_id: 'P008', qty: 10 }, { sku_id: 'P009', qty: 18 }, { sku_id: 'P017', qty: 8 }, { sku_id: 'P024', qty: 6 }, { sku_id: 'P014', qty: 4 }, { sku_id: 'P019', qty: 4 }, { sku_id: 'P022', qty: 5 }])
  makeOrder('S008', 30, [{ sku_id: 'P001', qty: 10 }, { sku_id: 'P004', qty: 6 }, { sku_id: 'P006', qty: 14 }, { sku_id: 'P009', qty: 15 }, { sku_id: 'P010', qty: 8 }, { sku_id: 'P017', qty: 7 }, { sku_id: 'P024', qty: 5 }])
  makeOrder('S008', 44, [{ sku_id: 'P001', qty: 12 }, { sku_id: 'P002', qty: 8 }, { sku_id: 'P005', qty: 14 }, { sku_id: 'P009', qty: 16 }, { sku_id: 'P020', qty: 8 }, { sku_id: 'P017', qty: 8 }, { sku_id: 'P024', qty: 6 }])
  makeOrder('S008', 58, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P006', qty: 12 }, { sku_id: 'P008', qty: 9 }, { sku_id: 'P009', qty: 14 }, { sku_id: 'P016', qty: 8 }, { sku_id: 'P017', qty: 7 }])
  makeOrder('S008', 72, [{ sku_id: 'P001', qty: 11 }, { sku_id: 'P005', qty: 15 }, { sku_id: 'P010', qty: 8 }, { sku_id: 'P009', qty: 16 }, { sku_id: 'P021', qty: 6 }, { sku_id: 'P017', qty: 8 }, { sku_id: 'P024', qty: 5 }])
  makeOrder('S008', 86, [{ sku_id: 'P001', qty: 12 }, { sku_id: 'P002', qty: 8 }, { sku_id: 'P006', qty: 14 }, { sku_id: 'P009', qty: 18 }, { sku_id: 'P014', qty: 4 }, { sku_id: 'P015', qty: 3 }])
  makeOrder('S008', 100, [{ sku_id: 'P004', qty: 5 }, { sku_id: 'P005', qty: 14 }, { sku_id: 'P008', qty: 10 }, { sku_id: 'P009', qty: 15 }, { sku_id: 'P017', qty: 7 }, { sku_id: 'P024', qty: 5 }])
  makeOrder('S008', 114, [{ sku_id: 'P001', qty: 10 }, { sku_id: 'P006', qty: 12 }, { sku_id: 'P011', qty: 8 }, { sku_id: 'P009', qty: 16 }, { sku_id: 'P019', qty: 4 }, { sku_id: 'P022', qty: 5 }])
  makeOrder('S008', 128, [{ sku_id: 'P001', qty: 12 }, { sku_id: 'P005', qty: 15 }, { sku_id: 'P010', qty: 8 }, { sku_id: 'P009', qty: 14 }, { sku_id: 'P017', qty: 8 }, { sku_id: 'P024', qty: 6 }])
  makeOrder('S008', 142, [{ sku_id: 'P002', qty: 8 }, { sku_id: 'P006', qty: 13 }, { sku_id: 'P008', qty: 9 }, { sku_id: 'P009', qty: 16 }, { sku_id: 'P020', qty: 8 }, { sku_id: 'P014', qty: 4 }])
  makeOrder('S008', 156, [{ sku_id: 'P001', qty: 11 }, { sku_id: 'P004', qty: 5 }, { sku_id: 'P005', qty: 14 }, { sku_id: 'P009', qty: 15 }, { sku_id: 'P017', qty: 7 }, { sku_id: 'P024', qty: 5 }])
  makeOrder('S008', 170, [{ sku_id: 'P003', qty: 5 }, { sku_id: 'P006', qty: 12 }, { sku_id: 'P016', qty: 7 }, { sku_id: 'P009', qty: 14 }, { sku_id: 'P027', qty: 5 }, { sku_id: 'P028', qty: 3 }])
  makeOrder('S008', 184, [{ sku_id: 'P001', qty: 12 }, { sku_id: 'P005', qty: 15 }, { sku_id: 'P008', qty: 9 }, { sku_id: 'P009', qty: 16 }, { sku_id: 'P019', qty: 4 }, { sku_id: 'P022', qty: 5 }])
  makeOrder('S008', 198, [{ sku_id: 'P001', qty: 10 }, { sku_id: 'P002', qty: 8 }, { sku_id: 'P006', qty: 12 }, { sku_id: 'P009', qty: 14 }, { sku_id: 'P017', qty: 8 }, { sku_id: 'P024', qty: 6 }])

  return orders
}

// ─── WRITE OUTPUT ──────────────────────────────────────────────────────────

const dataDir = path.join(__dirname)
const orders = buildOrders()

fs.writeFileSync(path.join(dataDir, 'stores.json'), JSON.stringify(stores, null, 2))
fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2))
fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2))
fs.writeFileSync(path.join(dataDir, 'promotions.json'), JSON.stringify(promotions, null, 2))

console.log('✅ Mock data generated successfully!')
console.log(`   - ${stores.length} stores`)
console.log(`   - ${products.length} products`)
console.log(`   - ${orders.length} orders`)
console.log(`   - ${promotions.length} promotions`)
