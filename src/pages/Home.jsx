import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fitspotLogo from "../assets/FitSpot.png";
import { supabase } from "../supabaseClient";
import FSButton from "../components/FSButton";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  async function handleFacebookLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
    });
    if (error) {
      alert("Facebook login failed: " + error.message);
    }
  }

  return (
    <>
      {/* Fonts and global styles for scroll/box-sizing fixes */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body, #root {
          width: 100vw;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          font-family: 'Montserrat', Arial, sans-serif;
          background: linear-gradient(120deg, #f8fafc 0%, #e0f2fe 100%);
          min-height: 100vh;
        }
        *, *:before, *:after { box-sizing: border-box; }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .container {
          max-width: 430px;
          margin: 0 auto;
          padding: 2.5rem 1rem 0 1rem;
          flex: 1;
          width: 100%;
        }
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 2rem;
        }
        .hero-logo {
          width: 140px;
          height: 140px;
          margin-bottom: 1.5rem;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          background: #fff;
        }
        .hero-text h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .lead {
          font-size: 1.17rem;
          margin-bottom: 1.5rem;
          color: #444;
        }
        .features {
          margin-bottom: 3rem;
        }
        .features-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.2rem;
        }
        .feature-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          padding: 1.2rem 1rem;
          min-width: 180px;
          max-width: 290px;
          text-align: center;
          flex: 1 1 220px;
        }
        .feature-card h3 {
          font-size: 1.12rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          color: #555;
          font-size: 0.98rem;
        }
        .callToAction {
          text-align: center;
          margin: 2rem 0;
        }
        .center-btn-row {
          display: flex;
          justify-content: center;
        }
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: #fff;
          border-radius: 18px;
          padding: 2rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          min-width: 300px;
          max-width: 95vw;
          text-align: center;
          position: relative;
        }
        .modal-content h2 {
          margin-bottom: 1.2rem;
          font-size: 1.2rem;
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
        .fb-btn {
          background: #4267B2 !important;
          color: #fff !important;
          margin-top: 8px;
        }
        @media (max-width: 540px) {
          .container {
            max-width: 98vw;
            padding: 1.5rem 2vw 0 2vw;
          }
          .hero-logo {
            width: 90px;
            height: 90px;
          }
          .hero-text h1 {
            font-size: 1.5rem;
          }
          .features-row {
            gap: 0.5rem;
          }
          .feature-card {
            max-width: 100%;
            min-width: 110px;
            padding: 1rem 0.3rem;
          }
        }
        footer {
          border-top: 1px solid #ddd;
          background: #fff;
          text-align: center;
          padding: 1rem 0;
          margin-top: auto;
          font-size: 0.99rem;
          color: #666;
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
            <FSButton
              className="fb-btn"
              onClick={handleFacebookLogin}
            >
              Continue with Facebook
            </FSButton>
            <FSButton
              className="cta"
              style={{ background: "#008000", color: "#fff" }}
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
