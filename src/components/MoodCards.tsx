function MoodCards() {
  const moods = [
    ["🧠", "Overstimulated"],
    ["🌙", "Calm"],
    ["⚡", "Focused"],
    ["💤", "Tired"],
  ];

  return (
    <section
      style={{
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "15px",
      }}
    >
      {moods.map(([icon, label]) => (
        <div
          key={label}
          style={{
            background: "rgba(255,255,255,0.06)",
            padding: "20px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "24px" }}>{icon}</div>
          <div>{label}</div>
        </div>
      ))}
    </section>
  );
}

export default MoodCards;