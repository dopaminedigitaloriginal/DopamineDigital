import { Link } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";

const legalStyles = `
  .legal-panel {
    display: grid;
    gap: 14px;
    padding: clamp(18px, 3vw, 30px);
    border: 1px solid rgba(255, 170, 210, 0.42);
    border-radius: 28px;
    color: #111;
    background:
      radial-gradient(circle at 88% 10%, rgba(255, 204, 225, 0.68), transparent 28%),
      linear-gradient(145deg, rgba(255, 243, 248, 0.78), rgba(226, 222, 255, 0.72));
    box-shadow: 0 18px 40px rgba(54, 24, 80, 0.13);
  }

  .legal-panel h2 {
    margin: 0;
    font-family: "Fredoka", "Nunito", sans-serif;
    font-size: clamp(1.25rem, 3vw, 2rem);
  }

  .legal-panel p,
  .legal-panel li {
    line-height: 1.55;
  }

  .legal-panel ul {
    margin: 0;
    padding-left: 20px;
  }

  .legal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

type LegalPageProps = {
  title: string;
  subtitle: string;
  points: string[];
};

function LegalPage({ title, subtitle, points }: LegalPageProps) {
  return (
    <div className="brand-page">
      <style>{legalStyles}</style>
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital</p>
        <h1>{title}</h1>
        <p className="hero-copy">{subtitle}</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="calm" />
      </section>

      <section className="legal-panel">
        <h2>{title}</h2>
        <ul>
          {points.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <p>
          Dopamine Digital is a wellbeing and productivity support app. It is not medical,
          legal, crisis, or emergency support.
        </p>
        <div className="legal-actions">
          <Link className="primary-button" to="/account">Create account</Link>
          <Link className="secondary-button" to="/">Back to welcome</Link>
        </div>
      </section>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      subtitle="A simple overview of how Dopamine Digital handles your app data."
      points={[
        "Your account is powered by Supabase authentication.",
        "Community posts, replies, reports, and profile details may be stored so the app can work across devices.",
        "Personal wellbeing data should be treated as sensitive. Only collect what you genuinely need for the experience.",
        "Before a bigger public launch, add a full privacy policy written for your exact business, region, and data use.",
      ]}
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms"
      subtitle="The starter rules for using Dopamine Digital kindly and safely."
      points={[
        "Use the app for supportive productivity, journaling, emotional regulation, and community connection.",
        "Do not post abusive, hateful, harassing, sexual, illegal, or unsafe content.",
        "Community features can be moderated, limited, or removed if they put people at risk.",
        "Before charging users or scaling publicly, replace this starter page with proper terms for your business.",
      ]}
    />
  );
}

export function Safety() {
  return (
    <LegalPage
      title="Community safety"
      subtitle="Gentle spaces still need clear boundaries."
      points={[
        "Use report and moderation tools when a post feels unsafe or inappropriate.",
        "Do not use Dopamine Digital as a crisis service. If someone may be in immediate danger, contact local emergency support.",
        "Keep advice gentle, non-judgemental, and non-clinical unless you are qualified and acting in that role.",
        "Add human moderation before inviting a larger public community.",
      ]}
    />
  );
}
