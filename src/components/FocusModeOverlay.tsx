import { useFocus } from "../context/FocusContext";
import BrainMascot from "./BrainMascot";

export default function FocusModeOverlay() {
  const { isFocusMode, stopFocus, completeFocus } = useFocus();

  if (!isFocusMode) return null;

  return (
    <div className="focus-mode-overlay" role="dialog" aria-modal="true" aria-label="Focus mode active">
      <section className="focus-mode-panel">
        <BrainMascot className="focus-mode-mascot" mood="calm" size="sm" />
        <p className="section-kicker">Focus mode active</p>
        <h2>One tiny thing at a time</h2>
        <p>Stay with the current task. When you are done, bank the win so your streak and badges update.</p>
        <div className="button-row">
          <button className="secondary-button" onClick={stopFocus} type="button">Pause focus</button>
          <button className="primary-button" onClick={completeFocus} type="button">Complete session</button>
        </div>
      </section>
    </div>
  );
}
