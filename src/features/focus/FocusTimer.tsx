import { useEffect, useState } from "react";
import { useFocus } from "../../context/FocusContext";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function FocusTimer() {
  const { isFocusMode, startFocus, stopFocus, completeFocus, resetFocus } = useFocus();
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isBreak, setIsBreak] = useState(false);
  const [session, setSession] = useState(1);

  useEffect(() => {
    if (!isFocusMode) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current > 1) return current - 1;
        if (!isBreak) {
          completeFocus();
          setIsBreak(true);
          return BREAK_TIME;
        }
        setIsBreak(false);
        setSession((value) => value + 1);
        return WORK_TIME;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [completeFocus, isBreak, isFocusMode]);

  const resetTimer = () => {
    resetFocus();
    setIsBreak(false);
    setSeconds(WORK_TIME);
    setSession(1);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <section className="focus-timer-card">
      <div className="section-heading-row centered">
        <div>
          <p className="section-kicker">Focus system</p>
          <h2>{isBreak ? "Break Time" : "Focus Session"}</h2>
        </div>
      </div>
      <div className="big-timer">{minutes}:{remainingSeconds.toString().padStart(2, "0")}</div>
      <p className="muted-copy">Session {session} is {isFocusMode ? "active" : "paused"}</p>
      <div className="button-row centered">
        <button className="primary-button" onClick={startFocus} type="button">Start</button>
        <button className="secondary-button" onClick={stopFocus} type="button">Pause</button>
        <button className="secondary-button" onClick={completeFocus} type="button">Done</button>
        <button className="soft-danger-button" onClick={resetTimer} type="button">Reset</button>
      </div>
    </section>
  );
}

export default FocusTimer;
