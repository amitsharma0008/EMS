import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
const [taskTitle, setTaskTitle] = useState("");
const [taskDesc, setTaskDesc] = useState("");
const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  const { data: logsData } = await supabase.from("loginLogs").select("*");
  const { data: usersData } = await supabase.from("users").select("*");
  const { data: timeData } = await supabase.from("timeEntries").select("*");
  const { data: projectsData } = await supabase.from("projects").select("*");

  const { data: reportsData } = await supabase
    .from("daily_reports")
    .select("*");

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*");

  setReports(reportsData || []);
  setTasks(tasksData || []);
  setLogs(logsData || []);
  setUsers(usersData || []);
  setTimeEntries(timeData || []);
  setProjects(projectsData || []);
};

  const getDate = (d) => new Date(d).toLocaleDateString();
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

  const groupedByDate = {};

  logs.forEach((log) => {
    const d = getDate(log.login);
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(log);
  });
  const handleSaveTask = async () => {
  if (!selectedUser || !taskTitle) {
    return alert("Fill all fields");
  }

  const today = new Date().toISOString().split("T")[0];

  if (editingTask) {
    // ✏️ UPDATE
    await supabase
      .from("tasks")
      .update({
        title: taskTitle,
        description: taskDesc,
        assigned_to: selectedUser,
      })
      .eq("id", editingTask.id);

    alert("Task Updated ✅");
  } else {
    // ➕ CREATE
    await supabase.from("tasks").insert([
      {
        title: taskTitle,
        description: taskDesc,
        assigned_to: selectedUser,
        status: "pending",
        task_date: today,
      },
    ]);

    alert("Task Assigned ✅");
  }

  // reset
  setTaskTitle("");
  setTaskDesc("");
  setSelectedUser("");
  setEditingTask(null);

  fetchData();
};
const handleDeleteTask = async (id) => {
  const confirm = window.confirm("Delete this task?");
  if (!confirm) return;

  await supabase.from("tasks").delete().eq("id", id);

  alert("Task Deleted ❌");
  fetchData();
};
const handleEditTask = (task) => {
  setEditingTask(task);
  setTaskTitle(task.title);
  setTaskDesc(task.description);
  setSelectedUser(task.assigned_to);
};

  return (
    
    <div className="admin-dashboard-adm">
      <h1 className="dashboard-title-adm">Admin Control Center</h1>
<div className="task-create-box-adm">
  <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>

  <select
    value={selectedUser}
    onChange={(e) => setSelectedUser(e.target.value)}
  >
    <option value="">Select User</option>
    {users
      .filter((u) => u.role !== "admin")
      .map((u) => (
        <option key={u.id} value={u.email}>
          {u.name}
        </option>
      ))}
  </select>

  <input
    placeholder="Task Title"
    value={taskTitle}
    onChange={(e) => setTaskTitle(e.target.value)}
  />

  <textarea
    placeholder="Task Description"
    value={taskDesc}
    onChange={(e) => setTaskDesc(e.target.value)}
  />

  <button onClick={handleSaveTask}>
    {editingTask ? "Update Task" : "Assign Task"}
  </button>
</div>
<h2>All Tasks</h2>

{tasks.map((t) => (
  <div key={t.id} className="task-card-adm">
    <h3>{t.title}</h3>
    <p>{t.description}</p>
    <p><b>User:</b> {t.assigned_to}</p>
    <p>Status: {t.status}</p>

    <button onClick={() => handleEditTask(t)}>
      Edit
    </button>

    <button onClick={() => handleDeleteTask(t.id)}>
      Delete
    </button>
  </div>
))}
      <div className="stats-grid-adm">
        <div className="stat-card-adm">
          <h2>{users.length}</h2>
          <p>Total Users</p>
        </div>
        <div className="stat-card-adm">
          <h2>{projects.length}</h2>
          <p>Total Projects</p>
        </div>
        <div className="stat-card-adm">
          <h2>{timeEntries.length}</h2>
          <p>Total Work Logs</p>
        </div>
        <div className="stat-card-adm">
          <h2>{logs.length}</h2>
          <p>Total Login Logs</p>
        </div>
      </div>

      <div className="search-bar-adm">
        <input
          type="text"
          placeholder="Search by user name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {Object.keys(groupedByDate)
        .sort((a, b) => new Date(b) - new Date(a))
        .map((date, idx) => (
          <div key={idx} className="date-section-adm">
            <h2 className="date-title-adm">{date}</h2>

            <table className="table-adm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Project Details</th>
                  <th>Total Hours</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedByDate[date]
                  .filter((log) => {
                    const user = users.find((u) => u.email === log.email);
                    return user?.name
                      ?.toLowerCase()
                      .includes(search.toLowerCase());
                  })
                  .map((log, i2) => {
                    const user = users.find((u) => u.email === log.email);

                    const entries = timeEntries.filter(
                      (t) =>
                        t.useremail === log.email &&
                        t.date &&
                        getDate(t.date) === date,
                    );

                    const projectMap = {};

                    entries.forEach((e) => {
                      const p = projects.find(
                        (pr) => pr.id == e.projectid,
                      )?.title;

                      if (!projectMap[p]) projectMap[p] = 0;
                      projectMap[p] += Number(e.hours);
                    });

                    const detail = Object.entries(projectMap)
                      .map(([p, h]) => `${p} (${h}h)`)
                      .join(", ");

                    const total = Object.values(projectMap).reduce(
                      (a, b) => a + b,
                      0,
                    );

                    return (
                      <tr key={i2}>
                        <td>{user?.name}</td>
                        <td>{log.email}</td>
                        <td>{formatDateTime(log.login)}</td>
<td>{formatDateTime(log.logout)}</td>
                        <td>{detail}</td>
                        <td>{total} hrs</td>
                        <td>
                          <button
                            onClick={() =>
                              setModalData({
                                email: log.email,
                                date,
                                detail,
                                total,
                              })
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ))}
        {modalData && (
  <div className="report-modal-adm">
    <div className="report-content-adm">
      <h2>User Work Details ({modalData.date})</h2>

      {/* REPORT */}
      <h3>Daily Report</h3>
      <p>
        {
          reports.find(
            (r) =>
              r.useremail === modalData.email &&
              getDate(r.report_date) === modalData.date
          )?.report_text || "No report submitted"
        }
      </p>

      {/* TASKS */}
      <h3>Tasks</h3>
      <ul>
        {tasks
          .filter(
            (t) =>
              t.assigned_to === modalData.email &&
              getDate(t.task_date) === modalData.date
          )
          .map((t, i) => (
            <li key={i}>
              {t.title} — <b>{t.status}</b>
            </li>
          ))}
      </ul>

      {/* PROJECT WORK */}
      <h3>Project Work</h3>
      <p>{modalData.detail}</p>
      <p><b>Total Hours: {modalData.total} hrs</b></p>

      <button onClick={() => setModalData(null)}>Close</button>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminDashboard;
