// src/pages/productData.js
// ====== 原有数据，保持不变 ======
const productsData = [
  {
    sku: "JEW9999",
    name: "多位置多交易产品",
    cost: 15.9,
    unit: "Pack",
    height: 12,
    width: 8,
    depth: 6,
    weight: 0.3,
    stockLocations: [
      { location: "EB-001-A", quantity: 500 },
      { location: "BNP-07", quantity: 200 },
      { location: "RACK-12", quantity: 185 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -30 },
      { date: "2025-08-08", quantity: +120 },
      { date: "2025-08-06", quantity: -10 },
      { date: "2025-08-04", quantity: +50 },
      { date: "2025-08-02", quantity: -20 }
    ]
  },
  {
    sku: "TOY1234",
    name: "儿童拼图",
    cost: 9.9,
    unit: "Box",
    height: 10,
    width: 10,
    depth: 5,
    weight: 0.4,
    stockLocations: [
      { location: "TOY-01", quantity: 150 },
      { location: "TOY-03", quantity: 100 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -30 },
      { date: "2025-08-08", quantity: +100 },
      { date: "2025-08-06", quantity: -20 },
      { date: "2025-08-04", quantity: +50 }
    ]
  },
  {
    sku: "CLOTH555",
    name: "夏季短袖T恤",
    cost: 19.5,
    unit: "Piece",
    height: 2,
    width: 30,
    depth: 25,
    weight: 0.2,
    stockLocations: [
      { location: "CLOT-01", quantity: 400 },
      { location: "CLOT-02", quantity: 180 }
    ],
    transactions: [
      { date: "2025-08-09", quantity: -15 },
      { date: "2025-08-08", quantity: +60 },
      { date: "2025-08-06", quantity: -12 },
      { date: "2025-08-04", quantity: +30 }
    ]
  },
  {
    sku: "BOOK0001",
    name: "算法导论",
    cost: 45.5,
    unit: "Book",
    height: 24,
    width: 17,
    depth: 5,
    weight: 2,
    stockLocations: [
      { location: "BOOK-01", quantity: 100 },
      { location: "BOOK-02", quantity: 50 }
    ],
    transactions: [
      { date: "2025-08-10", quantity: -3 },
      { date: "2025-08-08", quantity: +20 },
      { date: "2025-08-06", quantity: -5 }
    ]
  }
];

export default productsData;


// ====== 下面是新增的命名导出方法（前端内存模拟“库存转移”）======

/**
 * 通过 SKU 获取产品引用（直接返回数组中的对象引用）
 */
export function findProductBySku(sku) {
  return productsData.find(p => p?.sku === sku) || null;
}

/**
 * 计算某产品总库存（优先累加 stockLocations；没有时回退 p.quantity）
 */
export function getTotalQuantity(p) {
  const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
  if (arr.length > 0) {
    return arr.reduce((sum, loc) => sum + (Number(loc?.quantity) || 0), 0);
  }
  return Number(p?.quantity ?? 0) || 0;
}

/**
 * 设置主库位（仅前端标记）：在 stockLocations 项上增加/更新 isPrimary
 * - 只允许一个 isPrimary = true
 */
export function setPrimaryLocation(sku, locationCode) {
  const p = findProductBySku(sku);
  if (!p) return false;
  const arr = Array.isArray(p.stockLocations) ? p.stockLocations : [];
  arr.forEach(x => { if (x) x.isPrimary = false; });
  const target = arr.find(x => String(x?.location) === String(locationCode));
  if (target) {
    target.isPrimary = true;
    return true;
  }
  return false;
}

/**
 * 库存转移（多来源 → 单目标；可新建目标；支持“设为主库位”）
 * @param {Object} payload
 * payload = {
 *   sku: 'BOOK0001',
 *   sources: [ { location: 'BOOK-02', qty: 10 }, { location: 'RACK-12', qty: 5 } ],
 *   target: { type: 'existing' | 'new', location?: 'BOOK-01', newCode?: 'NEW-LOC' },
 *   setAsPrimary: true/false
 * }
 * @returns {Object} 结果
 */
export function transferStock(payload) {
  const { sku, sources, target, setAsPrimary } = payload || {};
  const p = findProductBySku(sku);
  if (!p) return { ok: false, error: 'PRODUCT_NOT_FOUND' };

  const srcs = Array.isArray(sources) ? sources : [];
  if (srcs.length === 0) return { ok: false, error: 'NO_SOURCES' };

  const locArr = Array.isArray(p.stockLocations) ? p.stockLocations : (p.stockLocations = []);

  // 校验来源
  for (const s of srcs) {
    const code = String(s?.location ?? '');
    const qty = Number(s?.qty);
    if (!code || !Number.isFinite(qty) || qty <= 0) {
      return { ok: false, error: 'BAD_SOURCE_INPUT' };
    }
    const row = locArr.find(x => String(x?.location) === code);
    if (!row) return { ok: false, error: `SOURCE_NOT_FOUND:${code}` };
    if ((Number(row.quantity) || 0) < qty) {
      return { ok: false, error: `NOT_ENOUGH_QTY:${code}` };
    }
  }

  // 目标位置
  let targetCode = '';
  if (target?.type === 'existing') {
    targetCode = String(target?.location || '');
    if (!targetCode) return { ok: false, error: 'TARGET_NOT_SELECTED' };
  } else if (target?.type === 'new') {
    targetCode = String(target?.newCode || '').trim();
    if (!targetCode) return { ok: false, error: 'NEW_CODE_EMPTY' };
  } else {
    return { ok: false, error: 'TARGET_TYPE_INVALID' };
  }

  // 如果是新位置且已存在，则转为 existing
  let targetRow = locArr.find(x => String(x?.location) === targetCode);
  if (!targetRow) {
    // 新建目标
    targetRow = { location: targetCode, quantity: 0 };
    locArr.push(targetRow);
  }

  // 执行转移：扣减来源、累计目标
  let movedTotal = 0;
  const emptiedSources = [];
  for (const s of srcs) {
    const code = String(s.location);
    const qty = Number(s.qty);
    const row = locArr.find(x => String(x?.location) === code);
    row.quantity = (Number(row.quantity) || 0) - qty;
    movedTotal += qty;
    if ((Number(row.quantity) || 0) <= 0) {
      // 数量为 0：删除该库位记录（你的要求）
      const idx = locArr.indexOf(row);
      if (idx >= 0) {
        locArr.splice(idx, 1);
        emptiedSources.push(code);
      }
    }
  }
  targetRow.quantity = (Number(targetRow.quantity) || 0) + movedTotal;

  // 设为主库位（Pickface）
  if (setAsPrimary) {
    locArr.forEach(x => { if (x) x.isPrimary = false; });
    const t = locArr.find(x => String(x?.location) === targetCode);
    if (t) t.isPrimary = true;
  }

  return {
    ok: true,
    movedTotal,
    target: { location: targetCode, newQty: targetRow.quantity, isPrimary: !!targetRow.isPrimary },
    emptiedSources
  };
}
