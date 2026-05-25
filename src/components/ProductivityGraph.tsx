import { useEffect, useState } from "react";

function ProductivityGraph() {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("focus_history");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <h3>📈 Productivity Graph</h3>
        <p style={{ opacity: 0.6 }}>No data yet — start focusing</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <h3>📈 Productivity Graph</h3>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
        {data.slice(-10).map((value, i) => (
          <div
            key={i}
            style={{
              width: "20px",
              height: `${value * 10}px`,
              background: "linear-gradient(180deg, #7df9ff, #b56dff)",
              borderRadius: "6px",
            }}
          />
        ))}
      </div>

      <p style={{ opacity: 0.6, marginTop: "10px" }}>
        Last {data.length} focus sessions
      </p>
    </div>
  );
}

export default ProductivityGraph;