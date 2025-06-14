import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function BookSession() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [oneTimeCode, setOneTimeCode] = useState('');
  const location = useLocation();

  // Get gym/team from state or query (as per your app's logic)
  const gymName = (location.state && location.state.gymName) || "Selected Gym";
  const teamName = (location.state && location.state.teamName) || "Team A";

  const handleNext = () => setStep(step + 1);

  const handlePayment = () => {
    setTimeout(() => {
      setOneTimeCode(Math.random().toString(36).slice(2, 8).toUpperCase());
      setStep(4);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #6C47FF11", padding: 28 }}>
      <h2 style={{ color: "#6C47FF" }}>Book a Session</h2>
      {step === 1 && (
        <>
          <div><b>Gym:</b> {gymName}</div>
          <div><b>Team:</b> {teamName}</div>
          <label style={{ display: "block", marginTop: 18 }}>Choose Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ fontSize: 16, padding: 6, borderRadius: 5, border: "1px solid #6C47FF" }} />
          <label style={{ display: "block", marginTop: 12 }}>Choose Time:</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ fontSize: 16, padding: 6, borderRadius: 5, border: "1px solid #6C47FF" }} />
          <button
            disabled={!date || !time}
            onClick={handleNext}
            style={{
              background: "#6C47FF",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.4rem",
              marginTop: 24,
              fontWeight: 600,
              fontSize: 17,
              cursor: (!date || !time) ? "not-allowed" : "pointer"
            }}>
            Next
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <h4>Review Details</h4>
          <div>Gym: <b>{gymName}</b></div>
          <div>Team: <b>{teamName}</b></div>
          <div>Date: <b>{date}</b></div>
          <div>Time: <b>{time}</b></div>
          <button
            onClick={handleNext}
            style={{
              background: "#6C47FF",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.4rem",
              marginTop: 24,
              fontWeight: 600,
              fontSize: 17
            }}>
            Proceed to Payment
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <h4>Payment</h4>
          <div style={{ marginBottom: 20 }}>Payment integration coming soon.<br />Click below to simulate payment.</div>
          <button
            onClick={handlePayment}
            style={{
              background: "#6C47FF",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.4rem",
              marginTop: 8,
              fontWeight: 600,
              fontSize: 17
            }}>
            Pay &amp; Generate Code
          </button>
        </>
      )}
      {step === 4 && (
        <>
          <h4>Success!</h4>
          <div>Your one-time entry code:</div>
          <div style={{
            fontWeight: "bold",
            fontSize: 36,
            margin: "20px 0",
            background: "#E6E0F8",
            color: "#6C47FF",
            borderRadius: 10,
            padding: "10px 20px",
            letterSpacing: 2
          }}>{oneTimeCode}</div>
          <div>Show this code at the gym.<br />We’ll handle the rest!</div>
        </>
      )}
    </div>
  );
}
