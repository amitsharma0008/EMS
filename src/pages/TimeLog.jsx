import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "../styles/TimeLog.css";

function TimeLog() {
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  // ✅ Loader State
  const [loading, setLoading] = useState(true);

  // TIMER STATES
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    init();
    restoreTimer();
  }, []);

  // TIMER LOOP
  useEffect(() => {
    let interval;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, startTime]);

  // SAVE TIMER STATE
  useEffect(() => {
    localStorage.setItem(
      "timerState",
      JSON.stringify({
        isRunning,
        isPaused,
        startTime,
        elapsed,
        selectedProject,
      })
    );
  }, [isRunning, isPaused, startTime, elapsed, selectedProject]);

  const restoreTimer = () => {
    const saved = JSON.parse(localStorage.getItem("timerState") || "null");

    if (saved) {
      setIsRunning(saved.isRunning);
      setIsPaused(saved.isPaused);
      setStartTime(saved.startTime);
      setElapsed(saved.elapsed);
      setSelectedProject(saved.selectedProject);
    }
  };

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return alert("User not logged in");
    }

    setUserEmail(user.email);

    await fetchData(user.email);

    setLoading(false);
  };

  const fetchData = async (email) => {
    const { data: allProjects } = await supabase
      .from("projects")
      .select("*");

    const userProjects = (allProjects || []).filter((p) =>
      p?.assigneduser?.includes(email)
    );

    setProjects(userProjects);

    const { data: storedEntries } = await supabase
      .from("timeentries")
      .select("*")
      .eq("useremail", email);

    setEntries(storedEntries || []);
  };

  // FORMAT
  const formatHours = (hours) => {
    const totalSeconds = Math.floor(hours * 3600);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  // TIMER ACTIONS
  const startTimer = () => {
    if (!selectedProject) return alert("Select project first");

    setStartTime(Date.now());
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    setStartTime(Date.now() - elapsed);
  };

  const stopTimer = async () => {
    if (!userEmail || !selectedProject) {
      return alert("Missing data bhai");
    }

    setIsRunning(false);
    setIsPaused(false);

    const totalHours = elapsed / 3600000;

    console.log("Sending data:", {
      userEmail,
      selectedProject,
      totalHours,
    });

    const { data, error } = await supabase
      .from("timeentries")
      .insert([
        {
          useremail: userEmail,
          projectid: selectedProject,
          hours: totalHours,
          date: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.log("🔥 INSERT ERROR:", error);
      alert(error.message);
      return;
    }

    if (data) setEntries([...entries, data[0]]);

    setElapsed(0);
    setSelectedProject("");
    localStorage.removeItem("timerState");
  };

  const handleDelete = async (id) => {
    await supabase.from("timeentries").delete().eq("id", id);
    setEntries(entries.filter((e) => e.id !== id));
  };

  // TOTAL HOURS PER PROJECT
  const projectTotals = {};

  entries.forEach((e) => {
    projectTotals[e.projectid] =
      (projectTotals[e.projectid] || 0) + e.hours;
  });

  // ✅ Loader UI
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="time-log-container-tml">
      <h2>Time Log</h2>

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        disabled={isRunning}
      >
        <option value="">Select Project</option>

        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>

      {/* TIMER UI */}
      <div className={`timer-box-tml ${isRunning ? "timer-running" : ""}`}>
        <h3 className="timer-text-tml">{formatTime(elapsed)}</h3>

        {!isRunning ? (
          <button onClick={startTimer} className="main-btn-tml">
            Start
          </button>
        ) : isPaused ? (
          <>
            <button onClick={resumeTimer} className="main-btn-tml">
              Resume
            </button>

            <button onClick={stopTimer} className="main-btn-tml">
              Stop
            </button>
          </>
        ) : (
          <>
            <button onClick={pauseTimer} className="main-btn-tml">
              Pause
            </button>

            <button onClick={stopTimer} className="main-btn-tml">
              Stop
            </button>
          </>
        )}
      </div>

      {/* TOTAL SUMMARY */}
      <h3>Project Summary</h3>

      <table className="entry-table-tml">
        <thead>
          <tr>
            <th>Project</th>
            <th>Total Hours</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(projectTotals).map((pid) => (
            <tr key={pid}>
              <td>{projects.find((p) => p.id == pid)?.title}</td>
              <td>{formatHours(projectTotals[pid])}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
              <td>{projects.find((p) => p.id == e.projectid)?.title}</td>

              <td>{formatHours(e.hours)}</td>

              <td>
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