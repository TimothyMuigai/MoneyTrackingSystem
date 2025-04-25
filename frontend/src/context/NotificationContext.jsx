import useAxios from '@/Utils/useAxios';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import AuthContext from './AuthContext';

const NotificationContext = createContext();

export default NotificationContext

export const NotificationProvider = ({ children })=>{
    const api = useAxios()

    let { logoutUser } = useContext(AuthContext);
    
    const [notification, setNotification] = useState(false);

    const [loading, setloading] = useState(false);
    const [err, setError] = useState(false);
    const unreadCountRef = useRef(0);
    
    const getNotifications = async ()=>{
        if (notification) return;
        setloading(true)
        try {
            const response = await api.get('/api/notifications/');
            const notifications = response.data;
            // Filter unread notifications
            const unread = notifications.filter(n => !n.is_read);
            const savedSettings = JSON.parse(localStorage.getItem("notificationPreferences"));
		    const pushEnabled = savedSettings?.push;

            // Show toast depending on count
            if (!pushEnabled && unread.length > unreadCountRef.current) {
                if (unread.length === 1) {
                    toast.info("You have a new message", { position: "top-center" });
                } else {
                    toast.info(`You have ${unread.length} new messages`, { position: "top-center" });
                }
            }
    
            unreadCountRef.current = unread.length; 
            return notifications;
        } catch (error) {
            if (error.code === "ERR_NETWORK") {
                setError(true)
            } else {
                console.log(error)
                toast.error("An error occurred while fetching data. Logging you out!!");
                logoutUser();
            }
        }finally{
            setloading(false)
        }           
    } 

    const markAsRead = async (id) => {
        try{
            const response = await api.patch(`/api/notifications/${id}/mark-read/`);
            return response.data;
        }catch(error){
            console.log(error);
            toast.error('error marking this as read')
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await api.patch(`/api/notifications/mark-all-read/`);
            return response.data;
        } catch (error) {
            console.log(error)
            toast.error('error..cannot mark all as read')
        }
        
    };

    const clearAll = async ()=>{
        try {
            const response = await api.delete('/api/notifications/delete-all/')
            if (response.status === 204) {
                toast.success('All notifications cleared!');
              } else {
                toast.error('Could not complete action');
              }
        } catch (error) {
            console.log(error)
            toast.error('An error occurred while clearing notifications.')
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem("notificationPreferences");
        if (saved) {
            const parsed = JSON.parse(saved);
            setNotification(parsed.push);
        }
    }, []);
    
    const contextData = {
        getNotifications,
        markAllAsRead,
        markAsRead,
        clearAll,
        setNotification,
        notification,
        loading,
        err,
    }
    return(
        <NotificationContext.Provider value={contextData}>
            {children}
        </NotificationContext.Provider>
    )
}