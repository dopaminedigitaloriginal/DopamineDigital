import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import { addBrainNote } from "../utils/brainStats";

const tools = [
  { id: "reframe", title: "Reframe Game", subtitle: "What if they hate me?", tone: "pink", icon: "brain" },
  { id: "templates", title: "Response Templates", subtitle: "Copy, paste, breathe", tone: "blue", icon: "chat" },
  { id: "breathing", title: "Breathing Timer", subtitle: "Count with the calm cloud", tone: "purple", icon: "cloud" },
  { id: "tracker", title: "Overthinking Tracker", subtitle: "Log the spiral, shrink the spiral", tone: "orange", icon: "pencil" },
  { id: "reset", title: "Dopamine Reset", subtitle: "Tiny wins when your brain is drained", tone: "green", icon: "spark" },
];

const resetSteps = [
  "Put your phone face down for 10 mins",
  "Drink a full glass of cold water",
  "Step outside, even for 60 seconds",
  "Stretch your arms above your head",
  "Listen to one song that makes you feel powerful",
  "Write down 3 things that went right today",
  "Text someone who makes you feel safe",
  "Watch something that makes you laugh",
  "Remind yourself: their reply speed is not your worth",
  "Say out loud: I am not too much",
];

const templates = [
  ["When you need more time", "Hey! I saw your message. I want to give you a proper reply soon."],
  ["When you're unsure what they meant", "Just checking, what did you mean by that?"],
  ["When you feel ignored", "Just following up. No pressure."],
  ["When you over-explained", "Sorry for the essay lol. TLDR:"],
  ["When you need reassurance", "Hey, are we good? My brain is being weird."],
];

const phases = [
  { label: "Breathe in", count: 4 },
  { label: "Hold", count: 4 },
  { label: "Breathe out", count: 4 },
  { label: "Hold", count: 4 },
];

