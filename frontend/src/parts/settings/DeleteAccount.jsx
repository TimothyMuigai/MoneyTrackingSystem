// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

const DeleteAccount = ({ isOpen, onClose, onConfirm, info, loading }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center"
      >
        <h2 className="text-xl font-semibold text-gray-900">Delete This {info}?</h2>
        <p className="text-gray-600 text-sm mt-2">
        Are you sure you want to delete this {info}? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
						onClick={onConfirm}
						disabled={loading}
						className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
					>
						{loading ? (
							<svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
								></path>
							</svg>
						) : (
							"Delete"
						)}
					</button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default DeleteAccount;
