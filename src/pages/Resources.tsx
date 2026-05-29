import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrainMascot from "../components/BrainMascot";

type ResourceTone = "adhd" | "anxiety" | "rsd";

type SupportResource = {
  title: string;
  body: string;
  explanation: string;
  steps: string[];
  tone: ResourceTone;
};

type ResourceGroup = {
  title: string;
  tone: ResourceTone;
  items: SupportResource[];
};

const resourceGroups: ResourceGroup[] = [
  {
    title: "ADHD Support",
    tone: "adhd",
    items: [
      {
        title: "5-Minute Start Rule",
        body: "Commit to just five minutes when a task feels impossible.",
        explanation: "This lowers the pressure to finish and gives your brain an easy doorway into momentum.",
        tone: "adhd",
        steps: [
          "Pick one task and make it smaller than feels reasonable.",
          "Set a timer for 5 minutes.",
          "Stop when the timer ends, or keep going if your brain has warmed up.",
        ],
      },
      {
        title: "Brain Dump Method",
        body: "Unload every open loop before trying to organize it.",
        explanation: "A brain dump creates external storage for noisy thoughts, reminders, tasks, and emotional loops.",
        tone: "adhd",
        steps: [
          "Write every thought without sorting it first.",
          "Circle anything urgent or time-sensitive.",
          "Move only the next 1-3 actions into today.",
        ],
      },
      {
        title: "Pomodoro Focus",
        body: "Work in 25-minute bursts, then reset your nervous system.",
        explanation: "Timed focus gives your attention a container, while breaks protect your energy from all-or-nothing burnout.",
        tone: "adhd",
        steps: [
          "Choose one specific focus target.",
          "Start a 25-minute timer and remove one obvious distraction.",
          "Take a 5-minute reset before deciding what comes next.",
        ],
      },
    ],
  },
  {
    title: "Anxiety / Calming",
    tone: "anxiety",
    items: [
      {
        title: "4-7-8 Breathing",
        body: "Inhale for 4, hold for 7, exhale for 8.",
        explanation: "Longer exhales can send your body a gentle signal that you are not in immediate danger.",
        tone: "anxiety",
        steps: [
          "Breathe in through your nose for 4 counts.",
          "Hold softly for 7 counts.",
          "Exhale slowly for 8 counts, then repeat 3 times.",
        ],
      },
      {
        title: "Grounding",
        body: "Name 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.",
        explanation: "Grounding pulls attention out of the spiral and back into the present moment using your senses.",
        tone: "anxiety",
        steps: [
          "Look around and name 5 things you can see.",
          "Notice 4 things you can physically feel.",
          "Finish with 3 sounds, 2 smells, and 1 taste or slow breath.",
        ],
      },
      {
        title: "Thought Defusion",
        body: "Name the thought instead of becoming the thought.",
        explanation: "Defusion creates space between you and the anxious story, so the thought becomes something you notice rather than obey.",
        tone: "anxiety",
        steps: [
          "Write the thought exactly as it appears.",
          "Say, I am noticing the thought that...",
          "Ask what action would support you, even if the thought is loud.",
        ],
      },
    ],
  },
  {
    title: "RSD Support",
    tone: "rsd",
    items: [
      {
        title: "Emotional Reset",
        body: "Feelings are real, but they are not always facts.",
        explanation: "RSD can make emotional pain feel like proof. This reset validates the feeling while slowing the conclusion.",
        tone: "rsd",
        steps: [
          "Name the feeling without judging it.",
          "Put one hand on your chest and take 3 slow breaths.",
          "Ask: what else could be true here?",
        ],
      },
      {
        title: "Pause Before Reaction",
        body: "Wait 10-15 minutes before replying from the spike.",
        explanation: "A pause protects your future self from sending a message while your nervous system is still alarmed.",
        tone: "rsd",
        steps: [
          "Draft the reply somewhere private, not in the chat.",
          "Set a 10-minute timer.",
          "Return and send only what still feels kind, clear, and necessary.",
        ],
      },
      {
        title: "Reframe Thought",
        body: "Ask what else this situation could mean.",
        explanation: "Reframing helps your brain consider softer explanations before it locks onto rejection as the only answer.",
        tone: "rsd",
        steps: [
          "Write the rejection story your brain is telling.",
          "List one neutral explanation and one kind explanation.",
          "Choose the next action from the kindest realistic version.",
        ],
      },
    ],
  },
];

