// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SubscriptionContext from "@/context/SubscriptionContext";
import { Plus, X } from 'lucide-react';
import { useContext, useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { toast } from "sonner";
import { addDays, addMonths, addYears, parseISO, format } from "date-fns";


function AddSubs({ refreshData }){
    const { getSubCategory, addSubs, err} = useContext(SubscriptionContext);

    const [categorySelect, setCategorySelect] = useState([]);

    // eslint-disable-next-line no-unused-vars
    const [autoDueDate, setAutoDueDate] = useState(true);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [start_date, setStartDate] =useState("");
    const [due_date, setDueDate] = useState("");
    const [frequency, setFrequency] = useState("monthly");

    const [isOpen, setIsOpen] = useState(false);    

    const handleSubmit = async (e)=>{
        e.preventDefault();
        let submittingCategory = category.charAt(0).toUpperCase() + category.slice(1);

        if (new Date(due_date) < new Date(start_date)) {
            toast.error("Due date cannot be earlier than start date");
            return;
        }

        if (amount>=0){
            try {
                await addSubs( submittingCategory, parseFloat(amount), start_date, due_date, frequency );
                refreshData();
                toast.success('Subscription is added!')

                setIsOpen(false);

                setCategory("");
                setAmount("");
                setDueDate("");
                setStartDate("");
                setFrequency("");

            } catch (error) {
                toast.error('An error occured adding subscritpion details',error)
            }
        }else{
            toast.error("Enter an amount more than ksh.0 ")
        }
    }

    useEffect(()=>{
        getCategorires()
    },[isOpen]);

    const getCategorires = async ()=>{
        const category = await getSubCategory()
        setCategorySelect(category)
    }

    const handleStartDateChange = (date) => {
        setStartDate(date);
    
        if (!date || !frequency) return;
    
        const parsedDate = parseISO(date);
        let newDueDate;
    
        switch (frequency) {
            case "weekly":
                newDueDate = addDays(parsedDate, 7);
                break;
            case "monthly":
                newDueDate = addMonths(parsedDate, 1);
                break;
            case "yearly":
                newDueDate = addYears(parsedDate, 1);
                break;
            default:
                newDueDate = parsedDate;
        }
    
        setDueDate(format(newDueDate, "yyyy-MM-dd"));
        setAutoDueDate(true);
    };
    
    const handleFrequencyChange = (value) => {
        setFrequency(value);
    
        if (start_date) {
            handleStartDateChange(start_date);
        }
    };
    

  return (
    <>
        {err ? ( 
        <button
            disabled
            className='flex items-center gap-2 bg-gray-600  text-white font-semibold py-2 px-4 rounded-lg shadow-md '
        >
            <Plus size={18} /> Add Subscription
        </button>
        ):(
            <button            
                className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105'
                onClick={() => setIsOpen(true)}
            >
                <Plus size={18} /> Add Subscription
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

                    <h2 className="text-xl font-semibold mb-4 text-center">Add Subscription</h2>

                    <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-gray-400 mb-1">Category</label>
                        <input
                            type="text"
                            list="subscritpion-categories"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Select or enter a new category"
                            className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <datalist id="subscritpion-categories">
                                {categorySelect.map((cat) => (
                                    <option key={cat.id} value={cat.name} />
                                ))}
                            </datalist>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Amount</label>
                        <input
                        type="number"
                        value={amount}
                        onChange={(e)=>setAmount(e.target.value)}
                        className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => handleFrequencyChange(e.target.value)}
                            className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={start_date}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={due_date}
                                onChange={(e) => {
                                    setDueDate(e.target.value);
                                    setAutoDueDate(false);
                                }}
                                className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200"
                    >
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

export default AddSubs