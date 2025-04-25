// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon } from "lucide-react";

const SubscriptionCard = () => {
    const subscription = [
      {
        amount: "2000.00",
        auto_renew: false,
        due_date: "2025-03-31",
        frequency: "monthly",
        id: 1,
        is_active: true,
        name: "Netflix",
        start_date: "2025-03-30",
        status: "cancel_pending",
      },
    ];
    const [firstSub] = subscription;
    const { name, amount, start_date, due_date } = firstSub;
    

  const isDueSoon = new Date(due_date) - new Date() < 3 * 24 * 60 * 60 * 1000;
  const formattedStart = new Date(start_date).toLocaleDateString();
  const formattedDue = new Date(due_date).toLocaleDateString();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl shadow-md border border-gray-700 transition-all duration-200 bg-gray-900 dark:bg-gray-950 ${
        isDueSoon ? "border-yellow-500" : "border-gray-700"
      }`}
    >
      <div className="flex justify-between items-center">
        
        <h2 className="text-lg font-semibold text-white">{name}</h2>
        <p className="text-sm text-green-400 font-bold">Ksh {amount}</p>
      </div>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          Start: {formattedStart}
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Due: {formattedDue}
        </div>
      </div>
      {isDueSoon && (
        <p className="mt-2 text-xs text-yellow-400 font-medium">Payment due soon!</p>
      )}
    </motion.div>
  );
};

export default SubscriptionCard;
