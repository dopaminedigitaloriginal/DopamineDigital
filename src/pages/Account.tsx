import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import { clearToken, getMe, loginUser, registerUser, type ApiUser } from "../lib/api";

const accountStyles = `
  .account-panel {
    display: grid;
    gap: 16px;
    margin-top: 18px;
    padding: clamp(18px, 3vw, 28px);
    border: 1px solid rgba(255, 205, 232, 0.28);
    border-radius: 26px;
    color: #111;
    background:
      radial-gradient(circle at 90% 12%, rgba(255, 255, 255, 0.3), transparent 26%),
      linear-gradient(145deg, rgba(255, 225, 239, 0.76), rgba(219, 214, 255, 0.66));
    box-shadow: 0 18px 42px rgba(31, 12, 54, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .account-form {
    display: grid;
    gap: 12px;
  }

  .account-form input {
    width: 100%;
    border: 1px solid rgba(255, 143, 199, 0.3);
    border-radius: 18px;
    padding: 12px 14px;
    color: #111;
    background: rgba(255, 255, 255, 0.55);
    font: inherit;
  }

  .account-toggle {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

export default function Account() {
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [name, setName] = useState("Dopamine member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMe().then((data) => setUser(data.user)).catch(() => setUser(null));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      const data = mode === "register"
        ? await registerUser({ name, email, password })
        : await loginUser({ email, password });
      setUser(data.user);
      setMessage("You are signed in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in");
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setMessage("Signed out.");
  };

  const fromPath = typeof location.state === "object" && location.state && "from" in location.state
    ? String(location.state.from)
    : "/app";

  return (
    <div className="brand-page">
      <style>{accountStyles}</style>
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital account</p>
        <h1>{user ? "Account" : "Login first"}</h1>
        <p className="hero-copy">Sign in before entering your Dopamine Digital dashboard, tools, journal, and community.</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="happy" />
      </section>

      <section className="account-panel">
        {user ? (
          <>
            <div>
              <p className="section-kicker">Signed in</p>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>Role: {user.role} | Membership: {user.membership}</p>
            </div>
            <div className="account-toggle">
              <Link className="primary-button" to={fromPath === "/account" ? "/app" : fromPath}>Go to dashboard</Link>
              <button className="secondary-button" onClick={logout} type="button">Sign out</button>
            </div>
          </>
        ) : (
          <>
            <div className="account-toggle">
              <button className={mode === "register" ? "primary-button" : "secondary-button"} onClick={() => setMode("register")} type="button">Register</button>
              <button className={mode === "login" ? "primary-button" : "secondary-button"} onClick={() => setMode("login")} type="button">Login</button>
            </div>
            <form className="account-form" onSubmit={submit}>
              {mode === "register" && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />}
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
              <button className="primary-button" type="submit">{mode === "register" ? "Create account" : "Login"}</button>
            </form>
          </>
        )}
        {message && <p>{message}</p>}
      </section>
    </div>
  );
}
