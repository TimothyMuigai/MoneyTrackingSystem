// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React from 'react'
import { createPortal } from "react-dom";

function SubscriptionStatus({ isOpen, onClose, onConfirm, info, SubType }) {
    if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center"
      >
        <h2 className="text-xl font-semibold text-gray-900">{SubType}?</h2>
        <p className="text-gray-600 text-sm mt-2">
        {info}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </div>,
    document.body

  )
}

export default SubscriptionStatus