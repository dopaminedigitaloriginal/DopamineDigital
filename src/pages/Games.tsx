import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";

type GameId = "dopamine-pop" | "tiny-wins-garden" | "mood-potion-lab" | "sparkle-sweep";

const gameCards: Array<{
  id: GameId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}> = [
  {
    id: "dopamine-pop",
    title: "Dopamine Pop",
    subtitle: "Pop cute floating bits before they drift away.",
    icon: "✦",
    color: "pink",
  },
  {
    id: "tiny-wins-garden",
    title: "Tiny Wins Garden",
    subtitle: "Tap tiny wins and grow a soft brain garden.",
    icon: "✿",
    color: "green",
  },
  {
    id: "mood-potion-lab",
    title: "Mood Potion Lab",
    subtitle: "Mix pastel feelings into a little support potion.",
    icon: "◌",
    color: "blue",
  },
  {
    id: "sparkle-sweep",
    title: "Sparkle Sweep",
    subtitle: "Clear visual clutter and fill your calm meter.",
    icon: "⌁",
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
    min-height: 188px;
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
      radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.56), transparent 28%),
      linear-gradient(145deg, rgba(255, 234, 244, 0.76), rgba(225, 222, 255, 0.72));
    box-shadow: 0 16px 38px rgba(52, 22, 76, 0.14);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .game-app-card:hover {
    transform: translateY(-4px) scale(1.01);
    border-color: rgba(255, 105, 184, 0.66);
    box-shadow: 0 20px 44px rgba(52, 22, 76, 0.18), 0 0 22px rgba(255, 157, 205, 0.22);
  }

  .game-app-card::after {
    content: "";
    position: absolute;
    inset: auto 12px 12px auto;
    width: 72px;
    height: 72px;
    border-radius: 28px;
    opacity: 0.62;
    background: rgba(255, 255, 255, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .game-icon {
    position: relative;
    z-index: 1;
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    border-radius: 21px;
    font-size: 1.9rem;
    font-weight: 900;
    background: rgba(255, 255, 255, 0.62);
    box-shadow: 0 10px 22px rgba(65, 29, 89, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    animation: gameFloat 4.2s ease-in-out infinite;
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
    min-height: 560px;
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

  .game-stats {
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
    background: rgba(255, 255, 255, 0.56);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .play-zone {
    position: relative;
    min-height: 340px;
    overflow: hidden;
    border: 1px solid rgba(255, 157, 205, 0.28);
    border-radius: 30px;
    background:
      radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.44), transparent 28%),
      rgba(255, 255, 255, 0.28);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.74);
  }

  .pop-item,
  .sweep-item,
  .garden-bloom {
    position: absolute;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 160ms ease, opacity 160ms ease;
  }

  .pop-item {
    width: 58px;
    height: 58px;
    font-size: 1.7rem;
    background: rgba(255, 255, 255, 0.66);
    box-shadow: 0 12px 26px rgba(255, 120, 195, 0.18), inset 0 1px 0 rgba(255,255,255,0.9);
    animation: bobPop 3.2s ease-in-out infinite;
  }

  .pop-item:hover,
  .sweep-item:hover {
    transform: scale(1.12) rotate(4deg);
  }

  .garden-actions,
  .potion-actions,
  .game-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .garden-bed {
    min-height: 330px;
  }

  .garden-bloom {
    width: 50px;
    height: 50px;
    font-size: 1.45rem;
    background: rgba(255, 255, 255, 0.56);
    box-shadow: 0 10px 20px rgba(75, 42, 95, 0.12);
    animation: growIn 280ms ease both, gameFloat 4s ease-in-out infinite;
  }

  .potion-lab {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(220px, 1.1fr);
    gap: 16px;
    align-items: stretch;
  }

  .potion-bottle {
    display: grid;
    place-items: center;
    min-height: 330px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.32);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
  }

  .bottle {
    width: 142px;
    height: 224px;
    position: relative;
    overflow: hidden;
    border: 6px solid rgba(255, 255, 255, 0.72);
    border-radius: 54px 54px 34px 34px;
    background: rgba(255, 255, 255, 0.36);
    box-shadow: 0 18px 38px rgba(58, 20, 82, 0.16), inset 0 1px 0 rgba(255,255,255,0.9);
  }

  .bottle-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    transition: height 240ms ease, background 240ms ease;
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
    width: 28px;
    height: 28px;
    border-radius: 11px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .sweep-item {
    width: 54px;
    height: 54px;
    font-size: 1.5rem;
    background: rgba(255, 255, 255, 0.54);
    box-shadow: 0 10px 24px rgba(52, 22, 76, 0.12);
  }

  .clear-meter {
    height: 16px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .clear-meter span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff9bd1, #b9b5ff, #8ee4ff);
    transition: width 220ms ease;
  }

  @keyframes gameFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes bobPop {
    0%, 100% { translate: 0 0; }
    50% { translate: 0 -8px; }
  }

  @keyframes growIn {
    from { opacity: 0; transform: scale(0.72); }
    to { opacity: 1; transform: scale(1); }
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

const popSymbols = ["★", "♡", "☁", "✦", "✿", "◌", "☾", "◆", "✧", "❀", "⚡", "✩"];
const bloomSymbols = ["✿", "❀", "✦", "♡", "☁", "★", "✧", "☾"];
const sweepSymbols = ["✧", "⌁", "◌", "✦", "♡", "☁", "·", "★", "❀"];

function randomPosition(index: number) {
  return {
    left: `${8 + ((index * 23) % 78)}%`,
    top: `${8 + ((index * 31) % 76)}%`,
  };
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
            <div className="game-icon">{game.icon}</div>
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
  const [items, setItems] = useState(() => popSymbols.map((symbol, index) => ({ symbol, id: `${symbol}-${index}`, ...randomPosition(index) })));
  const [score, setScore] = useState(0);

  const pop = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setScore((value) => value + 1);
  };

  const reset = () => {
    setItems(popSymbols.map((symbol, index) => ({ symbol, id: `${symbol}-${Date.now()}-${index}`, ...randomPosition(index + score) })));
    setScore(0);
  };

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Dopamine Pop</h2>
          <p>Pop the cute floating bits. No words, no pressure, just satisfying tiny taps.</p>
        </div>
        <div className="game-stats"><span className="game-stat-pill">{score} popped</span></div>
      </div>
      <div className="play-zone">
        {items.map((item) => (
          <button className="pop-item" key={item.id} onClick={() => pop(item.id)} style={{ left: item.left, top: item.top }} type="button">
            {item.symbol}
          </button>
        ))}
        {items.length === 0 && <BrainMascot className="page-hero-mascot" size="md" mood="happy" />}
      </div>
      <div className="game-actions">
        <button className="primary-button" onClick={reset} type="button">New bubbles</button>
      </div>
    </>
  );
}

