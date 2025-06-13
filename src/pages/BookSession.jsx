import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ... (any other imports you use)

export default function BookSession() {
  const location = useLocation();
  const navigate = useNavigate();

  // State and other variables
  const gym = location.state?.gym;
  const [step, setStep] = useState("form");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [code, setCode] = useState("");

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
          Back to Gyms
        </button>
      </div>
    );
  }

  // Step 2: Payment (simulate payment)
  if (step === "payment") {
    return (
      <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
        <h2>Confirm & Pay</h2>
        <div style={{ marginBottom: 24 }}>
          <div>
            <strong>Gym:</strong> {gym.name}
          </div>
          <div>
            <strong>Date:</strong> {date}
          </div>
          <div>
            <strong>Time:</strong> {time}
          </div>
          <div>
            <strong>Price:</strong> ${gym.price || "10"}
          </div>
        </div>
        <button
          onClick={() => {
            setIsPaying(true);
            setTimeout(() => {
              // Generate fake booking code
              const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              setCode(generatedCode);

              // Save booking to localStorage
              const prev = JSON.parse(localStorage.getItem("fitspot_bookings") || "[]");
              prev.push({
                code: generatedCode,
                gym,
                date,
                time,
                created: Date.now()
              });
              localStorage.setItem("fitspot_bookings", JSON.stringify(prev));

              setIsPaying(false);
              setShowModal(true);
              setModalMsg("Payment successful! Your session is booked.");
              setStep("done");
            }, 1800);
          }}
          disabled={isPaying}
          style={{
            background: isPaying
              ? "linear-gradient(90deg, #b6ccfa, #7fa7e4)"
              : "linear-gradient(90deg, #38bdf8, #2563eb)",
            color: "#fff",
            fontSize: '1.25rem',
            fontWeight: 800,
            border: 'none',
            borderRadius: '40px',
            padding: '1.1rem 2.4rem',
            marginBottom: 16,
            marginTop: 16,
            boxShadow: '0 4px 16px #2563eb22',
            cursor: isPaying ? "not-allowed" : "pointer",
            letterSpacing: '.06em',
            transition: 'background 0.2s, transform 0.1s',
            display: 'block',
            width: '100%'
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
          onClick={() => navigate("/mycodes")}
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
