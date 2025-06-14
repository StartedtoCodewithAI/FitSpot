import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export default function BookSession() {
  const { gymId } = useParams();
  const location = useLocation();

  // Try to get these from state if passed from previous page
  const initialGymName = location.state?.gymName || "";
  const initialTeamName = location.state?.teamName || "";

  const [gymName, setGymName] = useState(initialGymName);
  const [teamName, setTeamName] = useState(initialTeamName);

  // You could fetch real gym data here if not present
  useEffect(() => {
    if (!gymName && gymId) {
      // Simulate fetch. Replace with your real fetch logic!
      // e.g., fetch(`/api/gyms/${gymId}`).then(...)
      setTimeout(() => {
        setGymName("Demo Gym " + gymId);
        setTeamName("Default Team");
      }, 400); // Simulate loading
    }
  }, [gymId, gymName]);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [oneTimeCode, setOneTimeCode] = useState('');

  // Handle loading if fetching gym info
  if (!gymName) {
    return (
      <div style={{
        maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 16px #6C47FF11", padding: 28, textAlign: "center"
      }}>
        <h2 style={{ color: "#6C47FF" }}>Loading gym info...</h2>
      </div>
    );
  }

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
