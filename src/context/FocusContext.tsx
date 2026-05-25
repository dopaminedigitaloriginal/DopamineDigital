import { createContext, useContext, useState } from "react";
import { recordFocusSession, recordReset } from "../utils/brainStats";

type FocusContextType = {
  isFocusMode: boolean;
  focusStartedAt: string | null;
  startFocus: () => void;
  stopFocus: () => void;
  completeFocus: () => void;
  resetFocus: () => void;
};

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusStartedAt, setFocusStartedAt] = useState<string | null>(null);

  const startFocus = () => {
    setIsFocusMode(true);
    setFocusStartedAt((current) => current ?? new Date().toISOString());
  };

  const stopFocus = () => {
    setIsFocusMode(false);
    setFocusStartedAt(null);
  };

  const completeFocus = () => {
    recordFocusSession();
    setIsFocusMode(false);
    setFocusStartedAt(null);
  };

  const resetFocus = () => {
    recordReset();
    setIsFocusMode(false);
    setFocusStartedAt(null);
  };

  return (
    <FocusContext.Provider value={{ isFocusMode, focusStartedAt, startFocus, stopFocus, completeFocus, resetFocus }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used inside FocusProvider");
  return ctx;
}
