import React, { useContext, useEffect, useState } from 'react';
import TransInfoCard from './TransInfoCard';
import ExpenseContext from '@/context/ExpenseContext';
import IncomeContext from '@/context/IncomeContext';

const RecentTransactions = () => {
    const { getExpenses } = useContext(ExpenseContext);
    const { getIncomes } = useContext(IncomeContext);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (expenses.length || incomes.length) {
        const updatedTransactions = [...expenses, ...incomes]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        setRecentTransactions(updatedTransactions);
    }
}, [expenses, incomes]);


  const fetchData = async () => {
    const [expenseResponse, incomeResponse] = await Promise.all([
      getExpenses(),
      getIncomes(),
    ]);

    setExpenses([...expenseResponse]);  
    setIncomes([...incomeResponse]); 
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg p-4 sm:p-6 rounded-2xl">
      <h5 className="text-base sm:text-lg font-semibold text-white text-center">Recent Transactions</h5>

      <div className="mt-4 space-y-3">
        {recentTransactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm sm:text-base">No recent transactions</p>
        ) : (
          recentTransactions.map((transaction) => (
            <TransInfoCard
              key={transaction.id}
              title={transaction.expense_category || transaction.income_category}
              date={new Date(transaction.created_at).toLocaleDateString()}
              amount={transaction.amount_used || transaction.amount_received}
              type={transaction.amount_used ? 'expense' : 'income'}
            />
          ))
        )}
      </div>
    </div>

  );
};

export default RecentTransactions;
