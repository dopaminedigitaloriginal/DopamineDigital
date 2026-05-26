import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrainMascot from "../../components/BrainMascot";
import logo from "../../assets/LOGO.png";
import { useFocus } from "../../context/FocusContext";
import {
  addBrainNote,
  getBrainBadges,
  getDailyMissions,
  getDailyStats,
  getLatestCheckInToday,
  getMoodCheckIns,
  getOnboardingPreference,
  getMissionSummary,
  saveMoodCheckIn,
  saveOnboardingPreference,
  type OnboardingNeed,
} from "../../utils/brainStats";

const emotions = [
  { emoji: "\u{1F60A}", name: "steady", mood: 4, energy: 3 },
  { emoji: "\u26A1", name: "wired", mood: 3, energy: 5 },
  { emoji: "\u{1F635}\u200D\u{1F4AB}", name: "overwhelmed", mood: 2, energy: 2 },
  { emoji: "\u{1F61F}", name: "anxious", mood: 2, energy: 4 },
  { emoji: "\u{1F634}", name: "drained", mood: 2, energy: 1 },
  { emoji: "\u{1F496}", name: "soft", mood: 5, energy: 2 },
];

const hubCards = [
  { title: "Toolkit", path: "/toolkit", label: "Text anxiety tools, reset games, scripts", imageClass: "toolkit" },
  { title: "Tools", path: "/tools", label: "Focus timer and regulation tools", imageClass: "tools" },
  { title: "Journal", path: "/journal", label: "Dedicated brain dump writing space", imageClass: "journal" },
  { title: "Games", path: "/games", label: "Tiny playful resets for busy brains", imageClass: "games" },
  { title: "Resources", path: "/resources", label: "Calming, ADHD support, RSD resets", imageClass: "resources" },
];

const onboardingOptions: Array<{
  id: OnboardingNeed;
  title: string;
  copy: string;
  path: string;
}> = [
  { id: "focus", title: "Focus", copy: "Start a timer and reduce the noise.", path: "/tools/focus" },
  { id: "anxiety", title: "Anxiety", copy: "Open a calming reset or breathing tool.", path: "/toolkit/breathing" },
  { id: "brain-dump", title: "Brain dump", copy: "Empty the mental tabs into your journal.", path: "/journal" },
  { id: "rsd", title: "RSD", copy: "Use a gentle reframe for spirals.", path: "/toolkit/reframe" },
  { id: "burnout", title: "Burnout", copy: "Choose a tiny reset instead of a full overhaul.", path: "/toolkit/reset" },
  { id: "motivation", title: "Motivation", copy: "Try a dopamine game or tiny win.", path: "/games/tiny-wins-garden" },
];

