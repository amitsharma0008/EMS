import { useState } from "react";
import { supabase } from "../supabaseClient";

function ResetPassword() {
  const [password, setPassword] = useState("");

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully");
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