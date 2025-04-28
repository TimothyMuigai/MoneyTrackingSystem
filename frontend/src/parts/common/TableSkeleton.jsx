import React from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function TableSkeleton() {
  return (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <td className='px-6 py-4 whitespace-nowrap'>
            <div className='h-10 w-10 rounded-full bg-gray-700 animate-pulse'></div>
        </td>
=
        <td className='px-6 py-4 whitespace-nowrap'>
            <div className="h-4 w-32 bg-gray-700 rounded-md animate-pulse"></div>
        </td>

        <td className='px-4 py-4 whitespace-nowrap'>
            <div className="h-4 w-24 bg-gray-700 rounded-md animate-pulse"></div>
        </td>

        <td className='px-4 py-4 whitespace-nowrap'>
            <div className="h-4 w-28 bg-gray-700 rounded-md animate-pulse"></div>
        </td>

        <td className='px-4 py-4 flex gap-3'>
            <div className="h-6 w-6 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-700 rounded-md animate-pulse"></div>
        </td>
    </motion.tr>

  )
}

export default TableSkeleton