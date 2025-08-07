import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const ProductDrawer = ({ product, onClose }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const handleChange = (field, value) => {
    setEditedProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (index, key, value) => {
    const updatedLocations = [...editedProduct.stockLocations];
    updatedLocations[index][key] = value;
    setEditedProduct(prev => ({ ...prev, stockLocations: updatedLocations }));
  };

  const saveChanges = () => {
    // TODO: 接入保存逻辑
    setEditing(false);
  };

  const renderField = (label, field, unit) => (
    <div className="drawer-edit-row">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <input
        type="text"
        className="drawer-input"
        value={editedProduct[field] || ""}
        onChange={e => handleChange(field, e.target.value)}
        disabled={!editing}
      />
      {unit && <span className="ml-2 text-sm text-gray-400">{unit}</span>}
    </div>
  );

  const drawerSectionBox = (title, value, onClick) => (
    <div
      className="drawer-section-box cursor-pointer"
      onClick={onClick}
    >
      <div className="drawer-section-box-title">{title}</div>
      <div className="drawer-section-box-value">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
      {/* ✅点击空白关闭 */}
      <div className="flex-1" onClick={onClose}></div>

      {/* ✅ 右侧面板 */}
      <div className="w-[30%] bg-white h-full p-6 shadow-xl overflow-y-auto relative">

        {/* 顶部按钮栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">{t("product.detailTitle")}</h2>
          <div>
            <button className="drawer-edit-btn mr-2" onClick={() => setEditing(!editing)}>
              {editing ? t("save") : t("edit")}
            </button>
            <button className="drawer-edit-btn bg-gray-500 hover:bg-gray-600" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </div>

        {/* 基本字段 */}
        {renderField(t("product.sku"), "sku")}
        {renderField(t("product.name"), "name")}
        {renderField(t("product.stock"), "stock")}
        {renderField(t("product.cost"), "cost")}
        {renderField(t("product.unit"), "unit")}

        {/* 尺寸字段 */}
        <h3 className="mt-4 mb-2 text-sm font-medium text-gray-500">{t("product.dimensions")}</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderField(t("product.height"), "height", "cm")}
          {renderField(t("product.width"), "width", "cm")}
          {renderField(t("product.depth"), "depth", "cm")}
          {renderField(t("product.weight"), "weight", "kg")}
        </div>

        {/* 库存位置 */}
        <h3 className="mt-6 mb-2 text-sm font-medium text-gray-500">{t("product.location")}</h3>
        <div className="drawer-section-scrollable">
          {(editedProduct.stockLocations || []).slice(0, 5).map((loc, index) => (
            <div
              key={index}
              className="drawer-section-box cursor-pointer"
              onClick={() => !editing && setShowAllLocations(true)}
            >
              {editing ? (
                <>
                  <input
                    className="drawer-input mr-2"
                    value={loc.location}
                    onChange={e => handleLocationChange(index, "location", e.target.value)}
                  />
                  <input
                    className="drawer-input w-20"
                    value={loc.quantity}
                    onChange={e => handleLocationChange(index, "quantity", e.target.value)}
                  />
                </>
              ) : (
                <>
                  <div className="drawer-section-box-title">{loc.location}</div>
                  <div className="drawer-section-box-value">
                    {loc.quantity} {editedProduct.unit || "pcs"}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 出货补货记录 */}
        <h3 className="mt-6 mb-2 text-sm font-medium text-gray-500">{t("product.transactions")}</h3>
        <div className="drawer-section-scrollable">
          {(product.transactions || []).slice(0, 5).map((tx, index) => (
            <div
              key={index}
              className="drawer-section-box cursor-pointer"
              onClick={() => !editing && setShowAllTransactions(true)}
            >
              <div className="drawer-section-box-title">
                {format(new Date(tx.date), "dd MMM yyyy")}
              </div>
              <div className="drawer-section-box-value">
                {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {editedProduct.unit || "pcs"}
              </div>
            </div>
          ))}
        </div>

        {/* 保存按钮 */}
        {editing && (
          <button className="drawer-edit-btn mt-4 w-full" onClick={saveChanges}>
            {t("save")}
          </button>
        )}
      </div>

      {/* ✅ 全部位置弹窗 */}
      {showAllLocations && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center" onClick={() => setShowAllLocations(false)}>
          <div className="bg-white max-h-[80%] w-[500px] p-6 rounded-lg overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t("product.location")}</h3>
            {(product.stockLocations || []).map((loc, index) => (
              <div key={index} className="drawer-section-box">
                <div className="drawer-section-box-title">{loc.location}</div>
                <div className="drawer-section-box-value">
                  {loc.quantity} {product.unit || "pcs"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ 全部交易弹窗 */}
      {showAllTransactions && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center" onClick={() => setShowAllTransactions(false)}>
          <div className="bg-white max-h-[80%] w-[500px] p-6 rounded-lg overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t("product.transactions")}</h3>
            {(product.transactions || []).map((tx, index) => (
              <div key={index} className="drawer-section-box">
                <div className="drawer-section-box-title">{format(new Date(tx.date), "dd MMM yyyy")}</div>
                <div className="drawer-section-box-value">
                  {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {product.unit || "pcs"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDrawer;
