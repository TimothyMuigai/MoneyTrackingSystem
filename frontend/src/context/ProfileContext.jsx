import useAxios from '@/Utils/useAxios';
import React, { createContext, useContext, useState } from 'react'
import { toast } from 'sonner';
import AuthContext from './AuthContext';

const ProfileContext = createContext();

export default ProfileContext

export const ProfileProvider = ({ children }) => {
    let { logoutUser } = useContext(AuthContext)
    const api = useAxios();
    let [loading, setLoading] = useState(false);

    let userProfile = async (email, username, image) => {
        setLoading(true)
        try{
            const formData = new FormData();
            formData.append("email", email);
            formData.append("username", username);
            
            if (image) {
                formData.append("image", image);
            }

            let response = await api.patch('/api/profile/', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.status === 200) {
                toast.success('Profile updated successfully!');
            }
        }catch(err){
            console.log(err)
            toast.error("A problem occurred. Could not update profile at the moment")
        }finally {
            setLoading(false);
        }
    }

    let PasswordChange = async (oldPassword, newPassword) => {
        setLoading(true)
        try{
            let response = await api.put("/api/change-password/", {
                old_password: oldPassword,
                new_password: newPassword,
            });
            
            if (response.status === 200) {
                toast.success("Password updated successfully Login with new password!");
                logoutUser();
            }
            
        }catch(err){
            if (err.response && err.response.status === 400) {
                toast.error("Incorrect current password.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }finally{
            setLoading(false)
        }
    }

    const contextData = {
        userProfile,
        PasswordChange,
        loading
    }

    return (
        <ProfileContext.Provider value={contextData}>
            {children}
        </ProfileContext.Provider>
    )
}