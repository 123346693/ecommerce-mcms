// frontend/src/pages/ProductManagement/ProductPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import productsData from './productData';
import ProductDrawer from './ProductDrawer';

export default function ProductPage() {
  const { t } = useTranslation();

  const [products] = useState(productsData);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const openDrawer = (p) => { setActive(p); setOpen(true); };
  const closeDrawer = () => { setOpen(false); setActive(null); };

  const [keyword, setKeyword] = useState('');

  const allLocations = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p?.stockLocations || []).forEach(l => {
      if (l?.location) set.add(String(l.location));
    }));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
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
    setSelectedLocations(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
  };
  const selectAllLocations = () => setSelectedLocations(allLocations);
  const clearAllLocations = () => setSelectedLocations([]);

  const [sortField, setSortField] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');

  function getPrimaryLocCode(p) {
    const arr = Array.isArray(p?.stockLocations) ? p.stockLocations : [];
    const primary = arr.find(l => l?.isPrimary);
    const code = (primary?.location ?? arr[0]?.location ?? '').toString().trim().toUpperCase();
    return code;
  }

  const getTotalQuantity = (p) =>
    (p?.stockLocations || []).reduce((sum, l) => sum + (Number(l?.quantity) || 0), 0);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    let list = products.filter(p => {
      const hitKW = !kw
        || String(p?.name || '').toLowerCase().includes(kw)
        || String(p?.sku  || '').toLowerCase().includes(kw);
      if (!hitKW) return false;

      if (selectedLocations.length === 0) return true;
      const locs = (p?.stockLocations || []).map(l => String(l.location));
      return locs.some(code => selectedLocations.includes(code));
    });

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
          const aEmpty = A.length === 0, bEmpty = B.length === 0;
          if (aEmpty && bEmpty) return 0;
          if (aEmpty) return 1;
          if (bEmpty) return -1;
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
  }, [products, keyword, selectedLocations, sortField, sortOrder]);

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
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[420px] lg:w-[560px]">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('product.searchPlaceholder')}
              className="w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <button
              id="location-multiselect-trigger"
              type="button"
              onClick={() => setLocOpen(v => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm hover:bg-gray-50"
            >
              <span className="text-gray-700">{t('filter.location')}</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {selectedLocations.length || t('common.all', 'All')}
              </span>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
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
                        {t('common.select', 'Select')} {t('common.all', 'All')}
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
        </div>

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(p => {
          const total = getTotalQuantity(p);
          return (
            <div
              key={p.sku}
              className="group cursor-pointer rounded-2xl border bg-white p-4 hover:shadow-md transition"
              onClick={() => openDrawer(p)}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="truncate font-medium text-gray-900" title={p.name}>{p.name}</div>
                <div className="text-xs text-gray-500">SKU: {p.sku}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  {t('product.totalStock', 'Total Stock')}：<span className="font-semibold">{total}</span>
                </div>
                <div className="text-gray-600">
                  {t('product.cost', 'Cost')}：<span className="font-semibold">
                    {p.cost == null ? '-' : `$${Number(p.cost).toFixed(2)}`}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 truncate">
                {(p.stockLocations || []).slice(0, 2).map(l => l.location).join(' · ')}
                {(p.stockLocations || []).length > 2 ? ' …' : ''}
              </div>
            </div>
          );
        })}
      </div>

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
