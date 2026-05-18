import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Projects.css";
import Sidebar from "../components/Sidebar";

function Projects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [title, setTitle] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  // 🔹 Admin fetch (all data)
  const fetchData = async () => {
    const { data: p } = await supabase.from("projects").select("*");

    const { data: u } = await supabase
      .from("users")
      .select("*")
      .eq("role", "user");

    setProjects(p || []);
    setUsers(u || []);
  };

  // 🔹 User fetch (only assigned projects)
  const fetchUserProjects = async (email) => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("assigneduser", email);

    setProjects(data || []);
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserEmail(user.email);

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single();

    if (data?.role === "admin") {
      setIsAdmin(true);
      await fetchData();
    } else {
      setIsUser(true);
      await fetchUserProjects(user.email);
    }

    setLoading(false);
  };

  const openAdd = () => {
    setEditProject(null);
    setTitle("");
    setSelectedUser("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setTitle(p.title);
    setSelectedUser(p.assigneduser);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title || !selectedUser) return alert("Fill all fields");

    if (editProject) {
      await supabase
        .from("projects")
        .update({ title, assigneduser: selectedUser })
        .eq("id", editProject.id);
    } else {
      await supabase.from("projects").insert([
        { title, assigneduser: selectedUser },
      ]);
    }

    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    fetchData();
  };

  // ✅ Loader UI
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="proj-container-prj">
      <Sidebar />

      <div className="proj-content-prj">
        <div className="proj-header-prj">
          <h2>{isAdmin ? "Project Management" : "My Projects"}</h2>

          {isAdmin && (
            <button className="add-btn-prj" onClick={openAdd}>
              + Add Project
            </button>
          )}
        </div>

        <table className="proj-table-prj">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Assigned User</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {projects.length > 0 ? (
              projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.assigneduser}</td>

                  {isAdmin && (
                    <td>
                      <button
                        className="edit-prj"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-prj"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 3 : 2} style={{ textAlign: "center" }}>
                  No Projects Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Modal only for Admin */}
      {showModal && isAdmin && (
        <div className="modal-prj">
          <div className="modal-card-prj">
            <h3>{editProject ? "Edit Project" : "Add Project"}</h3>

            <input
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>

              {users.map((u) => (
                <option key={u.id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <div className="modal-actions-prj">
              <button onClick={handleSave}>Save</button>

              <button
                className="cancel-prj"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;