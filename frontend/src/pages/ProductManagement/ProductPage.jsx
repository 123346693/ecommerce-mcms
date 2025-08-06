import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import productData from './productData';
import ProductDrawer from './ProductDrawer';

export default function ProductPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t } = useTranslation();
  const drawerRef = useRef(null);

  const openDrawer = (product) => setSelectedProduct(product);
  const closeDrawer = () => setSelectedProduct(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.closest('tr')
      ) {
        closeDrawer();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-6 font-sans text-[15px]">
      <h1 className="text-2xl font-bold mb-4">{t('product.title', '产品管理')}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">{t('product.sku')}</th>
              <th className="px-4 py-2 border">{t('product.name')}</th>
              <th className="px-4 py-2 border">{t('product.stock')}</th>
              <th className="px-4 py-2 border">{t('product.cost')}</th>
              <th className="px-4 py-2 border">{t('product.unit')}</th>
              <th className="px-4 py-2 border">{t('product.supplier')}</th>
              <th className="px-4 py-2 border">{t('product.supplierUrl')}</th>
            </tr>
          </thead>
          <tbody>
            {productData.map((product) => (
              <tr
                key={product.sku}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => openDrawer(product)}
              >
                <td className="px-4 py-2 border">{product.sku}</td>
                <td className="px-4 py-2 border">{product.name}</td>
                <td className="px-4 py-2 border">{product.stock}</td>
                <td className="px-4 py-2 border">${product.cost}</td>
                <td className="px-4 py-2 border">{product.unit}</td>
                <td className="px-4 py-2 border">{product.supplier}</td>
                <td className="px-4 py-2 border text-blue-600 underline">
                  <a href={product.supplierUrl} target="_blank" rel="noreferrer">
                    {t('product.supplierUrl')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedProduct && (
        <div ref={drawerRef}>
          <ProductDrawer product={selectedProduct} onClose={closeDrawer} />
        </div>
      )}
    </div>
  );
}
