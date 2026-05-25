import Navbar from "../components/Navbar";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1d0b2e 0%, #090014 70%)",
        color: "#fff",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP NAV */}
      <div style={{ padding: "20px" }}>
        <Navbar />
      </div>

      {/* PAGE CONTENT */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AppShell;