// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ExpenseContext from '@/context/ExpenseContext'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import TableSkeleton from "../common/TableSkeleton";
import { ArrowDown, ArrowUp, ArrowUpDown, Banknote, Pencil, Plus, Search, Trash2, TrendingDown, X } from "lucide-react";
import Warning from "./Warning";
import AddExpense from "./AddExpense";
import ConfirmDelete from "../common/DeleteModal";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import CurrencyContext from "@/context/CurrencyContext";

function DisplayExpense({ refreshData }) {
  const { getExpenses, loading, err, getIncomes, deleteExpense, getExpenseCategories, editExpense } = useContext(ExpenseContext);
  const { exchangeRates, toCurrency} = useContext(CurrencyContext);

    const currencyAmount = exchangeRates[toCurrency] || 1;
    const currency = toCurrency;

    const [expenseData, setExpenseData] = useState([]);
    const [incomeData, setIncomeData] = useState([]);

    const [categories, setCategories] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);

    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [isExpenseOpen, setIsExpenseOpen] = useState(false);

    const [updateCategory, setUpdate] = useState("");
    const [updateAmount, setUpdateAmount] = useState("");
    const [isEdit, setEdit] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const handleDelete = async(id)=>{
        await deleteExpense(id)
        toast.warning("Expense detail has been deleted")
        setConfirmDelete(false);
        fetchData()
    };  

    useEffect(()=>{
        fetchData();
        fetchIncomeData();
        fetchCategories();
    },[])

    const fetchData = async () => {
        try {
            const data = await getExpenses();
            setExpenseData(data || []);
            refreshData()
        } catch (error) {
            console.error("Failed to fetch income data", error);
            setExpenseData([]);
        }
    };
    
    const fetchIncomeData = async()=>{
        const data = await getIncomes()
        setIncomeData(data)
    }

    const fetchCategories = async () => {
        const categoryData = await getExpenseCategories();
        setCategories(categoryData);
    };

    const [originalCategory, setOriginalCategory] = useState("");
    const [originalAmount, setOriginalAmount] = useState("");

    const openEditModal = (user) => {
        setEdit(true);
        setSelectedExpenseId(user.id);
        setUpdate(user.expense_category);
        setUpdateAmount(user.amount_used);

        setOriginalCategory(user.expense_category);
        setOriginalAmount(user.amount_used);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if(updateAmount === originalAmount && updateCategory === originalCategory){
            toast.info('No update has been done')
            setEdit(false);
        }else{
            await editExpense({ id: selectedExpenseId, 
                expense_category: updateCategory, 
                amount_used: updateAmount 
            });
            toast.success("Expense detail editted successfully")
            setEdit(false);
            fetchData();
        }
    };

    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else {
                setSortBy(null);
                setSortOrder('asc');
            }
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown size={16} className="text-gray-400 inline" />;
        return sortOrder === 'asc' ? <ArrowUp size={16} className="text-blue-400 inline" /> : <ArrowDown size={16} className="text-blue-400 inline" />;
    };

    const displayedUsers = useMemo(() => {
        let sortedData = [...expenseData];
        
        sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (sortBy) {
            sortedData.sort((a, b) => {
                if (sortBy === 'expense') {
                    return sortOrder === 'asc' 
                        ? parseFloat(a.amount_used) - parseFloat(b.amount_used)
                        : parseFloat(b.amount_used) - parseFloat(a.amount_used);
                } else if (sortBy === 'date') {
                    return sortOrder === 'asc'
                        ? new Date(a.created_at) - new Date(b.created_at)
                        : new Date(b.created_at) - new Date(a.created_at);
                }
                return 0;
            });
        }

        const filteredData = sortedData.filter((user) => {
            const formattedDate = new Date(user.updated_at).toDateString().toLowerCase();
            return (
                user.expense_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formattedDate.includes(searchTerm.toLowerCase())
            );
        });

        const indexOfLastRecord = currentPage * recordsPerPage;
        const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
        return filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
    }, [searchTerm, sortBy, sortOrder, currentPage, expenseData]);


    const totalPages = Math.ceil(
        expenseData?.filter((user) => user.amount_used.toLowerCase().includes(searchTerm) || user.expense_category.toLowerCase().includes(searchTerm)).length / recordsPerPage
    );

    const totalExpense = (expenseData || []).reduce((sum, total) => 
      sum + parseFloat(total.amount_used || 0), 0
    );
    const totalIncome = (incomeData || []).reduce((sum, total) => 
        sum + parseFloat(total.amount_received || 0), 0
    );
    const balance = totalIncome - totalExpense;
  
  
    const handleAddExpenseClick = () => {
      if (balance < 0) {
          setIsWarningOpen(true);
      } else {
          setIsExpenseOpen(true);
      }
    };
  return (
    <>
    <motion.div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 w-full'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
    >
            <div className='flex flex-wrap justify-between items-center mb-6'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-100 mb-2 sm:mb-0'>Expenses Table</h2>
                {err ? ( 
                        <button
                            disabled
                            className='flex items-center gap-2 bg-gray-600  text-white font-semibold py-2 px-4 rounded-lg shadow-md '
                        >
                            <Plus size={18} /> Add Expense
                        </button>
                    ):(
                        <button
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            onClick={handleAddExpenseClick}
                        >
                            <Plus size={18}/> Add Expense
                        </button>
                    )}
            </div>
            
            <div className='relative mb-4 w-full'>
                <input type='text' placeholder='Search expenses...' className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full' value={searchTerm} onChange={handleSearch} />
                <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr className="text-center text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">
                            <th></th>
                            <th className='px-4 sm:px-6 py-3'>Category</th>
                            <th className='px-4 sm:px-6 py-3' onClick={() => handleSort('expense')}>
                                Expense {getSortIcon('expense')}
                            </th>

                            <th className='px-4 sm:px-6 py-3 cursor-pointer' onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-1">
                                    Date {getSortIcon('date')}
                                </div>
                            </th>

                            <th className='px-4 sm:px-6 py-3'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                    {loading ? (
                    <>
                        <TableSkeleton/>
                        <TableSkeleton/>
                    </>
                    ) : expenseData.length > 0 ? (
                        displayedUsers.map((user) => (
                            <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <td className='px-6 py-4 whitespace-nowrap'>                                    
                                    <div className='h-10 w-10 rounded-full bg-gradient-to-r from-red-700 flex items-center justify-center'>
                                        <Banknote/>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-gray-100'>
                                {user.expense_category}
                                </td>
                                <td className='px-4 py-4 whitespace-nowrap text-red-400 font-bold flex gap-2'>
                                    {currency}. {(user.amount_used*currencyAmount).toFixed(2)} <TrendingDown />
                                </td>
                                <td className='px-4 py-4 whitespace-nowrap text-gray-300'>{new Date(user.updated_at).toDateString()}</td>
                                <td className='px-4 py-4 flex gap-3'>

                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2'
                                    onClick={() => openEditModal(user)}
                                    > 
                                        <Pencil />
                                    </button>

                                    <button className='text-red-400 hover:text-red-300'
                                        onClick={()=>{ setConfirmDelete(true), setSelectedExpenseId(user.id); }}
                                    >
                                        <Trash2 />
                                    </button>
                                </td>
                            </motion.tr>
                        ))
                    ) : (
                      <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-300">
                              {err ? "Can not access your data. Check your connection and refresh the page." : "No Expense entries yet..."}
                          </td>
                      </tr>
                    )}
                </tbody>
                </table>
            </div>
            {confirmDelete && (
                <ConfirmDelete 
                    isOpen={confirmDelete} 
                    onClose={() => setConfirmDelete(false)} 
                    onConfirm={() => handleDelete(selectedExpenseId)} 
                    info="Expense"
                />
            )}
            
            <div className="flex justify-between items-center mt-4">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white`}>
                    Previous
                </button>
                <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages==0} className={`px-4 py-2 rounded-lg ${currentPage === totalPages || totalPages == 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white`}>
                    Next
                </button>
            </div>
        </motion.div>
        
        {isEdit && createPortal(
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
                                <label className="block text-gray-400">Category</label>
                                <input
                                    type="text"
                                    list="expense-categories"
                                    placeholder="Select or enter a new category"
                                    value={updateCategory}
                                    onChange={(e) => setUpdate(e.target.value)}
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
                                    value={updateAmount}
                                    onChange={(e) => setUpdateAmount(e.target.value)}
                                    className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
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

            {isWarningOpen && (
                <Warning
                    isOpen={isWarningOpen}
                    onClose={() => setIsWarningOpen(false)}
                    onContinue={() => {
                        setIsWarningOpen(false);
                        setIsExpenseOpen(true);
                    }}
                    amount = {balance}
                />
            )}

            {isExpenseOpen && (
                <AddExpense
                    refreshData={fetchData}
                    isOpen={isExpenseOpen}
                    onClose={() => setIsExpenseOpen(false)}
                />
            )}

    </>
  )
}

export default DisplayExpense