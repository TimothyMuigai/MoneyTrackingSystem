import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function useCurrency(url) {
    const [data, setData] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(()=>{
        const fetchCityData = async ()=>{
            setLoaded(true)
            try {
                const response = await axios(url)
                setData(response.data)
            } catch (error) {
               toast.error("Error fetching currencies", error)
            }finally{
                setLoaded(false)
            }
        }
        fetchCityData()
    },[url])
    return { data, loaded };
}

export default useCurrency