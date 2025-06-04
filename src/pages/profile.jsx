import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import axios from "axios";

export default function Profile() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = "user123"; // Replace with actual user ID logic in future

  useEffect(() => {
    async function fetchQR() {
      try {
        const response = await axios.post("https://fitspot-backend.up.railway.app/api/generate-token", {
          userId
        });
        setToken(response.data.token);
      } catch (err) {
        setError("Failed to generate QR code.");
      } finally {
        setLoading(false);
      }
    }

    fetchQR();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Your Daily Access QR</h1>
      {loading ? (
        <p>Generating QR code...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <p>Show this QR at the gym entrance. Valid for today only.</p>
          <QRCode value={token} size={256} />
        </>
      )}
    </div>
  );
}
