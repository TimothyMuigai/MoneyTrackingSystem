import useAxios from '@/Utils/useAxios';
import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner';
import AuthContext from './AuthContext';

const IncomeContext = createContext();

export default IncomeContext;

export const IncomeProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [err, setError] = useState(false);
    let { logoutUser } = useContext(AuthContext)

    let api = useAxios();

    const getIncomes = async ()=>{
        setLoading(true)
        try {
            const response = await api.get('/api/income/')
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
            setLoading(false)
        }
    }

    const getIncomeCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/income-categories/');
            return response.data;
        } catch (error) {
           console.log(error)
            return [];
        } finally {
            setLoading(false);
        }
    };
    

    const addIncome = async (category, amount)=>{
        try {
            const response = await api.post('/api/income/',{
                income_category:category,
                amount_received:amount
            });
            if (response.status === 201) {    
                return response.data 
            } else {
                toast.error(`Something went wrong: ${response.status}`);
            }
        } catch (error) {
            toast.error(error)
        }
    }

    const editIncome = async ({id, income_category, amount_received}) => {
        try {
            const response = await api.patch(`/api/income/${id}/`,{ income_category,amount_received })
            
            if(response.status === 200){
                return response.data
            }
        } catch (error) {
            console.log(error)
        }
    }

    const deleteIncome = async (id)=>{
        try {
            const response = await api.delete(`/api/income/${id}/`)
            return response
        } catch (error) {
            console.log(error)
        }
    }

    const contextData = {
        err,
        loading,
        getIncomes,
        addIncome,
        getIncomeCategories,
        editIncome,
        deleteIncome,
    }

    return (
        <IncomeContext.Provider value={contextData}>
            { children }
        </IncomeContext.Provider>
    )
}