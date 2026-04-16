import "../styles/LoginInfo.css";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function LoginInfo() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserAndLogs();
  }, []);
  const formatDateTime = (d) => {
  return d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Active";
};

  const getUserAndLogs = async () => {
    // ✅ Get user from Supabase Auth
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser(user);

    const { data } = await supabase
      .from("loginLogs")
      .select("*")
      .eq("email", user.email)
      .order("id", { ascending: false });

    setLogs(data || []);
  };

  if (!user) {
    return <h2 style={{ padding: 20 }}>Auth loading... wait 1 sec</h2>;
  }

  return (
    <div className="login-info-container-lgi">
      <h2>Login History</h2>

      {logs.map((log, i) => (
        <div className="login-card-lgi" key={i}>
          <p>
            <strong>Login:</strong> {formatDateTime(log.login)}
          </p>

          <p>
            <strong>Logout:</strong> {formatDateTime(log.logout)|| "Active"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default LoginInfo;