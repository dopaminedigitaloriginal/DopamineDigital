import { Link } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import logo from "../assets/LOGO.png";

const landingStyles = `
  .launch-page {
    min-height: 100%;
    display: grid;
    gap: 18px;
    color: #111;
  }

  .launch-hero {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
    align-items: center;
    gap: clamp(18px, 4vw, 42px);
    padding: clamp(22px, 5vw, 52px);
    border: 1px solid rgba(255, 180, 216, 0.42);
    border-radius: 32px;
    background:
      radial-gradient(circle at 18% 16%, rgba(255, 204, 225, 0.76), transparent 28%),
      radial-gradient(circle at 86% 22%, rgba(205, 211, 255, 0.68), transparent 30%),
      linear-gradient(145deg, rgba(255, 238, 244, 0.94), rgba(232, 222, 255, 0.88));
    box-shadow: 0 22px 58px rgba(65, 29, 89, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .launch-logo {
    width: min(230px, 74vw);
    height: auto;
    object-fit: contain;
    margin-bottom: 12px;
  }

  .launch-hero h1 {
    max-width: 720px;
    margin: 0;
    font-family: "Fredoka", "Nunito", sans-serif;
    font-size: clamp(2.1rem, 6vw, 4.4rem);
    line-height: 0.94;
    letter-spacing: 0;
  }

  .launch-hero p {
    max-width: 620px;
    margin: 12px 0 0;
    font-size: clamp(1rem, 2vw, 1.14rem);
    line-height: 1.55;
  }

  .launch-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .launch-mascot-wrap {
    display: grid;
    justify-items: center;
    gap: 12px;
  }

  .launch-mascot-card {
    width: min(100%, 320px);
    display: grid;
    justify-items: center;
    gap: 10px;
    padding: 18px;
    border: 1px solid rgba(255, 143, 199, 0.34);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.38);
    box-shadow: 0 18px 34px rgba(67, 27, 91, 0.14);
  }

  .launch-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .launch-card {
    min-height: 168px;
    padding: 18px;
    border: 1px solid rgba(255, 170, 210, 0.42);
    border-radius: 26px;
    color: #111;
    background:
      radial-gradient(circle at 88% 18%, rgba(255, 198, 225, 0.64), transparent 30%),
      linear-gradient(145deg, rgba(255, 245, 249, 0.72), rgba(228, 223, 255, 0.7));
    box-shadow: 0 16px 34px rgba(54, 24, 80, 0.13);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .launch-card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(255, 116, 189, 0.65);
    box-shadow: 0 20px 42px rgba(54, 24, 80, 0.17), 0 0 22px rgba(255, 143, 199, 0.24);
  }

  .launch-card-icon {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    margin-bottom: 12px;
    border-radius: 18px;
    font-size: 1.55rem;
    background: rgba(255, 255, 255, 0.62);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 20px rgba(65, 29, 89, 0.12);
  }

  .launch-card h2 {
    margin: 0 0 6px;
    font-size: 1.06rem;
    font-family: "Fredoka", "Nunito", sans-serif;
  }

  .launch-card p {
    margin: 0;
    line-height: 1.45;
  }

  .launch-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 10px 0 4px;
  }

  .launch-links a {
    color: #111;
    font-weight: 800;
    text-decoration: none;
  }

  @media (max-width: 920px) {
    .launch-hero,
    .launch-grid {
      grid-template-columns: 1fr;
    }

    .launch-hero {
      padding: 22px;
    }
  }
`;

export default function Landing() {
  return (
    <main className="brand-page launch-page">
      <style>{landingStyles}</style>
      <section className="launch-hero">
        <div>
          <img className="launch-logo" src={logo} alt="Dopamine Digital" />
          <p className="section-kicker">ADHD-friendly operating system</p>
          <h1>Your calm, cute second brain for messy brain days.</h1>
          <p>
            Dopamine Digital brings focus tools, brain dumps, mood check-ins, anxiety support,
            RSD reframes, and gentle community spaces into one soft place.
          </p>
          <div className="launch-actions">
            <Link className="primary-button" to="/account">Create account</Link>
            <Link className="secondary-button" to="/account">Login</Link>
            <Link className="secondary-button" to="/app">Enter app</Link>
          </div>
        </div>

        <div className="launch-mascot-wrap">
          <div className="launch-mascot-card">
            <BrainMascot size="lg" mood="happy" />
            <strong>Built for low-overwhelm support</strong>
            <span>Soft structure, tiny wins, and tools that meet you where you are.</span>
          </div>
        </div>
      </section>

      <section className="launch-grid" aria-label="Dopamine Digital features">
        <article className="launch-card">
          <div className="launch-card-icon">⚡</div>
          <h2>Focus tools</h2>
          <p>Pomodoro sessions, focus overlays, and quick resets when your attention drifts.</p>
        </article>
        <article className="launch-card">
          <div className="launch-card-icon">🧠</div>
          <h2>Brain dump</h2>
          <p>Capture thoughts fast, tag the chaos, and turn mental noise into something lighter.</p>
        </article>
        <article className="launch-card">
          <div className="launch-card-icon">💗</div>
          <h2>Emotional support</h2>
          <p>Breathing, grounding, anxiety scripts, mood logs, and RSD-friendly reframes.</p>
        </article>
        <article className="launch-card">
          <div className="launch-card-icon">✨</div>
          <h2>Community</h2>
          <p>Gentle support threads, tiny wins, body doubling, and safer connection spaces.</p>
        </article>
      </section>

      <nav className="launch-links" aria-label="Launch links">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/safety">Community safety</Link>
      </nav>
    </main>
  );
}
