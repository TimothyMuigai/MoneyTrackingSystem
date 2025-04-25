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
      className="flex items-center gap-4 p-4 bg-gray-500 rounded-xl hover:bg-gray-400 transition-all"
    >
      <div className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full">
        {type === 'income' ? (
          <TrendingUp size={20} className="text-green-500" />
        ) : (
          <TrendingDown size={20} className="text-red-600" />
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-800">{date}</p>
      </div>

      <div className={`flex items-center px-3 py-1 rounded-lg ${getAmountStyles()}`}>
        <span className="text-sm font-semibold">
          {type === 'income' ? '+' : '-'} Ksh. {parseFloat(amount).toLocaleString()}
        </span>
      </div>
    </Link>
  );
};

export default TransInfoCard;