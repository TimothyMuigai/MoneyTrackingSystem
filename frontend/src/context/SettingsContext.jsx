import useAxios from '@/Utils/useAxios';
import React, { createContext } from 'react'

const SettingsContext = createContext();

export default SettingsContext

export const SettingsProvider = ({ children }) => {

    const api = useAxios();

    const deleteAccount = async () => {
        const response = await api.delete('api/delete-account/')
        return response
    }

    const contextData = {
        deleteAccount,
    }

    return(
        <SettingsContext.Provider value={contextData}>
            { children }
        </SettingsContext.Provider>
    )
}