function formatElapsed(startedAt: string | null) {
  if (!startedAt) return "00:00";
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function HomeDashboard() {
  const navigate = useNavigate();
  const { isFocusMode, focusStartedAt, startFocus, stopFocus, completeFocus, resetFocus } = useFocus();
  const [stats, setStats] = useState(getDailyStats);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [emotion, setEmotion] = useState(emotions[0]);
  const [onboardingPreference, setOnboardingPreference] = useState(getOnboardingPreference);
  const [showCheckInHistory, setShowCheckInHistory] = useState(false);
  const [thought, setThought] = useState("");
  const [elapsed, setElapsed] = useState(formatElapsed(focusStartedAt));
  const checkIn = useMemo(() => getLatestCheckInToday(), [stats]);
  const checkInHistory = useMemo(() => getMoodCheckIns().slice(0, 10), [stats]);
  const missions = useMemo(() => getDailyMissions(stats), [stats]);
  const missionSummary = useMemo(() => getMissionSummary(missions), [missions]);
  const badges = useMemo(() => getBrainBadges(), [stats]);
  const earnedBadges = badges.filter((badge) => badge.unlocked);

  const refreshStats = () => setStats(getDailyStats());

  useEffect(() => {
    refreshStats();
    window.addEventListener("brain-os-storage", refreshStats);
    return () => window.removeEventListener("brain-os-storage", refreshStats);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed(formatElapsed(focusStartedAt)), 1000);
    return () => window.clearInterval(interval);
  }, [focusStartedAt]);

  const submitThought = (event: FormEvent) => {
    event.preventDefault();
    const note = addBrainNote(thought);
    if (!note) return;
    setThought("");
    refreshStats();
  };

  const quickReset = () => {
    resetFocus();
    refreshStats();
    navigate("/toolkit/reset");
  };

  const saveCheckIn = () => {
    saveMoodCheckIn(mood, energy, emotion.name, emotion.emoji);
    refreshStats();
  };

  const chooseEmotion = (nextEmotion: (typeof emotions)[number]) => {
    setEmotion(nextEmotion);
    setMood(nextEmotion.mood);
    setEnergy(nextEmotion.energy);
  };

  const runMissionAction = (missionId: string) => {
    if (missionId === "brain-sweep") navigate("/journal");
    if (missionId === "focus-spark") {
      startFocus();
      navigate("/tools/focus");
    }
    if (missionId === "energy-scan") document.querySelector(".checkin-console")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const chooseOnboardingNeed = (need: OnboardingNeed, path: string) => {
    const preference = saveOnboardingPreference(need);
    setOnboardingPreference(preference);
    navigate(path);
  };

  return (
    <div className="brand-home">
      <header className="brand-topbar">
        <img src={logo} alt="Dopamine Digital" />
        <button className="glass-button" onClick={() => navigate("/toolkit")} type="button">Open toolkit</button>
      </header>

      <section className="brain-hero">
        <div className="hero-copy-block">
          <p className="section-kicker">DopamineDigital central brain</p>
          <h1>ADHD Operating System</h1>
          <p className="hero-copy">
            Your bright, low-friction launch pad for focus, thoughts, resets, energy, and support.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => {
              startFocus();
              navigate("/tools/focus");
            }} type="button">Start focus</button>
            <button className="secondary-button" onClick={() => navigate("/journal")} type="button">Brain dump</button>
            <button className="soft-danger-button" onClick={quickReset} type="button">Reset</button>
          </div>
        </div>

        <div className="animated-brain-stage mascot-stage" aria-label="DopamineDigital brain mascot">
          <div className="orbit-ring one" />
          <div className="orbit-ring two" />
          <BrainMascot className="home-brain-buddy" size="lg" />
          <span className="spark spark-one" />
          <span className="spark spark-two" />
          <span className="spark spark-three" />
        </div>
      </section>

      <section className="mission-panel">
        <div className="mission-header">
          <div>
            <p className="section-kicker">Daily missions</p>
            <h2>{missionSummary.allComplete ? "Mission set complete" : "Today’s dopamine quests"}</h2>
            <p className="muted-copy">
              {missionSummary.completeCount} of {missionSummary.total} complete. Tiny wins count here.
            </p>
          </div>
          <div className={missionSummary.allComplete ? "mission-ring complete" : "mission-ring"}>
            <strong>{missionSummary.percent}%</strong>
            <span>done</span>
          </div>
        </div>

        <div className="mission-grid">
          {missions.map((mission) => (
            <article className={mission.complete ? "mission-card complete" : "mission-card"} key={mission.id}>
              <div className="mission-card-top">
                <span>{mission.complete ? "Complete" : "Mission"}</span>
                <strong>{mission.current}/{mission.target}</strong>
              </div>
              <h3>{mission.title}</h3>
              <p>{mission.description}</p>
              <div className="mission-progress" aria-label={`${mission.title} progress`}>
                <span style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }} />
              </div>
              <div className="mission-footer">
                <small>{mission.reward}</small>
                <button className={mission.complete ? "secondary-button" : "primary-button"} onClick={() => runMissionAction(mission.id)} type="button">
                  {mission.complete ? "Done" : mission.actionLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {!onboardingPreference && (
        <section className="onboarding-panel">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Quick setup</p>
              <h2>What do you need today?</h2>
              <p className="muted-copy">Pick one and Dopamine Digital will take you straight to the right support.</p>
            </div>
            <BrainMascot size="xs" mood="happy" />
          </div>
          <div className="onboarding-choice-grid">
            {onboardingOptions.map((option) => (
              <button className="onboarding-choice" key={option.id} onClick={() => chooseOnboardingNeed(option.id, option.path)} type="button">
                <strong>{option.title}</strong>
                <span>{option.copy}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-launch-grid four-up" aria-label="Homepage navigation">
        {hubCards.map((card) => (
          <Link className="launch-card" key={card.path} to={card.path}>
            <div className={`launch-image ${card.imageClass}`}>
              <span />
            </div>
            <div>
              <h2>{card.title}</h2>
              <p>{card.label}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="badge-showcase-panel">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Badge shelf</p>
            <h2>Your dopamine wins</h2>
            <p className="muted-copy">Earn badges as you check in, focus, reset, and sort your thoughts.</p>
          </div>
          <Link className="secondary-button" to="/badges">View all badges</Link>
        </div>

        <div className="badge-mini-grid">
          {(earnedBadges.length ? earnedBadges.slice(0, 4) : badges.slice(0, 4)).map((badge) => (
            <article className={badge.unlocked ? "badge-mini-card unlocked" : "badge-mini-card locked"} key={badge.id}>
              <span className={`badge-icon ${badge.icon}`} />
              <div>
                <strong>{badge.title}</strong>
                <small>{badge.unlocked ? badge.earnedLabel : `${badge.progress}/${badge.target}`}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="brain-console">
        <article className="console-panel focus-console">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Current focus</p>
              <h2>{isFocusMode ? "Active" : "Paused"}</h2>
            </div>
            <span className={isFocusMode ? "status-pill active" : "status-pill"}>{isFocusMode ? "active" : "paused"}</span>
          </div>
          <div className="big-timer">{elapsed}</div>
          <div className="button-row">
            <button className="primary-button" onClick={isFocusMode ? stopFocus : startFocus} type="button">
              {isFocusMode ? "Pause" : "Start"}
            </button>
            <button className="secondary-button" onClick={completeFocus} type="button">Done</button>
          </div>
        </article>

        <article className="console-panel stats-console">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Brain stats</p>
              <h2>Today</h2>
            </div>
            <span className="status-pill hot">{stats.streakDays} day streak</span>
          </div>
          <div className="stat-grid">
            <div><strong>{stats.thoughtsToday}</strong><span>thoughts</span></div>
            <div><strong>{stats.focusSessionsToday}</strong><span>focus sessions</span></div>
            <div><strong>{stats.resetsToday}</strong><span>resets</span></div>
            <div><strong>{stats.streakDays}</strong><span>streak</span></div>
          </div>
        </article>

        <article className="console-panel capture-console">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Fast capture</p>
              <h2>Drop a thought</h2>
            </div>
          </div>
          <form className="quick-thought-form" onSubmit={submitThought}>
            <input value={thought} onChange={(event) => setThought(event.target.value)} placeholder="Type it before it floats away..." />
            <button className="primary-button" type="submit">Add</button>
          </form>
        </article>

        <article className="console-panel checkin-console">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Daily check-in</p>
              <h2>{emotion.emoji} {emotion.name}</h2>
            </div>
            <span className="status-pill">{checkIn ? `M${checkIn.mood} E${checkIn.energy}` : "not set"}</span>
          </div>

          <div className="emotion-grid" aria-label="Emotion options">
            {emotions.map((item) => (
              <button className={item.name === emotion.name ? "emotion-button active" : "emotion-button"} key={item.name} onClick={() => chooseEmotion(item)} type="button">
                <span>{item.emoji}</span>
                <strong>{item.name}</strong>
              </button>
            ))}
          </div>

          <label>Mood <input min="1" max="5" value={mood} onChange={(event) => setMood(Number(event.target.value))} type="range" /></label>
          <label>Energy <input min="1" max="5" value={energy} onChange={(event) => setEnergy(Number(event.target.value))} type="range" /></label>
          <div className="button-row">
            <button className="secondary-button" onClick={saveCheckIn} type="button">Save check-in</button>
            <button className="glass-button compact" onClick={() => setShowCheckInHistory((value) => !value)} type="button">
              {showCheckInHistory ? "Hide history" : "View history"}
            </button>
          </div>

          {showCheckInHistory && (
            <div className="checkin-history" aria-label="Mood check-in history">
              <div className="checkin-history-header">
                <strong>Past check-ins</strong>
                <span>{checkInHistory.length} saved</span>
              </div>
              {checkInHistory.length === 0 ? (
                <p className="muted-copy">Your saved check-ins will appear here.</p>
              ) : (
                <div className="checkin-history-list">
                  {checkInHistory.map((item) => (
                    <article className="checkin-history-item" key={item.createdAt}>
                      <span className="checkin-history-emoji">{item.emoji || "\u{1F9E0}"}</span>
                      <div>
                        <strong>{item.emotion || "check-in"}</strong>
                        <small>
                          {new Date(item.createdAt).toLocaleDateString()} at{" "}
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </small>
                      </div>
                      <span className="checkin-history-score">M{item.mood} E{item.energy}</span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default HomeDashboard;

