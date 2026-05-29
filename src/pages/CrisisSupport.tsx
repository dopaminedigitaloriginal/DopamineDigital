import BrainMascot from "../components/BrainMascot";

type CrisisContact = {
  country: string;
  service: string;
  phone?: string;
  text?: string;
  details: string;
  url: string;
};

const crisisContacts: CrisisContact[] = [
  {
    country: "United Kingdom and ROI",
    service: "Samaritans",
    phone: "116 123",
    details: "Free emotional support, day or night.",
    url: "https://www.samaritans.org/how-we-can-help/contact-samaritan/",
  },
  {
    country: "United Kingdom",
    service: "Shout",
    text: "Text SHOUT to 85258",
    details: "Free, confidential text support when things feel too much.",
    url: "https://giveusashout.org/",
  },
  {
    country: "United States",
    service: "988 Suicide & Crisis Lifeline",
    phone: "988",
    text: "Text 988",
    details: "Call or text for 24/7 crisis support.",
    url: "https://988lifeline.org/",
  },
  {
    country: "Canada",
    service: "988 Suicide Crisis Helpline",
    phone: "988",
    text: "Text 988",
    details: "Call or text for suicide crisis support.",
    url: "https://988.ca/",
  },
  {
    country: "Australia",
    service: "Lifeline",
    phone: "13 11 14",
    text: "Text 0477 13 11 14",
    details: "24 hour crisis support and suicide prevention.",
    url: "https://www.lifeline.org.au/",
  },
  {
    country: "New Zealand",
    service: "1737 Need to Talk?",
    phone: "1737",
    text: "Text 1737",
    details: "Free call or text to speak with a trained counsellor.",
    url: "https://1737.org.nz/",
  },
  {
    country: "International",
    service: "Find a Helpline",
    details: "Search by country for mental health, crisis, and emotional support lines.",
    url: "https://findahelpline.com/",
  },
];

const crisisStyles = `
  .crisis-page {
    display: grid;
    gap: 18px;
    color: #111;
  }

  .crisis-hero {
    overflow: hidden;
    border: 1px solid rgba(255, 170, 210, 0.42);
    background:
      radial-gradient(circle at 14% 18%, rgba(255, 199, 220, 0.62), transparent 28%),
      radial-gradient(circle at 86% 18%, rgba(203, 210, 255, 0.62), transparent 30%),
      linear-gradient(145deg, rgba(255, 242, 248, 0.86), rgba(225, 222, 255, 0.76));
  }

  .urgent-support-card {
    display: grid;
    gap: 12px;
    padding: clamp(18px, 3vw, 26px);
    border: 1px solid rgba(255, 143, 199, 0.4);
    border-radius: 28px;
    background:
      radial-gradient(circle at 92% 14%, rgba(255, 255, 255, 0.62), transparent 26%),
      linear-gradient(145deg, rgba(255, 233, 244, 0.82), rgba(255, 246, 250, 0.66));
    box-shadow: 0 18px 42px rgba(54, 24, 80, 0.13);
  }

  .urgent-support-card h2,
  .crisis-contact-card h2 {
    margin: 0;
    font-family: "Fredoka", "Nunito", sans-serif;
    letter-spacing: 0;
  }

  .urgent-support-card p,
  .crisis-contact-card p {
    margin: 0;
    line-height: 1.5;
  }

  .crisis-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .crisis-contact-card {
    display: grid;
    gap: 12px;
    min-height: 220px;
    padding: 18px;
    border: 1px solid rgba(255, 170, 210, 0.38);
    border-radius: 26px;
    background:
      radial-gradient(circle at 88% 14%, rgba(255, 255, 255, 0.54), transparent 24%),
      linear-gradient(145deg, rgba(255, 245, 249, 0.72), rgba(228, 223, 255, 0.7));
    box-shadow: 0 16px 34px rgba(54, 24, 80, 0.12);
  }

  .crisis-country {
    width: fit-content;
    padding: 7px 11px;
    border-radius: 999px;
    color: #111;
    font-weight: 900;
    background: rgba(255, 255, 255, 0.56);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.78);
  }

  .crisis-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: auto;
  }

  .crisis-actions a {
    text-decoration: none;
  }

  .crisis-note {
    padding: 16px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.42);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.74);
  }

  @media (max-width: 820px) {
    .crisis-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function CrisisSupport() {
  return (
    <div className="brand-page crisis-page">
      <style>{crisisStyles}</style>

      <section className="page-hero compact crisis-hero">
        <p className="section-kicker">Immediate support</p>
        <h1>Crisis support</h1>
        <p className="hero-copy">
          If you or someone else might be in immediate danger, contact emergency services now.
          This page is a quick directory, not a replacement for professional or emergency help.
        </p>
        <BrainMascot className="page-hero-mascot" mood="calm" size="sm" />
      </section>

      <section className="urgent-support-card">
        <p className="section-kicker">If it feels urgent</p>
        <h2>Use emergency services first</h2>
        <p>
          If there is immediate danger, call your local emergency number such as 999, 911, 112,
          000, or the emergency number where you live.
        </p>
      </section>

      <section className="crisis-grid" aria-label="Crisis contacts">
        {crisisContacts.map((contact) => (
          <article className="crisis-contact-card" key={`${contact.country}-${contact.service}`}>
            <span className="crisis-country">{contact.country}</span>
            <div>
              <h2>{contact.service}</h2>
              <p>{contact.details}</p>
            </div>
            <div className="crisis-actions">
              {contact.phone && <a className="primary-button" href={`tel:${contact.phone.replaceAll(" ", "")}`}>Call {contact.phone}</a>}
              {contact.text && <span className="secondary-button">{contact.text}</span>}
              <a className="glass-button compact" href={contact.url} rel="noreferrer" target="_blank">Website</a>
            </div>
          </article>
        ))}
      </section>

      <section className="crisis-note">
        <p>
          Crisis services vary by country and region. If one number does not work, use emergency
          services or the international directory above to find local help.
        </p>
      </section>
    </div>
  );
}
