import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";

function stringToInitials(name) {
  if (!name) return "";
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setForm({
        name: parsed.name || "",
        email: parsed.email || "",
        avatar: parsed.avatar || ""
      });
    }
  }, []);

  function handleSave(e) {
    e.preventDefault();
    setUser(form);
    localStorage.setItem("user", JSON.stringify(form));
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || ""
      });
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>No profile found. Please <a href="/login">log in</a>.</p>
      </div>
    );
  }

  return (
    <>
      <div className="profile-card" style={{ overflow: "visible" }}>
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
            <SearchBar
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name"
            />
            <SearchBar
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
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
      </div>
    </>
  );
}
