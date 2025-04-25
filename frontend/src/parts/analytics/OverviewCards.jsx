/* eslint-disable no-unused-vars */
import ExpenseContext from "@/context/ExpenseContext";
import IncomeContext from "@/context/IncomeContext";
import { motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const OverviewCards = () => {
	const { getExpenses, getIncomes, getExpenseCategories } = useContext(ExpenseContext);
	const { getIncomeCategories } = useContext(IncomeContext);

	const [expenseData, setExpenseData] = useState([]);
	const [incomeData, setIncomeData] = useState([]);
	const [categories, setCategories] = useState([]);
	const [incomeCate, setIncomeCate] = useState([]);

	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");

	useEffect(()=>{
		fetchData();
		fetchIncomeData();
		fetchCategories();
		fetchIncomeCate();
	},[])

	const fetchData = async () => {
		try {
			const data = await getExpenses();
			setExpenseData(data || []);
		} catch (error) {
			console.error("Failed to fetch income data", error);
			setExpenseData([]);
		}
	};
	
	const fetchIncomeData = async()=>{
		const data = await getIncomes()
		setIncomeData(data||[])
	}

	const fetchCategories = async () => {
		const categoryData = await getExpenseCategories();
		setCategories(categoryData);
	};

	const fetchIncomeCate = async () => {
        const data = await getIncomeCategories();
        setIncomeCate(data);
    };

	const getMonthName = (dateStr) => {
	const date = new Date(dateStr);
	return date.toLocaleString('default', { month: 'short' });
	};

	const getMonthlyData = () => {
		const dataMap = {};
	
		const formatMonth = (dateStr) => {
			const date = new Date(dateStr);
			return `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
		};
	
		// Determine filter start date
		const getStartDate = () => {
			const now = new Date();
			switch (selectedTimeRange) {
				case "This Week":
					const day = now.getDay();
					return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
				case "This Month":
					return new Date(now.getFullYear(), now.getMonth(), 1);
				case "This Quarter":
					const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
					return new Date(now.getFullYear(), quarterStartMonth, 1);
				case "This Year":
					return new Date(now.getFullYear(), 0, 1);
				default:
					return new Date(0);
			}
		};
	
		const startDate = getStartDate();
	
		// Filter & group income
		incomeData
			.filter((item) => new Date(item.created_at) >= startDate)
			.forEach((item) => {
				const month = formatMonth(item.created_at);
				if (!dataMap[month]) dataMap[month] = { month, income: 0, expense: 0 };
				dataMap[month].income += parseFloat(item.amount_received || 0);
			});
	
		// Filter & group expense
		expenseData
			.filter((item) => new Date(item.created_at) >= startDate)
			.forEach((item) => {
				const month = formatMonth(item.created_at);
				if (!dataMap[month]) dataMap[month] = { month, income: 0, expense: 0 };
				dataMap[month].expense += parseFloat(item.amount_used || 0);
			});
	
		return Object.values(dataMap).sort((a, b) => {
			const dateA = new Date(a.month);
			const dateB = new Date(b.month);
			return dateA - dateB;
		});
	};
	
	
	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Income-Expense Overview</h2>

				<select
					className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
					value={selectedTimeRange}
					onChange={(e) => setSelectedTimeRange(e.target.value)}
				>
					<option>This Week</option>
					<option>This Month</option>
					<option>This Quarter</option>
					<option>This Year</option>
				</select>
			</div>

			<div className='w-full h-80'>
				<ResponsiveContainer>
					<BarChart width={730} height={250} data={getMonthlyData()}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Bar dataKey="income" fill="#34d399" name="Income" />
						<Bar dataKey="expense" fill="#f87171" name="Expenses" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default OverviewCards;