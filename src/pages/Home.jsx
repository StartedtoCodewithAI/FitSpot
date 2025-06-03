import React from "react";
import logo from "../FitSpot.png"; // path to your image in the root

export default function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center" }}>
      <img src={logo} alt="FitSpot Logo" style={{ maxWidth: "200px", margin: "1rem auto" }} />
      <section style={{ padding: "4rem 1rem", backgroundColor: "#f5f5f5" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome to FitSpot</h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>
          Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <button style={btnStyle}>Get Started</button>
        </div>
      </section>

      {/* rest of the content */}
    </div>
  );
}

const btnStyle = {
  padding: "1rem 2rem",
  fontSize: "1rem",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
