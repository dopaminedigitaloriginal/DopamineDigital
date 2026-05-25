import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={isHome ? "app-layout home-layout" : "app-layout"}>
      {!isHome && <Sidebar />}
      <div className={isHome ? "page-content home-content" : "page-content"}>{children}</div>
    </div>
  );
}

export default Layout;
