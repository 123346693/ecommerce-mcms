// src/pages/AdjustmentModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adjustStockWithTransaction } from './productData';

export default function AdjustmentModal({ open, onClose, product, onDone }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('existing'); // existing | new
  const [targetLoc, setTargetLoc] = useState('');
  const [newCode, setNewCode] = useState('');
  const [type, setType] = useState('deduct'); // deduct | add
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('damage'); // damage | shrinkage | cycle | other
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const locations = useMemo(() => {
    return Array.isArray(product?.stockLocations) ? product.stockLocations : [];
  }, [product]);

  const existingCodes = useMemo(() => locations.map(l => String(l.location)), [locations]);

  const qtyNum = Number(qty);
  const selectedAvailable = useMemo(() => {
    if (type !== 'deduct' || mode === 'new') return Infinity;
    const row = locations.find(x => String(x.location) === targetLoc);
    return Number(row?.quantity) || 0;
  }, [locations, targetLoc, type, mode]);

  const valid = useMemo(() => {
    if (!product) return false;
    if (!qty || !Number.isFinite(qtyNum) || qtyNum <= 0) return false;
    if (mode === 'existing') {
      if (!targetLoc) return false;
      if (type === 'deduct' && qtyNum > selectedAvailable) return false;
    } else {
      const code = newCode.trim();
      if (!code) return false;
      if (existingCodes.includes(code)) return false; // 新建不能重复
    }
    return true;
  }, [product, qty, qtyNum, mode, targetLoc, type, selectedAvailable, existingCodes, newCode]);

  useEffect(() => {
    if (!open) {
      setMode('existing');
      setTargetLoc('');
      setNewCode('');
      setType('deduct');
      setQty('');
      setReason('damage');
      setNote('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !product) return null;

  const onConfirm = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        sku: product.sku,
        target: mode === 'existing'
          ? { type: 'existing', location: targetLoc }
          : { type: 'new', newCode: newCode.trim() },
        // add: 正数；deduct: 负数
        quantity: type === 'add' ? qtyNum : -qtyNum,
        reason,
        note
      };
      const res = adjustStockWithTransaction(payload);
      if (res?.ok) {
        onDone?.(res);
        onClose?.();
      } else {
        alert(`${t('adjust.toast.failed')}: ${t(`adjust.error.${res?.error || 'UNKNOWN'}`)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-[760px] max-w-[96vw] max-h-[92vh] overflow-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">
            {t('adjust.title')}
          </div>
          <button
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            title={t('common.close')}
          >
            {t('common.close')}
          </button>
        </div>

        {/* 内容 */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 左：类型+理由+备注 */}
          <section className="rounded-xl border">
            <div className="px-4 py-3 border-b font-medium">{t('adjust.left.title')}</div>
            <div className="p-4 space-y-4 text-sm">
              <div>
                <div className="mb-1 text-gray-600">{t('adjust.left.type')}</div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" checked={type === 'deduct'} onChange={() => setType('deduct')} />
                    <span>{t('adjust.left.deduct')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" checked={type === 'add'} onChange={() => setType('add')} />
                    <span>{t('adjust.left.add')}</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-1 text-gray-600">{t('adjust.left.reason')}</div>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="damage">{t('adjust.reason.damage')}</option>
                  <option value="shrinkage">{t('adjust.reason.shrinkage')}</option>
                  <option value="cycle">{t('adjust.reason.cycle')}</option>
                  <option value="other">{t('adjust.reason.other')}</option>
                </select>
              </div>

              <div>
                <div className="mb-1 text-gray-600">{t('adjust.left.note')}</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder={t('adjust.left.notePlaceholder')}
                />
              </div>
            </div>
          </section>

          {/* 右：目标位置 + 数量 */}
          <section className="rounded-xl border">
            <div className="px-4 py-3 border-b font-medium">{t('adjust.right.title')}</div>
            <div className="p-4 space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
                  <span>{t('adjust.right.existing')}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} />
                  <span>{t('adjust.right.new')}</span>
                </label>
              </div>

              {mode === 'existing' ? (
                <select
                  value={targetLoc}
                  onChange={(e) => setTargetLoc(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">{t('adjust.right.selectPlaceholder')}</option>
                  {existingCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder={t('adjust.right.inputPlaceholder')}
                />
              )}

              <div>
                <div className="mb-1 text-gray-600">{t('adjust.right.qty')}</div>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                  min={0}
                  step="1"
                  placeholder="0"
                />
                {type === 'deduct' && mode === 'existing' && (
                  <div className="mt-1 text-xs text-gray-500">
                    {t('adjust.right.available')}: {selectedAvailable}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={onClose}
                  disabled={submitting}
                >
                  {t('adjust.btn.cancel')}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${valid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  onClick={onConfirm}
                  disabled={!valid || submitting}
                >
                  {submitting ? t('adjust.btn.submitting') : t('adjust.btn.confirm')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
