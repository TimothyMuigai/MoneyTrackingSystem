import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

function PrivateRoutes() {
    let { authTokens } = useContext(AuthContext);
    

    return (
        authTokens ? <Outlet/> : <Navigate to="/login"/>
    )
}

export default PrivateRoutes;