import { Link, useParams } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import FocusTimer from "../components/FocusTimer";
import ToolsPanel from "../components/ToolsPanel";

const toolApps = [
  {
    title: "Focus Timer",
    path: "/tools/focus",
    label: "Start a focused work session with gentle dopamine pacing.",
    imageClass: "focus",
  },
  {
    title: "Regulate",
    path: "/tools/regulate",
    label: "Open the breathing tool when your nervous system feels loud.",
    imageClass: "regulate",
  },
  {
    title: "Anxiety Text Toolkit",
    path: "/toolkit",
    label: "Scripts, reframes, resets, and reply support in one mini app.",
    imageClass: "anxiety",
  },
  {
    title: "Journal",
    path: "/journal",
    label: "A dedicated brain dump space for thoughts, reminders, and spirals.",
    imageClass: "journal",
  },
  {
    title: "Dopamine Reset",
    path: "/toolkit/reset",
    label: "A tiny checklist for when your brain needs a soft restart.",
    imageClass: "reset",
  },
  {
    title: "Reframe Game",
    path: "/toolkit/reframe",
    label: "Turn anxious thoughts into something kinder and more realistic.",
    imageClass: "reframe",
  },
  {
    title: "Response Templates",
    path: "/toolkit/templates",
    label: "Copyable message scripts for when texting feels too much.",
    imageClass: "templates",
  },
  {
    title: "Resources",
    path: "/resources",
    label: "Calming support, ADHD ideas, and practical reset prompts.",
    imageClass: "resources",
  },
];

function ToolsLauncher() {
  return (
    <div className="brand-page tools-launcher-page">
      <section className="page-hero compact">
        <p className="section-kicker">DopamineDigital tools</p>
        <h1>Tools</h1>
        <p className="hero-copy">Pick a tiny app for focus, regulation, journaling, texting support, or a quick reset.</p>
        <BrainMascot className="page-hero-mascot" mood="calm" size="sm" />
      </section>

      <section className="tools-app-grid" aria-label="DopamineDigital tools">
        {toolApps.map((tool) => (
          <Link className="tool-app-card" key={tool.path} to={tool.path}>
            <div className={`tool-app-art ${tool.imageClass}`}>
              <span />
            </div>
            <div className="tool-app-copy">
              <h2>{tool.title}</h2>
              <p>{tool.label}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function FocusToolPage() {
  return (
    <div className="brand-page">
      <section className="page-hero compact">
        <p className="section-kicker">Focus tool</p>
        <h1>Focus Timer</h1>
        <p className="hero-copy">Start, pause, complete, or reset a focused dopamine-friendly session.</p>
        <BrainMascot className="page-hero-mascot" mood="calm" size="sm" />
      </section>
      <FocusTimer />
    </div>
  );
}

function RegulateToolPage() {
  return (
    <div className="brand-page">
      <section className="page-hero compact">
        <p className="section-kicker">Regulation tool</p>
        <h1>Breathing</h1>
        <p className="hero-copy">Use the count when your body needs a slower, softer rhythm.</p>
        <BrainMascot className="page-hero-mascot" mood="sleepy" size="sm" />
      </section>
      <ToolsPanel />
    </div>
  );
}

export default function Tools() {
  const { toolId } = useParams();

  if (toolId === "focus") return <FocusToolPage />;
  if (toolId === "regulate") return <RegulateToolPage />;

  return <ToolsLauncher />;
}
