import React, { useState } from "react";

// Dummy initial user data (simulate what might come from an API or localStorage)
const initialUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  avatar: "", // Leave blank for initials
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
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSave(e) {
    e.preventDefault();
    setUser({ ...user, ...form });
    setEditing(false);
  }

  function handleCancel() {
    setForm({ name: user.name, email: user.email });
    setEditing(false);
  }

  return (
    <>
      <style>{`
        .profile-card {
          max-width: 420px;
          margin: 2.5rem auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 2rem 2.5rem 2.5rem 2.5rem;
          text-align: center;
        }
        .avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: #e0e7ef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.6rem;
          color: #336699;
          margin: 0 auto 1rem auto;
          object-fit: cover;
        }
        .profile-card h2 {
          margin-bottom: 0.3rem;
        }
        .profile-card p {
          margin-bottom: 1.2rem;
          color: #777;
        }
        .profile-card form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }
        .profile-card input {
          font-size: 1rem;
          padding: 0.55rem;
          border-radius: 9px;
          border: 1px solid #c3dafc;
          width: 90%;
        }
        .profile-card .edit-btn,
        .profile-card .save-btn {
          background: #0056b3;
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 0.55rem 1.8rem;
          font-size: 1rem;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        .profile-card .save-btn {
          background: #008000;
        }
        .profile-card .cancel-btn {
          background: #ccc;
          color: #222;
          border: none;
          border-radius: 20px;
          padding: 0.55rem 1.8rem;
          font-size: 1rem;
          cursor: pointer;
        }
        .bookings-list {
          text-align: left;
          margin-top: 2.2rem;
        }
        .bookings-list h3 {
          margin-bottom: 0.9rem;
        }
        .booking-item {
          background: #f6fafe;
          padding: 0.8rem 1.1rem;
          border-radius: 11px;
          margin-bottom: 0.7rem;
          font-size: 1rem;
        }
      `}</style>
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
          {user.bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            user.bookings.map((b) => (
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
