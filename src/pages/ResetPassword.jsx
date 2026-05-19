import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";


function ResetPassword() {
  const [password, setPassword] = useState("");

  // 🔥 IMPORTANT: session set karna from URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      supabase.auth.getSession();
    }
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
    <div>
      <h2>Set New Password</h2>

      <input
        type="password"
        placeholder="Enter new password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleUpdate}>
        Update Password
      </button>
    </div>
  );
}

export default ResetPassword;