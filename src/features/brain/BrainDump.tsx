import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFocus } from "../../context/FocusContext";
import { addBrainNote, getBrainNotes, saveBrainNotes, type BrainNote } from "../../utils/brainStats";

const filters = ["all", "task", "anxiety", "idea", "reminder"] as const;

type BrainDumpProps = {
  variant?: "card" | "journal";
};

function BrainDump({ variant = "card" }: BrainDumpProps) {
  const [notes, setNotes] = useState<BrainNote[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isFocusMode } = useFocus();

  const refreshNotes = () => setNotes(getBrainNotes());

  useEffect(() => {
    refreshNotes();
    const focusInput = () => inputRef.current?.focus();
    window.addEventListener("brain-os-storage", refreshNotes);
    window.addEventListener("brain-dump-focus", focusInput);
    return () => {
      window.removeEventListener("brain-os-storage", refreshNotes);
      window.removeEventListener("brain-dump-focus", focusInput);
    };
  }, []);

  const addNote = (event?: FormEvent) => {
    event?.preventDefault();
    const note = addBrainNote(input);
    if (!note) return;
    setInput("");
    refreshNotes();
    if (isFocusMode) window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearNotes = () => {
    saveBrainNotes([]);
    refreshNotes();
  };

  const visibleNotes = filter === "all" ? notes : notes.filter((note) => note.tag === filter);

  return (
    <section className={variant === "journal" ? "brain-card journal-brain-card" : "brain-card"}>
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">{variant === "journal" ? "Online journal" : "Smart brain dump"}</p>
          <h2>{variant === "journal" ? "Write it out" : "Capture and organize"}</h2>
        </div>
        <button className="soft-danger-button" onClick={clearNotes} type="button">Clear</button>
      </div>

      <p className="muted-copy">
        {isFocusMode
          ? "Focus mode is active. Drop the thought fast and stay in flow."
          : "Thoughts auto-tag into task, anxiety, idea, or reminder and sync when your account is connected."}
      </p>

      <form className="brain-input-row journal-input-row" onSubmit={addNote}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Open the mental tabs here. Tasks, reminders, ideas, and anxious loops will be sorted automatically..."
          rows={variant === "journal" ? 8 : 4}
        />
        <button className="primary-button" type="submit">Add entry</button>
      </form>

      <div className="tag-filter-row" aria-label="Brain dump filters">
        {filters.map((item) => (
          <button
            className={item === filter ? "filter-chip active" : "filter-chip"}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className={variant === "journal" ? "note-stack journal-note-stack" : "note-stack"}>
        {visibleNotes.length === 0 ? (
          <p className="empty-note">No thoughts in this lane yet.</p>
        ) : (
          visibleNotes.map((note, index) => (
            <article className="note-card" key={note.createdAt + index}>
              <div className={"note-tag " + note.tag}>{note.tag}</div>
              <p>{note.text}</p>
              <span>{note.date} · {note.time}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default BrainDump;
