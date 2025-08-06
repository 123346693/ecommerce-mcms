import React from 'react'

export default function ProductTable({ products, onRowDoubleClick }) {
  return (
    <table className="w-full text-left table-auto border border-gray-200 shadow-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 font-medium">SKU</th>
          <th className="p-3 font-medium">名称</th>
          <th className="p-3 font-medium">库存</th>
          <th className="p-3 font-medium">成本</th>
          <th className="p-3 font-medium">供货商</th>
          <th className="p-3 font-medium">供应商链接</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr
            key={product.sku}
            onDoubleClick={() => onRowDoubleClick(product)}
            className="hover:bg-blue-50 transition duration-200 cursor-pointer"
          >
            <td className="p-3">{product.sku}</td>
            <td className="p-3">{product.name}</td>
            <td className="p-3">{product.stock}</td>
            <td className="p-3">${product.cost}</td>
            <td className="p-3">{product.vendor}</td>
            <td className="p-3">
              <a href={product.vendorUrl} className="text-blue-500 underline" target="_blank" rel="noreferrer">链接</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
