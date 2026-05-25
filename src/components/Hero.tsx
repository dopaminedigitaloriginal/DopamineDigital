import logo from "../assets/logo.png";

function Hero() {
  return (
    <div>
      <img
        src={logo}
        alt="logo"
        style={{ width: "280px", marginBottom: "20px" }}
      />

      <h1 style={{ fontSize: "60px", margin: "10px 0" }}>
        Brain on Loud
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8 }}>
        A calmer digital space for overwhelmed brains.
      </p>
    </div>
  );
}

export default Hero;