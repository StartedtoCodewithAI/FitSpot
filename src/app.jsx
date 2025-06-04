import React, { useState } from "react";

const gyms = [
  { id: "gym1", name: "Downtown Gym" },
  { id: "gym2", name: "Uptown Fitness" },
  { id: "gym3", name: "Beachside Gym" },
];

function App() {
  const [selectedGym, setSelectedGym] = useState("");
  const [code, setCode] = useState("");

  function generateCode() {
    if (!selectedGym) {
      alert("Please select a gym first!");
      return;
    }
    // Generate a simple one-time code (8 chars alphanumeric uppercase)
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(newCode);

    // TODO: send code + selectedGym to backend or DB for validation/storage
    // For now, just display it
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Generate One-Time Gym Access Code</h1>

      <label>
        Select your gym:
        <select
          value={selectedGym}
          onChange={(e) => {
            setSelectedGym(e.target.value);
            setCode(""); // reset code if gym changes
          }}
          style={{ marginLeft: 10 }}
        >
          <option value="">-- Select a Gym --</option>
          {gyms.map((gym) => (
            <option key={gym.id} value={gym.id}>
              {gym.name}
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: 20 }}>
        <button onClick={generateCode}>Generate Code</button>
      </div>

      {code && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 8,
            backgroundColor: "#f9f9f9",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Your Access Code:<br />
          <span style={{ color: "green" }}>{code}</span>
        </div>
      )}
    </div>
  );
}

export default App;
