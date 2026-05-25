import { useEffect, useMemo, useState } from "react";
import BrainMascot from "../components/BrainMascot";
import { getBrainBadges } from "../utils/brainStats";

export default function Badges() {
  const [tick, setTick] = useState(0);
  const badges = useMemo(() => getBrainBadges(), [tick]);
  const unlocked = badges.filter((badge) => badge.unlocked).length;

  useEffect(() => {
    const refresh = () => setTick((value) => value + 1);
    window.addEventListener("brain-os-storage", refresh);
    return () => window.removeEventListener("brain-os-storage", refresh);
  }, []);

  return (
    <div className="brand-page badges-page">
      <section className="page-hero compact">
        <p className="section-kicker">Badge shelf</p>
        <h1>Badges</h1>
        <p className="hero-copy">Track what you have unlocked and what your brain can aim for next.</p>
        <BrainMascot className="page-hero-mascot" size="sm" />
      </section>

      <section className="badge-progress-panel">
        <div>
          <p className="section-kicker">Unlocked</p>
          <h2>{unlocked}/{badges.length} badges</h2>
          <p className="muted-copy">Every tiny action counts. The shelf fills up as you use the system.</p>
        </div>
        <div className="badge-overall-bar" aria-label="Badge unlock progress">
          <span style={{ width: `${Math.round((unlocked / badges.length) * 100)}%` }} />
        </div>
      </section>

      <section className="badge-grid" aria-label="Badge collection">
        {badges.map((badge) => (
          <article className={badge.unlocked ? "badge-card unlocked" : "badge-card locked"} key={badge.id}>
            <div className="badge-card-top">
              <span className={`badge-icon ${badge.icon}`} />
              <small>{badge.category}</small>
            </div>
            <h2>{badge.title}</h2>
            <p>{badge.description}</p>
            <div className="badge-card-footer">
              <strong>{badge.unlocked ? badge.earnedLabel : `${badge.progress}/${badge.target}`}</strong>
              <div className="badge-progress" aria-label={`${badge.title} progress`}>
                <span style={{ width: `${Math.round((badge.progress / badge.target) * 100)}%` }} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
