// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import IncomeContext from "@/context/IncomeContext";
import React, { useContext, useEffect, useMemo, useState } from "react";
import AddIncome from "./AddIncome";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  Pencil,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import TableSkeleton from "../common/TableSkeleton";
import { createPortal } from "react-dom";
import ConfirmDelete from "../common/DeleteModal";
import { toast } from "sonner";
import CurrencyContext from "@/context/CurrencyContext";

function DisplayIncome({ refreshData }) {
  const {
    getIncomes,
    loading,
    err,
    getIncomeCategories,
    editIncome,
    deleteIncome,
  } = useContext(IncomeContext);
  const { exchangeRates, toCurrency } = useContext(CurrencyContext);

  const currencyAmount = exchangeRates[toCurrency] || 1;
  const currency = toCurrency;

  const [incomeData, setData] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [updateCategory, setUpdate] = useState("");
  const [updateAmount, setUpdateAmount] = useState("");
  const [isEdit, setEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getIncomes();
      setData(data || []);
      refreshData()
    } catch (error) {
      console.error("Failed to fetch income data", error);
      setData([]);
    }
  };

  const [originalCategory, setOriginalCategory] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");

  const handleEdit = async (e) => {
    e.preventDefault();
    if (
      updateAmount === originalAmount &&
      updateCategory === originalCategory
    ) {
      toast.info("No update has been done");
    } else {
      await editIncome({
        id: selectedIncomeId,
        income_category: updateCategory,
        amount_received: updateAmount,
      });
      toast.success("Income detail editted successfully");
      setEdit(false);
      fetchData();
    }
  };

  const fetchCategories = async () => {
    const data = await getIncomeCategories();
    setCategories(data);
  };

  const openEditModal = (user) => {
    setEdit(true);
    setSelectedIncomeId(user.id);
    setUpdate(user.income_category);
    setUpdateAmount(user.amount_received);
    setOriginalCategory(user.income_category);
    setOriginalAmount(user.amount_received);
  };

  const handleDelete = async (id) => {
    await deleteIncome(id);
    toast.warning("Income detail has been deleted");
    setConfirmDelete(false);
    fetchData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortBy(null);
        setSortOrder("asc");
      }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field)
      return <ArrowUpDown size={16} className="text-gray-400 inline" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} className="text-blue-400 inline" />
    ) : (
      <ArrowDown size={16} className="text-blue-400 inline" />
    );
  };

  const displayedUsers = useMemo(() => {
    let sortedData = [...incomeData];

    sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (sortBy) {
      sortedData.sort((a, b) => {
        if (sortBy === "income") {
          return sortOrder === "asc"
            ? parseFloat(a.amount_received) - parseFloat(b.amount_received)
            : parseFloat(b.amount_received) - parseFloat(a.amount_received);
        } else if (sortBy === "date") {
          return sortOrder === "asc"
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });
    }

    const filteredData = sortedData.filter((user) => {
      const formattedDate = new Date(user.updated_at)
        .toDateString()
        .toLowerCase();
      return (
        user.income_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formattedDate.includes(searchTerm.toLowerCase())
      );
    });

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [searchTerm, sortBy, sortOrder, currentPage, incomeData]);

  const totalPages = Math.ceil(
    incomeData?.filter(
      (user) =>
        user.amount_received.toLowerCase().includes(searchTerm) ||
        user.income_category.toLowerCase().includes(searchTerm)
    ).length / recordsPerPage
  );

  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2 sm:mb-0">
            Income Table
          </h2>
          <AddIncome refreshData={fetchData} />
        </div>

        <div className="relative mb-4 w-full">
          <input
            type="text"
            placeholder="Search expenses..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="text-center text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">
                <th></th>
                <th className="px-4 sm:px-6 py-3">Category</th>
                <th
                  className="px-4 sm:px-6 py-3"
                  onClick={() => handleSort("income")}
                >
                  Income {getSortIcon("income")}
                </th>

                <th
                  className="px-4 sm:px-6 py-3 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Date {getSortIcon("date")}
                  </div>
                </th>

                <th className="px-4 sm:px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <>
                  <TableSkeleton />
                  <TableSkeleton />
                </>
              ) : incomeData.length > 0 ? (
                displayedUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-700 flex items-center justify-center">
                        <Banknote />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                      {user.income_category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-green-400 font-bold flex gap-2">
                      {currency}.{" "}
                      {(user.amount_received * currencyAmount).toFixed(2)}{" "}
                      <TrendingUp />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                      {new Date(user.updated_at).toDateString()}
                    </td>
                    <td className="px-4 py-4 flex gap-3">
                      {/* Edit */}
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => openEditModal(user)}
                      >
                        <Pencil />
                      </button>

                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          setConfirmDelete(true), setSelectedIncomeId(user.id);
                        }}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-300">
                    {err
                      ? "Can not access your data. Check your connection and refresh the page."
                      : "No income entries yet..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {confirmDelete && (
          <ConfirmDelete
            isOpen={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() => handleDelete(selectedIncomeId)}
            info="income"
          />
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            } text-white`}
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages == 0}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages || totalPages == 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            } text-white`}
          >
            Next
          </button>
        </div>
      </motion.div>

      {isEdit &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-50 z-50">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-white relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                onClick={() => setEdit(false)}
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-center">
                Edit Income
              </h2>

              <form onSubmit={handleEdit}>
                <div className="mb-4">
                  <label className="block text-gray-400">Category</label>
                  <input
                    type="text"
                    list="income-categories"
                    placeholder="Select or enter a new category"
                    value={updateCategory}
                    onChange={(e) => setUpdate(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="income-categories">
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400">Income Amount</label>
                  <input
                    type="number"
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(e.target.value)}
                    className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-200"
                >
                  Edit
                </button>
              </form>
            </motion.div>
          </div>,
          document.body
        )}
    </>
  );
}

export default DisplayIncome;
