import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const ProductDrawer = ({ product, onClose, onShowAllTransactions = () => {}, onShowAllLocations = () => {} }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
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
    // TODO: 保存逻辑
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={onClose}>
      <div
        className="w-[28%] bg-white h-full p-6 shadow-xl overflow-y-auto ml-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">{t("product.detailTitle")}</h2>
          <div>
            <button className="drawer-edit-btn mr-2" onClick={() => setEditing(!editing)}>
              {editing ? t("common.save") : t("common.edit")}
            </button>
            <button className="drawer-edit-btn bg-gray-500 hover:bg-gray-600" onClick={onClose}>
              {t("common.close")}
            </button>
          </div>
        </div>

        {renderField(t("product.sku"), "sku")}
        {renderField(t("product.name"), "name")}
        {renderField(t("product.stock"), "stock")}
        {renderField(t("product.cost"), "cost")}
        {renderField(t("product.unit"), "unit")}

        <h3 className="mt-4 mb-2 text-sm font-medium text-gray-500">{t("product.dimensions")}</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderField(t("product.height"), "height", "cm")}
          {renderField(t("product.width"), "width", "cm")}
          {renderField(t("product.depth"), "depth", "cm")}
          {renderField(t("product.weight"), "weight", "kg")}
        </div>

        <h3 className="mt-6 mb-2 text-sm font-medium text-gray-500">{t("product.location")}</h3>
        <div className="drawer-section-scrollable">
          {(editedProduct.stockLocations || []).slice(0, 5).map((loc, index) => (
            <div
              key={index}
              className="drawer-section-box cursor-pointer"
              onClick={() => {
                if (!editing) onShowAllLocations(product);
              }}
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
                  <div className="drawer-section-box-value">{loc.quantity} {editedProduct.unit || "pcs"}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <h3 className="mt-6 mb-2 text-sm font-medium text-gray-500">{t("product.transactions")}</h3>
        <div className="drawer-section-scrollable">
          {(product.transactions || []).slice(0, 5).map((tx, index) => (
            <div
              key={index}
              className="drawer-section-box cursor-pointer"
              onClick={() => {
                if (!editing) onShowAllTransactions(product);
              }}
            >
              <div className="drawer-section-box-title">
                {format(new Date(tx.date), "dd MMM yyyy")}
              </div>
              <div className="drawer-section-box-value">
                {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {product.unit || "pcs"}
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <button className="drawer-edit-btn mt-4 w-full" onClick={saveChanges}>
            {t("common.save")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDrawer;
