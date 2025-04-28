// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React, { useContext, useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ExpenseContext from "@/context/ExpenseContext";

function ExpenseChart({ expenseData }) {
    const { getExpenseCategories } = useContext(ExpenseContext);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTimeRange, setSelectedTimeRange] = useState('This Week');
    const [categories, setCategories] = useState([]);


    const fetchCategories = async () => {
        const data = await getExpenseCategories();
        setCategories(data || []);
    };

    const filterByTimeRange = (data, range) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
    
        return data.filter(item => {
            const itemDate = new Date(item.created_at);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth();
            const itemQuarter = Math.floor(itemMonth / 3);
    
            switch (range) {
                case 'This Week': {
                    const itemStartOfWeek = new Date(itemDate);
                    itemStartOfWeek.setHours(0, 0, 0, 0);
                    const itemEndOfWeek = new Date(itemStartOfWeek);
                    itemEndOfWeek.setDate(itemStartOfWeek.getDate() + 6);
                    
                    return itemDate >= startOfWeek && itemDate <= endOfWeek;
                }
                case 'This Month': {
                    return itemMonth === currentMonth && itemYear === currentYear;
                }
                case 'This Quarter': {
                    return itemYear === currentYear && itemQuarter === currentQuarter;
                }
                case 'This Year': {
                    return itemYear === currentYear;
                }
                default:
                    return true;
            }
        });
    };   

    const filteredChartData = filterByTimeRange(
        selectedCategory === 'All'
          ? expenseData
          : expenseData.filter(item => item.expense_category === selectedCategory),
        selectedTimeRange
      );    

    useEffect(() => {
        fetchCategories();
    }, [expenseData]);

    const formatIncomeForChart = (data) => {

        if (selectedTimeRange === 'This Year') {
          const monthlyTotals = {};
      
          data.forEach(item => {
            const dateObj = new Date(item.created_at);
            const monthLabel = dateObj.toLocaleString('default', { month: 'short' });
      
            if (!monthlyTotals[monthLabel]) {
              monthlyTotals[monthLabel] = 0;
            }
            monthlyTotals[monthLabel] += parseFloat(item.amount_used);
          });
      
          return Object.entries(monthlyTotals).map(([date, expense]) => ({ date, expense }));
        }
      
        if (selectedTimeRange === 'This Quarter') {
          const monthSet = new Set();
      
          data.forEach(item => {
            const dateObj = new Date(item.created_at);
            const month = dateObj.getMonth();
            monthSet.add(month);
          });
      
          const uniqueMonths = Array.from(monthSet);
      
          if (uniqueMonths.length > 2) {
            const monthlyTotals = {};
      
            data.forEach(item => {
              const dateObj = new Date(item.created_at);
              const monthLabel = dateObj.toLocaleString('default', { month: 'short' });
      
              if (!monthlyTotals[monthLabel]) {
                monthlyTotals[monthLabel] = 0;
              }
              monthlyTotals[monthLabel] += parseFloat(item.amount_used);
            });
      
            return Object.entries(monthlyTotals).map(([date, expense]) => ({ date, expense }));
          }
        }     
      
        return data
          .map(item => {
            const dateObj = new Date(item.created_at);
            const dateLabel = dateObj.toLocaleDateString('default', {
              month: 'short',
              day: 'numeric',
            });
      
            return {
              date: dateLabel,
              expense: parseFloat(item.amount_used),
              created_at: item.created_at,
            };
          })
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    };

    const totalExpense = filteredChartData.reduce((sum, item) => sum + parseFloat(item.amount_used), 0);
    
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Expense Overview</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <select
            className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>

          <select
            className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-gray-300 text-sm sm:text-base mb-2">Total: KES {totalExpense.toLocaleString()}</p>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatIncomeForChart(filteredChartData)}>
            <CartesianGrid stroke="#074799" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                color: '#f9fafb'
              }}
              labelStyle={{ color: '#f9fafb' }}
              itemStyle={{ color: '#f9fafb' }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#F72C5B"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default ExpenseChart