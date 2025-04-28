// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ExpenseContext from "@/context/ExpenseContext";
import { Pencil, Trash, X } from 'lucide-react';

import React, {  useContext, useEffect, useState } from 'react';
import { createPortal } from "react-dom";
import { toast } from "sonner";
import ConfirmDelete from "../common/DeleteModal";
import { Link } from "react-router-dom";


function BudgetList({ entryData, refreshBudget, name, date }) {
  const { editExpense,deleteExpense } = useContext(ExpenseContext);

  const [budgetItems, setBudgetItems] = useState([]);
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [originalAmount, setOriginalAmount] = useState("");
  
  useEffect(() => {
    setBudgetItems(entryData || []);
    
  }, [entryData]);

  const openEditModal = (item) => {
    setEdit(true);
    setEditId(item.id);
    setUpdateAmount(item.amount_used);
    setUpdateCategory(item.expense_category)
    setOriginalAmount(item.amount_used);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      const lastDigit = day % 10;
      return lastDigit === 1 ? 'st' : lastDigit === 2 ? 'nd' : lastDigit === 3 ? 'rd' : 'th';
    };

    return `${day}${getOrdinalSuffix(day)}-${month}-${year}`;
  };

  const handleDelete = async(id)=>{
      await deleteExpense(id)
      toast.warning("Expense detail has been deleted")
      setConfirmDelete(false);
      refreshBudget()
  };
  
  const handleEdit = async (e) => {
      e.preventDefault();
      if(updateAmount === originalAmount){
        toast.info('No update has been done')
        setEdit(false);
        return;
      }else{
          await editExpense({ id: editId, 
              amount_used: updateAmount 
          });
          toast.success("Budget Detail editted successfully")
          setEdit(false);
          refreshBudget();
      }
  };

  return (
    <>
      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 bg-gray-800 text-white font-semibold p-4 rounded-md text-lg">
          <h2>Name</h2>
          <h2>Amount</h2>
          <h2>Date</h2>
          <h2 className="text-center">Action</h2>
        </div>

        {budgetItems.length > 0 ? (
          budgetItems.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-1 sm:grid-cols-4 p-4 border-b text-gray-900 text-sm ${
                index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
              }`}
            >
              <h2 className="font-medium">{name}</h2>
              <h2 className="text-green-600 font-semibold">Ksh. {item.amount_used}</h2>
              <h2 className="text-gray-700">{formatDate(item.created_at)}</h2>
              <div className="flex justify-center gap-5">
                <button
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
                  onClick={() => openEditModal(item)} 
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
                  onClick={()=>{ setConfirmDelete(true), setEditId(item.id); }}
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
           {new Date() >= new Date(date) ? (
            <Link to="/expense" className="text-blue-500 hover:underline">Click here to add items to budget</Link>
          ) : (
            "Cannot add items yet"
          )}
          </p>
        )}
      </div>

      {edit && createPortal(
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
              <motion.div
                  className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
              >
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={() => setEdit(false)}>
                      <X size={20} />
                  </button>

                  <h2 className="text-xl font-semibold mb-4 text-center">Edit Expense</h2>

                  <form onSubmit={handleEdit}>
                      <div className="mb-4">
                          <label className="block text-gray-400">Expense Category ID </label>
                          <input
                              type="text"
                              list="expense-categories"
                              placeholder="Select or enter a new category"
                              value={updateCategory}
                              onChange={(e) => setUpdateCategory(e.target.value)}
                              className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-not-allowed opacity-50"
                              disabled
                          />
                      </div>


                      <div className="mb-4">
                          <label className="block text-gray-400">Expense Amount</label>
                          <input
                              type="number"
                              value={updateAmount}
                              onChange={(e) => setUpdateAmount(e.target.value)}
                              className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                              required
                              min='0'
                          />
                      </div>

                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                          Edit
                      </button>
                  </form>
              </motion.div>
          </div>,
          document.body
      )}

      {confirmDelete && (
          <ConfirmDelete 
              isOpen={confirmDelete} 
              onClose={() => setConfirmDelete(false)} 
              onConfirm={() => handleDelete(editId)} 
              info="Budget Entry"
          />
      )}
    </>
  );
}

export default BudgetList;
