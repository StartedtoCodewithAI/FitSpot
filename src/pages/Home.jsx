import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        .container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1rem;
          text-align: center;
        }

        h1 {
          font-weight: 600;
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #007bff;
        }

        p.lead {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
          color: #555;
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
          margin-bottom: 3rem;
        }

        button.cta:hover {
          background-color: #0056b3;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,86,179,0.4);
        }

        section.features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        section.features > div {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
          max-width: 250px;
          flex: 1 1 250px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        section.features > div:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        section.callToAction {
          margin-bottom: 3rem;
        }

        footer {
          text-align: bottom;
          padding: 2rem 1rem;
          font-size: 0.9rem;
          color: #888;
          border-top: 1px solid #ddd;
          background: #fff;
        }

        @media (max-width: 600px) {
          h1 {
            font-size: 2.2rem;
          }

          section.features {
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      `}</style>

      <div className="container">
        {/* Logo */}
        <img
          src={logo}
          alt="FitSpot Logo"
          style={{ maxWidth: "200px", marginBottom: "2rem" }}
        />

        {/* Hero Section */}
        <section style={{ padding: "4rem 1rem", backgroundColor: "#f5f5f5", borderRadius: "15px" }}>
          <h1>Welcome to FitSpot</h1>
          <p className="lead">
            Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
          </p>
          <button className="cta">Get Started</button>
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

        {/* Call to Action Section */}
        <section className="callToAction" style={{ backgroundColor: "#f5f5f5", padding: "3rem 1rem", borderRadius: "15px" }}>
          <h2>Ready to get fit?</h2>
          <button className="cta">Create Account</button>
        </section>

        {/* Footer */}
        <footer>&copy; {new Date().getFullYear()} FitSpot. All rights reserved.</footer>
      </div>
    </>
  );
}
