import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "../styles/TimeLog.css";

function TimeLog() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [hours, setHours] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [editId, setEditId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    setUserEmail(user.email);
    fetchData(user.email);
  };

  const fetchData = async (email) => {
    // ✅ Only projects assigned to this user
    const { data: allProjects, error: projectError } =
      await supabase.from("projects").select("*");

    if (projectError) {
      console.log("Project Fetch Error:", projectError);
      return;
    }

    const userProjects = (allProjects || []).filter((p) =>
      p?.assigneduser?.includes(email)
    );

    setProjects(userProjects);

    // ✅ Only this user's entries
    const { data: storedEntries, error: entryError } = await supabase
      .from("timeEntries")
      .select("*")
      .eq("useremail", email);

    if (entryError) {
      console.log("Entry Fetch Error:", entryError);
      return;
    }

    setEntries(storedEntries || []);
  };

  const addOrUpdate = async () => {
    if (!selectedProject || !hours) {
      return alert("Fill all fields");
    }

    if (editId) {
      const { error } = await supabase
        .from("timeEntries")
        .update({
          hours: Number(hours),
        })
        .eq("id", editId);

      if (error) return console.log(error);

      const updated = entries.map((e) =>
        e.id === editId ? { ...e, hours: Number(hours) } : e
      );

      setEntries(updated);
      setEditId(null);
    } else {
      const { data, error } = await supabase
        .from("timeEntries")
        .insert([
          {
            useremail: userEmail,
            projectid: selectedProject,
            hours: Number(hours),
            date: new Date().toISOString(),
          },
        ])
        .select();

      if (error) return console.log(error);

      if (data && data.length > 0) {
        setEntries([...entries, data[0]]);
      }
    }

    setHours("");
    setSelectedProject("");
  };

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setHours(entry.hours);
    setSelectedProject(entry.projectid);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("timeEntries")
      .delete()
      .eq("id", id);

    if (error) return console.log(error);

    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
  };

  return (
    <div className="time-log-container-tml">
      <h2>Time Log</h2>

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Enter Hours"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />

      <button className="main-btn-tml" onClick={addOrUpdate}>
        {editId ? "Update Entry" : "Add Entry"}
      </button>

      <h3>Your Entries</h3>

      <table className="entry-table-tml">
        <thead>
          <tr>
            <th>Project</th>
            <th>Hours</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>
                {projects.find((p) => p.id == e.projectid)?.title}
              </td>
              <td>{e.hours} hrs</td>
              <td>
                <button
                  className="edit-btn-tml"
                  onClick={() => handleEdit(e)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn-tml"
                  onClick={() => handleDelete(e.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimeLog;