import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/LOGO.png";
import { getMe, type ApiUser } from "../lib/api";

function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    getMe().then((data) => setUser(data.user)).catch(() => setUser(null));
  }, [location.pathname]);

  const items = [
    { label: "Home", path: "/app" },
    { label: "Tools", path: "/tools" },
    { label: "Journal", path: "/journal" },
    { label: "Badges", path: "/badges" },
    { label: "Resources", path: "/resources" },
    { label: "Community", path: "/community" },
    { label: "Account", path: "/account" },
    ...(user?.role === "admin" ? [{ label: "Admin", path: "/admin" }] : []),
  ];

  return (
    <aside className="brand-sidebar">
      <Link className="sidebar-logo" to="/app">
        <img src={logo} alt="Dopamine Digital" />
      </Link>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link className={active ? "sidebar-link active" : "sidebar-link"} key={item.path} to={item.path}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-hint">
        <span>Ctrl K</span>
        <p>Quick command brain</p>
      </div>
    </aside>
  );
}

export default Sidebar;
