// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import ExpenseContext from '@/context/ExpenseContext';
import React, { useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { toast } from 'sonner';

function AddExpense({ refreshData, isOpen, onClose }) {

  const { addExpense, getExpenseCategories } = useContext(ExpenseContext);

    const [category, setCategory] = useState("");
    const [expense, setExpense] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(()=>{
      fetchCategory();
    },[isOpen]);

  const fetchCategory = async () => {
    const categoryData = await getExpenseCategories();
    setCategories(categoryData);
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      let submitCat = category.charAt(0).toUpperCase() + category.slice(1);
      if (expense>=0){
        try {
            await addExpense( parseFloat(expense), submitCat );
            toast.success('Expense added!')
            refreshData();
            onClose();
            setCategory("");
            setExpense("");
        } catch (error) {
            console.error("Error adding budget:", error);
        }
      }
    };

  return isOpen ? createPortal(
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

                <h2 className="text-xl font-semibold mb-4 text-center">Add Expense</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400">Category</label>
                        <input
                            type="text"
                            list="expense-categories"
                            placeholder="Select or enter a new category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <datalist id="expense-categories">
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400">Expense Amount</label>
                        <input
                            type="number"
                            value={expense}
                            onChange={(e) => setExpense(e.target.value)}
                            className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                        Save
                    </button>
                </form>
            </motion.div>
        </div>,
        document.body
    ) : null;
}

export default AddExpense