import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const publicPaths = ["/", "/privacy", "/terms", "/safety"];
  const isPublic = publicPaths.includes(location.pathname);

  return (
    <div className={isPublic ? "app-layout home-layout" : "app-layout"}>
      {!isPublic && <Sidebar />}
      <div className={isPublic ? "page-content home-content" : "page-content"}>{children}</div>
    </div>
  );
}

export default Layout;
