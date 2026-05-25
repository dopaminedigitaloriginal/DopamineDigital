import BrainDump from "../components/BrainDump";
import BrainMascot from "../components/BrainMascot";

export default function Journal() {
  return (
    <div className="brand-page journal-page">
      <section className="page-hero compact journal-hero">
        <p className="section-kicker">Brain dump journal</p>
        <h1>Journal</h1>
        <p className="hero-copy">A dedicated space to empty your head, sort the noise, and come back lighter.</p>
        <BrainMascot className="page-hero-mascot" mood="sleepy" size="sm" />
      </section>

      <BrainDump variant="journal" />
    </div>
  );
}
