import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  let [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  

  let [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  let registerUser = async (email, password) => {
    setLoading(true)
    try{
      let response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {    
        navigate("/login", { state: { email, password } });
        toast.success("Registration was successful Login now")    
      } else if (response.status === 400) {
        toast.error("Email is already taken.");
      } else {
        toast.error(`Something went wrong: ${response.status}`);
      }
    }catch (error) {
      console.log(error);
      toast.error("Network error. Please try again.");
    }finally{
      setLoading(false)
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    try{
      let response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        localStorage.setItem("authTokens", JSON.stringify(data));
        toast.success("Login successful. Welcome!");
        navigate("/", { replace: true });

      }else if(response.status === 401){
        toast.error("Incorrect email or password.");

      }else if(response.status===404){
        toast.error("User does not exist. Please register first.");

      }else{
        toast.error("Something went wrong. Please try again.", {
          action: {
            label: "Try Again",
            onClick: () => window.location.reload(),
          },
        });
      }
    }catch(error){
      console.log(error);
      toast.error("Network error. Please check your connection.", {
        action: {
          label: "Try Again",
          onClick: () => window.location.reload(), 
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    localStorage.removeItem("authTokens");
    navigate("/login");
  };

  const contextData = {
    authTokens,
    loading,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser,
  };


  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
