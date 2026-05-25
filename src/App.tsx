import { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/Layout";
import CommandPalette from "./components/CommandPalette";
import FocusModeOverlay from "./components/FocusModeOverlay";
import BrainMascot from "./components/BrainMascot";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import Tools from "./pages/Tools";
import Community from "./pages/Community";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Journal from "./pages/Journal";
import Badges from "./pages/Badges";
import AnxietyToolkit, { ToolkitTool } from "./pages/AnxietyToolkit";
import { Privacy, Safety, Terms } from "./pages/Legal";
import { AUTH_CHANGED_EVENT, getMe, type ApiUser } from "./lib/api";

function AuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [checking, setChecking] = useState(true);
  const publicPaths = ["/", "/account", "/privacy", "/terms", "/safety"];
  const isPublicPage = publicPaths.includes(location.pathname);

  const checkAuth = () => {
    setChecking(true);
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, checkAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, checkAuth);
  }, []);

  if (checking) {
    return (
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital</p>
        <h1>Checking your account</h1>
        <p className="hero-copy">One tiny moment while we connect your app.</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="calm" />
      </section>
    );
  }

  if (!user && !isPublicPage) {
    return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function App() {
  return (
    <Layout>
      <AuthGate>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:toolId" element={<Tools />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/toolkit" element={<AnxietyToolkit />} />
          <Route path="/toolkit/:toolId" element={<ToolkitTool />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:communityId" element={<Community />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AuthGate>

      <CommandPalette />
      <FocusModeOverlay />
    </Layout>
  );
}

export default App;
