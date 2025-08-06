import React from 'react'

export default function ProductDetailCard({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed top-5 right-5 w-96 bg-white rounded-xl shadow-xl p-6 z-50 border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <button
          className="text-gray-500 hover:text-red-500 text-sm"
          onClick={onClose}
        >
          ❌
        </button>
      </div>
      <p><strong>SKU:</strong> {product.sku}</p>
      <p><strong>库存:</strong> {product.stock}</p>
      <p><strong>成本:</strong> ${product.cost}</p>
      <p><strong>供货商:</strong> {product.vendor}</p>
      <p><strong>链接:</strong> <a href={product.vendorUrl} className="text-blue-500 underline" target="_blank" rel="noreferrer">查看</a></p>
    </div>
  );
}