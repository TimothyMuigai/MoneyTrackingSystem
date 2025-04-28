import React, { useContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import dayjs from 'dayjs'
import AuthContext from '@/context/AuthContext'


const baseURL = 'http://127.0.0.1:8000'

const useAxios = ()=> {
    const { authTokens, setAuthTokens } = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL,
        headers: {Authorization: `Bearer ${authTokens?.access}`}
    });

    axiosInstance.interceptors.request.use(async req => {
            
        const user = jwtDecode(authTokens.access)
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
        
        console.log('token isExpired', isExpired)
        
        if (!isExpired) return req
    
        const response = await axios.post(`${baseURL}/api/token/refresh/`,{
            refresh:authTokens.refresh
        })
    
        localStorage.setItem('authTokens', JSON.stringify(response.data))

        setAuthTokens(response.data)
        req.headers.Authorization = `Bearer ${response.data.access}`
    
        return req
    })

  return axiosInstance
}

export default useAxios