import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/MyTasks.css";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", user.email)
      .eq("task_date", today)
      .order("created_at", { ascending: false });

    setTasks(data || []);
    setLoading(false);
  };

  const markDone = async (id) => {
    await supabase
      .from("tasks")
      .update({ status: "done" })
      .eq("id", id);

    fetchTasks();
  };

  if (loading)
    return (
      <p className="tasks-loading-tsk" style={{ padding: "20px" }}>
        Loading tasks...
      </p>
    );

  return (
    <div className="tasks-container-tsk" style={{ padding: "30px" }}>
      <h2 className="tasks-title-tsk">
        My Tasks for {today}
      </h2>

      {tasks.length === 0 && (
        <p className="no-tasks-tsk">
          No tasks assigned today 🎉
        </p>
      )}

      {tasks.map((task) => (
        <div
          className="task-card-tsk"
          key={task.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3 className="task-title-tsk">{task.title}</h3>

          <p className="task-desc-tsk">{task.description}</p>

          <p className="task-status-tsk">
            Status: <b>{task.status}</b>
          </p>

          {task.status === "pending" && (
            <button
              className="task-btn-tsk"
              onClick={() => markDone(task.id)}
            >
              Mark as Done
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyTasks;