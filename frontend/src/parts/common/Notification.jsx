// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckIcon, Filter } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import NotificationContext from "@/context/NotificationContext";

function Notification() {
  const { getNotifications, markAsRead, markAllAsRead, clearAll, loading, err, notification } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [sortBy, setSortBy] = useState("date");

  const fetchData = async () => {
    const data = await getNotifications();
    setNotifications(data || []);
  };

  useEffect(() => {
    if(notification)return;
    const fetchDataAndRefresh = () => {
      fetchData();
  };

  fetchDataAndRefresh();
    const interval = setInterval(() => {
      fetchDataAndRefresh();
    }, 10 * 60 * 1000);
    window.addEventListener("refreshNotifications", fetchDataAndRefresh); 
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshNotifications", fetchDataAndRefresh);
    }
  }, []);

  const clearNotifications = async ()=>{
    await clearAll()
    fetchData();
  }
  

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const allRead = notifications.every((n) => n.is_read);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const sortedNotifications = (() => {
    const unread = notifications
      .filter((n) => !n.is_read)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const read = notifications
      .filter((n) => n.is_read)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
    if (notifications.length === 0) return [];
  
    if (allRead) {
      return [...notifications].sort((a, b) =>
        sortBy === "latest"
        ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      );
    }
  
    if (sortBy === "date") {
      return [...unread, ...read];
    } else if (sortBy === "unread") {
      return [...read, ...unread];
    }
  
    return [...notifications];
  })();
  
  

  const SkeletonLoader = () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-3 w-24 bg-gray-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-600 rounded" />
        </div>
      ))}
    </div>
  );
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative cursor-pointer p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-200 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5 text-gray-300 dark:text-gray-400" />
            </motion.div>
              {unreadCount > 0 && !notification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
              {unreadCount}
            </motion.div>
          )}
        </motion.div>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] bg-gray-900 dark:bg-gray-950 shadow-lg rounded-lg cursor-pointer border border-gray-800">
        <div className="p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-100">Notifications</h3>
          {!err && <button
           onClick={() => {
            if (allRead) {
              setSortBy(sortBy === "latest" ? "oldest" : "latest");
            } else {
              setSortBy(sortBy === "date" ? "unread" : "date");
            }
          }}
          className="text-gray-400 hover:text-gray-300 flex items-center gap-1"
        >
          <Filter className="w-4 h-4" />
          {allRead
            ? sortBy === "latest"
              ? "Sort by Latest"
              : "Sort by Oldest"
            : sortBy === "date"
              ? "Unread ↓ Read"
              : "Read ↓ Unread"}
          </button>}
        </div>
        <Separator />

        <ScrollArea className="max-h-[300px] overflow-y-auto">
          <div className="space-y-4 p-4">
          {notification ?(
              <p className="text-sm text-gray-500 dark:text-gray-400">Notifications are turned off. Go to settings.</p>
            ): loading ? (
              <SkeletonLoader />
            ) : err ? (
              <p className="text-sm text-red-400 dark:text-red-500">Cannot collect data. Please check your connection and refresh the page.</p>
            ) : sortedNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications.</p>
            ) : (
              sortedNotifications.map((data) => (
                <motion.div
                  key={data.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`grid grid-cols-[1fr_auto] items-start gap-4 p-3 rounded-lg transition duration-200 ${
                    data.notification_type !== "general"
                      ? "bg-red-700 dark:bg-red-800 hover:bg-red-600 dark:hover:bg-red-700"
                      : data.is_read
                      ? "bg-gray-800 dark:bg-gray-900"
                      : "bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700"
                  }`}
                  
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">{new Date(data.created_at).toLocaleString()}</p>
                    <p className={`text-sm font-medium ${data.notification_type !== "general" ? "text-white" : "text-gray-200"}`}>
                      {data.message}
                    </p>  
                  </div>
                  {!data.is_read && !notification && (
                    <motion.button
                      onClick={() => handleMarkAsRead(data.id)}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {unreadCount > 0 && !notification && (
          <>
            <Separator />
            <div className="p-4">
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
        {unreadCount === 0 && notifications.length!=0 && !notification &&(
          <Button
            variant="destructive"
            onClick={()=> clearNotifications()}
            className="w-full text-white"
          >
            Clear all notifications
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Notification;