import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const TransInfoCard = ({ title, date, amount, type }) => {
  const getAmountStyles = () =>
    type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';

  const linkPath = type === 'income' ? '/income' : '/expense';

  return (
    <Link
      to={linkPath}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-500 rounded-xl hover:bg-gray-400 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full shrink-0">
          {type === 'income' ? (
            <TrendingUp size={18} className="text-green-500" />
          ) : (
            <TrendingDown size={18} className="text-red-600" />
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px] sm:max-w-[240px]">
            {title}
          </p>
          <p className="text-xs text-gray-800">{date}</p>
        </div>
      </div>

      <div className={`flex items-center justify-center px-3 py-1 rounded-lg ${getAmountStyles()}`}>
        <span className="text-sm font-semibold">
          {type === 'income' ? '+' : '-'} Ksh. {parseFloat(amount).toLocaleString()}
        </span>
      </div>
    </Link>
  );
};

export default TransInfoCard;