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
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body, #root,
        .page-wrapper,
        .container,
        section,
        .callToAction,
        footer,
        .modal-content {
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        .page-wrapper,
        .callToAction,
        footer,
        section {
          width: 100vw !important;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem 0 1rem;
          flex: 1;
          width: 100%;
          box-sizing: border-box;
        }
        .callToAction {
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        * {
          min-width: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        body {
          font-family: 'Montserrat', Arial, sans-serif;
        }
        .page-wrapper {
          display: flex;
          flex-direction: column;
          background: linear-gradient(120deg, #f8fafc 0%, #e0f2fe 100%);
          width: 100%;
          box-sizing: border-box;
        }
        .hero {
          display: flex;
        }
        .features {
          padding: 3rem 1rem;
          border-radius: 15px;
          text-align: center;
          width: 100%;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
        }
        .callToAction .center-btn-row {
          width: 100%;
        }
        footer {
          border-top: 1px solid #ddd;
          background: #fff;
          flex-shrink: 0;
          width: 100%;
          box-sizing: border-box;
        }
        .modal-content .cta, .modal-content .fb-btn {
          margin: 0.7rem 0;
          width: 220px;
          max-width: 90vw;
          min-width: 120px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .modal-content .fb-btn {
          background: #4267B2 !important;
          color: #fff !important;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.6rem 1rem;
          transition: background 0.2s;
        }
        .modal-content .fb-btn:hover {
          background: #35508a !important;
        }
        @media (max-width: 600px) {
          .hero-logo {
            margin-bottom: 1rem;
            width: 90%;
            height: auto;
            max-width: 180px;
          }
          .hero-text h1 {
            font-size: 2.2rem;
          }
          .features-row {
            flex-direction: column;
            gap: 1rem;
            max-width: 100%;
            width: 100%;
          }
          .feature-card {
            max-width: 100%;
            min-width: 0;
            width: 100%;
          }
        }
        .feature-card, p, pre, code {
          word-break: break-word;
          overflow-wrap: break-word;
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
            <FSButton
              className="fb-btn"
              style={{
                background: "#4267B2",
                color: "#fff",
                marginTop: "10px",
              }}
              onClick={handleFacebookLogin}
            >
              Continue with Facebook
            </FSButton>
            <br />
            <FSButton
              className="cta"
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
