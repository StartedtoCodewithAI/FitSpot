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
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
      />
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
              <button className="nav-btn" onClick={() => navigate("/signup")}>
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