const connectLinks = [
  { label: "Crisis Support", url: "/crisis-support", external: false },
  { label: "Shop Dopamine Digital", url: "https://payhip.com/DopamineDigital", external: true },
  { label: "ADHD TikTok Content", url: "https://www.tiktok.com/@dopaminedigital_", external: true },
  { label: "Instagram", url: "https://www.instagram.com/dopaminedigital_", external: true },
  { label: "Facebook Page", url: "https://www.facebook.com/profile.php?id=61589892487838", external: true },
];

const supportLibraryStyles = `
  .support-library-page {
    position: relative;
  }

  .support-library-page .resources-hero {
    overflow: hidden;
    border: 1px solid rgba(255, 176, 221, 0.24);
    background:
      radial-gradient(circle at 12% 18%, rgba(255, 143, 199, 0.22), transparent 34%),
      radial-gradient(circle at 82% 24%, rgba(147, 187, 255, 0.18), transparent 32%),
      linear-gradient(145deg, rgba(74, 34, 102, 0.62), rgba(39, 22, 65, 0.7));
    box-shadow: 0 22px 60px rgba(30, 12, 54, 0.28);
  }

  .support-resource-card {
    width: 100%;
    min-height: 178px;
    cursor: pointer;
    text-align: left;
    border: 1px solid rgba(255, 205, 232, 0.28);
    color: #111;
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }

  .support-resource-card:hover {
    transform: translateY(-4px) scale(1.015);
    border-color: rgba(255, 143, 199, 0.66);
    box-shadow: 0 18px 42px rgba(255, 143, 199, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.24) inset;
  }

  .support-resource-card:focus-visible {
    outline: 3px solid rgba(255, 143, 199, 0.75);
    outline-offset: 4px;
  }

  .resource-section.adhd .support-resource-card:hover .resource-card-art {
    animation: dopaminePop 700ms ease both;
  }

  .resource-section.anxiety .support-resource-card .resource-card-art {
    animation: breathingGlow 4.2s ease-in-out infinite;
  }

  .resource-section.rsd .support-resource-card:hover .resource-card-art {
    animation: comfortGlow 1.8s ease-in-out infinite;
  }

  .resource-section.adhd .resource-card-art {
    background: radial-gradient(circle, #ffe78a 0 24%, #ff9ccc 25% 44%, transparent 45%);
  }

  .resource-section.anxiety .resource-card-art {
    background: radial-gradient(circle, #bde7ff 0 28%, #c8b9ff 29% 48%, transparent 49%);
  }

  .resource-section.rsd .resource-card-art {
    background: radial-gradient(circle at 45% 40%, #ff9fc8 0 24%, #ffd5e6 25% 46%, transparent 47%);
  }

  .support-card-action {
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
    color: #111;
    font-weight: 800;
    opacity: 0.78;
  }

  .support-library-page .connect-card {
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }

  .support-library-page .connect-card:hover {
    transform: translateY(-4px);
    border-color: rgba(147, 187, 255, 0.58);
    box-shadow: 0 18px 42px rgba(147, 187, 255, 0.18);
  }

  .support-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10020;
    display: grid;
    place-items: center;
    padding: 22px;
    background:
      radial-gradient(circle at 22% 20%, rgba(255, 143, 199, 0.32), transparent 32%),
      radial-gradient(circle at 82% 78%, rgba(142, 186, 255, 0.22), transparent 36%),
      rgba(24, 13, 43, 0.74);
    backdrop-filter: blur(16px);
    animation: supportFadeIn 180ms ease both;
  }

  .support-modal {
    width: min(560px, 100%);
    max-height: min(760px, 88vh);
    overflow: auto;
    border: 1px solid rgba(255, 205, 232, 0.42);
    border-radius: 30px;
    padding: clamp(22px, 4vw, 34px);
    color: #111;
    background:
      radial-gradient(circle at 86% 16%, rgba(255, 255, 255, 0.54), transparent 28%),
      linear-gradient(145deg, rgba(255, 231, 242, 0.96), rgba(225, 219, 255, 0.94));
    box-shadow: 0 28px 80px rgba(15, 8, 31, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.72);
    animation: supportModalIn 220ms ease both;
  }

  .support-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }

  .support-modal-header h2 {
    margin: 4px 0 0;
    font-size: clamp(1.35rem, 4vw, 2rem);
  }

  .support-modal p {
    color: #111;
  }

  .support-step-list {
    display: grid;
    gap: 12px;
    padding: 0;
    margin: 18px 0 24px;
    list-style: none;
  }

  .support-step-list li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: center;
    padding: 14px;
    border: 1px solid rgba(255, 143, 199, 0.3);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.44);
  }

  .support-step-list span {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    color: #111;
    font-weight: 900;
    background: linear-gradient(135deg, #ff9fcc, #b9c8ff);
  }

  .support-modal-footer {
    display: flex;
    justify-content: flex-end;
  }

  @keyframes dopaminePop {
    0%, 100% { transform: translateY(0) scale(1); }
    35% { transform: translateY(-6px) scale(1.08); }
    65% { transform: translateY(2px) scale(0.98); }
  }

  @keyframes breathingGlow {
    0%, 100% { transform: scale(0.96); filter: drop-shadow(0 0 4px rgba(189, 231, 255, 0.28)); }
    50% { transform: scale(1.06); filter: drop-shadow(0 0 14px rgba(189, 231, 255, 0.56)); }
  }

  @keyframes comfortGlow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 159, 200, 0.32)); }
    50% { filter: drop-shadow(0 0 18px rgba(255, 159, 200, 0.6)); }
  }

  @keyframes supportFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes supportModalIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 640px) {
    .support-resource-card {
      min-height: 150px;
    }

    .support-modal-backdrop {
      padding: 14px;
      align-items: end;
    }

    .support-modal {
      max-height: 86vh;
      border-radius: 26px 26px 18px 18px;
    }
  }
`;

