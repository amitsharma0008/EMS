import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";

function Layout() {
  const location = useLocation();

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;