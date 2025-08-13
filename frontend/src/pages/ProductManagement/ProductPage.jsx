import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductDrawer from "./ProductDrawer";
import AllTransactionsModal from "./AllTransactionsModal";
import AllLocationsModal from "./AllLocationsModal";
import productsData from "./productData";

/* =========================
   常量
========================= */
const SORT_FIELDS = {
  SKU: "sku",
  NAME: "name",
  STOCK: "stock", // 按 totalStock 排
  COST: "cost",
  WEIGHT: "weight",
};
const SORT_ORDERS = { ASC: "asc", DESC: "desc" };
const STOCK_STATUS = { ALL: "ALL", IN_STOCK: "IN_STOCK", LOW_STOCK: "LOW_STOCK", OUT_OF_STOCK: "OUT_OF_STOCK" };
const pageSizeOptions = [20, 50, 100];
const FILTER_COLLAPSE_KEY = "product_filters_collapsed_v2";

/* =========================
   工具：分页页码生成
========================= */
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current, current - 1, current + 1].filter(n => n >= 1 && n <= total));
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    const next = sorted[i + 1];
    if (next && next - sorted[i] > 1) result.push("…");
  }
  return result;
}

/* =========================
   自定义下拉（多选）
   - 固定宽度（widthClass）
   - 菜单对齐（menuAlign: left/right）
   - 选中显示“前2项 +N”
========================= */
function DropdownMulti({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  widthClass = "w-[220px] min-w-[220px]",
  menuAlign = "left",
  buttonHeight = "h-10",
  textSize = "text-[13px]",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggle = () => setOpen(v => !v);

  const handleToggleValue = (val) => {
    if (selectedValues.includes(val)) onChange(selectedValues.filter(v => v !== val));
    else onChange([...selectedValues, val]);
  };

  const handleSelectAll = () => onChange([...options]);
  const handleClear = () => onChange([]);

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    const preview = selectedValues.slice(0, 2).join(", ");
    const more = selectedValues.length - 2;
    const body = more > 0 ? `${preview} +${more}` : preview;
    return `${label}: ${body}`;
  };

  const menuPos = menuAlign === "right" ? "right-0 left-auto" : "left-0";

  return (
    <div className={`relative ${widthClass} shrink-0`} ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className={`w-full ${buttonHeight} px-3 border rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10`}
        title={getDisplayText()}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${textSize} text-gray-800`}>{getDisplayText()}</span>
          <span className="ml-2 text-gray-400">▾</span>
        </div>
      </button>
      {open && (
        <div
          className={`absolute ${menuPos} z-40 mt-1 w-full bg-white border rounded-xl shadow-xl p-2 max-h-64 overflow-auto`}
        >
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 border rounded-lg hover:bg-gray-50"
            >
              全选 / Select All
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2 py-1 border rounded-lg hover:bg-gray-50"
            >
              清空 / Clear
            </button>
          </div>
          <div className="space-y-1">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={() => handleToggleValue(opt)}
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   自定义下拉（单选）
   - 固定宽度
   - 右对齐菜单，防溢出
========================= */
function DropdownSingle({
  value,
  onChange,
  options,
  getLabel = (v) => v,
  widthClass = "w-[160px] min-w-[160px]",
  buttonHeight = "h-9",
  textSize = "text-[13px]",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className={`relative ${widthClass} shrink-0`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full ${buttonHeight} px-3 border rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10`}
        title={current ? getLabel(current.value) : ""}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${textSize} text-gray-800`}>
            {current ? getLabel(current.value) : ""}
          </span>
          <span className="ml-2 text-gray-400">▾</span>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-full bg-white border rounded-xl shadow-xl p-1 max-h-60 overflow-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 ${textSize} ${
                value === opt.value ? "bg-gray-100" : ""
              }`}
            >
              {getLabel(opt.value)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   分页组件
========================= */
function Pagination({ currentPage, totalPages, onChange }) {
  const pages = buildPageList(currentPage, totalPages);
  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        ‹
      </button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            className={`px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 ${
              p === currentPage ? "bg-black text-white border-black hover:bg-black" : ""
            }`}
            onClick={() => onChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        ›
      </button>
    </div>
  );
}

/* =========================
   主页面
========================= */
const ProductPage = () => {
  const { t } = useTranslation();

  // Drawer / Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  // Search + Filters + Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatus, setStockStatus] = useState(STOCK_STATUS.ALL);
  const [lowThreshold, setLowThreshold] = useState(10);
  const [selectedUnits, setSelectedUnits] = useState([]);        // 多选单位
  const [selectedLocations, setSelectedLocations] = useState([]);// 多选位置
  const [sortField, setSortField] = useState(SORT_FIELDS.SKU);   // 单字段排序
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.ASC);

  // 分页
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [page, setPage] = useState(1);

  // 筛选折叠
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_COLLAPSE_KEY);
    if (saved === "1") setFiltersCollapsed(true);
  }, []);
  const toggleFilters = () => {
    setFiltersCollapsed(v => {
      const next = !v;
      localStorage.setItem(FILTER_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  // 计算可选单位、位置
  const unitOptions = useMemo(() => {
    const set = new Set(productsData.map(p => (p.unit || "").trim()).filter(Boolean));
    return Array.from(set).sort();
  }, []);
  const locationOptions = useMemo(() => {
    const set = new Set();
    productsData.forEach(p => (p.stockLocations || []).forEach(loc => set.add((loc.location || "").trim())));
    return Array.from(set).filter(Boolean).sort();
  }, []);

  // 计算总库存 & 主拣货位
  const getTotalStock = (p) => (p.stockLocations || []).reduce((sum, loc) => sum + (parseInt(loc.quantity || 0, 10) || 0), 0);
  const getPrimaryLocation = (p) => p.stockLocations?.[0]?.location || "-";

  // 过滤
  const filtered = useMemo(() => {
    let list = productsData.map(p => ({
      ...p,
      __totalStock: getTotalStock(p),
      __primaryLocation: getPrimaryLocation(p),
    }));

    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      list = list.filter(p =>
        (p.sku || "").toLowerCase().includes(kw) || (p.name || "").toLowerCase().includes(kw)
      );
    }

    list = list.filter(p => {
      const s = p.__totalStock;
      switch (stockStatus) {
        case STOCK_STATUS.IN_STOCK: return s > 0;
        case STOCK_STATUS.LOW_STOCK: return s > 0 && s <= Number(lowThreshold || 0);
        case STOCK_STATUS.OUT_OF_STOCK: return s === 0;
        default: return true;
      }
    });

    if (selectedUnits.length > 0) {
      const set = new Set(selectedUnits.map(u => u.toLowerCase()));
      list = list.filter(p => set.has((p.unit || "").toLowerCase()));
    }

    if (selectedLocations.length > 0) {
      const set = new Set(selectedLocations);
      list = list.filter(p => (p.stockLocations || []).some(loc => set.has(loc.location || "")));
    }

    return list;
  }, [searchTerm, stockStatus, lowThreshold, selectedUnits, selectedLocations]);

  // 单字段排序
  const sorted = useMemo(() => {
    const toVal = (p) => {
      switch (sortField) {
        case SORT_FIELDS.STOCK: return p.__totalStock;
        case SORT_FIELDS.COST:  return Number(p.cost || 0);
        case SORT_FIELDS.WEIGHT:return Number(p.weight || 0);
        case SORT_FIELDS.NAME:  return (p.name || "").toLowerCase();
        case SORT_FIELDS.SKU:
        default:                return (p.sku || "").toLowerCase();
      }
    };
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = toVal(a), bv = toVal(b);
      if (av < bv) return sortOrder === SORT_ORDERS.ASC ? -1 : 1;
      if (av > bv) return sortOrder === SORT_ORDERS.ASC ?  1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  // 分页
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paged = sorted.slice(start, end);

  // 任何筛选变化 → 回第一页
  useEffect(() => {
    setPage(1);
  }, [searchTerm, stockStatus, lowThreshold, selectedUnits, selectedLocations, sortField, sortOrder, pageSize]);

  const resetFilters = () => {
    setSearchTerm("");
    setStockStatus(STOCK_STATUS.ALL);
    setLowThreshold(10);
    setSelectedUnits([]);
    setSelectedLocations([]);
    setSortField(SORT_FIELDS.SKU);
    setSortOrder(SORT_ORDERS.ASC);
    setPageSize(pageSizeOptions[0]);
    setPage(1);
  };

  const handleProductClick = (product) => setSelectedProduct(product);
  const handleCloseDrawer = () => setSelectedProduct(null);

  /* ============ UI ============ */
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* 顶部：标题 + 搜索（右上） */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">
          {t("product.title")}
        </h1>
        <input
          type="text"
          placeholder={t("product.searchPlaceholder")}
          className="w-80 h-10 px-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 筛选工具条：横向排列，固定宽，高级对齐，防重叠；菜单悬浮不裁切 */}
      <div className="bg-white border rounded-2xl shadow-sm mb-6 p-4 overflow-visible">
        {/* 折叠开关 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-gray-900">
            {t("product.filters.title")}
          </span>
          <button
            onClick={toggleFilters}
            className="text-[13px] text-gray-600 hover:text-gray-900 px-3 py-1 border rounded-lg"
          >
            {filtersCollapsed ? t("product.filters.toggleShow") : t("product.filters.toggleHide")}
          </button>
        </div>

        {!filtersCollapsed && (
          <div className="relative">
            {/* 横向滚动容器，防窗口太窄时换行导致拥挤 */}
            <div className="flex items-end gap-3 overflow-x-auto pb-1">
              {/* 库存状态（160） */}
              <div className="flex flex-col shrink-0" style={{ width: 160 }}>
                <label className="text-xs text-gray-500 mb-1">{t("product.filters.stockStatus")}</label>
                <select
                  className="h-10 px-3 border rounded-lg text-[13px]"
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                >
                  <option value={STOCK_STATUS.ALL}>{t("product.filters.stockStatusAll")}</option>
                  <option value={STOCK_STATUS.IN_STOCK}>{t("product.filters.stockStatusIn")}</option>
                  <option value={STOCK_STATUS.LOW_STOCK}>{t("product.filters.stockStatusLow")}</option>
                  <option value={STOCK_STATUS.OUT_OF_STOCK}>{t("product.filters.stockStatusOut")}</option>
                </select>
              </div>

              {/* 低库存阈值（120） */}
              <div className="flex flex-col shrink-0" style={{ width: 120 }}>
                <label className="text-xs text-gray-500 mb-1">{t("product.filters.lowStockThreshold")}</label>
                <input
                  type="number"
                  min="1"
                  className="h-10 px-3 border rounded-lg text-[13px]"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  placeholder="10"
                />
              </div>

              {/* 单位（多选 200，左对齐菜单） */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t("product.filters.unitsMulti")}</label>
                <DropdownMulti
                  label={t("product.filters.unit")}
                  options={unitOptions}
                  selectedValues={selectedUnits}
                  onChange={setSelectedUnits}
                  placeholder={t("product.filters.unitAll")}
                  widthClass="w-[200px] min-w-[200px]"
                  menuAlign="left"
                  buttonHeight="h-9"
                  textSize="text-[13px]"
                />
              </div>

              {/* 位置（多选 220，右对齐菜单） */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t("product.filters.locationsMulti")}</label>
                <DropdownMulti
                  label={t("product.filters.location")}
                  options={locationOptions}
                  selectedValues={selectedLocations}
                  onChange={setSelectedLocations}
                  placeholder={t("product.filters.locationAll")}
                  widthClass="w-[220px] min-w-[220px]"
                  menuAlign="right"
                  buttonHeight="h-9"
                  textSize="text-[13px]"
                />
              </div>

              {/* 排序（两枚 160，同一行、同宽、不换行） */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t("product.filters.sortBy")}</label>
                <div className="inline-flex items-center gap-2 whitespace-nowrap">
                  <DropdownSingle
                    value={sortField}
                    onChange={setSortField}
                    widthClass="w-[160px] min-w-[160px]"
                    buttonHeight="h-9"
                    textSize="text-[13px]"
                    options={[
                      { value: SORT_FIELDS.SKU },
                      { value: SORT_FIELDS.NAME },
                      { value: SORT_FIELDS.STOCK },
                      { value: SORT_FIELDS.COST },
                      { value: SORT_FIELDS.WEIGHT },
                    ]}
                    getLabel={(v) =>
                      v === SORT_FIELDS.SKU   ? t("product.filters.sort.field.sku")   :
                      v === SORT_FIELDS.NAME  ? t("product.filters.sort.field.name")  :
                      v === SORT_FIELDS.STOCK ? t("product.filters.sort.field.stock") :
                      v === SORT_FIELDS.COST  ? t("product.filters.sort.field.cost")  :
                      t("product.filters.sort.field.weight")
                    }
                  />
                  <DropdownSingle
                    value={sortOrder}
                    onChange={setSortOrder}
                    widthClass="w-[160px] min-w-[160px]"
                    buttonHeight="h-9"
                    textSize="text-[13px]"
                    options={[
                      { value: SORT_ORDERS.ASC },
                      { value: SORT_ORDERS.DESC },
                    ]}
                    getLabel={(v) => (v === SORT_ORDERS.ASC ? t("product.filters.sort.asc") : t("product.filters.sort.desc"))}
                  />
                </div>
              </div>

              {/* 重置 */}
              <div className="flex flex-col shrink-0" style={{ width: 120 }}>
                <label className="text-xs text-transparent mb-1 select-none">reset</label>
                <button
                  onClick={resetFilters}
                  className="h-9 px-3 text-[13px] rounded-lg border hover:bg-gray-50 w-full"
                >
                  {t("product.filters.reset")}
                </button>
              </div>

              {/* 每页条数（140） */}
              <div className="flex items-end shrink-0" style={{ width: 140 }}>
                <div className="w-full flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t("product.filters.perPage")}</span>
                  <select
                    className="h-9 px-3 border rounded-lg text-[13px] w-[80px]"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {pageSizeOptions.map(ps => (
                      <option key={ps} value={ps}>{ps}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 产品列表 */}
      <div className="space-y-4">
        {paged.map((product) => {
          const totalStock = product.__totalStock;
          const primaryLocation = product.__primaryLocation;

          return (
            <div
              key={product.sku}
              className="bg-white border p-4 rounded-2xl shadow-sm hover:shadow transition cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              {/* 标题：SKU - 名称 */}
              <div className="text-[15px] font-semibold tracking-tight text-gray-900 mb-2">
                {product.sku} - {product.name}
              </div>

              {/* 规格：一行8列平铺 */}
              <div className="grid grid-cols-8 gap-x-4 text-[13px] text-gray-600">
                <span>{t("product.stock")}: {totalStock}</span>
                <span>{t("product.cost")}: ${product.cost}</span>
                <span>{t("product.unit")}: {product.unit}</span>
                <span>{t("product.location")}: {primaryLocation}</span>
                <span>{t("product.height")}: {product.height} cm</span>
                <span>{t("product.width")}: {product.width} cm</span>
                <span>{t("product.depth")}: {product.depth} cm</span>
                <span>{t("product.weight")}: {product.weight} kg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页条 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {t("product.pagination.showing")} {total === 0 ? 0 : start + 1}-{Math.min(end, total)} {t("product.pagination.of")} {total}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={setPage}
        />
      </div>

      {/* 右侧详情 Drawer */}
      {selectedProduct && (
        <ProductDrawer
          product={selectedProduct}
          onClose={handleCloseDrawer}
          onShowAllTransactions={() => setShowTransactionsModal(true)}
          onShowAllLocations={() => setShowLocationsModal(true)}
        />
      )}

      {/* 弹窗：交易记录 */}
      {showTransactionsModal && selectedProduct && (
        <AllTransactionsModal
          product={selectedProduct}
          onClose={() => setShowTransactionsModal(false)}
        />
      )}

      {/* 弹窗：库存位置 */}
      {showLocationsModal && selectedProduct && (
        <AllLocationsModal
          product={selectedProduct}
          onClose={() => setShowLocationsModal(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
