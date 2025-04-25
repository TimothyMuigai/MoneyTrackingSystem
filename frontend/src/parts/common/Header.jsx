import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Notification from './Notification';
import useAxios from '@/Utils/useAxios';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header({ title }) {
  const  [userData, setUserData] = useState(null);
  let api = useAxios();

  useEffect(()=>{
    if (title == 'Overview'){
      fetchUserProfile()
    }
  },[title])

  const fetchUserProfile = async () => {
    try {
      let response = await api.get("/api/profile/");
      setUserData(response.data)      
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return <Skeleton className="rounded-full w-20 h-20 mr-4" />;

    if (image.startsWith("image/upload/https://")) {
    return image.replace("image/upload/", "");
    }

    if (image.startsWith("http")) return image;
    return `https://res.cloudinary.com/devs9of9t/${image.replace("image/upload/", "")}`;
  };
  return (
    <header className='bg-gray-800 bg-opacity-50 backdrop-blur-lg border-b border-gray-700'>
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-100">{title}</h1>

        {title == "Overview" ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            <Notification />

            <motion.div
              className="flex items-center space-x-2 sm:space-x-3 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-full p-2"
              whileHover={{ y: -5, boxShadow: "10 25px 50px -10px rgba(0,0,0,0.5)" }}
            >
              <a href="/settings">
                <img
                  src={getImageUrl(userData?.image)}
                  alt="Profile"
                  className="rounded-full w-9 h-9 sm:w-10 sm:h-10 object-cover"
                />
              </a>
            </motion.div>
          </div>
        ):(
          <>
            <Notification />
          </>
        )}
      </div>
    </header>
  );
}
