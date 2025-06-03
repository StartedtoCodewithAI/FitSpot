import React from "react";

const gyms = [
  { id: 1, name: "FitSpot Gym Downtown", address: "123 Main St", rating: 4.5 },
  { id: 2, name: "PowerHouse Gym", address: "456 Elm St", rating: 4.7 },
  { id: 3, name: "Muscle Factory", address: "789 Oak St", rating: 4.3 },
];

export default function Gyms() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Nearby Gyms</h1>
      <div style={{ display: "grid", gap: "1rem", maxWidth: "600px", margin: "auto" }}>
        {gyms.map((gym) => (
          <div key={gym.id} style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <h2>{gym.name}</h2>
            <p>{gym.address}</p>
            <p>Rating: {gym.rating} ⭐</p>
          </div>
        ))}
      </div>
    </div>
  );
}
