// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import IncomeContext from '@/context/IncomeContext';
import { Plus, X } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

function AddIncome({ refreshData }){
    const { addIncome, getIncomeCategories, err } = useContext(IncomeContext);

    const [categorySelect, setCategorySelect] = useState("");
    const [amount, setAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e)=>{
        e.preventDefault();
        let submittingCategory = categorySelect.charAt(0).toUpperCase() + categorySelect.slice(1);
        if (amount>=0){
            try {
                await addIncome( submittingCategory, parseFloat(amount) );
                refreshData();
                toast.success('Income added!')
                setIsOpen(false);
                setCategorySelect("");
                setAmount("");
            } catch (error) {
                toast.error('An error occured adding income details',error)
            }
        }else{
            toast.error("Enter an amount more than ksh.0 ")
        }
    }
    useEffect(()=>{
         getCategorires()
    },[]);

    const getCategorires = async ()=>{
        const category = await getIncomeCategories()
        setCategories(category)
    }

  return (
    <>
       {err ? ( 
        <button
            disabled
            className='flex items-center gap-2 bg-gray-600  text-white font-semibold py-2 px-4 rounded-lg shadow-md '
        >
            <Plus size={18} /> Add Income
        </button>
        ):(
            <button            
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105'
                onClick={() => setIsOpen(true)}
            >
                <Plus size={18} /> Add Income
            </button>

        )}

        {isOpen && createPortal(
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
                <motion.div
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-semibold mb-4 text-center">Add Income</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-400">Category</label>
                            <input
                                type="text"
                                list="income-categories"
                                placeholder="Select or enter a new category"
                                value={categorySelect}
                                onChange={(e) => setCategorySelect(e.target.value)}
                                className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <datalist id="income-categories">
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name} />
                                ))}
                            </datalist>
                        </div>


                        <div className="mb-4">
                            <label className="block text-gray-400">Income Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
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
        )}
    </>
  )
}

export default AddIncome