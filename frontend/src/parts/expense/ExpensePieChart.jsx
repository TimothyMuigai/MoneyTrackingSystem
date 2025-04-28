/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

function ExpensePieChart({ expenseData }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (expenseData.length > 0) {
            const categoryMap = {};

            expenseData.forEach((expense) => {
                const category = expense.expense_category;
                const amount = parseFloat(expense.amount_used);

                if (categoryMap[category]) {
                    categoryMap[category] += amount;
                } else {
                    categoryMap[category] = amount;
                }
            });

            const formattedData = Object.entries(categoryMap).map(([name, value]) => ({
                name,
                value
            }));

            setChartData(formattedData);
        }
    }, [expenseData]);

    return (
        <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-100">
        Expense by Category
      </h2>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={window.innerWidth < 640 ? 60 : 80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "0.75rem",
                color: "#E5E7EB",
                paddingTop: 10,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
    );
}

export default ExpensePieChart;
