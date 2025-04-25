import React, { createContext } from 'react'
import useAxios from '@/Utils/useAxios';

const DataContext = createContext();

export default DataContext

export const DataProvider = ({children}) => {
    const api = useAxios()
   
    const getBudgets = async ()=>{
        try {
            const response = await api.get('/api/budget/')
            return response.data 
        } catch (error) {
           console.log(error)
        }
    }

    const getExpenses = async ()=>{
        try {
            const response = await api.get('/api/expense/')
            return response.data            
        } catch (error) {
            console.log(error)
        }
    }

    const getIncomes = async ()=>{
        try {
            const response = await api.get('/api/income/')
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const getSubs = async ()=>{
        try{
            const response = await api.get('/api/subscriptions/')
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const contextData = {
        getBudgets,
        getExpenses,
        getIncomes,
        getSubs,
    }

    return(
        <DataContext.Provider value={contextData}>
            { children }
        </DataContext.Provider>
    )
}