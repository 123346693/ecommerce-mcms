import React, { useMemo, useState } from 'react';
import productData from './productData';
import ProductDrawer from './ProductDrawer';
import AllTransactionsModal from './AllTransactionsModal';
import AllLocationsModal from './AllLocationsModal';

/**
 * 本文件要点（与之前保持一致、仅必要调整）：
 * - 筛选：关键词、位置(多选)、排序（名称/SKU/库存/成本 + 升降序）
 * - 列表字段最少化：SKU、产品名、总库存、成本、单位、主库位(stockLocations[0])
 * - “总库存”= 所有 stockLocations.quantity 之和；若没有位置，则回退 product.quantity
 * - 不在卡片上放“打开弹窗”按钮；改为在 Drawer 内点击条目再触发弹窗
 */

const SORT_FIELDS = [
  { value: 'name', label: '名称' },
  { value: 'sku', label: 'SKU' },
  { value: 'quantity', label: '库存' },
  { value: 'cost', label: '成本' },
];
const SORT_DIR = [
  { value: 'asc', label: '升序' },
  { value: 'desc', label: '降序' },
];

const getTotalQuantity = (p) => {
  const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
  if (arr.length > 0) return arr.reduce((s, x) => s + (Number(x?.quantity) || 0), 0);
  return Number(p?.quantity ?? 0) || 0;
};

const getMainLocationText = (p) => {
  const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
  if (arr.length === 0) return '-';
  const first = arr[0] || {};
  const name = (first?.location ?? '') + '';
  const qty = Number(first?.quantity) || 0;
  return `${name || '-'}（${qty}）`;
};

export default function ProductPage() {
  // ---- 筛选/排序 ----
  const [query, setQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // ---- 抽屉/弹窗 ----
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);

  // 位置去重选项
  const locationOptions = useMemo(() => {
    const set = new Set();
    (productData || []).forEach(p => {
      (Array.isArray(p?.stockLocations) ? p.stockLocations : []).forEach(loc => {
        if (loc?.location !== undefined && loc?.location !== null) set.add(String(loc.location));
      });
    });
    return Array.from(set);
  }, []);

  // 过滤
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (productData || []).filter(p => {
      const name = (p?.name || '').toLowerCase();
      const sku = (p?.sku || '').toLowerCase();
      const okQ = !q || name.includes(q) || sku.includes(q);

      let okLoc = true;
      if (selectedLocations.length > 0) {
        const names = (Array.isArray(p?.stockLocations) ? p.stockLocations : []).map(x => String(x?.location));
        okLoc = names.some(n => selectedLocations.includes(n));
      }
      return okQ && okLoc;
    });
  }, [query, selectedLocations]);

  // 排序
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av, bv;
      switch (sortBy) {
        case 'sku':
          av = (a?.sku || '').toLowerCase(); bv = (b?.sku || '').toLowerCase(); break;
        case 'quantity':
          av = getTotalQuantity(a); bv = getTotalQuantity(b); break;
        case 'cost':
          av = Number(a?.cost ?? 0) || 0; bv = Number(b?.cost ?? 0) || 0; break;
        case 'name':
        default:
          av = (a?.name || '').toLowerCase(); bv = (b?.name || '').toLowerCase(); break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  // 事件
  const resetFilters = () => {
    setQuery(''); setSelectedLocations([]); setSortBy('name'); setSortDir('asc');
  };
  const handleLocationChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedLocations(values);
  };

  // 仅用于字段小展示
  const Field = ({ label, value }) => (
    <div className="text-sm">
      <span className="text-gray-500">{label}：</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 标题 */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900">产品管理</h1>
          <div className="text-sm text-gray-500">{sorted.length} 条结果</div>
        </div>
      </div>

      {/* 筛选 + 排序 */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full rounded-xl border bg-white shadow-sm">
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* 搜索 */}
            <div className="md:col-span-4">
              <label className="block text-xs text-gray-500 mb-1">搜索（名称 / SKU）</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索（名称 / SKU）"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 位置（多选） */}
            <div className="md:col-span-4">
              <label className="block text-xs text-gray-500 mb-1">位置（多选）</label>
              <select
                multiple
                size={Math.min(6, Math.max(3, locationOptions.length))}
                value={selectedLocations}
                onChange={handleLocationChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                title="按住 Ctrl/Command 可多选"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-400">提示：按住 Ctrl/Command 键多选/取消</div>
            </div>

            {/* 排序字段 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">排序字段</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_FIELDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* 升/降序 */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">排序方向</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_DIR.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* 重置 */}
            <div className="md:col-span-12 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 列表（最少字段） */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((p) => {
            const sku = p?.sku ?? '-';
            const name = p?.name ?? '-';
            const totalQty = getTotalQuantity(p);
            const costVal = p?.cost;
            const cost = costVal === undefined || costVal === null || costVal === '' ? '-' : `$${Number(costVal).toFixed(2)}`;
            const unit = p?.unit ?? '-';
            const mainLoc = getMainLocationText(p);

            return (
              <button
                key={sku}
                onClick={() => setSelectedProduct(p)}
                className="text-left rounded-xl border bg-white hover:bg-gray-50 shadow-sm p-4 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={name}
              >
                <div className="flex items-start justify-between">
                  <div className="font-medium text-gray-900 line-clamp-2">{name}</div>
                  <div className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                    totalQty === 0 ? 'bg-red-50 text-red-700'
                    : totalQty < 5 ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    库存: {totalQty}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                  <Field label="SKU" value={sku} />
                  <Field label="成本" value={cost} />
                  <Field label="单位" value={unit} />
                  <Field label="主库位" value={mainLoc} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧详情抽屉（点击条目触发弹窗） */}
      {selectedProduct && (
        <ProductDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onShowAllTransactions={() => setShowTxModal(true)}
          onShowAllLocations={() => setShowLocModal(true)}
          getTotalQuantity={getTotalQuantity}
        />
      )}

      {/* 全屏弹窗：全部交易 / 全部库位（保持不变） */}
      {showTxModal && selectedProduct && (
        <AllTransactionsModal product={selectedProduct} onClose={() => setShowTxModal(false)} />
      )}
      {showLocModal && selectedProduct && (
        <AllLocationsModal product={selectedProduct} onClose={() => setShowLocModal(false)} />
      )}
    </div>
  );
}