export default function AnxietyToolkit() {
  return (
    <div className="brand-page toolkit-native-page toolkit-menu-page">
      <section className="dd-hero-screen dd-toolkit-menu">
        <div className="dd-brand-badge">DopamineDigital</div>
        <div className="dd-floating-shape star one" />
        <div className="dd-floating-shape star two" />
        <div className="dd-floating-shape heart" />
        <div className="dd-floating-shape flower" />
        <BrainMascot className="toolkit-menu-mascot" size="md" />

        <h1>Text Anxiety Toolkit</h1>
        <p>pick your tiny brain rescue</p>

        <nav className="dd-tool-menu" aria-label="Toolkit sections">
          {tools.map((tool) => (
            <Link className={`dd-menu-button ${tool.tone}`} key={tool.id} to={`/toolkit/${tool.id}`}>
              <span>{tool.icon}</span>
              <strong>{tool.title}</strong>
              <small>{tool.subtitle}</small>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}

export function ToolkitTool() {
  const { toolId = "reframe" } = useParams();
  const tool = tools.find((item) => item.id === toolId) ?? tools[0];

  return (
    <div className="brand-page toolkit-native-page">
      <section className={`dd-screen dd-tool-screen ${tool.tone}`}>
        <div className="dd-screen-nav">
          <Link to="/toolkit">back</Link>
          <strong>{tool.title}</strong>
          <Link to="/">home</Link>
        </div>

        {tool.id === "reframe" && <ReframeTool />}
        {tool.id === "templates" && <TemplatesTool />}
        {tool.id === "breathing" && <BreathingTool />}
        {tool.id === "tracker" && <TrackerTool />}
        {tool.id === "reset" && <ResetTool />}
      </section>
    </div>
  );
}

function ReframeTool() {
  const [thought, setThought] = useState("They haven't replied. They definitely hate me now.");
  const [saved, setSaved] = useState(false);
  const reframe = "People get busy. A late reply does not mean they do not care about you. You are worthy of connection.";

  const saveReframe = () => {
    addBrainNote(`Reframe: ${thought} -> ${reframe}`);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="dd-single-tool dd-reframe-screen">
      <h2>What if they hate me?</h2>
      <BrainMascot className="toolkit-tool-mascot" mood="worried" size="sm" />
      <label>
        <span>The anxious thought</span>
        <textarea value={thought} onChange={(event) => setThought(event.target.value)} />
      </label>
      <div className="dd-result-card">
        <strong>Reframed</strong>
        <p>{reframe}</p>
      </div>
      <button className="dd-green-cta" onClick={saveReframe} type="button">{saved ? "Saved" : "Save this reframe"}</button>
    </div>
  );
}

function TemplatesTool() {
  const [copied, setCopied] = useState("");

  const copyTemplate = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Some embedded browser contexts block clipboard writes, but the UI should still confirm the tap.
    }
    setCopied(text);
    window.setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="dd-single-tool dd-template-screen">
      <h2>Response Templates</h2>
      <p className="dd-subtitle">copy, paste, breathe</p>
      <div className="dd-template-list">
        {templates.map(([title, text], index) => (
          <button className={copied === text ? "dd-template copied" : "dd-template"} key={title} onClick={() => copyTemplate(text)} type="button">
            <span>{index + 1}. {title}</span>
            <p>{text}</p>
            <strong>{copied === text ? "Copied" : "Tap to copy"}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function BreathingTool() {
  const [breathing, setBreathing] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!breathing) return undefined;
    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current > 1) return current - 1;
        setPhaseIndex((phase) => (phase + 1) % phases.length);
        return phases[(phaseIndex + 1) % phases.length].count;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathing, phaseIndex]);

  const currentPhase = phases[phaseIndex];

  return (
    <div className="dd-single-tool dd-breathing-screen">
      <h2>Breathing Timer</h2>
      <div className={breathing ? "dd-breathing-ring active" : "dd-breathing-ring"}>
        <span>{currentPhase.label}</span>
        <strong>{count}s</strong>
      </div>
      <p className="dd-round-label">{breathing ? "you're doing amazing" : "press start and count with it"}</p>
      <button className={breathing ? "dd-stop-cta" : "dd-green-cta"} onClick={() => setBreathing((value) => !value)} type="button">
        {breathing ? "Pause" : "Start Timer"}
      </button>
    </div>
  );
}

function ResetTool() {
  const [checked, setChecked] = useState<string[]>([]);
  const completed = checked.length;
  const progress = useMemo(() => Math.round((completed / resetSteps.length) * 100), [completed]);

  const toggleStep = (step: string) => {
    setChecked((current) => current.includes(step) ? current.filter((item) => item !== step) : [...current, step]);
  };

  return (
    <div className="dd-single-tool dd-reset-screen">
      <h2>Dopamine Reset</h2>
      <p className="dd-subtitle">when texting has drained your brain, do these</p>
      <div className="dd-reset-list">
        {resetSteps.map((step, index) => (
          <button className={checked.includes(step) ? "dd-reset-step done" : "dd-reset-step"} key={step} onClick={() => toggleStep(step)} type="button">
            <span>{checked.includes(step) ? "done" : "todo"}</span>
            {index + 1}. {step}
          </button>
        ))}
      </div>
      <BrainMascot className="toolkit-tool-mascot" size="sm" />
      <strong className="dd-progress-label">{completed}/10 completed</strong>
      <div className="dd-progress"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

function TrackerTool() {
  return (
    <div className="dd-single-tool dd-tracker-screen">
      <h2>Overthinking Tracker</h2>
      <p className="dd-subtitle">tap one square when your brain starts spiralling</p>
      <div className="dd-tracker-grid" aria-label="Overthinking tracker">
        {Array.from({ length: 28 }).map((_, index) => <span key={index} />)}
      </div>
      <Link className="dd-green-cta" to="/journal">Log thought</Link>
    </div>
  );
}
