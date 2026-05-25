function Features() {
  const items = [
    ["🧠", "Focus-friendly tools"],
    ["💜", "ADHD support resources"],
    ["🌙", "Low-stimulation design"],
    ["⚡", "Dopamine-friendly productivity"],
  ];

  return (
    <section style={{ maxWidth: "700px", width: "100%" }}>
      <h2>What You'll Find Here</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {items.map(([icon, text]) => (
          <div
            key={text}
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "20px",
              borderRadius: "16px",
            }}
          >
            <div style={{ fontSize: "24px" }}>{icon}</div>
            <div>{text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;