import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./parts/authentication/Login"
import PrivateRoutes from "./Utils/PrivateRoutes"
import Registration from "./parts/authentication/Registration"
import Settings from "./pages/Settings"
import Expense from "./pages/Expense"
import Budget from "./pages/Budget"
import Income from "./pages/Income"
import Overview from "./pages/Overview"
import Subscriptions from "./pages/Subscriptions"
import BudgetDetail from "./parts/budget/BudgetDetail"
function App() {

  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path='/' element={<Home/>} >
          <Route index element={<Overview/>}/>
          <Route path="settings" element={<Settings />} />
          <Route path='expense' element={<Expense/>} />

          <Route path='subscription' element={<Subscriptions/>} />
          <Route path='budget' element={<Budget/>} />
          <Route path="budget/:id/" element={<BudgetDetail />} />
          <Route path='income' element={<Income/>} />
        </Route>
      </Route>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Registration/>} />
    </Routes>
  )
}

export default App