export default function Resources() {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState<SupportResource | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const openLink = (url: string, external = false) => {
    if (external) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(url);
  };

  return (
    <div className="brand-page support-library-page">
      <style>{supportLibraryStyles}</style>

      <section className="page-hero compact resources-hero">
        <p className="section-kicker">Support library</p>
        <h1>Resources</h1>
        <p className="hero-copy">Bright, practical resets for ADHD, anxiety, emotional spikes, and getting unstuck.</p>
        <BrainMascot className="page-hero-mascot" mood="happy" size="sm" />
      </section>

      <section className="resource-library">
        {resourceGroups.map((group) => (
          <article className={"resource-section " + group.tone} key={group.title}>
            <div className="section-heading-row">
              <div>
                <p className="section-kicker">Resource set</p>
                <h2>{group.title}</h2>
              </div>
            </div>

            <div className="resource-card-grid">
              {group.items.map((item) => (
                <button
                  className="resource-card support-resource-card"
                  key={item.title}
                  onClick={() => setSelectedResource(item)}
                  type="button"
                >
                  <div className="resource-card-art" />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="support-card-action">Open reset</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="connect-panel">
        <div>
          <p className="section-kicker">Connect</p>
          <h2>DopamineDigital links</h2>
        </div>

        <div className="connect-grid">
          {connectLinks.map((link) => (
            <button className="connect-card" key={link.label} onClick={() => openLink(link.url, link.external)} type="button">
              <span>{link.label}</span>
              <strong>{link.external ? "Open" : "View"}</strong>
            </button>
          ))}
        </div>
      </section>

      {selectedResource && (
        <div className="support-modal-backdrop" onClick={() => setSelectedResource(null)}>
          <section
            className={"support-modal " + selectedResource.tone}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            <header className="support-modal-header">
              <div>
                <p className="section-kicker">Try this now</p>
                <h2 id="support-modal-title">{selectedResource.title}</h2>
              </div>
              <button className="secondary-button" onClick={() => setSelectedResource(null)} type="button">Close</button>
            </header>

            <p>{selectedResource.explanation}</p>

            <ol className="support-step-list">
              {selectedResource.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>

            <div className="support-modal-footer">
              <button className="primary-button" onClick={() => setSelectedResource(null)} type="button">Done</button>
            </div>
          </section>
        </div>
      )}

      {activeUrl && (
        <div className="resource-viewer-backdrop" onClick={() => setActiveUrl(null)}>
          <section className="resource-viewer" onClick={(event) => event.stopPropagation()}>
            <header>
              <span>DopamineDigital viewer</span>
              <button className="secondary-button" onClick={() => setActiveUrl(null)} type="button">Close</button>
            </header>
            <iframe src={activeUrl} title="in-app-browser" />
          </section>
        </div>
      )}
    </div>
  );
}
