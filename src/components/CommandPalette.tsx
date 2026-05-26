import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocus } from "../context/FocusContext";
import { addBrainNote } from "../utils/brainStats";

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { startFocus, stopFocus, resetFocus } = useFocus();

  const items = useMemo(() => [
    { label: "Home", hint: "Open dashboard", run: () => navigate("/app") },
    { label: "Tools", hint: "Open tools", run: () => navigate("/tools") },
    { label: "Journal", hint: "Open brain dump journal", run: () => navigate("/journal") },
    { label: "Games", hint: "Open mini games", run: () => navigate("/games") },
    { label: "Dopamine Pop", hint: "Open bubble popping game", run: () => navigate("/games/dopamine-pop") },
    { label: "Tiny Wins Garden", hint: "Open tiny wins garden", run: () => navigate("/games/tiny-wins-garden") },
    { label: "Mood Potion Lab", hint: "Open mood mixing game", run: () => navigate("/games/mood-potion-lab") },
    { label: "Sparkle Sweep", hint: "Open calming clear-space game", run: () => navigate("/games/sparkle-sweep") },
    { label: "Toolkit", hint: "Open text anxiety toolkit", run: () => navigate("/toolkit") },
    { label: "Badges", hint: "Open badge shelf", run: () => navigate("/badges") },
    { label: "Breathing timer", hint: "Open counted breathing", run: () => navigate("/toolkit/breathing") },
    { label: "Dopamine reset", hint: "Open reset checklist", run: () => navigate("/toolkit/reset") },
    { label: "Response templates", hint: "Open copy scripts", run: () => navigate("/toolkit/templates") },
    { label: "Reframe game", hint: "Open thought reframe", run: () => navigate("/toolkit/reframe") },
    { label: "Resources", hint: "Open resources", run: () => navigate("/resources") },
    { label: "Community", hint: "Open community", run: () => navigate("/community") },
    { label: "Add thought", hint: "Quick brain dump", run: () => {
      const thought = window.prompt("Quick brain dump:");
      if (thought) addBrainNote(thought);
      navigate("/journal");
    } },
    { label: "Start focus", hint: "Begin focus mode", run: startFocus },
    { label: "Stop focus", hint: "Pause focus mode", run: stopFocus },
    { label: "Show stats", hint: "Return to dashboard", run: () => navigate("/app") },
    { label: "Reset", hint: "Log a reset", run: resetFocus },
  ], [navigate, resetFocus, startFocus, stopFocus]);

  const filtered = items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  const runItem = (run: () => void) => {
    run();
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="command-overlay" onClick={() => setOpen(false)}>
      <section className="command-modal" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filtered[0]) runItem(filtered[0].run);
          }}
          placeholder="Search commands: toolkit, journal, add thought..."
        />
        <div className="command-list">
          {filtered.map((item) => (
            <button key={item.label} onClick={() => runItem(item.run)} type="button">
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CommandPalette;
