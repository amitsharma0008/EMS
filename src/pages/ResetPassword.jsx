import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";



function ResetPassword() {
  const [password, setPassword] = useState("");

  // 🔥 IMPORTANT: session set karna from URL
  useEffect(() => {
  const getSessionFromUrl = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error.message);
    }
  };

  getSessionFromUrl();
}, []);

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully");
      window.location.href = "/";
    }
  };

  return (
  <div className="rp-wrapper">
    <div className="rp-card">
      <h2 className="rp-title">Set New Password</h2>

      <input
        className="rp-input"
        type="password"
        placeholder="Enter new password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="rp-btn" onClick={handleUpdate}>
        Update Password
      </button>
    </div>
  </div>
);

export default ResetPassword;