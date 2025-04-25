import React, { useContext, useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import AuthContext from '@/context/AuthContext';
import { Toaster } from 'sonner';

function Login() {
  let { loginUser, loading } = useContext(AuthContext)
  const location = useLocation(); 

  const [prefillEmail, setPrefillEmail] = useState("");
  const [prefillPassword, setPrefillPassword] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setPrefillEmail(location.state.email);
    }
    if (location.state?.password) {
      setPrefillPassword(location.state.password);
    }
  }, [location.state]);
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
       
    <motion.div
      className="bg-gray-800 p-8 rounded-2xl shadow-xl w-96 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
      
      <form onSubmit={loginUser}>
        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={prefillEmail}
            className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400">Password</label>
          <input
            type="password"
            name="password"
            defaultValue={prefillPassword}
            className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          {loading ? (
            <motion.div
              className="flex justify-center items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="loader animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span>
              Logging in...
            </motion.div>
          ) : (
            "Login"
          )}
        </button>
        
      </form>

      <p className="text-center text-gray-400 mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-indigo-400 hover:underline">
          Sign up
        </Link>
      </p>
    </motion.div>
  </div>
  )
}

export default Login