import React from "react";
import logo from "../assets/FitSpot.png"; // Make sure the path is correct

export default function Home() {
  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #f5f7fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #ffffff;
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #e9f0ff;
          padding: 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .hero img {
          width: 100px;
          height: auto;
          margin-bottom: 1rem;
        }

        .hero h1 {
          font-size: 2.5rem;
          color: #007bff;
          margin-bottom: 1rem;
          text-align: center;
        }

        .lead {
          font-size: 1.1rem;
          color: #444;
          text-align: center;
          max-width: 600px;
          margin-bottom: 1.5rem;
        }

        .cta {
          background-color: #007bff;
          border: none;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .cta:hover {
          background-color: #0056b3;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .feature-card h3 {
          margin-bottom: 0.5rem;
        }

        .callToAction {
          background-color: #f0f4ff;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .callToAction h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        footer {
          text-align: center;
          font-size: 0.85rem;
          color: #777;
          padding: 1.5rem 0;
          margin-top: auto;
        }

        @media (min-width: 768px) {
          .hero {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }

          .hero img {
            margin-bottom: 0;
            margin-right: 2rem;
          }

          .lead {
            text-align: left;
          }

          .features {
            flex-direction: row;
            justify-content: space-between;
          }

          .feature-card {
            flex: 1;
          }
        }
      `}</style>

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <img src={logo} alt="FitSpot Logo" />
          <div>
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

        {/* Call to Action */}
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
