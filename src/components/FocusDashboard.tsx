function FocusDashboard() {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: "20px",
        padding: "25px",
        backdropFilter: "blur(12px)",
        minHeight: "300px",
      }}
    >
      <h2>🎯 Focus Zone</h2>

      <p style={{ opacity: 0.8 }}>
        Your distraction-free workspace for deep work.
      </p>

      <textarea
        placeholder="What are you working on?"
        style={{
          width: "100%",
          height: "150px",
          marginTop: "15px",
          borderRadius: "12px",
          padding: "15px",
          border: "none",
          outline: "none",
          fontSize: "16px",
        }}
      />

      <button
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(90deg, #7df9ff, #b56dff)",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Start Focus Session
      </button>
    </section>
  );
}

export default FocusDashboard;