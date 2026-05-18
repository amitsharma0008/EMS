import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/ForgotPassword.css";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset link sent to your email");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-box">

        <h2 className="forgot-title">Forgot Password 🔐</h2>

        <p className="forgot-subtitle">
          Enter your email to receive reset link
        </p>

        <input
          className="forgot-input"
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="forgot-btn"
          onClick={handleReset}
        >
          Send Reset Link
        </button>

        <p className="back-login" onClick={() => navigate("/")}>
  Back to Login
</p>

      </div>
    </div>
  );
}

export default ForgotPassword;