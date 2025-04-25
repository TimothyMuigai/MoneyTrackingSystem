// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { User, X } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

import React, { useContext, useEffect, useState } from 'react';

import BudgetContext from "@/context/BudgetContext";
import ExpenseContext from "@/context/ExpenseContext";

  function AddBudget({refreshBudgets}) {
    const { getExpenseCategories } = useContext(ExpenseContext);
    const { addBudget } = useContext(BudgetContext);

    const [categories, setCategories] = useState([]);
    
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("")
    const [start_at, setStart_at] = useState("")
    const [due_when, setDue_when] = useState("")

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(()=>{
      fetchCategory();
    },[isModalOpen]);
    
    const fetchCategory = async () => {
      const categoryData = await getExpenseCategories();
      setCategories(categoryData);
    };

    const handleSubmit = async(e) => {
      e.preventDefault();
    
      const today = new Date().toISOString().split("T")[0];
    
      if (parseFloat(amount) <= 0) {
        toast.error('The amount should be more than 0');
        return;
      }
    
      if (start_at < today) {
        toast.error('Start date cannot be in the past');
        return;
      }
    
      if (due_when <= start_at) {
        toast.error('Due date cannot be earlier or same as start date');
        return;
      }
    
      let submitCat = category.charAt(0).toUpperCase() + category.slice(1);
    
      try {
        await addBudget(submitCat, parseFloat(amount), start_at, due_when);
        toast.success('Budget added!');
        refreshBudgets();
        setIsModalOpen(false);
        setCategory("");
        setAmount("");
        setStart_at("");
        setDue_when("");
      } catch (error) {
        console.error("Error adding budget:", error);
        toast.error("Something went wrong");
      }
    };
    
    return (
      <>
        <div onClick={()=>setIsModalOpen(true)}>
          <div className="p-10 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-500 cursor-pointer 
                          hover:bg-gray-800 hover:border-gray-400 hover:shadow-lg hover:transition-all duration-300 ease-in-out 
                          h-[170px] bg-gray-900 text-gray-300">
            <h2 className="text-4xl text-gray-400">+</h2>
            <h2 className="text-lg font-medium">Create New Budget</h2>
          </div>
        </div>
        {isModalOpen &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
              <motion.div
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Add Budget</h2>

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
                    <label className="block text-gray-400">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={start_at}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => 
                          setStart_at(e.target.value)
                          }
                        className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={due_when}
                        min={start_at || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDue_when(e.target.value)}
                        className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>


                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                    Add Budget
                  </button>
                </form>
              </motion.div>
            </div>,
            document.body
          )
        }
      </>
    );
  }

  export default AddBudget;
