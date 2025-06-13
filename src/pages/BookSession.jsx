import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

// Helper for generating a simple unique code
function generateCode(length = 6) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// Save booking in localStorage (demo)
function saveBooking(booking) {
  const key = "fitspot_bookings";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  prev.push(booking);
  localStorage.setItem(key, JSON.stringify(prev));
}

// Funny gym-themed sayings
const funnySayings = [
  "You crushed it, gym champ! 💪",
  "Booking done! Time to lift your spirits—and some weights!",
  "Look at you go! Gains are coming. 🏋️",
  "There you go, player! You did it 😉",
  "Booking confirmed: excuses cancelled. 🛑",
  "Time to get those reps in! 🏆",
  "Sweat now, shine later. Your journey starts!",
  "Flex mode activated. See you at the gym!",
  "Nice! Your muscles just sent a thank you card.",
  "Let’s get physical... at the gym! 🎶",
];
function getRandomSaying() {
  return funnySayings[Math.floor(Math.random() * funnySayings.length)];
}

export default function BookSession() {
  const { gymId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const gym = location.state?.gym;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [step, setStep] = useState("form"); // "form", "payment", "done"
  const [code, setCode] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Popup state
  const [showFunnyPopup, setShowFunnyPopup] = useState(false);
  const [funnyText, setFunnyText] = useState("");

  if (!gym) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Invalid Booking</h2>
        <p>No gym information found. Please return to the gym list.</p>
        <button
          onClick={() => navigate("/gyms")}
          style={{
            padding: "0.6rem 1.5rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 16,
          }}
        >
          Back to Gyms
        </button>
      </div>
    );
  }

  // Step 1: Booking Form
  if (step === "form") {
    return (
      <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
        <h2>
          Book a Session at <span style={{ color: "#2563eb" }}>{gym.name}</span>
        </h2>
        <div style={{ marginBottom: "1.5rem", color: "#555" }}>
          <div>
            <strong>Address:</strong> {gym.address || "n/a"}
          </div>
          <div>
            <strong>Phone:</strong> {gym.phone || "n/a"}
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            setStep("payment");
          }}
        >
          <label>
            Date: <br />
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ marginBottom: 12, padding: 6, width: "100%" }}
            />
          </label>
          <br />
          <label>
            Time of Arrival: <br />
            <input
              type="time"
              required
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ marginBottom: 20, padding: 6, width: "100%" }}
            />
          </label>
          <br />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #38bdf8, #2563eb)',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: '40px',
              padding: '1.1rem 2.4rem',
              marginTop: '1.3rem',
              boxShadow: '0 4px 16px #2563eb22',
              cursor: 'pointer',
              letterSpacing: '.06em',
              transition: 'background 0.2s, transform 0.1s',
              display: 'block',
              width: '100%'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #38bdf8)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8, #2563eb)'}
          >
            🚀 Closer to your goals!
          </button>
        </form>
        <button
          onClick={() => navigate("/gyms")}
          style={{
            marginTop: 24,
            background: "transparent",
            color: "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: 8,
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // Step 2: Fake Payment
  if (step === "payment") {
    return (
      <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h2>Payment</h2>
        <div style={{ margin: "1.4rem 0", color: "#444" }}>
          <div>
            <strong>Gym:</strong> {gym.name}
          </div>
          <div>
            <strong>Date:</strong> {date}
          </div>
          <div>
            <strong>Time:</strong> {time}
          </div>
        </div>
        <p>
          This is a demo payment screen.<br />
          <strong>Session Price:</strong> <span style={{ color: "#2563eb" }}>₹100</span>
        </p>
        <button
          onClick={() => {
            setIsPaying(true);
            setTimeout(() => {
              // Simulate payment and booking code generation
              const sessionCode = generateCode();
              setCode(sessionCode);
              saveBooking({
                gymId: gym.id,
                gym,
                date,
                time,
                code: sessionCode,
                created: new Date().toISOString(),
              });
              setIsPaying(false);
              // Show funny popup
              setFunnyText(getRandomSaying());
              setShowFunnyPopup(true);
              setTimeout(() => {
                setShowFunnyPopup(false);
                setStep("done");
              }, 2400); // Show popup for 2.4s then show confirmation
            }, 1200);
          }}
          disabled={isPaying}
          style={{
            padding: "0.8rem 2.2rem",
            background: isPaying ? "#93c5fd" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: isPaying ? "not-allowed" : "pointer",
            marginBottom: 16,
            marginTop: 16,
          }}
        >
          {isPaying ? "Processing..." : "Pay Now"}
        </button>
        <div>
          <button
            onClick={() => setStep("form")}
            disabled={isPaying}
            style={{
              background: "transparent",
              color: "#2563eb",
              border: "1px solid #2563eb",
              borderRadius: 8,
              padding: "0.45rem 1.5rem",
              fontWeight: 600,
              cursor: isPaying ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>
        </div>
        {/* FUNNY POPUP */}
        {showFunnyPopup && (
          <div
            style={{
              position: "fixed",
              top: "22vh",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              background: "linear-gradient(90deg,#fef08a,#a7f3d0)",
              color: "#713f12",
              padding: "1.2rem 2.1rem",
              borderRadius: 20,
              fontWeight: 800,
              fontSize: "1.35rem",
              boxShadow: "0 10px 32px #fde04755",
              animation: "pop-bounce 0.7s cubic-bezier(.36,1.56,.64,1) both"
            }}
            aria-live="polite"
          >
            🏋️‍♂️ {funnyText} 🏋️‍♀️
            <style>
              {`
                @keyframes pop-bounce {
                  0% { transform: scale(0.8); opacity: 0; }
                  60% { transform: scale(1.15); opacity: 1; }
                  100% { transform: scale(1); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Done - Show Unique Code
  if (step === "done") {
    return (
      <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h2>Booking Confirmed!</h2>
        <div style={{ margin: "1.1rem 0", color: "#444" }}>
          <div>
            <strong>Gym:</strong> {gym.name}
          </div>
          <div>
            <strong>Date:</strong> {date}
          </div>
          <div>
            <strong>Time:</strong> {time}
          </div>
        </div>
        <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: "2rem 0 1.1rem 0" }}>
          Your check-in code (show this at the gym):
        </p>
        <div style={{
          background: "#2563eb",
          color: "#fff",
          fontSize: "2.2rem",
          fontWeight: 900,
          borderRadius: 12,
          letterSpacing: "0.25em",
          padding: "18px",
          margin: "0 auto 1.7rem auto",
          maxWidth: 230,
          userSelect: "all",
        }}>
          {code}
        </div>
        <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem" }}>
          Saved to your bookings!
        </div>
        <button
          onClick={() => window.location.href = "/mycodes"}
          style={{
            marginTop: 28,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.7rem 2rem",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          View My Codes
        </button>
        <div>
          <button
            onClick={() => navigate("/gyms")}
            style={{
              marginTop: 16,
              background: "transparent",
              color: "#2563eb",
              border: "1px solid #2563eb",
              borderRadius: 8,
              padding: "0.5rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Gyms
          </button>
        </div>
      </div>
    );
  }

  return null;
}
