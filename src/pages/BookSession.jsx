import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BookingSuccessModal from '../components/BookingSuccessModal';
import { supabase } from '../supabaseClient';
import FSButton from "../components/FSButton";

export default function BookSession() {
  const { gymId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialGymName = location.state?.gymName || "";
  const initialTeamName = location.state?.teamName || "";

  const [gymName, setGymName] = useState(initialGymName);
  const [teamName, setTeamName] = useState(initialTeamName);

  useEffect(() => {
    if (!gymName && gymId) {
      setTimeout(() => {
        setGymName("Demo Gym " + gymId);
        setTeamName("Default Team");
      }, 400);
    }
  }, [gymId, gymName]);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [oneTimeCode, setOneTimeCode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("Current Supabase User (on load):", user, error);
    })();
  }, []);

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

  const handlePayment = async () => {
    setError("");
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      setError("Not logged in! Please sign in to book a session.");
      return;
    }

    // Insert into the correct table: 'codes'
    const { error: insertError } = await supabase
      .from("codes")
      .insert([{
        user_id: user.id,
        code,
        gym: gymId,
        date,
        time,
        used: false,
      }]);

    if (insertError) {
      setError("Failed to save booking: " + insertError.message);
      return;
    }

    setOneTimeCode(code);
    setModalOpen(true);
    setStep(4);
  };

  // Go to My Codes handler
  const goToMyCodes = () => navigate('/my-codes');

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #6C47FF11", padding: 28 }}>
      <h2 style={{ color: "#6C47FF" }}>Book a Session</h2>
      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#dc2626",
          padding: "0.8rem",
          borderRadius: 7,
          marginBottom: 16,
          textAlign: "center"
        }}>
          {error}
        </div>
      )}
      {step === 1 && (
        <>
          <div><b>Gym:</b> {gymName}</div>
          <div><b>Team:</b> {teamName}</div>
          <label style={{ display: "block", marginTop: 18 }}>Choose Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ fontSize: 16, padding: 6, borderRadius: 5, border: "1px solid #6C47FF" }} />
          <label style={{ display: "block", marginTop: 12 }}>Choose Time:</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ fontSize: 16, padding: 6, borderRadius: 5, border: "1px solid #6C47FF" }} />
          <FSButton
            disabled={!date || !time}
            onClick={handleNext}
            style={{
              marginTop: 24,
              fontWeight: 600,
              fontSize: 17,
              cursor: (!date || !time) ? "not-allowed" : "pointer"
            }}>
            Next
          </FSButton>
        </>
      )}
      {step === 2 && (
        <>
          <h4>Review Details</h4>
          <div>Gym: <b>{gymName}</b></div>
          <div>Team: <b>{teamName}</b></div>
          <div>Date: <b>{date}</b></div>
          <div>Time: <b>{time}</b></div>
          <FSButton
            onClick={handleNext}
            style={{
              marginTop: 24,
              fontWeight: 600,
              fontSize: 17
            }}>
            Proceed to Payment
          </FSButton>
        </>
      )}
      {step === 3 && (
        <>
          <h4>Payment</h4>
          <div style={{ marginBottom: 20 }}>Payment integration coming soon.<br />Click below to simulate payment.</div>
          <FSButton
            onClick={handlePayment}
            style={{
              marginTop: 8,
              fontWeight: 600,
              fontSize: 17
            }}>
            Pay &amp; Generate Code
          </FSButton>
        </>
      )}
      {step === 4 && (
        <>
          <h4>Booking Complete!</h4>
          <div>Your code will also be shown in a popup.</div>
          <FSButton
            onClick={goToMyCodes}
            style={{
              marginTop: 22,
              fontWeight: 700,
              fontSize: 17,
              padding: "0.8rem 2rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Go to My Codes
          </FSButton>
        </>
      )}
      <BookingSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookingCode={oneTimeCode}
        gymName={gymName}
        date={date}
        time={time}
        message="You're all set! Show this code at reception."
      />
    </div>
  );
}
