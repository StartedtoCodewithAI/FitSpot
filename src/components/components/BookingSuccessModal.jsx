import React, { useEffect } from "react";
import confetti from "canvas-confetti";

export default function BookingSuccessModal({ open, message, onClose }) {
  useEffect(() => {
    if (open) {
      // Fire confetti effect!
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(16,23,42,0.35)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 36px #2563eb44",
        padding: "2.5rem 2rem 2rem",
        maxWidth: 390,
        width: "90%",
        textAlign: "center",
        position: "relative",
        animation: "pop-in .4s cubic-bezier(.2,1.4,.4,1) 1"
      }}>
        <div style={{ fontSize: 54, marginBottom: 18 }}>🎉</div>
        <h2 style={{
          color: "#2563eb",
          fontWeight: 800,
          marginBottom: 8,
          fontSize: "2rem"
        }}>
          Booking Confirmed!
        </h2>
        <div style={{
          fontSize: "1.18rem",
          color: "#222",
          marginBottom: 15
        }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "linear-gradient(90deg,#2563eb,#38bdf8)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.09rem",
            border: "none",
            borderRadius: 10,
            padding: "0.7rem 2.2rem",
            marginTop: "1.1rem",
            boxShadow: "0 2px 8px #2563eb22",
            cursor: "pointer"
          }}
        >
          Close
        </button>
        <style>{`
          @keyframes pop-in {
            0% { transform: scale(0.7) translateY(60px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
