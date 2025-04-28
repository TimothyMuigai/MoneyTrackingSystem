import React, { createContext, useContext, useState } from 'react'
import ProfileContext from './ProfileContext';
import useAxios from '@/Utils/useAxios';
import { toast } from 'sonner';
import AuthContext from './AuthContext';

const BudgetContext = createContext();

export default BudgetContext

export const BudgetProvider = ({children}) => {
    const api = useAxios()

    let { logoutUser } = useContext(AuthContext);

    const [loading, setloading] = useState(false);
    const [err, setError] = useState(false);
    
    const getBudgets = async ()=>{
        setloading(true)
        try {
            const response = await api.get('/api/budget/')
            return response.data 
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                toast.error("Network Error: Please check your connection.");
                setError(true)
            } else {
                toast.error("An unexpected error occurred. Please log in again");
                logoutUser();
            }
        }finally{
            setloading(false)
        }
    }

    const addBudget = async (category, amount, start_at, due_when)=>{
        try {
            const response = await api.post('/api/budget/',{
                expense_category:category,
                amount_to_budget:amount,
                start_date:start_at,
                due_date:due_when
            })

            if(response.status === 201){
                return response.data
            }else{
                toast.error(`Something went wrong: ${response.status} error code`);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getBudgetById = async (id) => {
        setloading(true)
        try {
            const response = await api.get(`/api/budget/${id}/`);
            if (response.status===200){
                return response.data
            }else{
                toast.error("There is no data for that budget detail")
            }
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                toast.error("Network Error: Please check your connection.");
                setError(true)
            } else {
                toast.error("An unexpected error occurred. Please log in again");
                logoutUser();
            }
        }finally{
            setloading(false)
        }
    };

    const editBudget = async ({id, expense_category, amount_to_budget, start_date, due_date}) => {
        
        try {
            const response = await api.patch(`/api/budget/${id}/`,{
                expense_category, amount_to_budget, start_date, due_date
            })
            if(response.status === 200){
                return response.data
            }
        } catch (error) {
            console.log(error)
        }
    }

    const deleteBudget = async(id)=>{
        try {
            const response = await api.delete(`/api/budget/${id}/`)
            return response
        } catch (error) {
            console.log(error)
        }
    }

    const contextData = {
        getBudgets,
        addBudget,
        getBudgetById,
        editBudget,
        deleteBudget,
        loading,
        err,
    }

    return(
        <BudgetContext.Provider value={contextData}>
            { children }
        </BudgetContext.Provider>
    )
}