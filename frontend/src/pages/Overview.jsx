// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Banknote, ClipboardList, PiggyBank, Wallet } from 'lucide-react'
import { useContext, useEffect, useState } from 'react';
import ExpenseContext from '@/context/ExpenseContext';
import IncomeContext from '@/context/IncomeContext';
import BudgetContext from '@/context/BudgetContext';
import Header from "@/parts/common/Header";
import StatCard from "@/parts/common/StatCard";
import RecentTransactions from "@/parts/overview/RecentTransactions";
import { CustomPieChart } from "@/parts/overview/CustomPieChart";
import NetBalanceChart from "@/parts/overview/NetBalanceChart";
import BudgetBarChart from "@/parts/overview/BudgetBarChart";

function Overview() {
  const { getExpenses } = useContext(ExpenseContext);
  const { getIncomes } = useContext(IncomeContext);
  const { getBudgets } = useContext(BudgetContext);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(()=>{
    expenseData()
    incomeData()
    budgetData()
  },[])

  const expenseData = async()=>{
    const response = await getExpenses()
    setExpenses(response ||[])
  }
  const incomeData = async()=>{
    const response = await getIncomes()
    setIncome(response ||[])
  }
  const budgetData = async()=>{
    const response = await getBudgets()
    setBudgets(response ||[])
  }
  const totalExpenses = expenses.reduce((sum, total)=>(
    sum+parseFloat(total.amount_used)
  ),0) 
  const totalIncome = incomes.reduce((sum, total)=>(
    sum+parseFloat(total.amount_received)
  ),0) 
  const totalBudgets = budgets.reduce((sum, total)=>(
    sum+parseFloat(total.amount_to_budget)
  ),0)
  
  const balance = totalIncome-totalExpenses  

  const COLORS = ['#FF0000', '#00FF00','#fc03ba'];
  const combiData = [
    
    {name:"Total Expense", amount:totalExpenses},
    {name:"Total Income", amount:totalIncome},
    {name:"Total budgets", amount:totalBudgets},
  ]
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Balance" icon={PiggyBank} value={balance.toLocaleString()}color="#6366F1"/>
          <StatCard name="Total Expenses" icon={Wallet} value={totalExpenses.toLocaleString()} color="#FF0000"/>
          <StatCard name="Total Income" icon={Banknote} value={totalIncome.toLocaleString()} color="#00FF00"/>
          <StatCard name="No. of budgets" icon={ClipboardList} value={budgets.length} color="#6366F1"/>
        </motion.div>
        </main>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <RecentTransactions/>
          
          <div>
              <div className='flex items-center justify-between'>
                <h5 className='text-lg font-semibold text-white'>Financial Overview</h5>
              </div>
              {(totalExpenses > 0 || totalIncome > 0 || totalBudgets > 0) ? (
                <CustomPieChart
                  data={combiData}
                  label="Total Balance"
                  totalAmount={`ksh. ${balance.toLocaleString()}`}
                  colors={COLORS}
                  showTextAnchor
                />
              ) : (
                <p className="text-center text-gray-400">No financial data available</p>
              )}
                      
            </div>
        </div>
        { incomes.length > 0 && expenses.length > 0 && 
          <div className='mt-6'>
            <NetBalanceChart incomeData={incomes} expenseData={expenses}/>
          </div>
        }
        {budgets.length > 0 && <div>
          <BudgetBarChart budgetData = {budgets} />
        </div>}
    </div>
  )
}

export default Overview