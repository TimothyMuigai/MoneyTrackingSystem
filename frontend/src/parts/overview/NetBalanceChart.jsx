import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function NetBalanceChart({ incomeData, expenseData }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("This Week");
  const [chartType, setChartType] = useState("line");

  const filterByTimeRange = (data, range) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return data.filter((item) => {
      const itemDate = new Date(item.created_at);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();
      const itemQuarter = Math.floor(itemMonth / 3);

      switch (range) {
        case "This Week":
          return itemDate >= startOfWeek && itemDate <= endOfWeek;
        case "This Month":
          return itemMonth === currentMonth && itemYear === currentYear;
        case "This Quarter":
          return itemYear === currentYear && itemQuarter === currentQuarter;
        case "This Year":
          return itemYear === currentYear;
        default:
          return true;
      }
    });
  };

  const filteredIncome = filterByTimeRange(incomeData, selectedTimeRange);
  const filteredExpenses = filterByTimeRange(expenseData, selectedTimeRange);

  const formatNetBalanceData = () => {
    const dataMap = {};

    const addToMap = (list, key, valueKey, isIncome = true) => {
      list.forEach((item) => {
        const dateObj = new Date(item.created_at);
        const label =
          selectedTimeRange === "This Year"
            ? dateObj.toLocaleString("default", { month: "short" })
            : dateObj.toLocaleDateString("default", {
                month: "short",
                day: "numeric",
              });

        if (!dataMap[label]) {
          dataMap[label] = { date: label, income: 0, expense: 0 };
        }
        dataMap[label][isIncome ? "income" : "expense"] += parseFloat(
          item[valueKey]
        );
      });
    };

    addToMap(filteredIncome, "created_at", "amount_received", true);
    addToMap(filteredExpenses, "created_at", "amount_used", false);

    return Object.values(dataMap)
      .map((item) => ({
        ...item,
        netBalance: item.income - item.expense,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = formatNetBalanceData();

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
          Net Balance Overview
        </h2>

        <div className="flex flex-wrap gap-2 sm:gap-4">
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
            className="bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>

      <p className="text-gray-300 text-sm sm:text-base mb-2">
        Net Balance: KES{" "}
        {chartData
          .reduce((acc, item) => acc + item.netBalance, 0)
          .toLocaleString()}
      </p>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid stroke="#074799" />
              <XAxis dataKey="date" />
              <YAxis />
              <Legend />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const income =
                      payload.find((p) => p.dataKey === "income")?.value || 0;
                    const expense =
                      payload.find((p) => p.dataKey === "expense")?.value || 0;
                    const net = income - expense;

                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm space-y-1">
                        <div className="font-semibold">Date: {label}</div>
                        <div>Income: KES {income.toLocaleString()}</div>
                        <div>Expense: KES {expense.toLocaleString()}</div>
                        <div className="font-semibold text-green-400">
                          Net: KES {net.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#00FF9C"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#FF0077"
                strokeWidth={2}
                name="Expense"
              />
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#074799" />
              <XAxis dataKey="date" />
              <YAxis />
              <Legend />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const income =
                      payload.find((p) => p.dataKey === "income")?.value || 0;
                    const expense =
                      payload.find((p) => p.dataKey === "expense")?.value || 0;
                    const net = income - expense;

                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm space-y-1">
                        <div className="font-semibold">Date: {label}</div>
                        <div>Income: KES {income.toLocaleString()}</div>
                        <div>Expense: KES {expense.toLocaleString()}</div>
                        <div className="font-semibold text-green-400">
                          Net: KES {net.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#00FF9C"
                fill="#00FF9C40"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#FF0077"
                fill="#FF007740"
                name="Expense"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default NetBalanceChart;
