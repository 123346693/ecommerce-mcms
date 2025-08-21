// frontend/src/pages/ProductManagement/ProductPage.jsx
// Q14 唯一改动点：将分页控件移动到页面右下角固定显示（包含每页数量下拉 + Prev/Next + 页码信息）。
// 其余：严格保持 Q13 的结构与样式，不改搜索/筛选/排序/卡片布局/文案。

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import productsData from './productData';
import ProductDrawer from './ProductDrawer';

export default function ProductPage() {
  const { t } = useTranslation();

  // 数据
  const [products] = useState(productsData);

  // 抽屉
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const openDrawer = (p) => { setActive(p); setOpen(true); };
  const closeDrawer = () => { setOpen(false); setActive(null); };

  // 搜索
  const [keyword, setKeyword] = useState('');

  // —— 位置多选（保持原有结构与交互）——
  const allLocations = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p?.stockLocations || []).forEach(l => {
      if (l?.location) set.add(String(l.location));
    }));
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [products]);

  const [locOpen, setLocOpen] = useState(false);
  const [locSearch, setLocSearch] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);

  const visibleLocations = useMemo(() => {
    const s = locSearch.trim().toLowerCase();
    if (!s) return allLocations;
    return allLocations.filter(x => x.toLowerCase().includes(s));
  }, [allLocations, locSearch]);

  const toggleOneLocation = (code) => {
    setSelectedLocations(prev =>
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  };
  const selectAllLocations = () => setSelectedLocations(allLocations);
  const clearAllLocations = () => setSelectedLocations([]);

  // —— 库存状态筛选 —— //
  // 允许值：'all' | 'outOfStock' | 'lowStock' | 'normal' | 'overstock'
  const [statusFilter, setStatusFilter] = useState('all');

  // 排序（保持原有）
  const [sortField, setSortField] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');

  // 主库位
  function getPrimaryLocCode(p) {
    const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
    const primary = arr.find(l => l?.isPrimary);
    const code = (primary?.location ?? arr[0]?.location ?? '')
      .toString().trim().toUpperCase();
    return code;
  }

  // 总库存
  const getTotalQuantity = (p) =>
    (p?.stockLocations || []).reduce((sum, l) => sum + (Number(l?.quantity) || 0), 0);

  // —— 库存状态（与筛选/徽标一致；预留算法接入口）——
  // 返回：'outOfStock' | 'lowStock' | 'normal' | 'overstock'
  function getStatus(p) {
    if (typeof p?.status === 'string') {
      const s = p.status;
      if (['outOfStock','lowStock','normal','overstock'].includes(s)) return s;
    }
    // 占位：以数量粗略判断（将来替换为你的高级算法）
    const total = getTotalQuantity(p);
    if (total <= 0) return 'outOfStock';
    if (p?.lowThreshold != null && total < Number(p.lowThreshold)) return 'lowStock';
    if (p?.overThreshold != null && total > Number(p.overThreshold)) return 'overstock';
    return 'normal';
  }

  // 徽标颜色
  function statusClasses(status) {
    switch (status) {
      case 'outOfStock': return 'text-red-700 bg-red-50 border-red-300';
      case 'lowStock':   return 'text-amber-700 bg-amber-50 border-amber-300';
      case 'overstock':  return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'normal':
      default:           return 'text-green-700 bg-green-50 border-green-300';
    }
  }

  // 过滤 + 排序（保持既有逻辑，仅加上 statusFilter）
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    let list = products.filter(p => {
      // 搜索
      const hitKW = !kw
        || String(p?.name || '').toLowerCase().includes(kw)
        || String(p?.sku  || '').toLowerCase().includes(kw);
      if (!hitKW) return false;

      // 位置过滤
      if (selectedLocations.length > 0) {
        const locs = (p?.stockLocations || []).map(l => String(l.location));
        const hitLoc = locs.some(code => selectedLocations.includes(code));
        if (!hitLoc) return false;
      }

      // 库存状态过滤
      if (statusFilter !== 'all') {
        const st = getStatus(p);
        if (st !== statusFilter) return false;
      }

      return true;
    });

    // 排序
    const dir = sortOrder === 'desc' ? -1 : 1;
    const numericOpts = { numeric: true, sensitivity: 'base' };

    list = list.slice().sort((a, b) => {
      switch (sortField) {
        case 'sku':
          return String(a?.sku || '').localeCompare(String(b?.sku || ''), undefined, numericOpts) * dir;
        case 'name':
          return String(a?.name || '').localeCompare(String(b?.name || ''), undefined, numericOpts) * dir;
        case 'location': {
          const A = getPrimaryLocCode(a);
          const B = getPrimaryLocCode(b);
          if (!A && !B) return 0;
          if (!A) return 1;
          if (!B) return -1;
          const base = A.localeCompare(B, undefined, numericOpts);
          return dir === -1 ? -base : base;
        }
        case 'price': {
          const pa = Number(a?.cost) || 0;
          const pb = Number(b?.cost) || 0;
          return (pa - pb) * dir;
        }
        case 'stock': {
          const sa = getTotalQuantity(a);
          const sb = getTotalQuantity(b);
          return (sa - sb) * dir;
        }
        default:
          return 0;
      }
    });

    return list;
  }, [products, keyword, selectedLocations, statusFilter, sortField, sortOrder]);

  // ===== 分页（Q13 已有；Q14 仅改变控件显示位置）=====
  const pageSizeOptions = [20, 50, 100, 200, 500];
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // 当过滤条件变更时，重置回第 1 页
  useEffect(() => { setPage(1); }, [keyword, selectedLocations, statusFilter, sortField, sortOrder, pageSize]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pageItems = useMemo(() => filtered.slice(startIdx, endIdx), [filtered, startIdx, endIdx]);

  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));

  // 点击空白关闭位置多选浮层（保持原有）
  useEffect(() => {
    const onClick = (e) => {
      const pop = document.getElementById('location-multiselect-popover');
      const btn = document.getElementById('location-multiselect-trigger');
      if (!pop || !btn) return;
      if (!pop.contains(e.target) && !btn.contains(e.target)) setLocOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="p-4 md:p-6">
      {/* 顶部：搜索 + 位置多选 + 库存状态筛选 + 右侧排序  */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* 搜索框（保持之前的宽度缩小设置） */}
          <div className="w-full md:w-[420px] lg:w-[560px]">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('product.searchPlaceholder')}
              className="w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 位置多选（原有） */}
          <div className="relative">
            <button
              id="location-multiselect-trigger"
              type="button"
              onClick={() => setLocOpen(v => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm hover:bg-gray-50"
            >
              <span className="text-gray-700">{t('filter.location')}</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {selectedLocations.length || t('product.allLocations', 'All Locations')}
              </span>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>

            {locOpen && (
              <div
                id="location-multiselect-popover"
                className="absolute right-0 z-20 mt-2 w-80 rounded-xl border bg-white shadow-lg"
              >
                <div className="border-b p-2">
                  <input
                    value={locSearch}
                    onChange={(e) => setLocSearch(e.target.value)}
                    placeholder={t('filter.searchLocation', 'Search location')}
                    className="h-9 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-[320px] overflow-auto p-1">
                  <div className="sticky top-0 z-10 mb-1 bg-white px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
                        onClick={selectAllLocations}
                      >
                        {t('common.select', 'Select')} {t('product.allLocations', 'All Locations')}
                      </button>
                      <button
                        className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
                        onClick={clearAllLocations}
                      >
                        {t('common.clear', 'Clear')}
                      </button>
                      <div className="ml-auto text-xs text-gray-500">
                        {selectedLocations.length}/{allLocations.length}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-0.5 px-1 pb-2">
                    {visibleLocations.length === 0 ? (
                      <li className="px-2 py-2 text-xs text-gray-400">{t('app.noData', 'No data')}</li>
                    ) : (
                      visibleLocations.map(code => {
                        const checked = selectedLocations.includes(code);
                        return (
                          <li key={code}>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={checked}
                                onChange={() => toggleOneLocation(code)}
                              />
                              <span className="text-sm text-gray-700">{code}</span>
                            </label>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 库存状态筛选（位置筛选右侧） */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('product.statusFilterLabel', 'Stock Status')}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('product.allStatus', 'All Status')}</option>
              <option value="outOfStock">{t('product.status.outOfStock', 'Out of Stock')}</option>
              <option value="lowStock">{t('product.status.lowStock', 'Low Stock')}</option>
              <option value="normal">{t('product.status.normal', 'Normal')}</option>
              <option value="overstock">{t('product.status.overstock', 'Overstock')}</option>
            </select>
          </div>
        </div>

        {/* 排序（保持原有） */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('sort.sortBy', 'Sort by')}</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sku">{t('sort.bySku', 'SKU')}</option>
              <option value="name">{t('sort.byName', 'Name')}</option>
              <option value="location">{t('sort.byLocation', 'Location')}</option>
              <option value="price">{t('sort.byPrice', 'Price')}</option>
              <option value="stock">{t('sort.byStock', 'Stock')}</option>
            </select>
          </div>

          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('sort.order', 'Order')}</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">{t('sort.ascending', 'Ascending')}</option>
              <option value="desc">{t('sort.descending', 'Descending')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 卡片列表（保持双列/多列栅格） */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pageItems.map(p => {
          const total = getTotalQuantity(p);
          const status = getStatus(p); // 'outOfStock' | 'lowStock' | 'normal' | 'overstock'
          const colorCls = statusClasses(status);
          return (
            <div
              key={p.sku}
              className="group cursor-pointer rounded-2xl border bg-white p-4 hover:shadow-md transition"
              onClick={() => openDrawer(p)}
              data-stock-status={status}
            >
              {/* 第一行：左 SKU，右 库存徽章（仅显示数量；颜色由状态控制） */}
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium text-gray-900" title={p.sku}>{p.sku}</div>
                <div
                  className={`inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-0.5 text-xs font-medium ${colorCls}`}
                  title={`${t('product.totalStock', 'Stock')}: ${total}`}
                >
                  {t('product.totalStock', 'Stock')}：{total}
                </div>
              </div>

              {/* 第二行：左 名称，右 成本 */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 truncate" title={p.name}>{p.name}</div>
                <div className="text-gray-600">
                  {t('product.cost', 'Cost')}：<span className="font-semibold">
                    {p.cost == null ? '-' : `$${Number(p.cost).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* 第三行：位置（只显示主位置；样式与成本一致） */}
              <div className="mt-2 text-sm text-gray-600 truncate">
                {t('product.positionLabel', '位置')}：{getPrimaryLocCode(p) || '-'}
              </div>
            </div>
          );
        })}
      </div>

      {/* 固定右下角分页控件（Q14 变更点） */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow">
          {/* 每页数量下拉 */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 px-2 rounded-md border bg-white text-sm"
          >
            {pageSizeOptions.map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>

          {/* 页码信息 */}
          <span className="text-sm text-gray-600">
            {t('pagination.page', 'Page')} {currentPage} / {totalPages}
          </span>

          {/* 翻页按钮 */}
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {t('pagination.prev', 'Prev')}
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {t('pagination.next', 'Next')}
          </button>
        </div>
      </div>

      {/* 详情抽屉（保持原有） */}
      {open && (
        <ProductDrawer
          product={active}
          onClose={closeDrawer}
          onShowAllTransactions={() => {}}
          onShowAllLocations={() => {}}
        />
      )}
    </div>
  );
}
