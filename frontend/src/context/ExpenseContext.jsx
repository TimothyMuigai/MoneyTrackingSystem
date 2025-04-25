import useAxios from '@/Utils/useAxios';
import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner';
import AuthContext from './AuthContext';

const ExpenseContext = createContext();

export default ExpenseContext

export const ExpenseProvider = ({ children }) => {
    const api = useAxios();
    let { logoutUser } = useContext(AuthContext);

    const [loading, setloading] = useState(false);
    const [err, setError] = useState(false);

    const getIncomes = async ()=>{
            try {
                const response = await api.get('/api/income/')
                return response.data
            } catch (error) {
                console.log(error)
            }
        }

    const getExpenses = async ()=>{
        setloading(true)
        try {
            const response = await api.get('/api/expense/')
            return response.data            
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                toast.error("Network Error: Please check your connection.");
                setError(true)
            } else {
                toast.error("An error occurred while fetching data. Logging you out!!");
                logoutUser();
            }
        }finally{
            setloading(false)
        }
    }

    const addExpense = async(amount, category)=>{
        try{
            const response = await api.post('/api/expense/',{
                amount_used:amount,
                expense_category:category
            })

            if(response.status === 201){
                return response.data
            } else {
                toast.error(`Something went wrong: ${response.status}`);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getExpenseCategories = async()=>{
        setloading(true);
        try {
            const response = await api.get('/api/expense-categories/');
            return response.data;
        } catch (error) {
            console.log(error)
            return [];
        }finally {
            setloading(false);
        }
    }

    const deleteExpense = async (id)=>{
        try {
            const response = await api.delete(`/api/expense/${id}/`)
            return response
        } catch (error) {
            console.log(error)
        }
    }
    
    const editExpense = async ({id, expense_category, amount_used}) => {
        try {
            const response = await api.patch(`/api/expense/${id}/`,{ expense_category,amount_used })
            
            if(response.status === 200){
                return response.data
            }
        } catch (error) {
            console.log(error)
        }
    }

    const contextData = {
        loading,
        err,
        getExpenses,
        getIncomes,
        addExpense,
        getExpenseCategories,
        deleteExpense,
        editExpense,
    }

    return (
        <ExpenseContext.Provider value={contextData}>
            { children }
        </ExpenseContext.Provider>
    )
}