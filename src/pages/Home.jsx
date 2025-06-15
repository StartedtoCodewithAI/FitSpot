import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fitspotLogo from "../assets/FitSpot.png";
import { supabase } from "../supabaseClient"; // Adjust this import if needed

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Supabase login state effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setUser(sessionData?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  function handleGetStarted() {
    setShowModal(true);
  }

  function handleCloseModal(e) {
    if (
      e.target.className === "modal-backdrop" ||
      e.target.className === "close-modal"
    ) {
      setShowModal(false);
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
          font-family: 'Montserrat', Arial, sans-serif;
        }
        .page-wrapper, .container, .hero, .features, .callToAction, footer {
          font-family: 'Montserrat', Arial, sans-serif;
        }
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
          display: block !important;
        }
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
          text-align: center;
          width: 100%;
        }
        .hero-logo {
          width: 185px;
          height: 185px;
          border-radius: 50%;
          object-fit: cover;
          background: #e0e7ef;
        }
        .hero-text h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .lead {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          color: #444;
          font-weight: 400;
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
          font-family: 'Montserrat', Arial, sans-serif;
        }
        .cta:hover {
          background: #003d80;
          box-shadow: 0 8px 15px rgba(0,86,179,0.4);
        }
        /* Updated features section */
        section.features {
          width: 100%;
          margin: 0 auto 3rem auto;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .features-row {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 2rem;
          max-width: 980px;
          margin: 0 auto 0 auto;
          width: 100%;
          flex-wrap: wrap;
        }
        .feature-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
          text-align: center;
          min-width: 220px;
          max-width: 320px;
          flex: 1 1 220px;
          margin-bottom: 0;
          transition: transform 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        @media (max-width: 900px) {
          .features-row {
            flex-direction: column;
            gap: 1.5rem;
          }
          .feature-card {
            margin: 0 auto;
            max-width: 98vw;
          }
        }
        section.callToAction {
          margin-bottom: 3rem;
          background-color: #f5f5f5;
          padding: 3rem 1rem;
          border-radius: 15px;
          text-align: center;
          width: 100%;
          display: block;
        }
        .callToAction .center-btn-row {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .callToAction .center-btn-row .cta {
          margin: 0 auto;
          display: block;
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
        @media (max-width: 600px) {
          .hero {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .hero-logo {
            margin-bottom: 1rem;
          }
          .hero-text h1 {
            font-size: 2.2rem;
          }
        }
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
          <section className="hero">
            <img src={fitspotLogo} alt="FitSpot Logo" className="hero-logo" />
            <div className="hero-text">
              <h1>Welcome to FitSpot</h1>
              <p className="lead">
                Book your workout spot instantly. Anytime. Anywhere. Just like Uber — but for gyms.
              </p>
              {!user ? (
                <button className="cta" onClick={handleGetStarted}>Get Started</button>
              ) : (
                <>
                  <p style={{ fontWeight: 500, margin: "1.2rem 0 1.5rem 0" }}>
                    Welcome back, <span style={{ color: "#6C47FF" }}>{user.email}</span>!
                  </p>
                  <button className="cta" onClick={() => navigate("/gyms")}>
                    Explore Gyms
                  </button>
                </>
              )}
            </div>
          </section>
          <section className="features">
            <div className="features-row">
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
            </div>
          </section>
        </div>
        {!user && (
          <section className="callToAction">
            <h2>Ready to start your fitness journey?</h2>
            <div className="center-btn-row">
              <button className="cta" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>
          </section>
        )}
        <footer>
          &copy; 2025 FitSpot. All rights reserved.
        </footer>
      </div>
      {showModal && !user && (
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
