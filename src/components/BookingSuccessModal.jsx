// src/components/BookingSuccessModal.jsx
import React from 'react';

const BookingSuccessModal = ({
  isOpen,
  onClose,
  bookingCode,
  gymName,
  date,
  time,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "var(--color-bg-light, #FAF9FF)",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(108,71,255,0.09)",
          padding: "2.3rem 1.7rem 1.7rem 1.7rem",
          minWidth: "300px",
          maxWidth: "94vw",
          textAlign: "center",
          fontFamily: "'Poppins', Arial, sans-serif"
        }}
      >
        <h2 style={{
          color: "var(--color-primary, #6C47FF)",
          letterSpacing: 1,
          marginBottom: "1.2rem"
        }}>
          Booking Successful! 🎉
        </h2>
        {/* Show the funny message if provided */}
        {message && (
          <div style={{
            marginBottom: "1.4rem",
            color: "var(--color-accent, #E76BF3)",
            fontWeight: 600,
            fontSize: "1.08rem"
          }}>
            {message}
          </div>
        )}
        <p style={{margin:"0.5rem 0", color:"var(--color-primary-dark, #4B1FA4)"}}>
          <b>Gym:</b> {gymName}<br/>
          <b>Date:</b> {date}<br/>
          <b>Time:</b> {time}
        </p>
        <p style={{margin:"1.1rem 0 0.2rem 0"}}>
          <strong>Your Check-in Code:</strong>
          <br />
          <span style={{
            display: "inline-block",
            margin: "1rem 0",
            padding: "0.7rem 2rem",
            background: "var(--color-accent, #E76BF3)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "4px",
            boxShadow: "0 2px 12px #E76BF355"
          }}>
            {bookingCode}
          </span>
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            padding: "0.65rem 2.1rem",
            background: "var(--color-primary, #6C47FF)",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1.08rem",
            boxShadow: "0 1px 8px #6C47FF22",
            transition: "background 0.18s"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
