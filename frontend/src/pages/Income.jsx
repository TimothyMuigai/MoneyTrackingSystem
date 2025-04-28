// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React, { useContext, useEffect, useState } from 'react'
import { BarChart2, ShoppingBag, Users, Zap } from 'lucide-react'
import Header from "@/parts/common/Header";
import DisplayIncome from "@/parts/income/DisplayIncome";
import StatCard from "@/parts/common/StatCard";
import DataContext from "@/context/DataContext";
import CurrencyContext from "@/context/CurrencyContext";
import IncomeChart from "@/parts/income/IncomeChart";
import IncomePieChart from "@/parts/income/IncomePiechart";

function Income() {
  const { getIncomes } = useContext(DataContext);
  const [incomeData, setData] = useState([])
  const { exchangeRates, toCurrency} = useContext(CurrencyContext);
  const currencyAmount = exchangeRates[toCurrency] || 1;
  const currency = toCurrency;

  useEffect(()=>{
    fetchData()
  },[])

  const fetchData = async()=>{
    const data = await getIncomes()
    setData(data || [])
  }

  const amountIncome = incomeData.reduce((sum, total)=>(
    sum+parseFloat(total.amount_received)
  ),0)

  const minAmount = incomeData.length >0 
  ? Math.min(...incomeData.map(income => parseFloat(income.amount_received)))
  :0;
  const maxAmount = incomeData.length >0 
  ? Math.max(...incomeData.map(income => parseFloat(income.amount_received)))
  :0;

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Income" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Income" icon={Zap} value={`${currency}.${(amountIncome*currencyAmount).toFixed(0).toLocaleString()}`} color="#6366F1"/>
          <StatCard name="Max. Income Recieved" icon={ShoppingBag} value={`${currency}.${(maxAmount*currencyAmount).toFixed(0).toLocaleString()}`} color="#10B981"/>
          <StatCard name="Min. Income Received" icon={BarChart2} value={`${currency}.${(minAmount*currencyAmount).toFixed(0).toLocaleString()}`} color="#6366F1"/>
          <StatCard name="No. of income streams" icon={Users} value={incomeData.length} color="#885CF6"/>
        </motion.div>
        {incomeData.length>0 &&
          <div className="py-2">
            <IncomeChart incomeData={incomeData} />
          </div>
        }
        <DisplayIncome refreshData = {fetchData}/>
        {incomeData.length>0 && 
          <div className="py-4">            
            <IncomePieChart incomeData={incomeData}/>
          </div>
        }
        </main>
    </div>
  )
}

export default Income