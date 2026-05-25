import { useEffect, useState } from "react";

function DailyDashboard() {
  const [thoughts, setThoughts] = useState(0);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();

    // 🧠 LOAD THOUGHTS
    const savedNotes = localStorage.getItem("brain_dump_notes");
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);

      const todayNotes = notes.filter((n: any) =>
        n.date ? n.date === today : true
      );

      setThoughts(todayNotes.length);
    }

    // ⏱ LOAD FOCUS SESSIONS
    const savedSessions = localStorage.getItem("focus_sessions");
    if (savedSessions) {
      setSessions(Number(savedSessions));
    }
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px",
      }}
    >
      <h2>📊 Daily Dashboard</h2>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>🧠 Thoughts</h3>
          <p style={{ fontSize: "24px" }}>{thoughts}</p>
        </div>

        <div>
          <h3>⏱ Focus Sessions</h3>
          <p style={{ fontSize: "24px" }}>{sessions}</p>
        </div>
      </div>

      <p style={{ opacity: 0.6 }}>
        Your daily activity overview
      </p>
    </div>
  );
}

export default DailyDashboard;