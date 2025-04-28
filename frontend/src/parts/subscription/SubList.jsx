import React, { useContext, useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import SubscriptionContext from '@/context/SubscriptionContext';
import { addDays, addMonths, addYears, parseISO, format } from "date-fns";

import AddSubs from './AddSubs';
import TableSkeleton from '../common/TableSkeleton';
import SubscriptionStatus from './CancelSubscription';
import { SubscriptionActionsDropdown } from './SubOptions';
import ConfirmDelete from '../common/DeleteModal';
import CurrencyContext from '@/context/CurrencyContext';


function SubList({newData}) {
    const { getSubs, loading, err, deleteSubs, getSubCategory, editSubs, cancelSubs, cancelImmediatley, renewSubs} = useContext(SubscriptionContext);

    const { exchangeRates, toCurrency} = useContext(CurrencyContext);
    const currencyAmount = exchangeRates[toCurrency] || 1;
    const currency = toCurrency;

    const [subData, setSubData] =useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedId, setSelectedId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [_, setAutoDueDate] = useState(true);
    const [isEdit, setEdit] = useState(false);
    const [updateCategory, setUpdate] = useState("");
    const [updateAmount, setUpdateAmount] = useState("");
    const [updateFrequncy, setFrequency] = useState("");
    const [updateDueDay, setUpdateDueDay] = useState("");
    const [updateStartDay, setUpdateStartDay] = useState("");

    const [cancel, setCancel] = useState(false);
    const [remove, setRemove] = useState(false);
    const [afresh, SetAfresh] = useState(false);

    const fecthData = async()=>{
        const response = await getSubs()
        setSubData(response || [])
        newData()      
    }
    
    useEffect(()=>{
        fecthData();
        getCategorires();
    },[])

    const getCategorires = async ()=>{
        const category = await getSubCategory()
        setCategories(category)
    }
    
    const openEditModal = (user) => {
        setEdit(true);
        setSelectedId(user.id);
        setUpdate(user.sub_Category);
        setUpdateAmount(user.amount);
        setUpdateDueDay(user.due_date);
        setUpdateStartDay(user.start_date);
        setFrequency(user.frequency)
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        await editSubs({ id: selectedId, 
            sub_Category: updateCategory, 
            amount: updateAmount,
            due_date: updateDueDay,
            start_date: updateStartDay,
            frquency:updateFrequncy,
        });
        toast.success("Saved")
        setEdit(false);
        fecthData();
    };

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
        let sortedData = [...subData];

        const activeSubs = sortedData.filter(sub => sub.status !== "cancelled");
        const cancelledSubs = sortedData.filter(sub => sub.status === "cancelled");

        if (sortBy) {
            activeSubs.sort((a, b) => {
                if (sortBy === 'subs') {
                    return sortOrder === 'asc'
                        ? parseFloat(a.amount) - parseFloat(b.amount)
                        : parseFloat(b.amount) - parseFloat(a.amount);
                } else if (sortBy === 'date' || sortBy === 'remainingDays') {
                    return sortOrder === 'asc'
                        ? new Date(a.due_date) - new Date(b.due_date)
                        : new Date(b.due_date) - new Date(a.due_date);
                }
                return 0;
            });
        } else {

            activeSubs.sort((a, b) => {
                const daysA = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                const daysB = Math.ceil((new Date(b.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysA - daysB;
            });
        }
        sortedData = [...activeSubs, ...cancelledSubs];

        const filteredData = sortedData.filter((user) => {
            const formattedDate = new Date(user.due_date).toDateString().toLowerCase();
            const subCategory = user.sub_Category.toLowerCase();
            const status = user.status.toLowerCase();
        
            const searchParts = searchTerm.toLowerCase().split("&").map(part => part.trim());
        
            return searchParts.every(term =>
                subCategory.includes(term) ||
                formattedDate.includes(term) ||
                status.includes(term)
            );
        });
        
        const indexOfLastRecord = currentPage * recordsPerPage;
        const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
        return filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
    }, [searchTerm, currentPage, subData,sortBy, sortOrder]);
    
    const totalPages = Math.ceil(
        subData?.filter((user) => user.status.toLowerCase().includes(searchTerm) || user.sub_Category.toLowerCase().includes(searchTerm)).length / recordsPerPage
    );
    
    const calculateDaysUntilDue = (dueDateStr, status) => {
        if (status === "cancelled") return "None";

        const today = new Date();
        const dueDate = new Date(dueDateStr);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (diff === 0) return "Due today";
        if (diff < 0) return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`;
        return `${diff} day${diff !== 1 ? "s" : ""} left`;
    };

    const handleDelete = async(id)=>{
        await deleteSubs(id)
        toast.warning("Subscription has been deleted")
        setConfirmDelete(false);
        fecthData()
    };
    
    const handleStartDateChange = (date) => {
            setUpdateStartDay(date);
        
            if (!date || !updateFrequncy) return;
        
            const parsedDate = parseISO(date);
            let newDueDate;
        
            switch (updateFrequncy) {
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
        
            setUpdateDueDay(format(newDueDate, "yyyy-MM-dd"));
            setAutoDueDate(true);
        };
        
        const handleFrequencyChange = (value) => {
            setFrequency(value);
        
            if (updateStartDay) {
                handleStartDateChange(updateStartDay);
            }
        };

        const cancleSubscription = async (id)=>{
            await cancelSubs(id)
            toast.warning("Subscription will be tracked till due date then cancel")
            setCancel(false);
            fecthData()
        }
        const cancelSub = async (id)=>{
            await cancelImmediatley(id)
            toast.warning("Subscription has been cancelled")
            setRemove(false);
            fecthData()
        }
        const renewSub = async (id)=>{
            const renewed = subData.find(sub => sub.id === id)
            if (renewed) openEditModal(renewed)
            await renewSubs(id)
            toast.success("Subscription  renewed")
            SetAfresh(false);            
        }
         

    return (
    <>
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
        <div className='mb-6'>

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0 sm:space-x-4'>
                <h2 className='text-lg sm:text-xl font-semibold text-gray-100'>Subscriptions Table</h2>
                <AddSubs refreshData={fecthData} />
            </div>

            <div className='relative mb-4 w-full'>
                <input type='text' placeholder='Search i.e. Subscription name or status & Subscription name...' 
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full' 
                    value={searchTerm}
                    onChange={handleSearch}/>
                <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
            </div>

        </div>


            <div className='w-full overflow-x-auto rounded-lg border border-gray-700'>
                <table className='min-w-[600px] divide-y divide-gray-700'>

                <thead>
                    <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Subscription
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
                            onClick={() => handleSort('subs')}
                        >
                            Amount {getSortIcon('subs')}
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Status
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Start Date
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
                            onClick={() => handleSort('date')}
                        >
                            Due Date {getSortIcon('date')}
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'
                            onClick={() => handleSort('remainingDays')}
                        >
                            Days remaining {getSortIcon('remainingDays')}
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className='divide divide-gray-700'>
                {loading ? (
                    <>
                        <TableSkeleton/>
                        <TableSkeleton/>
                    </>
                    ): subData.length > 0 ? (
                        displayedUsers.map((subs) => (
                            <motion.tr key={subs.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {subs.sub_Category}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                {currency!== 'KES' ? `${currency}.`:"" }{(subs.amount*currencyAmount).toFixed(0).toLocaleString()}
                                </td>
                                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        subs.status === "cancel_pending"
                                            ? "bg-gray-100 text-gray-800"
                                            : subs.status === "cancelled"
                                            ? "bg-red-300 text-red-800"
                                            : subs.status === "due"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : subs.status === "upcoming"
                                            ? "bg-blue-100 text-blue-800"
                                            : subs.status === "current"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {subs.status}
                                    </span>
                                </td>
                                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {subs.status == 'cancelled' ? ('none'):(new Date(subs.start_date).toDateString())}
                                </td>
                                <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {subs.status == 'cancelled' ? ('none'):(new Date(subs.due_date).toDateString())}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center'>
                                    {calculateDaysUntilDue(subs.due_date, subs.status)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                <SubscriptionActionsDropdown
                                    onDelete={() => {
                                        setSelectedId(subs.id);
                                        setConfirmDelete(true);
                                    }}
                                    onEdit={
                                        subs.status !=='cancelled' ? () => openEditModal(subs): undefined}
                                    onRenew={
                                        subs.status === 'cancelled'
                                            ? () => {
                                                setSelectedId(subs.id);
                                                SetAfresh(true);
                                                setSelectedCategory(subs.sub_Category);
                                            }
                                            : undefined
                                    }
                                    onRemove={
                                        subs.status !== 'cancelled'
                                            ? () => {
                                                setSelectedId(subs.id);
                                                setRemove(true);
                                                setSelectedCategory(subs.sub_Category);
                                            }
                                            : undefined
                                    }
                                    onCancel={
                                        subs.status !== 'cancel_pending' && subs.status !=='cancelled'
                                            ? () => {
                                                setSelectedId(subs.id);
                                                setCancel(true);
                                                setSelectedCategory(subs.sub_Category);
                                            }
                                            : undefined
                                    }
                                />
                                    
                                </td>
                            </motion.tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                            {err ? "Can not access your data. Check your connection and refresh the page." : "No subscriptions found..."}
                            </td>
                        </tr>
                    )}
                    
                    
                </tbody>
            </table>
        </div>
            
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
            <button 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={currentPage === 1} 
                className={`px-4 py-2 rounded-lg text-sm ${currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
            >
                Previous
            </button>
            <span className="text-gray-300 text-sm">Page {currentPage} of {totalPages}</span>
            <button 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className={`px-4 py-2 rounded-lg text-sm ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
            >
                Next
            </button>
        </div>

        {confirmDelete && (
            <ConfirmDelete 
                isOpen={confirmDelete} 
                onClose={() => setConfirmDelete(false)} 
                onConfirm={() => handleDelete(selectedId)} 
                info="Subscription"
            />
        )}
        {cancel && (
            <SubscriptionStatus
                isOpen={cancel} 
                onClose={() => setCancel(false)} 
                onConfirm={() => cancleSubscription(selectedId)} 
                info={`Are you sure you want to cancel? The ${selectedCategory} subscritpion will run until the due date.`}
                SubType={"Cancel but track till the End of Subscription Period"}
            />
        )}
        {remove && (
            <SubscriptionStatus
                isOpen={remove} 
                onClose={() => setRemove(false)} 
                onConfirm={() => cancelSub(selectedId)} 
                info={`This action will stop tracking your ${selectedCategory} subscription immediately. Do you still wish to Continue?`}
                SubType={"Cancel Now"}
            />
        )}
        {afresh && (
            <SubscriptionStatus
                isOpen={afresh} 
                onClose={() => SetAfresh(false)} 
                onConfirm={() => renewSub(selectedId)} 
                info={`Are you sure you wish to renew your ${selectedCategory} subscription?`}
                SubType={'Renew Subscription'}
            />
        )}
    </motion.div>

        {isEdit && createPortal(
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
                <motion.div
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-200" 
                    onClick={() => {
                            setEdit(false);
                            fecthData();
                        }}
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-semibold mb-4 text-center">Edit Subscription</h2>

                    <form onSubmit={handleEdit}>
                        <div className="mb-4">
                            <label className="block text-gray-400">Category</label>
                            <input
                                type="text"
                                list="subscription-categories"
                                placeholder="Select or enter a new category"
                                value={updateCategory}
                                onChange={(e) => setUpdate(e.target.value)}
                                className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <datalist id="subscription-categories">
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name} />
                                ))}
                            </datalist>
                        </div>


                        <div className="mb-4">
                            <label className="block text-gray-400"> Amount</label>
                            <input
                                type="number"
                                value={updateAmount}
                                onChange={(e) => setUpdateAmount(e.target.value)}
                                className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Frequency</label>
                            <select
                                value={updateFrequncy}
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
                                    value={updateStartDay}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={updateDueDay}
                                    onChange={(e) => {
                                        setUpdateDueDay(e.target.value);
                                        setAutoDueDate(false);
                                    }}
                                    className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                            Edit
                        </button>
                    </form>
                </motion.div>
            </div>,
            document.body
        )}
        </>
    );
}

export default SubList;
