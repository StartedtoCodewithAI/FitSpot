import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9f9f9;
        }

        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #f0f4ff;
          padding: 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
        }

        .hero img {
          width: 90px;
          height: auto;
        }

        .hero-text {
          flex: 1;
          margin-left: 1.5rem;
        }

        .hero-text h1 {
          font-size: 2.5rem;
          color: #007bff;
          margin: 0 0 1rem;
        }

        .lead {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .cta {
          background-color: #007bff;
          border: none;
          color: white;
          padding: 0.9rem 2rem;
          border-radius: 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
        }

        .cta:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
        }

        .features {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .feature-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          flex: 1 1 calc(33% - 1rem);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .callToAction {
          background-color: #f0f4ff;
          padding: 2.5rem 1.5rem;
          border-radius: 20px;
          text-align: center;
          margin-top: auto;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .callToAction h2 {
          font-size: 1.8rem;
          margin-bottom: 1.2rem;
        }

        footer {
          text-align: center;
          font-size: 0.85rem;
          color: #777;
          padding: 1rem 0;
          border-top: 1px solid #ddd;
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 2rem 1rem;
          }

          .hero img {
            margin-bottom: 1rem;
          }

          .hero-text {
            margin-left: 0;
          }

          .hero-text h1 {
            font-size: 2rem;
          }

          .features {
            flex-direction: column;
          }

          .feature-card {
            flex: 1 1 100%;
          }

          .callToAction h2 {
            font-size: 1.5rem;
          }
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

        {/* Call to Action Section */}
        <section className="callToAction">
          <h2>Ready to get fit?</h2>
          <button className="cta">Create Account</button>
        </section>

        {/* Footer */}
        <footer>&copy; {new Date().getFullYear()} FitSpot. All rights reserved.</footer>
      </div>
    </>
  );
}
