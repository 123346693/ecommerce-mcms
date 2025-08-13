import React from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const AllTransactionsModal = ({ product, onClose }) => {
  const { t } = useTranslation();

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-[40%] max-h-[80%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("product.transactions")}</h2>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>
            ✕
          </button>
        </div>

        {(product.transactions || []).map((tx, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-200"
          >
            <div className="text-sm text-gray-700">
              {format(new Date(tx.date), "yyyy-MM-dd")}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {tx.quantity > 0 ? "+" : ""}
              {tx.quantity} {product.unit || "pcs"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTransactionsModal;
