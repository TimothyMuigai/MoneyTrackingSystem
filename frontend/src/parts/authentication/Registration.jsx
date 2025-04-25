import React, { useContext, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AuthContext from '@/context/AuthContext';
import { toast, Toaster } from 'sonner';

function Registration() {
    const { registerUser,loading } = useContext(AuthContext)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")

    const validatePassword = (password) => {

      if (password !== password2) {
        toast.error("Passwords don't match");
        return false;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return false;
      }
    
      if (!/[!@#$%^&*]/.test(password)) {
        toast.error("Password must contain at least one special character (!@#$%^&*).");
        return false;
      }
    
      if (!/\d/.test(password)) {
        toast.error("Password must contain at least one number.");
        return false;
      }
    
      if (!/[a-z]/.test(password)) {
        toast.error("Password must contain at least one lowercase letter.");
        return false;
      }
    
      if (!/[A-Z]/.test(password)) {
        toast.error("Password must contain at least one uppercase letter.");
        return false;
      }
    
      return true;
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();  
    
      if (!validatePassword(password)) {
        return;
      }
    
      registerUser(email, password);
    };
    
    
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <motion.div
        className="bg-gray-800 p-8 rounded-2xl shadow-xl w-96 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder='Enter Email'
              onChange={e => setEmail(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder='Enter Password'
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password2"
              placeholder='Confirm Password'
              onChange={e => setPassword2(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            { loading ? 
              (
                <motion.div
                  className="flex justify-center items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="loader animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span>
                  Signing in...
                </motion.div>
              ):(
                "Sign Up"
              )
            }
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Registration