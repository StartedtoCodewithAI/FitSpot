import React, { useState, useEffect } from "react";

// Helper: Simple SVG Avatar generator
function AvatarSVG({ hair, eyes, nose, body, color }) {
  // Simple shapes for demo - you can expand as much as you like!
  const hairOptions = {
    short: <ellipse cx="80" cy="58" rx="35" ry="22" fill={color} />,
    long: <ellipse cx="80" cy="60" rx="38" ry="28" fill={color} />,
    bald: null,
    curly: <ellipse cx="80" cy="60" rx="38" ry="28" fill={color} stroke="#333" strokeDasharray="4 2"/>,
  };
  const eyeOptions = {
    blue: <>
      <circle cx="68" cy="90" r="7" fill="#fff"/>
      <circle cx="68" cy="90" r="3" fill="#4bc3ff"/>
      <circle cx="92" cy="90" r="7" fill="#fff"/>
      <circle cx="92" cy="90" r="3" fill="#4bc3ff"/>
    </>,
    brown: <>
      <circle cx="68" cy="90" r="7" fill="#fff"/>
      <circle cx="68" cy="90" r="3" fill="#a65a2a"/>
      <circle cx="92" cy="90" r="7" fill="#fff"/>
      <circle cx="92" cy="90" r="3" fill="#a65a2a"/>
    </>,
    green: <>
      <circle cx="68" cy="90" r="7" fill="#fff"/>
      <circle cx="68" cy="90" r="3" fill="#5ac84b"/>
      <circle cx="92" cy="90" r="7" fill="#fff"/>
      <circle cx="92" cy="90" r="3" fill="#5ac84b"/>
    </>,
  };
  const noseOptions = {
    small: <ellipse cx="80" cy="105" rx="2" ry="5" fill="#b97a56" />,
    medium: <ellipse cx="80" cy="105" rx="3" ry="7" fill="#b97a56" />,
    big: <ellipse cx="80" cy="105" rx="5" ry="8" fill="#b97a56" />,
  };
  const bodyOptions = {
    slim: <rect x="60" y="125" width="40" height="45" rx="20" fill="#b97a56" />,
    average: <rect x="55" y="125" width="50" height="50" rx="25" fill="#b97a56" />,
    athletic: <rect x="50" y="125" width="60" height="48" rx="30" fill="#b97a56" stroke="#333" strokeWidth="2"/>,
    strong: <rect x="45" y="125" width="70" height="50" rx="33" fill="#b97a56" stroke="#222" strokeWidth="3"/>,
  };

  return (
    <svg width="160" height="200" viewBox="0 0 160 200">
      {/* Head */}
      <ellipse cx="80" cy="90" rx="40" ry="48" fill="#fcd7b6" stroke="#b97a56" strokeWidth="2"/>
      {/* Hair */}
      {hairOptions[hair]}
      {/* Eyes */}
      {eyeOptions[eyes]}
      {/* Nose */}
      {noseOptions[nose]}
      {/* Body */}
      {bodyOptions[body]}
    </svg>
  );
}

const defaultProfile = {
  name: "",
  email: "",
  hair: "short",
  eyes: "brown",
  nose: "medium",
  body: "average",
  color: "#4B3E2A",
  goals: "",
  target: "",
};

const hairColors = [
  { value: "#4B3E2A", label: "Dark Brown" },
  { value: "#FFD700", label: "Blonde" },
  { value: "#9A4C1E", label: "Reddish" },
  { value: "#333", label: "Black" },
  { value: "#FFF", label: "White" },
  { value: "#7fd0fa", label: "Blue" },
  { value: "#ff62b6", label: "Pink" },
];

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fitspot_profile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = e => {
    e.preventDefault();
    localStorage.setItem("fitspot_profile", JSON.stringify(profile));
    setEditMode(false);
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: "3.5rem auto",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
      padding: "2.6rem 2.3rem",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>
      <div style={{ marginBottom: 22 }}>
        <AvatarSVG {...profile} />
      </div>
      {!editMode ? (
        <div>
          <h2 style={{ margin: 0 }}>{profile.name || "No Name"}</h2>
          <div style={{ color: "#64748b", marginBottom: 8 }}>{profile.email || "No Email"}</div>
          <div style={{ marginBottom: 14 }}>
            <strong>Goals:</strong>
            <div style={{ color: "#2563eb", fontWeight: 500 }}>
              {profile.goals ? profile.goals : <span style={{ color: "#aaa" }}>No goals set yet</span>}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <strong>Your Target:</strong>
            <div style={{ color: "#22c55e", fontWeight: 600 }}>
              {profile.target ? profile.target : <span style={{ color: "#aaa" }}>No target yet</span>}
            </div>
          </div>
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "1.1rem",
              padding: "0.5rem 1.6rem",
              marginTop: 10,
              cursor: "pointer"
            }}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              required
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              type="email"
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Hair</label>
              <select name="hair" value={profile.hair} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, marginTop: 4 }}>
                <option value="short">Short</option>
                <option value="long">Long</option>
                <option value="curly">Curly</option>
                <option value="bald">Bald</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Hair Color</label>
              <select name="color" value={profile.color} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, marginTop: 4 }}>
                {hairColors.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Eyes</label>
              <select name="eyes" value={profile.eyes} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, marginTop: 4 }}>
                <option value="brown">Brown</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Nose</label>
              <select name="nose" value={profile.nose} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, marginTop: 4 }}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="big">Big</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Body Type</label>
              <select name="body" value={profile.body} onChange={handleChange} style={{ width: "100%", padding: 7, borderRadius: 6, marginTop: 4 }}>
                <option value="slim">Slim</option>
                <option value="average">Average</option>
                <option value="athletic">Athletic</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Describe your goals</label>
            <textarea
              name="goals"
              value={profile.goals}
              onChange={handleChange}
              style={{ width: "100%", minHeight: 50, padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              placeholder="e.g. Lose 10kg, run a marathon, build muscle..."
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Set a target</label>
            <input
              name="target"
              value={profile.target}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              placeholder="e.g. 5 workouts per week"
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1.07rem",
                padding: "0.5rem 1.6rem",
                cursor: "pointer"
              }}
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              style={{
                background: "#f1f5f9",
                color: "#2563eb",
                border: "1px solid #2563eb",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1.07rem",
                padding: "0.5rem 1.6rem",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
