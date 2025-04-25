/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import SubscriptionContext from '@/context/SubscriptionContext';

const COLORS = [
  "#E50914",
  "#1DB954",
  "#00A8E1",
  "#1CE783",
  "#FFE404",
  "#FF0000",
  "#005BAC",
  "#00A859",
  "#FFCC00",
  "#00C8FF",
  "#A9A9A9",
];
  


function SubPieChart({newData}) {
    const { getSubs } = useContext(SubscriptionContext);

    const [subs, setSubs] = useState([]);


    useEffect(()=>{
        fetchData() 
      },[newData])
    
      const fetchData = async()=>{
        const data = await getSubs()
        setSubs(data || [])
      }
    
      const subscriptionData = subs.map(sub => ({
        name: sub.sub_Category,
        value: parseFloat(sub.amount),
      }));

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-4'>Subscription Spending</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={subscriptionData}
              cx='50%'
              cy='50%'
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {subscriptionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default SubPieChart;
