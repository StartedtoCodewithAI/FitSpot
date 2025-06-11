import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        body {
          background: #f6f8fa;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }

        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .hero {
          display: flex;
          align-items: flex-start;
          gap: 2.5rem;
          background: #fff;
          padding: 3rem 2rem 2.5rem 2.5rem;
          border-radius: 24px;
          margin: 3rem 0 3.5rem 0;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
          position: relative;
        }

        .hero img {
          width: 120px;
          min-width: 120px;
          height: 120px;
          object-fit: contain;
          margin-right: 0.5rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,123,255,0.09);
          background: #f6f8fa;
        }

        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
        }

        .hero-text h1 {
          font-weight: 800;
          font-size: 2.75rem;
          margin-bottom: 1.1rem;
          color: #003366;
          letter-spacing: -1px;
        }

        .lead {
          font-size: 1.35rem;
          line-height: 1.65;
          color: #555;
          margin-bottom: 2.2rem;
          max-width: 440px;
        }

        button.cta {
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          color: white;
          padding: 1rem 2.25rem;
          border-radius: 32px;
          font-size: 1.12rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(59,130,246,0.09);
          transition: background 0.25s, transform 0.13s, box-shadow 0.25s;
          outline: none;
        }

        button.cta:hover, button.cta:active {
          background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 22px rgba(37,99,235,0.12);
        }

        section.features {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 3.5rem;
        }

        .feature-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          padding: 2rem 1.5rem 1.7rem 1.5rem;
          max-width: 270px;
          flex: 1 1 240px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 210px;
          transition: transform 0.15s, box-shadow 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-6px) scale(1.025);
          box-shadow: 0 8px 32px rgba(59,130,246,0.10);
        }

        .feature-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          font-size: 1.06rem;
          color: #444;
        }

        section.callToAction {
          margin-bottom: 3rem;
          background: linear-gradient(90deg, #eff6ff 60%, #dbeafe 100%);
          padding: 2.5rem 1rem 2.7rem 1rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 1px 12px rgba(0,0,0,0.03);
        }

        section.callToAction h2 {
          color: #1d4ed8;
          font-weight: 700;
          font-size: 2rem;
          margin-bottom: 1.3rem;
        }

        footer {
          text-align: center;
          padding: 1.3rem 1rem 1.6rem 1rem;
          font-size: 0.93rem;
          color: #a0aec0;
          border-top: 1px solid #e5e7eb;
          background: transparent;
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem 1.2rem;
          }
          .hero img {
            margin-bottom: 1rem;
            margin-right: 0;
          }
          .hero-text {
            text-align: left;
            align-items: flex-start;
          }
          section.features {
            flex-direction: column;
            gap: 1.6rem;
          }
        }

        @media (max-width: 600px) {
          .container {
            padding: 0 0.5rem;
          }
          .hero {
            padding: 1.2rem 0.7rem;
            margin: 1.5rem 0 2rem 0;
          }
          .hero img {
            width: 80px;
            height: 80px;
            min-width: 80px;
          }
          .hero-text h1 {
            font-size: 1.8rem;
          }
          .lead {
            font-size: 1.04rem;
            max-width: 100%;
          }
          .feature-card {
            padding: 1.1rem 0.8rem 1rem 0.8rem;
            min-width: unset;
            max-width: unset;
          }
          section.callToAction {
            padding: 1.4rem 0.5rem 1.7rem 0.5rem;
          }
          section.callToAction h2 {
            font-size: 1.3rem;
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
