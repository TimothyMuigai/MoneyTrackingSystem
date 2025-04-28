import BudgetContext from '@/context/BudgetContext';
import { useContext, useEffect, useState } from 'react';
import AddBudget from './AddBudget';
import { Link } from 'react-router-dom';
import CurrencyContext from '@/context/CurrencyContext';

function DisplayBudgets() {
  const { getBudgets, loading, err } = useContext(BudgetContext);
  const [budgetData, setBudgetData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const { exchangeRates, toCurrency} = useContext(CurrencyContext);
  const currencyAmount = exchangeRates[toCurrency] || 1;
  const currency = toCurrency;

  const [sortBy, setSortBy] = useState('newest');

  const fetchBudgetData = async () => {
    const response = await getBudgets();
    setBudgetData(response || []);
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const filteredData = budgetData
    .filter(budget => 
      (filterStatus === 'all' || budget.status === filterStatus)&&
      (filterCategory === 'all' || budget.expense_category === filterCategory))
    .sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount_to_budget - a.amount_to_budget;
      if (sortBy === 'amount-low') return a.amount_to_budget - b.amount_to_budget;
      if (sortBy === 'oldest') return new Date(a.start_date) - new Date(b.start_date);
      return new Date(b.start_date) - new Date(a.start_date);
  });

  const allCategories = ['all', ...new Set(budgetData.map(b => b.expense_category))];

  const calculateDaysUntilDue = (startDateStr, dueDateStr) => {
    const today = new Date();
    const startDate = new Date(startDateStr);
    const dueDate = new Date(dueDateStr);
  
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
  
    const daysToStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysToStart > 0) {
      return `Starts in ${daysToStart} day${daysToStart !== 1 ? "s" : ""}`;
    }
  };
  
  return (
    <div className="mt-7 px-4 sm:px-6 lg:px-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-3 sm:gap-4 overflow-x-auto">
        <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="overspent">Over spent</option>
            <option value="period_ended">Completed</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm min-w-[150px]"
        >
          {allCategories.map((category, index) => (
            <option key={index} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm min-w-[150px]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount: High → Low</option>
          <option value="amount-low">Amount: Low → High</option>
        </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="w-full bg-gray-800 rounded-lg h-[170px] animate-pulse flex items-center justify-center"
            ></div>
          ))}
        </div>
      ) : filteredData.length > 0 ? (
        <>
          <div className="mb-6">
            <AddBudget refreshBudgets={fetchBudgetData} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((budgets) => {
              const amountSpent = budgets.related_expenses.reduce(
                (sum, total) => sum + parseFloat(total.amount_used),
                0
              );
              const amountRemaining = Math.max(budgets.amount_to_budget - amountSpent, 0);
              let progress = budgets.amount_to_budget
                ? (amountSpent / budgets.amount_to_budget) * 100
                : 0;
              progress = progress > 100 ? 100 : progress;
              const progressColor = budgets.status==='period_ended'?'bg-gray-800': amountSpent >= budgets.amount_to_budget ? 'bg-red-500' : 'bg-green-400';
              const items = budgets.related_expenses.length;

              return (
                <Link key={budgets.id} to={`/budget/${budgets.id}/`}>
                  <div 
                    className={`p-4 sm:p-5 border rounded-lg text-gray-300 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer 
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
                      <h2 className={`font-bold ${budgets.status ==='period_ended' ? 'text-gray-400':'text-green-400' }  text-sm sm:text-md whitespace-nowrap mt-2 sm:mt-0`}>
                        {currency}. {(budgets.amount_to_budget*currencyAmount).toFixed(0).toLocaleString()}
                      </h2>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
                        <span>{currency}. {(amountSpent*currencyAmount).toFixed(0).toLocaleString()} spent</span>
                        <span>{currency}. {(amountRemaining*currencyAmount).toFixed(0).toLocaleString()} left</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full relative">
                        <div
                          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-right text-xs block mt-2 text-gray-400">
                        {calculateDaysUntilDue(budgets.start_date, budgets.due_date)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400">
          {err ? (
            <p className="mt-4">Cannot access your data. Check your connection and refresh the page.</p>
          ) : (
            <>
              <AddBudget refreshBudgets={fetchBudgetData} />
              <p className="mt-4">No budgets available. Add one to get started!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DisplayBudgets;
