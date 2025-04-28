import SubList from '@/parts/subscription/SubList'
import React, { useContext, useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import Header from '@/parts/common/Header';
import StatCard from '@/parts/common/StatCard';
import DataContext from '@/context/DataContext';
import SubPieChart from '@/parts/subscription/SubPieChart';
import SubGraph from '@/parts/subscription/SubGraph';
import CurrencyContext from '@/context/CurrencyContext';

function Subscriptions() {
  const [subStats, SetSubStats] = useState([]);
  const { getSubs } = useContext(DataContext);
  const { exchangeRates, toCurrency} = useContext(CurrencyContext);
  const currencyAmount = exchangeRates[toCurrency] || 1;
  const currency = toCurrency;

  useEffect(()=>{
    fetchData() 
  },[])

  const fetchData = async()=>{
    const data = await getSubs()
    SetSubStats(data || [])
  }
  
  const totalAmount = subStats.reduce((sum, total)=>(
    sum+parseFloat(total.amount)
  ),0)

  const pendingSubs = subStats.filter(sub => sub.status === "pending");
  const upcomingSubs = subStats.filter(sub => sub.status === "upcoming");
  const completedSubs = subStats.filter(sub => sub.status === "due");

  // To get the count:
  const pendingCount = pendingSubs.length;
  const upcomingCount = upcomingSubs.length;
  const noOfPending = pendingCount+upcomingCount

  return (
    <div>
      <div className="flex-1 overflow-auto relative z-10">
      <Header title="Subscriptions" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='Total Amount' icon={DollarSign} value={`${currency}.${(totalAmount*currencyAmount).toFixed(0).toLocaleString()}`} color='#EF4444' />
          <StatCard name='Pending Subscriptions' icon={Clock} value={noOfPending} color='#F59E0B' />
          <StatCard
              name='Completed Subscriptions'
              icon={CheckCircle}
              value={completedSubs.length}
              color='#10B981'
          />
          <StatCard name='Total Subscriptions' icon={ShoppingBag} value={subStats.length} color='#6366F1' />
        </motion.div>
        {subStats.length > 0 ? (
        <>
          <div className='pb-5'>
              <SubPieChart newData = {fetchData}/>
          </div>

          <SubList newData = {fetchData}/>
          
          <div className='py-4'>
            <SubGraph newData = {subStats}/>
          </div>
        </>
        ):(
          <SubList newData = {fetchData}/>
        )}
        
      </main>
    </div>
      
    </div>
  )
}

export default Subscriptions