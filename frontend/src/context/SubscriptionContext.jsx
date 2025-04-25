import useAxios from '@/Utils/useAxios'
import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'
import AuthContext from './AuthContext'
import NotificationContext from './NotificationContext'

const SubscriptionContext = createContext() 

export default SubscriptionContext

export const SubscriptionProvider = ({ children }) => {
    const api = useAxios();

    let { logoutUser } = useContext(AuthContext);

    const [loading, setloading] = useState(false);
    const [err, setError] = useState(false);
    const { notification } = useContext(NotificationContext);

    const getSubs = async ()=>{
        setloading(true)
        try{
            const response = await api.get('/api/subscriptions/')
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

    const getSubCategory = async ()=>{
        try {
            const response = await api.get('/api/sub-category/')
            return response.data
        } catch (error) {
            console.log(error)
        }
    }
    
    const addSubs = async (category, amount, start_date, due_date, frequency)=>{
        try {
            const response = await api.post('api/subscriptions/',{
                sub_Category: category,
                amount:amount,
                start_date: start_date,
                due_date:due_date,
                frequency:frequency
            })
            if(response.status === 201){
                return response.data
            } else {
                toast.error(`Something went wrong: ${response.status}`);
            }
        } catch{
            toast.error("Failed to add subscription");
        }
    }

    const editSubs = async ({id, sub_Category, amount, start_date, due_date, frequency, auto_renew})=>{
        try {
            const response = await api.patch(`/api/subscriptions/${id}/`,{ sub_Category, amount, start_date, due_date, frequency, auto_renew})
            
            if(response.status === 200){
                return response.data
            }
        } catch (error) {
            console.log(error)
        }
    }

    const cancelSubs = async (id)=>{
        try {
            const response = await api.post(`/api/cancel-subscription/${id}/`)
            if(response.status === 200){
                // After canceling subscription
                if(notification){
                    window.dispatchEvent(new Event("refreshNotifications"));
                }
                return response.data

            }else{
                toast.error('cannot complete action')
            }
        } catch (error) {
            console.log(error)
        }   
    }
    const cancelImmediatley = async (id)=>{
        try {
            const response = await api.post(`/api/cancel-immediately/${id}/`)
            if(response.status === 200){
                if(notification){
                    window.dispatchEvent(new Event("refreshNotifications"));
                }
                return response.data
            }else{
                toast.error('cannot complete action. Something went wrong')
            }
        } catch (error) {
            console.log(error)
        }
    }
    const renewSubs = async (id)=>{
        try {
            const response = await api.post(`/api/renew-subs/${id}/`)
            if(response.status === 200){
                if(notification){
                    window.dispatchEvent(new Event("refreshNotifications"));
                }
                return response.data
            }else{
                toast.error('cannot complete action. Something went wrong')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const deleteSubs = async (id)=>{
        try {
            const response = await api.delete(`/api/subscriptions/${id}/`)
            return response
        } catch (error) {
            console.log(error)
        }
    }

    const contextData = {
        getSubs,
        addSubs,
        getSubCategory,
        editSubs,
        cancelSubs,
        cancelImmediatley,
        renewSubs,
        deleteSubs,
        loading,
        err,
    }

    return(
        <SubscriptionContext.Provider value={contextData}>
            { children }
        </SubscriptionContext.Provider>
    )
}