import React, { useState, useEffect } from "react";

const demoUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  avatar: "",
  bookings: [
    { id: 1, gym: "PowerGym Downtown", date: "2025-06-12", time: "10:00" },
    { id: 2, gym: "CrossFit Zone", date: "2025-06-09", time: "18:30" },
  ],
};

function stringToInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });

  // Load user from localStorage or fallback to demoUser
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setForm({ name: parsed.name, email: parsed.email, avatar: parsed.avatar || "" });
    } else {
      setUser(demoUser);
      setForm({ name: demoUser.name, email: demoUser.email, avatar: demoUser.avatar || "" });
    }
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave(e) {
    e.preventDefault();
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    setEditing(false);
  }

  function handleCancel() {
    setForm({ name: user.name, email: user.email, avatar: user.avatar || "" });
    setEditing(false);
  }

  if (!user) return null;

  return (
    <>
      <style>{/* ...your existing CSS here... */}</style>
      <div className="profile-card">
        {user.avatar ? (
          <img className="avatar" src={user.avatar} alt="Avatar" />
        ) : (
          <div className="avatar">{stringToInitials(user.name)}</div>
        )}
        {!editing ? (
          <>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <label style={{ color: "#007bff", cursor: "pointer", fontSize: "1rem" }}>
              Change avatar
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </label>
            {form.avatar && (
              <img
                src={form.avatar}
                alt="avatar preview"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  marginLeft: 10,
                  verticalAlign: "middle",
                  objectFit: "cover",
                  border: "2px solid #e0e7ef"
                }}
              />
            )}
            <div>
              <button className="save-btn" type="submit">
                Save
              </button>
              <button className="cancel-btn" type="button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="bookings-list">
          <h3>Booking History</h3>
          {user.bookings && user.bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            (user.bookings || []).map((b) => (
              <div className="booking-item" key={b.id}>
                <strong>{b.gym}</strong><br />
                {b.date} at {b.time}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
