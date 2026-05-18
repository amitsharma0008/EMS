import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeentries, setTimeentries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAndData();
  }, []);

  const getUserAndData = async () => {
    // ✅ Get logged in user from Supabase Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);

    // ✅ Fetch data only after user is available
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*");

    const { data: timeData } = await supabase
      .from("timeentries")
      .select("*");

    setProjects(projectsData || []);
    setTimeentries(timeData || []);

    setLoading(false);
  };

  // ✅ Loader
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  const userProjects = projects.filter((p) =>
    p.assigneduser.includes(user.email)
  );

  const totalHours = timeentries
    .filter((t) => t.useremail === user.email)
    .reduce((acc, curr) => acc + Number(curr.hours), 0);

  const handleLogout = async () => {
    const { data: logs } = await supabase
      .from("loginLogs")
      .select("*")
      .eq("email", user.email)
      .is("logout", null)
      .order("id", {
        ascending: false,
      });

    if (logs && logs.length > 0) {
      await supabase
        .from("loginLogs")
        .update({
          logout: new Date(),
        })
        .eq("id", logs[0].id);
    }

    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="dashboard-dsb">
      <Sidebar />

      <div className="content-dsb">
        <button
          onClick={handleLogout}
          className="logout-btn-dsb"
        >
          Logout 🚪
        </button>

        <h1>Welcome, {user?.email} 👋</h1>

        <div className="cards-dsb">
          <div className="card-dsb blue-dsb">
            <h3>{userProjects.length}</h3>
            <p>Total Projects</p>
          </div>

          <div className="card-dsb green-dsb">
            <h3>{totalHours} hrs</h3>
            <p>Total Work Time</p>
          </div>

          <div className="card-dsb purple-dsb">
            <h3>{userProjects.length * 10}%</h3>
            <p>Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;