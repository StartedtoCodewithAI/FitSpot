import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo192.png"; // Or adjust path if needed

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  function handleGetStarted() {
    setShowModal(true);
  }

  function handleCloseModal(e) {
    // Close if background or close button is clicked
    if (e.target.className === "modal-backdrop" || e.target.className === "close-modal") {
      setShowModal(false);
    }
  }

  return (
    <>
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(120deg, #f8fafc 0%, #e0f2fe 100%);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem 0 1rem;
          flex: 1;
        }
        .hero {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .hero img {
          width: 120px;
          height: 120px;
        }
        .hero-text h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .lead {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          color: #444;
        }
        .cta {
          background: #0056b3;
          color: #fff;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 30px;
          font-size: 1.1rem;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 10px rgba(0,86,179,0.18);
        }
        .cta:hover {
          background: #003d80;
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
        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.35);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: #fff;
          border-radius: 18px;
          padding: 2rem 2.2rem 1.6rem 2.2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          min-width: 300px;
          text-align: center;
          position: relative;
        }
        .modal-content h2 {
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }
        .modal-content .cta {
          margin: 0.7rem 0;
          width: 90%;
        }
        .close-modal {
          position: absolute;
          top: 0.7rem;
          right: 1.1rem;
          background: none;
          border: none;
          font-size: 1.6rem;
          color: #888;
          cursor: pointer;
        }
        .close-modal:hover {
          color: #0056b3;
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
              <button className="cta" onClick={handleGetStarted}>Get Started</button>
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
          <button className="cta" onClick={() => navigate("/signup")}>Sign Up</button>
        </section>

        {/* Footer */}
        <footer>
          &copy; 2025 FitSpot. All rights reserved.
        </footer>
      </div>

      {/* Modal for Get Started */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal} title="Close">&times;</button>
            <h2>Get Started</h2>
            <button
              className="cta"
              onClick={() => {
                setShowModal(false);
                navigate("/login");
              }}
            >
              Login to your account
            </button>
            <br />
            <button
              className="cta"
              style={{ background: "#008000" }}
              onClick={() => {
                setShowModal(false);
                navigate("/signup");
              }}
            >
              Sign up if there is no account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
