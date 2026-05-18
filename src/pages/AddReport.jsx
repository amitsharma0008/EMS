import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/AddReport.css";

function AddReport() {
  const [report, setReport] = useState("");

  // ✅ Button loading
  const [loading, setLoading] = useState(false);

  // ✅ Page loader
  const [pageLoading, setPageLoading] = useState(true);

  const [todayReportId, setTodayReportId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPageLoading(false);
      return;
    }

    setUserEmail(user.email);

    await fetchTodayReport(user.email);

    setPageLoading(false);
  };

  const fetchTodayReport = async (email) => {
    const { data } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("useremail", email)
      .eq("report_date", today)
      .maybeSingle();

    if (data) {
      setReport(data.report_text);
      setTodayReportId(data.id);
    }
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      alert("User not logged in");
      return;
    }

    setLoading(true);

    if (todayReportId) {
      await supabase
        .from("daily_reports")
        .update({ report_text: report })
        .eq("id", todayReportId);

      alert("Report updated");
    } else {
      await supabase.from("daily_reports").insert([
        {
          useremail: userEmail,
          report_date: today,
          report_text: report,
        },
      ]);

      alert("Report submitted");
    }

    setLoading(false);
  };

  // ✅ Premium Loader
  if (pageLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="report-container-rpt" style={{ padding: "30px" }}>
      <h2 className="report-title-rpt">
        Daily Work Report ({today})
      </h2>

      <textarea
        className="report-textarea-rpt"
        rows="8"
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        placeholder="Aaj aapne kya kaam kiya? Detail me likho..."
        value={report}
        onChange={(e) => setReport(e.target.value)}
      />

      <br />
      <br />

      <button
        className="report-btn-rpt"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Submit Report"}
      </button>
    </div>
  );
}

export default AddReport;