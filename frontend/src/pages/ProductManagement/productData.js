// src/pages/productData.js
// ====== 原有数据，保持不变（示例）======
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
      { location: "EB-001-A", quantity: 500, isPrimary: true },
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
      { location: "TOY-01", quantity: 150, isPrimary: true },
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
      { location: "CLOT-01", quantity: 400, isPrimary: true },
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
      { location: "BOOK-01", quantity: 100, isPrimary: true },
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

// ====== 昨天的工具函数（保留）======
export function findProductBySku(sku) {
  return productsData.find(p => p?.sku === sku) || null;
}
export function getTotalQuantity(p) {
  const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
  if (arr.length > 0) {
    return arr.reduce((sum, loc) => sum + (Number(loc?.quantity) || 0), 0);
  }
  return Number(p?.quantity ?? 0) || 0;
}
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
export function transferStock(payload) {
  const { sku, sources, target, setAsPrimary } = payload || {};
  const p = findProductBySku(sku);
  if (!p) return { ok: false, error: 'PRODUCT_NOT_FOUND' };

  const srcs = Array.isArray(sources) ? sources : [];
  if (srcs.length === 0) return { ok: false, error: 'NO_SOURCES' };

  const locArr = Array.isArray(p.stockLocations) ? p.stockLocations : (p.stockLocations = []);

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

  let targetRow = locArr.find(x => String(x?.location) === targetCode);
  if (!targetRow) {
    targetRow = { location: targetCode, quantity: 0 };
    locArr.push(targetRow);
  }

  let movedTotal = 0;
  const emptiedSources = [];
  for (const s of srcs) {
    const code = String(s.location);
    const qty = Number(s.qty);
    const row = locArr.find(x => String(x?.location) === code);
    row.quantity = (Number(row.quantity) || 0) - qty;
    movedTotal += qty;
    if ((Number(row.quantity) || 0) <= 0) {
      const idx = locArr.indexOf(row);
      if (idx >= 0) {
        locArr.splice(idx, 1);
        emptiedSources.push(code);
      }
    }
  }
  targetRow.quantity = (Number(targetRow.quantity) || 0) + movedTotal;

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

// ====== 新增：手动调整并记一条交易 ======
/**
 * 手动调整库存，并追加一条交易记录（正数=补货，负数=出货）
 * @param {{
 *   sku: string,
 *   target: { type: 'existing'|'new', location?: string, newCode?: string },
 *   quantity: number,   // 正/负
 *   reason: 'damage'|'shrinkage'|'cycle'|'other',
 *   note?: string
 * }} payload
 */
export function adjustStockWithTransaction(payload) {
  const { sku, target, quantity, reason, note } = payload || {};
  const p = findProductBySku(sku);
  if (!p) return { ok: false, error: 'PRODUCT_NOT_FOUND' };
  const q = Number(quantity);
  if (!Number.isFinite(q) || q === 0) return { ok: false, error: 'BAD_QTY' };

  const locArr = Array.isArray(p.stockLocations) ? p.stockLocations : (p.stockLocations = []);
  // 目标位置解析
  let targetCode = '';
  if (target?.type === 'existing') {
    targetCode = String(target?.location || '');
    if (!targetCode) return { ok: false, error: 'TARGET_NOT_SELECTED' };
  } else if (target?.type === 'new') {
    targetCode = String(target?.newCode || '').trim();
    if (!targetCode) return { ok: false, error: 'NEW_CODE_EMPTY' };
    // 如果已存在则视为 existing
    const exist = locArr.find(x => String(x?.location) === targetCode);
    if (exist) {
      // 直接覆盖为 existing 模式
    } else {
      locArr.push({ location: targetCode, quantity: 0 });
    }
  } else {
    return { ok: false, error: 'TARGET_TYPE_INVALID' };
  }

  let row = locArr.find(x => String(x?.location) === targetCode);
  if (!row) return { ok: false, error: 'TARGET_NOT_FOUND' };

  // 扣/加库存；扣减不能为负
  const after = (Number(row.quantity) || 0) + q;
  if (after < 0) return { ok: false, error: 'NOT_ENOUGH_QTY' };
  row.quantity = after;

  // 若变为 0 => 删除该位置记录
  if (row.quantity === 0) {
    const idx = locArr.indexOf(row);
    if (idx >= 0) locArr.splice(idx, 1);
  }

  // 追加一条交易记录（保留你既有结构：{ date, quantity }）
  const nowStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!Array.isArray(p.transactions)) p.transactions = [];
  p.transactions.unshift({
    date: nowStr,
    quantity: q,
    reason,     // 前端可能不展示，但留下字段以便将来用
    note        // 备注
  });

  return {
    ok: true,
    target: { location: targetCode, newQty: row?.quantity ?? 0 },
    tx: { date: nowStr, quantity: q, reason, note }
  };
}
