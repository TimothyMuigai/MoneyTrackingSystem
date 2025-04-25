import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

function LowBalanceWarning({ isOpen, onClose, onContinue, amount }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
            <motion.div
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={onClose}>
                    <X size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center">Warning: Negative Balance</h2>
                <p className="text-gray-300 text-center">Your balance is <span className="font-bold text-red-500">{`ksh ${amount.toLocaleString()}`}</span> Do you still want to constinue?</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={onContinue}>
                        Continue
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}

export default LowBalanceWarning;
