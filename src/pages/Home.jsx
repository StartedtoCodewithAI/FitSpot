import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fitspotLogo from "../assets/FitSpot.png";
import FSButton from "../components/FSButton";

export default function Home({ user }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <style>{`
        .modal-content {
          position: relative;
          max-width: 95vw;
        }
        .modal-content h2 {
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
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
                <FSButton className="cta" onClick={handleGetStarted}>Get Started</FSButton>
              ) : (
                <>
                  <p style={{ fontWeight: 500, margin: "1.2rem 0 1.5rem 0" }}>
                    Welcome back, <span style={{ color: "#6C47FF" }}>{user.email}</span>!
                  </p>
                  <FSButton className="cta" onClick={() => navigate("/gyms")}>
                    Explore Gyms
                  </FSButton>
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
              <FSButton className="nav-btn" onClick={() => navigate("/signup")}>
                Sign Up
              </FSButton>
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
            <FSButton
              className="cta"
              onClick={() => {
                setShowModal(false);
                navigate("/login");
              }}
            >
              Login to your account
            </FSButton>
            <br />
            <FSButton
              className="cta"
              variant="secondary"
              style={{ background: "#008000" }}
              onClick={() => {
                setShowModal(false);
                navigate("/signup");
              }}
            >
              Sign up if there is no account
            </FSButton>
          </div>
        </div>
      )}
    </>
  );
}
