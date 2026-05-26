import { useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";

type GameId = "dopamine-pop" | "tiny-wins-garden" | "mood-potion-lab" | "sparkle-sweep";

type PlacedItem = {
  id: string;
  kind: string;
  left: string;
  top: string;
};

const gameCards: Array<{
  id: GameId;
  title: string;
  subtitle: string;
  iconClass: string;
  color: string;
}> = [
  {
    id: "dopamine-pop",
    title: "Dopamine Pop",
    subtitle: "Pop glossy dopamine treats and hit celebration levels.",
    iconClass: "pop",
    color: "pink",
  },
  {
    id: "tiny-wins-garden",
    title: "Tiny Wins Garden",
    subtitle: "Tap tiny wins and grow a soft brain garden.",
    iconClass: "garden",
    color: "green",
  },
  {
    id: "mood-potion-lab",
    title: "Mood Potion Lab",
    subtitle: "Mix pastel feelings into a little support potion.",
    iconClass: "potion",
    color: "blue",
  },
  {
    id: "sparkle-sweep",
    title: "Sparkle Sweep",
    subtitle: "Clean clutter patches and reveal a calm space.",
    iconClass: "sweep",
    color: "peach",
  },
];

const gamesStyles = `
  .games-page {
    display: grid;
    gap: 18px;
    color: #111;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .game-app-card {
    position: relative;
    min-height: 198px;
    display: grid;
    align-content: space-between;
    gap: 16px;
    padding: 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 157, 205, 0.36);
    border-radius: 28px;
    color: #111;
    text-decoration: none;
    background:
      radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.62), transparent 28%),
      linear-gradient(145deg, rgba(255, 234, 244, 0.78), rgba(225, 222, 255, 0.74));
    box-shadow: 0 16px 38px rgba(52, 22, 76, 0.14);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .game-app-card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(255, 105, 184, 0.66);
    box-shadow: 0 20px 44px rgba(52, 22, 76, 0.18), 0 0 22px rgba(255, 157, 205, 0.22);
  }

  .game-card-art,
  .game-piece,
  .clutter-patch,
  .garden-bloom,
  .game-celebration {
    position: relative;
  }

  .game-card-art {
    width: 78px;
    height: 78px;
    display: grid;
    place-items: center;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.58);
    box-shadow: 0 12px 24px rgba(65, 29, 89, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    animation: gameFloat 4.2s ease-in-out infinite;
  }

  .game-card-art::before,
  .game-card-art::after,
  .game-piece::before,
  .game-piece::after,
  .garden-bloom::before,
  .garden-bloom::after,
  .clutter-patch::before,
  .clutter-patch::after {
    content: "";
    position: absolute;
    display: block;
  }

  .game-card-art.pop::before,
  .game-piece.heart::before {
    width: 44px;
    height: 38px;
    border-radius: 999px 999px 10px 10px;
    background: linear-gradient(145deg, #ff9bd1, #ff6fb7);
    transform: rotate(-45deg);
    box-shadow: 0 10px 20px rgba(255, 111, 183, 0.22);
  }

  .game-card-art.pop::after,
  .game-piece.heart::after {
    width: 14px;
    height: 14px;
    top: 18px;
    left: 26px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
  }

  .game-card-art.garden::before,
  .garden-bloom.flower::before {
    width: 58px;
    height: 58px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 50% 50%, #ffd983 0 8px, transparent 9px),
      radial-gradient(circle at 50% 16%, #ff9bd1 0 12px, transparent 13px),
      radial-gradient(circle at 84% 50%, #ff9bd1 0 12px, transparent 13px),
      radial-gradient(circle at 50% 84%, #ff9bd1 0 12px, transparent 13px),
      radial-gradient(circle at 16% 50%, #ff9bd1 0 12px, transparent 13px);
  }

  .game-card-art.potion::before {
    width: 38px;
    height: 58px;
    bottom: 10px;
    border: 4px solid rgba(255,255,255,0.82);
    border-radius: 18px 18px 13px 13px;
    background: linear-gradient(180deg, #c9a7ff 10%, #9ec8ff 54%, #ff9bd1 100%);
    box-shadow: 0 10px 18px rgba(65, 29, 89, 0.14);
  }

  .game-card-art.potion::after {
    width: 12px;
    height: 12px;
    left: 18px;
    top: 15px;
    border-radius: 999px;
    background: #fff1f8;
    box-shadow: 26px 10px 0 #fff1f8, 12px 32px 0 rgba(255,255,255,0.72);
    animation: bubbleRise 2.4s ease-in-out infinite;
  }

  .game-card-art.sweep::before {
    width: 58px;
    height: 34px;
    bottom: 20px;
    border-radius: 20px;
    background: linear-gradient(145deg, #ffc7a8, #ff9bd1);
    box-shadow: 0 10px 20px rgba(65, 29, 89, 0.14);
  }

  .game-card-art.sweep::after {
    width: 54px;
    height: 10px;
    top: 22px;
    border-radius: 999px;
    background: #3f2146;
    transform: rotate(-25deg);
  }

  .game-app-card h2,
  .game-stage h2 {
    margin: 0 0 6px;
    font-family: "Fredoka", "Nunito", sans-serif;
    letter-spacing: 0;
  }

  .game-app-card p,
  .game-stage p {
    margin: 0;
    line-height: 1.45;
  }

  .game-stage {
    position: relative;
    overflow: hidden;
    min-height: 590px;
    display: grid;
    gap: 16px;
    padding: clamp(16px, 3vw, 26px);
    border: 1px solid rgba(255, 157, 205, 0.34);
    border-radius: 32px;
    background:
      radial-gradient(circle at 14% 12%, rgba(255, 206, 228, 0.72), transparent 26%),
      radial-gradient(circle at 86% 18%, rgba(203, 210, 255, 0.64), transparent 30%),
      linear-gradient(145deg, rgba(255, 242, 248, 0.78), rgba(225, 221, 255, 0.68));
    box-shadow: 0 18px 48px rgba(52, 22, 76, 0.14);
  }

  .game-topline {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .game-stats,
  .garden-actions,
  .game-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .game-stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    color: #111;
    font-weight: 850;
    background: rgba(255, 255, 255, 0.58);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .play-zone {
    position: relative;
    min-height: 360px;
    overflow: hidden;
    border: 1px solid rgba(255, 157, 205, 0.28);
    border-radius: 30px;
    background:
      radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.5), transparent 28%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.28), rgba(226, 222, 255, 0.26));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.74);
  }

  .game-piece,
  .clutter-patch,
  .garden-bloom {
    position: absolute;
    display: grid;
    place-items: center;
    border: 0;
    cursor: pointer;
    transition: transform 160ms ease, opacity 160ms ease;
  }

  .game-piece {
    width: 72px;
    height: 72px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.54);
    box-shadow: 0 14px 28px rgba(65, 29, 89, 0.14), inset 0 1px 0 rgba(255,255,255,0.9);
    animation: bobPop 3.2s ease-in-out infinite;
  }

  .game-piece:hover,
  .clutter-patch:hover {
    transform: scale(1.1) rotate(3deg);
  }

  .game-piece.star::before {
    width: 52px;
    aspect-ratio: 1;
    background: linear-gradient(145deg, #ffe18f, #ffc857);
    clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 80% 92%, 50% 70%, 20% 92%, 32% 57%, 2% 35%, 39% 35%);
    filter: drop-shadow(0 8px 10px rgba(255, 200, 87, 0.22));
  }

  .game-piece.cloud::before {
    width: 58px;
    height: 34px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 28% 64%, #ffffff 0 15px, transparent 16px),
      radial-gradient(circle at 50% 38%, #ffffff 0 19px, transparent 20px),
      radial-gradient(circle at 72% 64%, #ffffff 0 15px, transparent 16px);
    box-shadow: 0 10px 16px rgba(110, 120, 170, 0.12);
  }

  .game-piece.candy::before {
    width: 54px;
    height: 34px;
    border-radius: 18px;
    background:
      repeating-linear-gradient(45deg, #ff9bd1 0 9px, #fff1f8 9px 18px),
      #ff9bd1;
    box-shadow: -14px 0 0 #ffc7a8, 14px 0 0 #bdeed2;
  }

  .level-card {
    display: grid;
    gap: 8px;
    padding: 14px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.46);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .clear-meter {
    height: 16px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .clear-meter span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff9bd1, #b9b5ff, #8ee4ff);
    transition: width 220ms ease;
  }

  .garden-bed {
    min-height: 360px;
    background:
      linear-gradient(180deg, transparent 0 52%, rgba(189, 238, 210, 0.42) 52%),
      radial-gradient(circle at 40% 18%, rgba(255,255,255,0.44), transparent 26%);
  }

  .garden-bloom {
    width: 58px;
    height: 92px;
    background: transparent;
    animation: growIn 280ms ease both, gameFloat 4s ease-in-out infinite;
  }

  .garden-bloom::before {
    left: 26px;
    bottom: 0;
    width: 7px;
    height: 52px;
    border-radius: 999px;
    background: linear-gradient(180deg, #83d9aa, #4fbf84);
  }

  .garden-bloom::after {
    left: 5px;
    top: 0;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 50% 50%, #ffd983 0 8px, transparent 9px),
      radial-gradient(circle at 50% 16%, var(--bloom-color, #ff9bd1) 0 12px, transparent 13px),
      radial-gradient(circle at 84% 50%, var(--bloom-color, #ff9bd1) 0 12px, transparent 13px),
      radial-gradient(circle at 50% 84%, var(--bloom-color, #ff9bd1) 0 12px, transparent 13px),
      radial-gradient(circle at 16% 50%, var(--bloom-color, #ff9bd1) 0 12px, transparent 13px);
    box-shadow: 0 10px 16px rgba(65, 29, 89, 0.12);
  }

  .potion-lab {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(220px, 1.1fr);
    gap: 16px;
    align-items: stretch;
  }

  .potion-bottle {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 350px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.32);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
  }

  .bottle {
    width: 150px;
    height: 238px;
    position: relative;
    overflow: hidden;
    border: 7px solid rgba(255, 255, 255, 0.78);
    border-radius: 58px 58px 36px 36px;
    background: rgba(255, 255, 255, 0.36);
    box-shadow: 0 18px 38px rgba(58, 20, 82, 0.16), inset 0 1px 0 rgba(255,255,255,0.9);
  }

  .bottle::before {
    content: "";
    position: absolute;
    left: 30px;
    top: 22px;
    width: 22px;
    height: 92px;
    border-radius: 999px;
    background: rgba(255,255,255,0.34);
    z-index: 2;
  }

  .bottle-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    transition: height 240ms ease, background 240ms ease;
  }

  .bottle-bubble {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.68);
    animation: bubbleRise 2.5s ease-in-out infinite;
  }

  .potion-ingredients {
    display: grid;
    gap: 10px;
  }

  .ingredient-button {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 157, 205, 0.3);
    border-radius: 20px;
    padding: 12px;
    color: #111;
    background: rgba(255, 255, 255, 0.48);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }

  .ingredient-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(52, 22, 76, 0.12);
  }

  .swatch {
    width: 34px;
    height: 34px;
    border-radius: 13px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .sweep-zone {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.12), rgba(189, 238, 210, 0.24)),
      radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5), transparent 34%);
  }

  .clutter-patch {
    width: 92px;
    height: 76px;
    border-radius: 32px;
    background:
      radial-gradient(circle at 28% 36%, rgba(255,255,255,0.66) 0 10px, transparent 11px),
      radial-gradient(circle at 62% 58%, rgba(255,255,255,0.5) 0 8px, transparent 9px),
      linear-gradient(145deg, #c9a7ff, #ffb2d6);
    box-shadow: 0 16px 28px rgba(65, 29, 89, 0.14);
    animation: clutterWiggle 4s ease-in-out infinite;
  }

  .clutter-patch.dust {
    background:
      radial-gradient(circle at 25% 35%, rgba(255,255,255,0.72) 0 10px, transparent 11px),
      linear-gradient(145deg, #d6c3ef, #b9b5ff);
  }

  .clutter-patch.smudge {
    background:
      radial-gradient(circle at 70% 38%, rgba(255,255,255,0.58) 0 9px, transparent 10px),
      linear-gradient(145deg, #ffc7a8, #ff9bd1);
  }

  .clutter-patch::before {
    left: 18px;
    top: 22px;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #3f2146;
    box-shadow: 28px 0 0 #3f2146;
  }

  .clutter-patch::after {
    left: 34px;
    top: 42px;
    width: 24px;
    height: 10px;
    border-bottom: 3px solid #3f2146;
    border-radius: 0 0 999px 999px;
  }

  .clean-star {
    position: absolute;
    width: 22px;
    aspect-ratio: 1;
    background: #ffd983;
    clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 80% 92%, 50% 70%, 20% 92%, 32% 57%, 2% 35%, 39% 35%);
    animation: miniTwinkle 2.3s ease-in-out infinite;
  }

  .game-celebration {
    position: absolute;
    inset: 0;
    z-index: 8;
    display: grid;
    place-items: center;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255,255,255,0.64), transparent 54%);
    animation: celebrateFade 1.55s ease both;
  }

  .celebration-card {
    display: grid;
    justify-items: center;
    gap: 8px;
    min-width: min(320px, 80vw);
    padding: 20px;
    border-radius: 28px;
    background: linear-gradient(145deg, rgba(255, 242, 248, 0.94), rgba(226, 222, 255, 0.9));
    box-shadow: 0 22px 52px rgba(65, 29, 89, 0.2), 0 0 34px rgba(255, 157, 205, 0.28);
  }

  .celebration-card strong {
    font-family: "Fredoka", "Nunito", sans-serif;
    font-size: clamp(1.35rem, 4vw, 2rem);
  }

  .confetti-row {
    display: flex;
    gap: 8px;
  }

  .confetti-row span {
    width: 18px;
    height: 18px;
    border-radius: 7px;
    background: var(--confetti, #ff9bd1);
    animation: confettiBounce 720ms ease-in-out infinite alternate;
  }

  .confetti-row span:nth-child(2) { --confetti: #ffd983; animation-delay: 80ms; }
  .confetti-row span:nth-child(3) { --confetti: #b9b5ff; animation-delay: 160ms; }
  .confetti-row span:nth-child(4) { --confetti: #91e7c4; animation-delay: 240ms; }

  @keyframes gameFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes bobPop {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
  }

  @keyframes growIn {
    from { opacity: 0; transform: translateY(18px) scale(0.72); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes bubbleRise {
    0%, 100% { transform: translateY(8px); opacity: 0.42; }
    50% { transform: translateY(-8px); opacity: 1; }
  }

  @keyframes clutterWiggle {
    0%, 100% { rotate: -1deg; }
    50% { rotate: 2deg; }
  }

  @keyframes celebrateFade {
    0% { opacity: 0; transform: scale(0.96); }
    16%, 78% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.02); }
  }

  @keyframes confettiBounce {
    from { transform: translateY(0) rotate(0); }
    to { transform: translateY(-10px) rotate(12deg); }
  }

  @media (max-width: 980px) {
    .games-grid,
    .potion-lab {
      grid-template-columns: 1fr;
    }

    .game-stage {
      min-height: auto;
    }
  }
`;

const popKinds = ["heart", "star", "cloud", "candy", "heart", "star", "cloud", "candy", "star", "heart", "cloud", "candy"];
const clutterKinds = ["dust", "smudge", "dust", "blob", "smudge", "dust", "blob", "smudge"];
const bloomColors = ["#ff9bd1", "#c9a7ff", "#ffc7a8", "#9ec8ff", "#91e7c4", "#ffd983"];

function randomPosition(index: number) {
  return {
    left: `${7 + ((index * 23) % 76)}%`,
    top: `${8 + ((index * 31) % 72)}%`,
  };
}

function buildItems(kinds: string[], seed = 0): PlacedItem[] {
  return kinds.map((kind, index) => ({ kind, id: `${kind}-${Date.now()}-${seed}-${index}`, ...randomPosition(index + seed) }));
}

function Celebration({ message }: { message: string }) {
  return (
    <div className="game-celebration">
      <div className="celebration-card">
        <div className="confetti-row"><span /><span /><span /><span /></div>
        <BrainMascot size="sm" mood="happy" />
        <strong>{message}</strong>
        <span>DopamineDigital win unlocked</span>
      </div>
    </div>
  );
}

function GamesLauncher() {
  return (
    <div className="brand-page games-page">
      <style>{gamesStyles}</style>
      <section className="page-hero compact">
        <p className="section-kicker">Dopamine arcade</p>
        <h1>Mini games for busy brains</h1>
        <p className="hero-copy">Tiny playful resets for restless, foggy, anxious, or understimulated moments.</p>
        <BrainMascot className="page-hero-mascot" size="sm" mood="happy" />
      </section>

      <section className="games-grid" aria-label="Mini games">
        {gameCards.map((game) => (
          <Link className={`game-app-card ${game.color}`} key={game.id} to={`/games/${game.id}`}>
            <div className={`game-card-art ${game.iconClass}`} />
            <div>
              <h2>{game.title}</h2>
              <p>{game.subtitle}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function DopaminePop() {
  const [items, setItems] = useState(() => buildItems(popKinds));
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [celebration, setCelebration] = useState("");

  const pop = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setScore((value) => {
      const nextScore = value + 1;
      if (nextScore % 8 === 0) {
        setLevel((nextLevel) => nextLevel + 1);
        setCelebration(`Level ${level + 1}`);
        window.setTimeout(() => setCelebration(""), 1500);
      }
      return nextScore;
    });
  };

  const reset = () => {
    setItems(buildItems(popKinds, score + level));
    setScore(0);
    setLevel(1);
  };

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Dopamine Pop</h2>
          <p>Pop the glossy hearts, stars, clouds, and candies. Every 8 pops hits a celebration.</p>
        </div>
        <div className="game-stats">
          <span className="game-stat-pill">Level {level}</span>
          <span className="game-stat-pill">{score} popped</span>
        </div>
      </div>
      <div className="level-card">
        <div className="clear-meter" aria-label="Level progress">
          <span style={{ width: `${((score % 8) / 8) * 100}%` }} />
        </div>
        <small>{8 - (score % 8)} pops until next celebration</small>
      </div>
      <div className="play-zone">
        {items.map((item) => (
          <button className={`game-piece ${item.kind}`} key={item.id} onClick={() => pop(item.id)} style={{ left: item.left, top: item.top }} type="button" aria-label={`Pop ${item.kind}`} />
        ))}
        {items.length === 0 && <BrainMascot className="page-hero-mascot" size="md" mood="happy" />}
        {celebration && <Celebration message={celebration} />}
      </div>
      <div className="game-actions">
        <button className="primary-button" onClick={() => setItems(buildItems(popKinds, score + level))} type="button">More treats</button>
        <button className="secondary-button" onClick={reset} type="button">Restart</button>
      </div>
    </>
  );
}

function TinyWinsGarden() {
  const wins = ["one breath", "drink water", "soft shoulders", "tiny tidy", "kind thought", "open app"];
  const [blooms, setBlooms] = useState<Array<PlacedItem & { color: string }>>([]);
  const [celebration, setCelebration] = useState("");

  const addBloom = (index: number) => {
    setBlooms((current) => {
      const next = [
        ...current,
        {
          id: `${Date.now()}-${index}`,
          kind: "flower",
          color: bloomColors[(current.length + index) % bloomColors.length],
          ...randomPosition(current.length + index),
        },
      ];
      if (next.length > 0 && next.length % 5 === 0) {
        setCelebration(`${next.length} tiny wins`);
        window.setTimeout(() => setCelebration(""), 1500);
      }
      return next;
    });
  };

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Tiny Wins Garden</h2>
          <p>Tap one small win and grow a cartoon garden. It blooms every five wins.</p>
        </div>
        <div className="game-stats"><span className="game-stat-pill">{blooms.length} blooms</span></div>
      </div>
      <div className="garden-actions">
        {wins.map((win, index) => (
          <button className="secondary-button" key={win} onClick={() => addBloom(index)} type="button">{win}</button>
        ))}
      </div>
      <div className="play-zone garden-bed">
        <BrainMascot className="page-hero-mascot" size="md" mood="calm" />
        {blooms.map((bloom) => (
          <span
            className="garden-bloom flower"
            key={bloom.id}
            style={{ left: bloom.left, top: bloom.top, "--bloom-color": bloom.color } as CSSProperties}
          />
        ))}
        {celebration && <Celebration message={celebration} />}
      </div>
      <button className="glass-button compact" onClick={() => setBlooms([])} type="button">Clear garden</button>
    </>
  );
}

function MoodPotionLab() {
  const ingredients = [
    { name: "comfort", color: "#ff9bc9", label: "soft pink" },
    { name: "calm", color: "#9ec8ff", label: "periwinkle" },
    { name: "energy", color: "#ffd983", label: "peach glow" },
    { name: "softness", color: "#c9a7ff", label: "lavender" },
    { name: "reset", color: "#91e7c4", label: "mint reset" },
  ];
  const [mix, setMix] = useState<typeof ingredients>([]);
  const [celebration, setCelebration] = useState("");
  const potionName = useMemo(() => {
    if (mix.length === 0) return "Empty bottle";
    if (mix.some((item) => item.name === "calm") && mix.some((item) => item.name === "energy")) return "Calm Spark";
    if (mix.some((item) => item.name === "comfort") && mix.some((item) => item.name === "softness")) return "Soft Landing";
    if (mix.some((item) => item.name === "reset")) return "Fresh Start";
    return `${mix[mix.length - 1].name} potion`;
  }, [mix]);
  const fillColor = mix.length ? `linear-gradient(180deg, ${mix.map((item) => item.color).join(", ")})` : "transparent";

  const addIngredient = (ingredient: (typeof ingredients)[number]) => {
    setMix((current) => {
      const next = [...current, ingredient].slice(-5);
      if (next.length === 5) {
        setCelebration("Potion complete");
        window.setTimeout(() => setCelebration(""), 1500);
      }
      return next;
    });
  };

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Mood Potion Lab</h2>
          <p>Mix what your brain needs and make a tiny potion for the moment.</p>
        </div>
        <div className="game-stats"><span className="game-stat-pill">{potionName}</span></div>
      </div>
      <div className="potion-lab">
        <div className="potion-bottle">
          <div className="bottle" aria-label={potionName}>
            <span className="bottle-fill" style={{ height: `${Math.min(92, mix.length * 18)}%`, background: fillColor }} />
            {mix.map((_, index) => (
              <span className="bottle-bubble" key={index} style={{ left: `${36 + index * 14}px`, bottom: `${28 + index * 24}px`, animationDelay: `${index * 120}ms` }} />
            ))}
          </div>
          {celebration && <Celebration message={celebration} />}
        </div>
        <div className="potion-ingredients">
          {ingredients.map((ingredient) => (
            <button className="ingredient-button" key={ingredient.name} onClick={() => addIngredient(ingredient)} type="button">
              <span className="swatch" style={{ background: ingredient.color }} />
              <span>{ingredient.name}</span>
              <small>{ingredient.label}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="game-actions">
        <button className="primary-button" onClick={() => setMix([])} type="button">Start over</button>
      </div>
    </>
  );
}

function SparkleSweep() {
  const [items, setItems] = useState(() => buildItems(clutterKinds));
  const [level, setLevel] = useState(1);
  const [celebration, setCelebration] = useState("");
  const cleared = clutterKinds.length - items.length;
  const percent = Math.round((cleared / clutterKinds.length) * 100);

  const sweep = (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      if (next.length === 0) {
        setCelebration("Space cleared");
        setLevel((value) => value + 1);
        window.setTimeout(() => setCelebration(""), 1500);
      }
      return next;
    });
  };

  const scatter = () => setItems(buildItems(clutterKinds, level + cleared));

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Sparkle Sweep</h2>
          <p>Clean the sleepy clutter patches and reveal little shine spots underneath.</p>
        </div>
        <div className="game-stats">
          <span className="game-stat-pill">Level {level}</span>
          <span className="game-stat-pill">{percent}% clear</span>
        </div>
      </div>
      <div className="clear-meter" aria-label="Clear space meter"><span style={{ width: `${percent}%` }} /></div>
      <div className="play-zone sweep-zone">
        {[0, 1, 2, 3, 4].map((index) => (
          <span className="clean-star" key={index} style={{ ...randomPosition(index + 2), animationDelay: `${index * 140}ms` }} />
        ))}
        {items.map((item) => (
          <button className={`clutter-patch ${item.kind}`} key={item.id} onClick={() => sweep(item.id)} style={{ left: item.left, top: item.top }} type="button" aria-label="Clean clutter patch" />
        ))}
        {items.length === 0 && <BrainMascot className="page-hero-mascot" size="md" mood="happy" />}
        {celebration && <Celebration message={celebration} />}
      </div>
      <button className="primary-button" onClick={scatter} type="button">New sweep</button>
    </>
  );
}

export function GameTool() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const activeGame = gameCards.find((game) => game.id === gameId);

  if (!activeGame) return <GamesLauncher />;

  return (
    <div className="brand-page games-page">
      <style>{gamesStyles}</style>
      <section className="game-stage">
        <div className="game-topline">
          <button className="secondary-button" onClick={() => navigate("/games")} type="button">Back to games</button>
          <BrainMascot size="xs" mood="happy" />
        </div>
        {activeGame.id === "dopamine-pop" && <DopaminePop />}
        {activeGame.id === "tiny-wins-garden" && <TinyWinsGarden />}
        {activeGame.id === "mood-potion-lab" && <MoodPotionLab />}
        {activeGame.id === "sparkle-sweep" && <SparkleSweep />}
      </section>
    </div>
  );
}

export default GamesLauncher;
