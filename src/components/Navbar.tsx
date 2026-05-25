import { Link } from "react-router-dom";

function Navbar() {
  const items = [
    { label: "Home", path: "/" },
    { label: "Resources", path: "/resources" },
    { label: "Tools", path: "/tools" },
    { label: "Community", path: "/community" },
  ];

  return (
    <nav
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "20px",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* BRAND */}
      <div style={{ fontWeight: "bold" }}>💙 Dopamine Digital</div>

      {/* LINKS */}
      <div style={{ display: "flex", gap: "20px" }}>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              color: "white",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;