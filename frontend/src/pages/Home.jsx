import Header from "@/parts/common/Header"
import Sidebar from "@/parts/common/Sidebar"
import { Outlet } from "react-router-dom"

function Home() {

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-auto relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 opacity-90" />
        <div className="absolute inset-0" />
      </div>

      <Sidebar />
      <div className="flex-grow p-8 relative z-10 overflow-auto h-screen">
        <div className="min-h-full p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Home