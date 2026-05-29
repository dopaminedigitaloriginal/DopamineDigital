import { Link } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";
import {
  FOCUS_SESSIONS_KEY,
  RESET_LOG_KEY,
  getBrainBadges,
  getBrainNotes,
  getDailyStats,
  getMoodCheckIns,
  readJson,
  type BrainTag,
} from "../utils/brainStats";

const tagLabels: BrainTag[] = ["task", "anxiety", "idea", "reminder"];

const insightsStyles = `
  .insights-page {
    display: grid;
    gap: 18px;
    color: #111;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .insight-card,
  .insight-panel {
    border: 1px solid rgba(255, 170, 210, 0.42);
    border-radius: 26px;
    color: #111;
    background:
      radial-gradient(circle at 88% 14%, rgba(255, 255, 255, 0.58), transparent 26%),
      linear-gradient(145deg, rgba(255, 245, 249, 0.74), rgba(228, 223, 255, 0.68));
    box-shadow: 0 16px 34px rgba(54, 24, 80, 0.12);
  }

  .insight-card {
    display: grid;
    gap: 8px;
    min-height: 132px;
    padding: 16px;
  }

  .insight-card strong {
    font-family: "Fredoka", "Nunito", sans-serif;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    line-height: 1;
  }

  .insight-card span,
  .insight-card p {
    margin: 0;
    line-height: 1.4;
  }

  .insight-panel {
    display: grid;
    gap: 16px;
    padding: clamp(16px, 3vw, 24px);
  }

  .insights-two-column {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
    gap: 14px;
  }

  .trend-bars {
    display: grid;
    gap: 10px;
  }

  .trend-row {
    display: grid;
    grid-template-columns: 92px 1fr auto;
    gap: 10px;
    align-items: center;
  }

  .trend-track,
  .tag-track {
    height: 14px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.46);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.78);
  }

  .trend-track span,
  .tag-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff9bd1, #b9b5ff, #8ee4ff);
  }

  .tag-list,
  .badge-insight-list,
  .mood-list {
    display: grid;
    gap: 10px;
  }

  .tag-row {
    display: grid;
    grid-template-columns: 88px 1fr auto;
    gap: 10px;
    align-items: center;
  }

  .mood-item,
  .badge-insight-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.44);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
  }

  .mood-emoji {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.58);
    font-size: 1.35rem;
  }

  .insight-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 980px) {
    .insights-grid,
    .insights-two-column {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .insights-grid,
    .insights-two-column {
      grid-template-columns: 1fr;
    }

    .trend-row,
    .tag-row {
      grid-template-columns: 1fr;
    }
  }
`;

