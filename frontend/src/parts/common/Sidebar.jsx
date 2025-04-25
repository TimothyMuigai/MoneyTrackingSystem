import {
  BarChart,
  CalendarClock,
    DollarSign,
    LayoutDashboard,
    LogOut,
    Menu,
    PiggyBank,
    Receipt,
    Settings
  } from "lucide-react";
  import React, { useContext, useState } from "react";
  // eslint-disable-next-line no-unused-vars
  import { AnimatePresence, motion } from "framer-motion";
  import { Link } from "react-router-dom";
  import AuthContext from "../../context/AuthContext";
  
  const SIDERBAR_ITEMS = [
    {
      name: "Overview",
      icon: LayoutDashboard,
      color: "#4F46E5",
      href: "/",
    },
    { name: "Income", icon: DollarSign, color: "#10B981", href: "/income" },
    { name: "Expenses", icon: Receipt, color: "#F87171", href: "/expense" },
    { name: "Budget", icon: PiggyBank, color: "#F59E0B", href: "/budget" },
    { name: "Subscriptions", icon: CalendarClock, color: "#8B5CF6", href: "/subscription" },
    { name: "Analytics", icon: BarChart, color: "#3B82F6", href: "/analytics" },
    { name: "Settings", icon: Settings, color: "#ccc", href: "/settings" },
  ];
  
  function Sidebar() {
    let { logoutUser } = useContext(AuthContext);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    return (
      <motion.div
        className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
        animate={{ width: isSidebarOpen ? 160 : 80 }}
      >
        <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
          >
            <Menu size={24} />
          </motion.button>
  
          <nav className="mt-8 flex-grow">
            {SIDERBAR_ITEMS.map((item) => (
              <Link key={item.href} to={item.href}>
                <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                  <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="ml-4 whitespace-nowrap"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 0 }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
           
            <motion.div
              className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              onClick={logoutUser}
            >
              <LogOut size={20} style={{ color: "#EF4444", minWidth: "20px" }} />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    className="ml-4 whitespace-nowrap"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </nav>
        </div>
      </motion.div>
    );
  }
  
  export default Sidebar;  