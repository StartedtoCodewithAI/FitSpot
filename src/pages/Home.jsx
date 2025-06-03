import React from "react";
import logo from "../../FitSpot.png";

export default function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "2rem" }}>
      {/* Logo */}
      <img src={logo} alt="FitSpot Logo" style={{ maxWidth: "200px", marginBottom: "2rem" }} />

      {/* Hero Section */}
      <section style={{ padding: "4rem 1rem", backgroundColor: "#f5f5f5" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome to FitSpot</h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto" }}>
          Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <button style={btnStyle}>Get Started</button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "3rem 1rem" }}>
        <h2>Why FitSpot?</h2>
        <div style={featuresContainer}>
          <div style={featureCard}>
            <h3>No Memberships</h3>
            <p>Pay per session. No strings attached.</p>
          </div>
          <div style={featureCard}>
            <h3>Find Nearby Gyms</h3>
            <p>Use GPS to locate gyms around you instantly.</p>
          </div>
          <div style={featureCard}>
            <h3>Instant Booking</h3>
            <p>Reserve your workout slot in seconds.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "3rem 1rem", backgroundColor: "#f5f5f5" }}>
        <h2>Ready to get fit?</h2>
        <button style={btnStyle}>Create Account</button>
      </section>

      {/* Footer */}
      <footer style={{ padding: "2rem", fontSize: "0.9rem", color: "#666" }}>
        &copy; {new Date().getFullYear()} FitSpot. All rights reserved.
      </footer>
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
  cursor: "pointer"
};

const featuresContainer = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: "2rem",
  flexWrap: "wrap",
  marginTop: "2rem"
};

const featureCard = {
  maxWidth: "250px",
  padding: "1rem",
  border: "1px solid #ddd",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};
