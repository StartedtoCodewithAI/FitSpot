import React from "react";
import logo from "../assets/FitSpot.png";

export default function Home() {
  return (
    <>
      <style>{`
        /* Reset and base */
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background-color: #f0f2f5;
          color: #333;
        }

        /* Container with padding and max width */
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* Header group pushed near the top */
        .header-group {
          margin-top: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          flex-shrink: 0;
        }

        /* Logo style */
        .logo {
          max-width: 150px;
          margin: 0 auto 1rem;
          display: block;
        }

        /* Main heading */
        h1 {
          font-weight: 700;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          /* No color here to avoid global blue */
        }

        /* Main title only blue */
        h1.main-title {
          color: #007bff;
        }

        /* Subtitle/description */
        p.lead {
          font-size: 1.15rem;
          color: #555;
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }

        /* Primary action button */
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
          margin: 1.5rem auto 3rem;
          display: block;
          max-width: 200px;
          width: 100%;
        }

        button.cta:hover {
          background-color: #0056b3;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,86,179,0.4);
        }

        /* Features section */
        section.features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        /* Feature cards */
        section.features > div {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
          text-align: center;
          max-width: 350px;
          margin: 0 auto;
          transition: transform 0.3s ease;
          color: #333; /* Ensure text color is neutral */
        }

        section.features > div:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        /* CTA section */
        section.callToAction {
          background-color: #f5f5f5;
          padding: 2rem 1rem;
          border-radius: 15px;
          text-align: center;
          max-width: 400px;
          margin: 0 auto 3rem;
          color: #222;
        }

        section.callToAction h2 {
          margin-bottom: 1rem;
          font-size: 1.8rem;
          font-weight: 600;
        }

        /* Footer */
        footer {
          text-align: center;
          padding: 2rem 1rem;
          font-size: 0.9rem;
          color: #888;
          border-top: 1px solid #ddd;
          background: #fff;
          margin-top: auto;
        }

        /* Responsive adjustments */
        @media(min-width: 600px) {
          /* For tablets & up: features in row */
          section.features {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>

      <div className="container">
        {/* Logo + Welcome Text + Button near top */}
        <div className="header-group">
          <img src={logo} alt="FitSpot Logo" className="logo" />
          <h1 className="main-title">Welcome to FitSpot</h1>
          <p className="lead">
            Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
          </p>
          <button className="cta">Get Started</button>
        </div>

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
