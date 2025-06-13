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
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          padding: "2rem",
          minWidth: "300px",
          maxWidth: "90vw",
          textAlign: "center"
        }}
      >
        <h2>Booking Successful!</h2>
        {/* Show the funny message if provided */}
        {message && (
          <div style={{
            marginBottom: "1.5rem",
            color: "#2563eb",
            fontWeight: 600,
            fontSize: "1.1rem"
          }}>
            {message}
          </div>
        )}
        <p>
          <strong>Gym:</strong> {gymName}<br/>
          <strong>Date:</strong> {date}<br/>
          <strong>Time:</strong> {time}
        </p>
        <p>
          <strong>Your Check-in Code:</strong>
          <br />
          <span style={{
            display: "inline-block",
            margin: "1rem 0",
            padding: "0.5rem 1rem",
            background: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "1.5rem",
            letterSpacing: "2px"
          }}>
            {bookingCode}
          </span>
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
