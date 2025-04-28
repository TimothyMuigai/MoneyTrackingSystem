// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MoveLeft, Pencil, Trash2, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BudgetContext from "@/context/BudgetContext";
import { toast } from "sonner";
import BudgetList from "./BudgetList";
import { createPortal } from "react-dom";
import ExpenseContext from "@/context/ExpenseContext";
import ConfirmDeleteModal from "./DeleteBudget";

function BudgetDetail() {

  const { getBudgetById, editBudget, deleteBudget, loading, err } = useContext(BudgetContext);
  const { getExpenseCategories } = useContext(ExpenseContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const [budgets, setBudget] = useState(null);
  const [entriesList, setList] = useState([]);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [categories, setCategories] = useState([]);
  const [updatedAmount, setAmount] = useState("");
  const [updatedCategory, setCategory] = useState("");
  const [updatedDue, setDue] = useState("");
  const [updatedStart, setStart] = useState("");
  const [isModalOpen, setIsModalOpen]= useState(false);

  const [overBudgetModal, setOverBudgetModal] = useState(false);
  
  useEffect(() => {
    fetchBudget();
    fetchCategories()
  }, [id]);
  
  const fetchCategories = async () => {
    const categoryData = await getExpenseCategories();
    setCategories(categoryData);
  };

  const fetchBudget = async () => {
    try {
      const data = await getBudgetById(id);
      setBudget(data || []);
      setList(data.related_expenses || [])
    } catch (err) {
      toast.error("Failed to load budget details." + err);
    }  
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    await editBudget({
      id,
      expense_category: updatedCategory,
      amount_to_budget: updatedAmount,
      start_date: updatedStart,
      due_date: updatedDue
    });
    setIsModalOpen(false);
    toast.success("Budget updated successfully!");
    fetchBudget();   
  }

  const openEditModal = () => {
      if (budgets) {
        setIsModalOpen(true)
        setAmount(budgets.amount_to_budget);
        setCategory(budgets.expense_category);
        setStart(budgets.start_date);
        setDue(budgets.due_date);
      }
  };

  const handleDelete = async () => {
    await deleteBudget(budgets.id);
    navigate('/budget');
    toast.warning(`Budget '${budgets.expense_category}' is deleted`);
  };
  
  const total = budgets?.amount_to_budget || 0;
  const amountSpent = budgets?.related_expenses?.reduce(
    (sum, total) => sum + parseFloat(total.amount_used),
    0
  ) || 0;
  

  useEffect(() => {
    if (budgets && amountSpent > total) {
      setOverBudgetModal(true);
    }
  }, [budgets, amountSpent, total]);
  
  if (loading) {
    return (
      <div className="mt-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  mt-6 gap-5">
          {[1].map((index) => (
            <div
              key={index}
              className="w-full bg-gray-800 rounded-lg h-[170px] animate-pulse flex items-center justify-center"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!budgets) {
    return (
      <p className="text-center text-gray-500 mt-10">
        {err ? "Check your connection" : "Budget not found"}
      </p>
    );
  }
  
  

  const amountRemaining = Math.max(budgets.amount_to_budget - amountSpent, 0);
  let progress = budgets.amount_to_budget
    ? (amountSpent / budgets.amount_to_budget) * 100
    : 0;
    progress = progress > 100 ? 100 : progress;
  const progressColor = budgets.status==='period_ended'?'bg-gray-800': amountSpent >= budgets.amount_to_budget ? 'bg-red-500' : 'bg-green-400';
  const items = budgets?.related_expenses.length;
  
  const calculateDaysUntilDue = (startDateStr, dueDateStr, status) => {
    const today = new Date();
    const startDate = new Date(startDateStr);
    const dueDate = new Date(dueDateStr);
  
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
  
    const daysToStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
    const daysToDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysToStart > 0) {
      return `Starts in ${daysToStart} day${daysToStart !== 1 ? "s" : ""}`;
    }
  
    if (daysToStart === 0 && status !== 'period_ended') {
      if (daysToDue === 0) return "Due today";
      if (daysToDue < 0) return `Overdue by ${Math.abs(daysToDue)} day${Math.abs(daysToDue) !== 1 ? "s" : ""}`;
      return `Due in ${daysToDue} day${daysToDue !== 1 ? "s" : ""}`;
    }
  
    return "Period ended";
  };

  return (
    <>
      <div className="p-4 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <button
            className="inline-flex items-center gap-3 hover:bg-blue-700 active:scale-95"
            onClick={() => navigate("/budget")}
          >
            <MoveLeft /> Go back
          </button>
          {/* {budget.name} */}
          <span className="flex gap-2">
            <button
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white 
                             text-sm md:text-base rounded-md shadow-sm transition-all duration-300 
                             hover:bg-blue-700 active:scale-95"
              onClick={()=>openEditModal()}
            >
              <Pencil size={16} />
              <span>Edit</span>
            </button>

            <button
              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white 
                             text-sm md:text-base rounded-md shadow-sm transition-all duration-300 
                             hover:bg-red-700 active:scale-95"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              <span>Delete Budget</span>
            </button>
          </span>
        </h2>

        <div className="grid  mt-6 gap-5">
          <div 
            className={`p-4 sm:p-5 border rounded-lg text-gray-300 hover:shadow-md transition-all duration-300 ease-in-out 
               ${
                  budgets.status === "period_ended"
                  ? "bg-gray-800 text-gray-500 border-gray-600 opacity-60"
                  : "bg-gray-900 border-gray-700 hover:bg-opacity-50 hover:bg-cyan-950"
                }`
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold leading-snug break-words">
                  {budgets.expense_category}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Status • {budgets.status}</p>
                <p className="text-sm text-gray-500">{items} Items</p>
              </div>
              <h2 className={`font-bold ${budgets.status ==='period_ended' ? 'text-gray-400':'text-green-400' } text-sm sm:text-md whitespace-nowrap mt-2 sm:mt-0`}>
                Ksh. {budgets.amount_to_budget}
              </h2>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
                <span>Ksh. {amountSpent} spent</span>
                <span>Ksh. {amountRemaining} left</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full relative">
                <div
                  className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-right text-xs block mt-2 text-gray-400">
                {calculateDaysUntilDue(budgets.start_date, budgets.due_date, budgets.status)}
              </span>
            </div>
          </div>
          
        </div>

        <div className="mt-4">
          <h2 className="font-bold text-lg">Budget Items</h2>
          <BudgetList entryData = {entriesList} refreshBudget={fetchBudget} name={budgets.expense_category} date={budgets.start_date} />
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

                  <h2 className="text-xl font-semibold mb-4 text-center">Edit Budget</h2>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400">Category</label>
                        <input
                            type="text"
                            list="expense-categories"
                            placeholder="Select or enter a new category"
                            value={updatedCategory}
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
                        value={updatedAmount}
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
                          value={updatedStart}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => 
                            setStart(e.target.value)
                            }
                          className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={updatedDue}
                          min={updatedStart || new Date().toISOString().split("T")[0]}
                          onChange={(e) => setDue(e.target.value)}
                          className="w-full p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200">
                      Edit Budget
                    </button>
                  </form>
                </motion.div>
              </div>,
        document.body
      )}
      
      {confirmDelete && (
        <ConfirmDeleteModal
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}

      {overBudgetModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-center text-red-500">Budget Warning!</h2>
            <p className="text-center text-gray-300">
              You have gone over the limit of the budget. Adjust your budget entries or increase the budget limit.
            </p>

            <div className="mt-5 flex justify-center">
              <button 
                onClick={() => setOverBudgetModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

    </>
  );
}

export default BudgetDetail;