function shortDate(value: string) {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

function average(items: number[]) {
  if (!items.length) return 0;
  return Math.round((items.reduce((total, item) => total + item, 0) / items.length) * 10) / 10;
}

export default function Insights() {
  const notes = getBrainNotes();
  const checkIns = getMoodCheckIns();
  const stats = getDailyStats();
  const focusSessions = readJson<string[]>(FOCUS_SESSIONS_KEY, []);
  const resets = readJson<string[]>(RESET_LOG_KEY, []);
  const badges = getBrainBadges();
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const recentCheckIns = checkIns.slice(0, 7);
  const avgMood = average(recentCheckIns.map((item) => item.mood));
  const avgEnergy = average(recentCheckIns.map((item) => item.energy));
  const topTag = tagLabels
    .map((tag) => ({ tag, count: notes.filter((note) => note.tag === tag).length }))
    .sort((a, b) => b.count - a.count)[0];
  const tagMax = Math.max(1, ...tagLabels.map((tag) => notes.filter((note) => note.tag === tag).length));

  return (
    <div className="brand-page insights-page">
      <style>{insightsStyles}</style>

      <section className="page-hero compact">
        <p className="section-kicker">Progress</p>
        <h1>Brain insights</h1>
        <p className="hero-copy">A soft snapshot of your moods, thoughts, focus, resets, and dopamine wins.</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="happy" />
      </section>

      <section className="insights-grid">
        <article className="insight-card">
          <span>Streak</span>
          <strong>{stats.streakDays}</strong>
          <p>active day{stats.streakDays === 1 ? "" : "s"}</p>
        </article>
        <article className="insight-card">
          <span>Brain dumps</span>
          <strong>{notes.length}</strong>
          <p>{stats.thoughtsToday} today</p>
        </article>
        <article className="insight-card">
          <span>Focus</span>
          <strong>{focusSessions.length}</strong>
          <p>{stats.focusSessionsToday} today</p>
        </article>
        <article className="insight-card">
          <span>Badges</span>
          <strong>{unlockedBadges.length}</strong>
          <p>unlocked wins</p>
        </article>
      </section>

      <section className="insights-two-column">
        <article className="insight-panel">
          <div>
            <p className="section-kicker">Mood history</p>
            <h2>Last check-ins</h2>
          </div>
          {recentCheckIns.length === 0 ? (
            <p className="muted-copy">Mood check-ins will appear here once you save them.</p>
          ) : (
            <div className="mood-list">
              {recentCheckIns.map((item) => (
                <article className="mood-item" key={item.createdAt}>
                  <span className="mood-emoji">{item.emoji || "🧠"}</span>
                  <div>
                    <strong>{item.emotion || "check-in"}</strong>
                    <small>{shortDate(item.createdAt)}</small>
                  </div>
                  <span>M{item.mood} E{item.energy}</span>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="insight-panel">
          <div>
            <p className="section-kicker">Energy trend</p>
            <h2>Recent average</h2>
          </div>
          <div className="trend-bars">
            <div className="trend-row">
              <strong>Mood</strong>
              <div className="trend-track"><span style={{ width: `${(avgMood / 5) * 100}%` }} /></div>
              <span>{avgMood || 0}/5</span>
            </div>
            <div className="trend-row">
              <strong>Energy</strong>
              <div className="trend-track"><span style={{ width: `${(avgEnergy / 5) * 100}%` }} /></div>
              <span>{avgEnergy || 0}/5</span>
            </div>
          </div>
          <p className="muted-copy">
            {recentCheckIns.length ? "This is based on your latest saved check-ins." : "Save a check-in to start seeing your pattern."}
          </p>
        </article>
      </section>

      <section className="insights-two-column">
        <article className="insight-panel">
          <div>
            <p className="section-kicker">Brain dump tags</p>
            <h2>{topTag?.count ? `Top tag: ${topTag.tag}` : "No tags yet"}</h2>
          </div>
          <div className="tag-list">
            {tagLabels.map((tag) => {
              const count = notes.filter((note) => note.tag === tag).length;
              return (
                <div className="tag-row" key={tag}>
                  <strong>{tag}</strong>
                  <div className="tag-track"><span style={{ width: `${(count / tagMax) * 100}%` }} /></div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="insight-panel">
          <div>
            <p className="section-kicker">Reset support</p>
            <h2>Nervous system care</h2>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <span>Resets</span>
              <strong>{resets.length}</strong>
              <p>{stats.resetsToday} today</p>
            </div>
            <div className="insight-card">
              <span>Focus today</span>
              <strong>{stats.focusSessionsToday}</strong>
              <p>session{stats.focusSessionsToday === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="insight-actions">
            <Link className="primary-button" to="/journal">Add thought</Link>
            <Link className="secondary-button" to="/toolkit/reset">Use reset</Link>
          </div>
        </article>
      </section>

      <section className="insight-panel">
        <div>
          <p className="section-kicker">Badge shelf</p>
          <h2>Unlocked dopamine wins</h2>
        </div>
        <div className="badge-insight-list">
          {(unlockedBadges.length ? unlockedBadges : badges.slice(0, 4)).map((badge) => (
            <article className="badge-insight-item" key={badge.id}>
              <span className={`badge-icon ${badge.icon}`} />
              <div>
                <strong>{badge.title}</strong>
                <small>{badge.unlocked ? badge.earnedLabel : `${badge.progress}/${badge.target}`}</small>
              </div>
              <span>{badge.unlocked ? "Unlocked" : "Locked"}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
