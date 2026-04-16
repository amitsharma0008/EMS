import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    getUserAndData();
  }, []);

  const getUserAndData = async () => {
    // ✅ Get logged in user from Supabase Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser(user);

    // ✅ Fetch data only after user is available
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*");

    const { data: timeData } = await supabase
      .from("timeEntries")
      .select("*");

    setProjects(projectsData || []);
    setTimeEntries(timeData || []);
  };

  // ✅ Wait for auth
  if (!user) {
    return <h2 style={{ padding: 20 }}>Auth loading... wait 1 sec</h2>;
  }

  const userProjects = projects.filter((p) =>
    p.assigneduser.includes(user.email)
  );

  const totalHours = timeEntries
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
        logout: new Date(), // ✅ FIXED
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