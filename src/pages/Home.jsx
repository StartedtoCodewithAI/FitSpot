import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem 0 0.5rem;
          flex: 1 0 auto;
          position: relative;
          left: -20px; /* Move everything a few pixels to the left */
        }
        .hero {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          background-color: #f5f5f5;
          padding: 2rem;
          border-radius: 15px;
          margin-bottom: 3rem;
        }
        .hero img {
          width: 100px;
          height: auto;
        }
        .hero-text {
          flex: 1;
        }
        .hero-text h1 {
          font-weight: 600;
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #007bff;
        }
        .lead {
          font-size: 1.25rem;
          line-height: 1.6;
          color: #555;
          margin-bottom: 2rem;
        }
        button.cta {
          background-color: #007bff;
          border: none;
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 30px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          box-shadow: 0 5px 10px rgba(0,123,255,0.3);
        }
        button.cta:hover {
          background-color: #0056b3;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,86,179,0.4);
        }
        section.features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        section.features > div {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
          max-width: 100%;
          text-align: center;
          transition: transform 0.3s ease;
        }
        section.features > div:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        section.callToAction {
          margin-bottom: 3rem;
          background-color: #f5f5f5;
          padding: 3rem 1rem;
          border-radius: 15px;
          text-align: center;
        }
        footer {
          text-align: center;
          padding: 2rem 1rem;
          font-size: 0.9rem;
          color: #888;
          border-top: 1px solid #ddd;
          background: #fff;
          flex-shrink: 0;
        }
        @media (min-width: 700px) {
          section.features {
            grid-template-columns: repeat(3, 1fr);
          }
          section.features > div {
            max-width: 250px;
            margin: 0 auto;
          }
        }
        @media (max-width: 600px) {
          .hero {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .hero img {
            margin-bottom: 1rem;
          }
          .hero-text h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
      <div className="page-wrapper">
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
            <div>
              <h3>No Memberships</h3>
              <p>Pay per session. No strings attached.</p>
            </div>
            <div>
              <h3>Find Nearby Gyms</h3>
              <p>Use GPS to locate gyms around you instantly.</p>
            </div>
            <div>
              <h3>Instant Booking</h3>
              <p>Reserve your workout slot in seconds.</p>
            </div>
          </section>
        </div>

        {/* Call to Action Section */}
        <section className="callToAction">
          <h2>Ready to start your fitness journey?</h2>
          <button className="cta">Sign Up</button>
        </section>

        {/* Footer */}
        <footer>
          &copy; 2025 FitSpot. All rights reserved.
        </footer>
      </div>
    </>
  );
}
