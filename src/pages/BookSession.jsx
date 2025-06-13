import React, { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function BookSession() {
  const { gymId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const gym = location.state?.gym;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Handle missing gym info (e.g. direct URL entry)
  if (!gym) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Invalid Booking</h2>
        <p>No gym information found. Please return to the gym list.</p>
        <button
          onClick={() => navigate("/")}
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show booking details and proceed to next step (payment)
    // You may store booking info in localStorage as you add more steps
    alert(
      `Session booked at ${gym.name}\nDate: ${date}\nTime: ${time}\n\nNext: Add payment integration.`
    );
    // TODO: Save booking, redirect to payment, etc.
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
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
      <form onSubmit={handleSubmit}>
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
            padding: "0.7rem 2rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            marginTop: 12,
          }}
        >
          Proceed to Payment
        </button>
      </form>
      <button
        onClick={() => navigate("/")}
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
