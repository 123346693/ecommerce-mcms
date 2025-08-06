import React, { useState } from 'react';

export default function ProductDrawer({ product, onClose }) {
  const [editedProduct, setEditedProduct] = useState(product);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockChange, setStockChange] = useState(0);
  const [reason, setReason] = useState('');

  const handleChange = (field, value) => {
    setEditedProduct({ ...editedProduct, [field]: value });
  };

  const confirmStockChange = () => {
    alert(`库存变更: ${stockChange}, 原因: ${reason}\n提醒管理员确认。`);
    setShowStockModal(false);
  };

  return (
    <div className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-lg p-6 z-50 overflow-y-auto transition-transform transform translate-x-0">
      <button className="text-gray-500 mb-4" onClick={onClose}>关闭</button>
      <h2 className="text-xl font-bold mb-4">产品详情 / Product Detail</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input type="text" value={editedProduct.sku} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">产品名称 / Name</label>
          <input type="text" value={editedProduct.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">库存 / Stock</label>
          <div className="flex items-center gap-3">
            <input type="number" value={editedProduct.stock} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setShowStockModal(true)}>修改库存</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">成本 / Cost</label>
          <input type="number" step="0.01" value={editedProduct.cost} onChange={(e) => handleChange('cost', parseFloat(e.target.value))} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">单位 / Unit</label>
          <input type="text" value={editedProduct.unit} onChange={(e) => handleChange('unit', e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">出货/补货记录 / Transactions</h3>
        <ul className="space-y-2">
          {product.transactions?.map((tx, idx) => (
            <li
              key={idx}
              onDoubleClick={() => alert(`详情：${tx.details}`)}
              className="bg-gray-100 p-3 rounded cursor-pointer hover:bg-gray-200"
            >
              <span className="text-sm text-gray-700">{tx.date}</span> —
              <span className={`ml-2 font-bold ${tx.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.change > 0 ? '+' : ''}{tx.change}</span>
            </li>
          ))}
          {product.transactions?.length === 0 && <li className="text-gray-400">暂无记录 / No Record</li>}
        </ul>
      </div>

      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">库存变更 / Stock Adjustment</h3>
            <p className="mb-2">产品：{editedProduct.name}</p>
            <input
              type="number"
              placeholder="变更数量（+/-）"
              value={stockChange}
              onChange={(e) => setStockChange(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <textarea
              placeholder="说明 / Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowStockModal(false)} className="text-gray-600">取消</button>
              <button onClick={confirmStockChange} className="bg-blue-600 text-white px-4 py-2 rounded">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}