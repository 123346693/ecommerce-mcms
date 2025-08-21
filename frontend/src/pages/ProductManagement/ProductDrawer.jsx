// frontend/src/pages/ProductManagement/ProductDrawer.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransferModal from './TransferModal';
import AdjustmentModal from './AdjustmentModal';
import AllLocationsModal from './AllLocationsModal';
import AllTransactionsModal from './AllTransactionsModal';
import { getTotalQuantity, setPrimaryLocation } from './productData';

export default function ProductDrawer({
  product,
  onClose,
  onShowAllTransactions,
  onShowAllLocations
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const triggerRefresh = () => setRefreshTick(x => x + 1);

  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  // 新增：内部控制 “全部库位 / 全部出入库” 弹窗
  const [allLocOpen, setAllLocOpen] = useState(false);
  const [allTxOpen, setAllTxOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const totalQty = useMemo(() => getTotalQuantity(product), [product, refreshTick]);

  const top5Locations = useMemo(() => {
    const locs = Array.isArray(product?.stockLocations) ? product.stockLocations : [];
    return locs.slice(0, 5);
  }, [product, refreshTick]);

  const top5Transactions = useMemo(() => {
    const txs = Array.isArray(product?.transactions) ? product.transactions : [];
    return txs.slice(0, 5);
  }, [product, refreshTick]);

  const [form, setForm] = useState({
    sku: product?.sku ?? '',
    name: product?.name ?? '',
    cost: product?.cost ?? '',
    unit: product?.unit ?? '',
    height: product?.height ?? '',
    width: product?.width ?? '',
    depth: product?.depth ?? '',
    weight: product?.weight ?? ''
  });

  useEffect(() => {
    setForm({
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      cost: product?.cost ?? '',
      unit: product?.unit ?? '',
      height: product?.height ?? '',
      width: product?.width ?? '',
      depth: product?.depth ?? '',
      weight: product?.weight ?? ''
    });
    setEditing(false);
    setTransferOpen(false);
    setAdjustOpen(false);
    setAllLocOpen(false);
    setAllTxOpen(false);
  }, [product]);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const onSave = () => setEditing(false);

  if (!product) return null;

  const costView =
    form.cost === '' || form.cost === null || form.cost === undefined
      ? '-'
      : `$${Number(form.cost).toFixed(2)}`;

  const handleTransferDone = (res) => {
    if (res?.target?.location && res?.target?.isPrimary) {
      setPrimaryLocation(product.sku, res.target.location);
    }
    triggerRefresh();
  };

  const handleAdjustDone = () => {
    triggerRefresh();
  };

  // 统一打开弹窗的内部处理（保持对外 props 不破坏）
  const openAllLocations = () => {
    // 如果父组件提供了处理器，也调用一下（兼容旧逻辑）
    onShowAllLocations?.();
    // 同时打开本地弹窗，确保可见
    setAllLocOpen(true);
  };
  const openAllTransactions = () => {
    onShowAllTransactions?.();
    setAllTxOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-[780px] max-w-[95vw] max-h-[92vh] overflow-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部条 */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {product?.name ?? '-'}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {t('product.sku', 'SKU')}：{product?.sku ?? '-'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
                onClick={() => setEditing(true)}
                title={t('common.edit')}
              >
                {t('common.edit')}
              </button>
            ) : (
              <button
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={onSave}
                title={t('common.save')}
              >
                {t('common.save')}
              </button>
            )}
            <button
              className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              title={t('common.close')}
            >
              {t('common.close')}
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-5 space-y-6">
          {/* 基本信息 + 尺寸/重量/体积重量 */}
          <section className="grid grid-cols-2 gap-3">
            <Field label={t('product.sku')} value={form.sku} editing={editing} onChange={(v) => update('sku', v)} />
            <Field label={t('product.name')} value={form.name} editing={editing} onChange={(v) => update('name', v)} />
            <Field label={t('product.totalStock')} value={String(totalQty)} editing={false} />
            <Field label={t('product.cost')} value={editing ? String(form.cost ?? '') : costView} editing={editing} type="number" onChange={(v) => update('cost', v)} />
            <Field label={t('product.unit')} value={form.unit} editing={editing} onChange={(v) => update('unit', v)} />
            <Field label={t('product.height')} value={String(form.height ?? '')} editing={editing} type="number" onChange={(v) => update('height', v)} />
            <Field label={t('product.width')} value={String(form.width ?? '')} editing={editing} type="number" onChange={(v) => update('width', v)} />
            <Field label={t('product.depth')} value={String(form.depth ?? '')} editing={editing} type="number" onChange={(v) => update('depth', v)} />
            <Field label={t('product.weight')} value={String(form.weight ?? '')} editing={editing} type="number" onChange={(v) => update('weight', v)} />
            <Field
              label={t('product.volumetricWeight')}
              value={
                (Number(product?.height)||0) && (Number(product?.width)||0) && (Number(product?.depth)||0)
                  ? `${((Number(product.height)*Number(product.width)*Number(product.depth))/6000).toFixed(2)} kg`
                  : '-'
              }
              editing={false}
            />
          </section>

          {/* 库存位置 + 库存转移按钮 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {t('product.locationsTitle')}
              </h3>
              <button
                className="text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                onClick={() => setTransferOpen(true)}
                title={t('product.inventoryTransfer')}
              >
                {t('product.inventoryTransfer')}
              </button>
            </div>

            {top5Locations.length === 0 ? (
              <div className="text-sm text-gray-500">{t('product.noLocations')}</div>
            ) : (
              <ul className="divide-y rounded-lg border">
                {top5Locations.map((loc, idx) => {
                  const lname = loc?.location == null ? '-' : String(loc.location);
                  const lqty = Number(loc?.quantity) || 0;
                  return (
                    <li
                      key={`${lname}-${idx}`}
                      className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      title={t('product.clickToSeeAllLocations')}
                      onClick={openAllLocations}
                    >
                      <span className="text-gray-800">
                        {lname}
                        {loc?.isPrimary && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {t('transfer.source.main')}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-700">{t('product.quantity')}：{lqty}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* 出货 / 补货（前 5 条） + 手动调整按钮 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {t('product.transactionsTitle')}
              </h3>
              <button
                className="text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                onClick={() => setAdjustOpen(true)}
                title={t('product.manualAdjustment')}
              >
                {t('product.manualAdjustment')}
              </button>
            </div>

            {top5Transactions.length === 0 ? (
              <div className="text-sm text-gray-500">{t('product.noTransactions')}</div>
            ) : (
              <ul className="divide-y rounded-lg border">
                {top5Transactions.map((tx, idx) => {
                  const when = tx?.date ?? '';
                  const q = Number(tx?.quantity) || 0;
                  const desc = q >= 0 ? t('product.restock') : t('product.ship');
                  return (
                    <li
                      key={`tx-${idx}`}
                      className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      title={t('product.clickToSeeAllTransactions')}
                      onClick={openAllTransactions}
                    >
                      <span className="text-gray-800">{when} {desc}</span>
                      <span className={q < 0 ? 'text-red-600' : 'text-emerald-700'}>
                        {q > 0 ? `+${q}` : q}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* 库存转移弹窗 */}
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        product={product}
        onDone={handleTransferDone}
      />

      {/* 手动调整弹窗 */}
      <AdjustmentModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        product={product}
        onDone={handleAdjustDone}
      />

      {/* 全部库位弹窗 */}
      {allLocOpen && (
        <AllLocationsModal
          product={product}
          onClose={() => setAllLocOpen(false)}
        />
      )}

      {/* 全部出入库弹窗 */}
      {allTxOpen && (
        <AllTransactionsModal
          product={product}
          onClose={() => setAllTxOpen(false)}
        />
      )}
    </div>
  );
}

function Field({ label, value, editing, onChange, type = 'text' }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      {editing ? (
        <input
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          type={type}
        />
      ) : (
        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-gray-50 text-gray-800 min-h-[28px]">
          {value === '' || value === undefined || value === null ? '-' : String(value)}
        </div>
      )}
    </div>
  );
}
