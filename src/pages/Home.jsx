import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        body, #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .hero { ... } /* your existing hero styles */
        .features {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 3.5rem;
        }
        .feature-card { ... } /* your existing feature-card styles */
        footer {
          text-align: center;
          padding: 1.3rem 1rem 1.6rem 1rem;
          font-size: 0.93rem;
          color: #a0aec0;
          border-top: 1px solid #e5e7eb;
          background: transparent;
          margin-top: auto;
        }
        @media (max-width: 900px) {
          .features {
            flex-direction: column;
            gap: 1.6rem;
          }
        }
        @media (max-width: 600px) {
          .container { padding: 0 0.5rem; }
          .hero { padding: 1.2rem 0.7rem; margin: 1.5rem 0 2rem 0; }
          .features { flex-direction: column; gap: 1rem; }
          .feature-card { padding: 1rem 0.5rem; align-items: center; }
        }
      `}</style>
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <img src={logo} alt="FitSpot Logo" />
          <div className="hero-text">
            <h1>Welcome to FitSpot</h1>
            <p className="lead">
              Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
            </p>
            <button className="cta">Get Started</button>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="feature-card">
            <h3>No Memberships</h3>
            <p>Pay per session. No strings attached.</p>
          </div>
          <div className="feature-card">
            <h3>Find Nearby Gyms</h3>
            <p>Use GPS to locate gyms around you instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Instant Booking</h3>
            <p>Reserve your workout slot in seconds.</p>
          </div>
        </section>

        <footer>&copy; {new Date().getFullYear()} FitSpot. All rights reserved.</footer>
      </div>
    </>
  );
}
