import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [used, setUsed] = useState(false);
  const [error, setError] = useState(null);

  // Simulated user profile (replace with real auth data in production)
  useEffect(() => {
    const storedUser = {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
    };
    setUser(storedUser);
  }, []);

  // Generate one-time QR token on mount
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split("T")[0]; // e.g. "2025-06-04"
      const uniqueToken = `${user.id}-${today}`;

      // Call backend to register this token
      axios
        .post("https://fitspot-backend-url/api/generate", {
          token: uniqueToken,
          userId: user.id,
          date: today,
        })
        .then(() => {
          setToken(uniqueToken);
        })
        .catch((err) => {
          setError("Failed to generate token");
          console.error(err);
        });
    }
  }, [user]);

  if (!user) return <p>Loading user...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome, {user.name}</h1>
      <p>Your daily access code is below. Show it at the gym entrance.</p>

      {token && !used ? (
        <div style={{ margin: "2rem auto", width: "fit-content" }}>
          <QRCode value={token} size={256} />
          <p style={{ marginTop: "1rem" }}>Valid only for today and one-time use.</p>
        </div>
      ) : (
        <p>This code has been used or is no longer valid.</p>
      )}
    </div>
  );
}
