// src/pages/TransferModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { transferStock } from './productData';
import { useTranslation } from 'react-i18next';

export default function TransferModal({ open, onClose, product, onDone }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState({}); // { [location]: qty }
  const [mode, setMode] = useState('existing'); // existing | new
  const [targetLoc, setTargetLoc] = useState(''); // existing 下拉
  const [newCode, setNewCode] = useState('');     // new 输入
  const [setPrimary, setSetPrimary] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const locations = useMemo(() => {
    return Array.isArray(product?.stockLocations) ? product.stockLocations : [];
  }, [product]);

  const sourceCodes = useMemo(
    () => Object.keys(selected).filter(k => selected[k] > 0),
    [selected]
  );

  const targetCandidates = useMemo(() => {
    return locations
      .map(x => String(x.location))
      .filter(code => !sourceCodes.includes(code));
  }, [locations, sourceCodes]);

  const { totalMove, valid, errorKey } = useMemo(() => {
    let ok = true;
    let sum = 0;
    let err = '';

    for (const code of Object.keys(selected)) {
      const qty = Number(selected[code]) || 0;
      if (qty < 0) { ok = false; err = 'BAD_SOURCE_INPUT'; }
      const row = locations.find(x => String(x.location) === code);
      if (!row) { ok = false; err = 'SOURCE_NOT_FOUND'; }
      if (qty > (Number(row?.quantity) || 0)) { ok = false; err = 'NOT_ENOUGH_QTY'; }
      sum += qty;
    }
    if (sum <= 0) { ok = false; err = 'NO_SOURCES'; }

    if (mode === 'existing') {
      if (!targetLoc) { ok = false; err = 'TARGET_NOT_SELECTED'; }
      if (sourceCodes.includes(targetLoc)) { ok = false; err = 'TARGET_EQUALS_SOURCE'; }
    } else {
      const code = newCode.trim();
      if (!code) { ok = false; err = 'NEW_CODE_EMPTY'; }
      if (locations.some(x => String(x.location) === code)) {
        ok = false; err = 'TARGET_ALREADY_EXISTS';
      }
    }
    return { totalMove: sum, valid: ok, errorKey: err };
  }, [selected, locations, mode, targetLoc, newCode, sourceCodes]);

  useEffect(() => {
    if (!open) {
      setSelected({});
      setMode('existing');
      setTargetLoc('');
      setNewCode('');
      setSetPrimary(true);
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !product) return null;

  const handleToggle = (code, availableQty) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[code] > 0) {
        delete next[code];
      } else {
        next[code] = Math.min(availableQty, availableQty); // 默认填满
      }
      return next;
    });
  };

  const handleQtyChange = (code, v, availableQty) => {
    const n = Number(v);
    setSelected(prev => ({
      ...prev,
      [code]: Number.isFinite(n) ? Math.max(0, Math.min(n, availableQty)) : 0
    }));
  };

  const onConfirm = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        sku: product.sku,
        sources: Object.keys(selected)
          .filter(code => selected[code] > 0)
          .map(code => ({ location: code, qty: Number(selected[code]) })),
        target:
          mode === 'existing'
            ? { type: 'existing', location: targetLoc }
            : { type: 'new', newCode: newCode.trim() },
        setAsPrimary: !!setPrimary
      };
      const res = transferStock(payload);
      if (res?.ok) {
        onDone?.(res);
        onClose?.();
      } else {
        alert(`${t('transfer.toast.failed')}: ${t(`transfer.error.${res?.error || 'UNKNOWN'}`)}`);
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
        className="w-[920px] max-w-[96vw] max-h-[92vh] overflow-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">
            {t('transfer.title')}
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
          {/* 左：来源位置 */}
          <section className="rounded-xl border">
            <div className="px-4 py-3 border-b font-medium">
              {t('transfer.source.title')}
            </div>
            <ul className="divide-y">
              {locations.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">{t('transfer.source.none')}</li>
              ) : (
                locations.map((loc) => {
                  const code = String(loc.location);
                  const available = Number(loc.quantity) || 0;
                  const checked = selected[code] > 0;
                  return (
                    <li key={code} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggle(code, available)}
                          />
                          <span className="text-gray-900">{code}</span>
                          {loc.isPrimary && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {t('transfer.source.main')}
                            </span>
                          )}
                        </label>
                        <div className="text-sm text-gray-600">
                          {t('transfer.source.available')}：{available}
                        </div>
                      </div>

                      {checked && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('transfer.source.transferQty')}</span>
                          <input
                            type="number"
                            value={selected[code]}
                            onChange={(e) => handleQtyChange(code, e.target.value, available)}
                            className="w-32 rounded-lg border px-2 py-1 text-sm"
                            min={0}
                            max={available}
                          />
                          <button
                            className="px-2 py-1 text-xs rounded-lg border hover:bg-gray-50"
                            onClick={() => handleQtyChange(code, available, available)}
                          >
                            {t('transfer.source.all')}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/* 右：目标位置 */}
          <section className="rounded-xl border">
            <div className="px-4 py-3 border-b font-medium">{t('transfer.target.title')}</div>
            <div className="p-4 space-y-4">
              {/* 选择模式 */}
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={mode === 'existing'}
                    onChange={() => setMode('existing')}
                  />
                  <span>{t('transfer.target.chooseExisting')}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={mode === 'new'}
                    onChange={() => setMode('new')}
                  />
                  <span>{t('transfer.target.createNew')}</span>
                </label>
              </div>

              {mode === 'existing' ? (
                <select
                  value={targetLoc}
                  onChange={(e) => setTargetLoc(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">{t('transfer.target.selectPlaceholder')}</option>
                  {targetCandidates.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder={t('transfer.target.inputPlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              )}

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={setPrimary}
                  onChange={(e) => setSetPrimary(e.target.checked)}
                />
                <span>{t('transfer.target.setAsPrimary')}</span>
              </label>

              <div className="text-sm text-gray-600">
                {t('transfer.preview.totalMove')}：<span className="font-semibold">{totalMove}</span>
                {!valid && errorKey && (
                  <span className="ml-2 text-red-600">
                    {t(`transfer.error.${errorKey}`)}
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={onClose}
                  disabled={submitting}
                  title={t('transfer.btn.cancel')}
                >
                  {t('transfer.btn.cancel')}
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-white ${valid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  onClick={onConfirm}
                  disabled={!valid || submitting}
                  title={t('transfer.btn.confirm')}
                >
                  {submitting ? t('transfer.btn.submitting') : t('transfer.btn.confirm')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
