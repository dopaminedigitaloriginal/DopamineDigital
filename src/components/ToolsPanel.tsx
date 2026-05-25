import { useEffect, useMemo, useState } from "react";

const phases = [
  { label: "Inhale", seconds: 4 },
  { label: "Hold", seconds: 7 },
  { label: "Exhale", seconds: 8 },
];

function ToolsPanel() {
  const [breathing, setBreathing] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(phases[0].seconds);
  const phase = phases[phaseIndex];

  const helperText = useMemo(() => {
    if (!breathing) return "Press start and breathe with the count.";
    return `${phase.label} for ${count}`;
  }, [breathing, count, phase.label]);

  useEffect(() => {
    if (!breathing) return;

    const interval = window.setInterval(() => {
      setCount((current) => {
        if (current > 1) return current - 1;

        setPhaseIndex((index) => {
          const nextIndex = (index + 1) % phases.length;
          setCount(phases[nextIndex].seconds);
          return nextIndex;
        });

        return current;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [breathing]);

  const toggleBreathing = () => {
    setBreathing((value) => {
      const nextValue = !value;
      if (nextValue) {
        setPhaseIndex(0);
        setCount(phases[0].seconds);
      }
      return nextValue;
    });
  };

  return (
    <section className="console-panel tools-panel">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">Quick tools</p>
          <h2>Regulate</h2>
        </div>
      </div>

      <button className="primary-button" onClick={toggleBreathing} type="button">
        {breathing ? "Stop breathing" : "Start breathing"}
      </button>

      <div className={breathing ? "breathing-tool active" : "breathing-tool"}>
        <div className="breathing-orb">
          <strong>{breathing ? count : "4"}</strong>
        </div>
        <h3>{breathing ? phase.label : "4-7-8 breathing"}</h3>
        <p>{helperText}</p>
      </div>
    </section>
  );
}

export default ToolsPanel;
