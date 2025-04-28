// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function BudgetBarChart({ budgetData }) {
  const chartData = budgetData.map(item => {
    const totalSpent = item.related_expenses.reduce((sum, exp) => sum + parseFloat(exp.amount_used), 0);
    return {
      category: item.expense_category,
      budgeted: parseFloat(item.amount_to_budget),
      actual: totalSpent,
    };
  });
  
  return (
    <div className="w-full">
  <motion.div
    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <div className="flex flex-col gap-4 sm:gap-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Budget Overview</h2>

      <div className="w-full h-[250px] xs:h-[280px] sm:h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
            <Bar dataKey="actual" fill="#ef4444" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
</div>


  )
}

export default BudgetBarChart