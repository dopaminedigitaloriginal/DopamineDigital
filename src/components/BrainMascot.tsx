import brainMascot from "../assets/brain-mascot.png";

type BrainMascotProps = {
  className?: string;
  label?: string;
  mood?: "happy" | "calm" | "worried" | "sleepy";
  size?: "xs" | "sm" | "md" | "lg";
};

function BrainMascot({
  className = "",
  label = "DopamineDigital brain mascot",
  mood = "happy",
  size = "md",
}: BrainMascotProps) {
  return (
    <div className={`brain-mascot brain-mascot-${size} brain-mascot-${mood} ${className}`.trim()}>
      <img src={brainMascot} alt={label} />
    </div>
  );
}

export default BrainMascot;