function TinyWinsGarden() {
  const wins = ["one breath", "drink water", "soft shoulders", "tiny tidy", "kind thought", "open app"];
  const [blooms, setBlooms] = useState<Array<{ id: string; symbol: string; left: string; top: string }>>([]);

  const addBloom = (index: number) => {
    setBlooms((current) => [
      ...current,
      { id: `${Date.now()}-${index}`, symbol: bloomSymbols[(current.length + index) % bloomSymbols.length], ...randomPosition(current.length + index) },
    ]);
  };

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Tiny Wins Garden</h2>
          <p>Tap one small win and let the garden grow. Small still counts.</p>
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
          <span className="garden-bloom" key={bloom.id} style={{ left: bloom.left, top: bloom.top }}>{bloom.symbol}</span>
        ))}
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
  const potionName = useMemo(() => {
    if (mix.length === 0) return "Empty bottle";
    if (mix.some((item) => item.name === "calm") && mix.some((item) => item.name === "energy")) return "Calm Spark";
    if (mix.some((item) => item.name === "comfort") && mix.some((item) => item.name === "softness")) return "Soft Landing";
    if (mix.some((item) => item.name === "reset")) return "Fresh Start";
    return `${mix[mix.length - 1].name} potion`;
  }, [mix]);
  const fillColor = mix.length ? `linear-gradient(180deg, ${mix.map((item) => item.color).join(", ")})` : "transparent";

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
          </div>
        </div>
        <div className="potion-ingredients">
          {ingredients.map((ingredient) => (
            <button className="ingredient-button" key={ingredient.name} onClick={() => setMix((current) => [...current, ingredient].slice(-5))} type="button">
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
  const [items, setItems] = useState(() => sweepSymbols.map((symbol, index) => ({ symbol, id: `${symbol}-${index}`, ...randomPosition(index) })));
  const cleared = sweepSymbols.length - items.length;
  const percent = Math.round((cleared / sweepSymbols.length) * 100);

  const sweep = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const reset = () => setItems(sweepSymbols.map((symbol, index) => ({ symbol, id: `${symbol}-${Date.now()}-${index}`, ...randomPosition(index + cleared) })));

  return (
    <>
      <div className="game-topline">
        <div>
          <h2>Sparkle Sweep</h2>
          <p>Tap away visual noise and fill the clear-space meter.</p>
        </div>
        <div className="game-stats"><span className="game-stat-pill">{percent}% clear</span></div>
      </div>
      <div className="clear-meter" aria-label="Clear space meter"><span style={{ width: `${percent}%` }} /></div>
      <div className="play-zone">
        {items.map((item) => (
          <button className="sweep-item" key={item.id} onClick={() => sweep(item.id)} style={{ left: item.left, top: item.top }} type="button">
            {item.symbol}
          </button>
        ))}
        {items.length === 0 && <BrainMascot className="page-hero-mascot" size="md" mood="happy" />}
      </div>
      <button className="primary-button" onClick={reset} type="button">Scatter sparkles</button>
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
