/* ✅ ProductPage.jsx 升级：左侧排列 SKU + Name + 加入高宽深重列 + 主储位显示逻辑 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import productData from './productData';
import ProductDrawer from './ProductDrawer';

export default function ProductPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredProducts = productData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStock = (product) => {
    if (!product.stockLocations) return product.stock || 0;
    return product.stockLocations.reduce((sum, loc) => sum + loc.quantity, 0);
  };

  const getPrimaryLocation = (product) => {
    if (!product.stockLocations || product.stockLocations.length === 0) return '-';
    return product.stockLocations[0].location;
  };

  return (
    <div className="p-6 font-sans text-[15px] bg-[#fafafa] min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1c1c1e]">{t('product.title')}</h1>
        <input
          type="text"
          placeholder={t('product.searchPlaceholder') || 'Search...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring w-60"
        />
      </div>
      <div className="overflow-x-auto grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.sku}
            onClick={() => openDrawer(product)}
            className="bg-white hover:bg-gray-50 rounded-2xl shadow border p-4 cursor-pointer transition-all duration-200"
          >
            <div className="flex text-[#1c1c1e] text-[15px] mb-2 gap-4">
              <span className="font-medium text-lg">{product.sku}</span>
              <span className="font-medium text-lg">{product.name}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-y-2 text-sm text-gray-700">
              <div>{t('product.stock')}: {getTotalStock(product)}</div>
              <div>{t('product.cost')}: ${product.cost}</div>
              <div>{t('product.unit')}: {product.unit}</div>
              <div>{t('product.location')}: {getPrimaryLocation(product)}</div>
              <div>{t('product.height')}: {product.height} cm</div>
              <div>{t('product.width')}: {product.width} cm</div>
              <div>{t('product.depth')}: {product.depth} cm</div>
              <div>{t('product.weight')}: {product.weight} kg</div>
            </div>
          </div>
        ))}
      </div>
      {selectedProduct && (
        <div ref={drawerRef}>
          <ProductDrawer product={selectedProduct} onClose={closeDrawer} />
        </div>
      )}
    </div>
  );
}
