// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DisplayExpense from '@/parts/expense/DisplayExpense'
import React, { useContext, useEffect, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, ListOrdered, Wallet } from 'lucide-react'
import Header from "@/parts/common/Header";
import StatCard from "@/parts/common/StatCard";
import CurrencyContext from "@/context/CurrencyContext";
import DataContext from "@/context/DataContext";
import ExpenseChart from "@/parts/expense/ExpenseChart";
import ExpensePieChart from "@/parts/expense/ExpensePieChart";
function Expense() {

  const { getExpenses } = useContext(DataContext);
  const [expenseData, setData] = useState([]);

  const { exchangeRates, toCurrency} = useContext(CurrencyContext);
  const currencyAmount = exchangeRates[toCurrency] || 1;
  const currency = toCurrency;

  useEffect(()=>{
    fetchData()
  },[])

  const fetchData = async()=>{
    const data = await getExpenses()
    setData(data || [])
  }

  const amountExpenses = expenseData.reduce((sum, total)=>(
    sum+parseFloat(total.amount_used)
  ),0)

  const minAmount = expenseData.length >0 
  ? Math.min(...expenseData.map(expense => parseFloat(expense.amount_used)))
  :0;
  const maxAmount = expenseData.length >0 
  ? Math.max(...expenseData.map(expense => parseFloat(expense.amount_used)))
  :0;

  return (
    <div>
      <div className="flex-1 overflow-auto relative z-10">
      <Header title="Expense" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Expenses" icon={Wallet} value={`${currency}. ${(amountExpenses*currencyAmount).toFixed(0).toLocaleString()}`} color="#6366F1" />
          <StatCard name="Max. Expense Incurred" icon={ArrowUpCircle} value={`${currency}. ${(maxAmount*currencyAmount).toFixed(0).toLocaleString()}`} color="#FF0000" />
          <StatCard name="Min. Expense Incurred" icon={ArrowDownCircle} value={`${currency}. ${(minAmount*currencyAmount).toFixed(0).toLocaleString()}`} color="#00FF00" />
          <StatCard name="No. of Expenses" icon={ListOrdered} value={expenseData.length} color="#4169E1" />
        </motion.div>
        {expenseData.length>0 && <div><ExpenseChart expenseData={expenseData}/></div>}
        <DisplayExpense refreshData = {fetchData}/>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 py-4">
          {expenseData.length > 0 && <ExpensePieChart expenseData={expenseData}/>}
          
        </div>
      </main>
    </div>
      
    </div>
  )
}

export default Expense