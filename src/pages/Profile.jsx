import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast"; // Make sure to have react-hot-toast installed

const defaultProfile = {
  name: "",
  email: "",
  goals: "",
  targetLabel: "",
  targetTotal: "",
  currentProgress: 0,
  progressLog: [],
  avatar_url: "",
};

const MOTIVATION = [
  { pct: 0, msg: "Let's get started! Every step counts." },
  { pct: 25, msg: "You're making progress! Keep it up!" },
  { pct: 50, msg: "Halfway there! Stay strong!" },
  { pct: 75, msg: "Almost at your target. Finish strong!" },
  { pct: 100, msg: "Congratulations! Target achieved! 🎉" }
];

function getMotivationalMsg(pct) {
  if (pct >= 100) return MOTIVATION[4].msg;
  if (pct >= 75) return MOTIVATION[3].msg;
  if (pct >= 50) return MOTIVATION[2].msg;
  if (pct >= 25) return MOTIVATION[1].msg;
  return MOTIVATION[0].msg;
}

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    async function getUserProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      if (!user) {
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          email: user.email,
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || "",
          email: user.email,
        }));
      }
      setLoading(false);
    }
    getUserProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;
    await supabase.from("profiles").upsert({
      id: authUser.id,
      ...profile,
      email: authUser.email
    });
    toast.success("Profile updated!");
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !authUser) return;
    setAvatarUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${authUser.id}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error("Upload failed. Try again.");
      setAvatarUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (data?.publicUrl) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", authUser.id);
      if (updateError) {
        toast.error("Failed to update avatar.");
      } else {
        setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
        toast.success("Avatar updated!");
      }
    }
    setAvatarUploading(false);
  }

  async function handleAvatarRemove() {
    if (!authUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", authUser.id);
    if (!error) {
      setProfile(prev => ({ ...prev, avatar_url: null }));
      toast.success("Avatar removed!");
    } else {
      toast.error("Failed to remove avatar.");
    }
  }

  const targetTotalNum = Number(profile.targetTotal) > 0 ? Number(profile.targetTotal) : 0;
  const pct = targetTotalNum
    ? Math.min(100, Math.round((profile.currentProgress / targetTotalNum) * 100))
    : 0;

  const handleProgressAdd = e => {
    e.preventDefault();
    const addNum = Number(progressInput);
    if (!addNum || addNum <= 0) return;
    setProfile(prev => ({
      ...prev,
      currentProgress: prev.currentProgress + addNum,
      progressLog: [
        ...(prev.progressLog || []),
        { date: new Date().toISOString(), amount: addNum }
      ]
    }));
    setProgressInput("");
  };

  const handleProgressReset = () => {
    if (window.confirm("Reset progress for this target?")) {
      setProfile(prev => ({
        ...prev,
        currentProgress: 0,
        progressLog: [],
      }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authUser) return <div>Please log in to view your profile.</div>;

  return (
    <div className="profile-container" style={{
      maxWidth: 540,
      margin: "3.5rem auto",
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
      padding: "2.4rem 2.1rem 1.7rem 2.1rem",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>
      <div style={{ marginBottom: 22, position: "relative" }}>
        {/* Avatar block */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile avatar"
            style={{
              width: 130, height: 130, objectFit: "cover",
              borderRadius: "50%", border: "3px solid #2563eb", marginBottom: 8
            }}
          />
        ) : (
          <div
            style={{
              width: 130, height: 130, borderRadius: "50%",
              background: "#f1f5f9", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.8rem", fontWeight: 700, border: "3px solid #e0e7ef",
              margin: "0 auto 8px auto"
            }}
          >
            {getInitials(profile.name, profile.email)}
          </div>
        )}
        {editMode && (
          <div style={{ marginTop: 12 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1.02rem",
                padding: "0.42rem 1.1rem",
                cursor: avatarUploading ? "not-allowed" : "pointer",
                opacity: avatarUploading ? 0.6 : 1
              }}
              disabled={avatarUploading}
            >
              {avatarUploading ? "Uploading..." : profile.avatar_url ? "Change Photo" : "Upload Photo"}
            </button>
            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                style={{
                  background: "#f1f5f9",
                  color: "#dc2626",
                  border: "1px solid #dc2626",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: ".97rem",
                  padding: "0.38rem 1.1rem",
                  marginLeft: 8,
                  cursor: "pointer"
                }}
              >Remove Photo</button>
            )}
          </div>
        )}
      </div>

      {!editMode ? (
        <div>
          <h2 style={{ margin: 0 }}>{profile.name || "No Name"}</h2>
          <div style={{ color: "#64748b", marginBottom: 8 }}>{profile.email || "No Email"}</div>
          <div style={{ marginBottom: 14 }}>
            <strong>Goals:</strong>
            <div style={{ color: "#2563eb", fontWeight: 500, whiteSpace: "pre-line" }}>
              {profile.goals ? profile.goals : <span style={{ color: "#aaa" }}>No goals set yet</span>}
            </div>
          </div>
          {/* Progress Tracker Section */}
          <div style={{ background: "#f1f5f9", padding: "1.1rem 1rem", borderRadius: 12, marginBottom: 18 }}>
            <strong>Your Main Target:</strong>
            <div style={{ fontWeight: 600, color: "#22c55e", fontSize: "1.05rem", margin: "8px 0 4px 0" }}>
              {profile.targetLabel && profile.targetTotal
                ? `${profile.targetLabel} (${profile.currentProgress} / ${profile.targetTotal})`
                : <span style={{ color: "#aaa" }}>Not set</span>
              }
            </div>
            {profile.targetLabel && profile.targetTotal ? (
              <>
                <div style={{
                  background: "#e0e7ef",
                  borderRadius: 8,
                  height: 20,
                  width: "100%",
                  margin: "8px 0"
                }}>
                  <div style={{
                    background: pct >= 100 ? "#22c55e" : "#2563eb",
                    width: `${pct}%`,
                    height: 20,
                    borderRadius: 8,
                    transition: "width 0.4s"
                  }}>
                  </div>
                </div>
                <div style={{ margin: "6px 0 0 0", fontWeight: 600, color: "#2563eb" }}>
                  {pct}% complete
                </div>
                <div style={{ margin: "12px 0 0 0", color: "#64748b", fontSize: ".98rem" }}>
                  {getMotivationalMsg(pct)}
                </div>
                {pct < 100 && (
                  <form style={{ marginTop: 10, display: "flex", gap: 7, justifyContent: "center" }} onSubmit={handleProgressAdd}>
                    <input
                      type="number"
                      min={1}
                      max={profile.targetTotal - profile.currentProgress}
                      placeholder="Add progress"
                      value={progressInput}
                      onChange={e => setProgressInput(e.target.value)}
                      style={{ width: 80, padding: 6, borderRadius: 6, border: "1px solid #bcd" }}
                      required
                    />
                    <button
                      type="submit"
                      style={{
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "1.01rem",
                        padding: "0.38rem 1.1rem",
                        cursor: "pointer"
                      }}>
                      Log
                    </button>
                  </form>
                )}
                {profile.currentProgress > 0 && (
                  <button
                    onClick={handleProgressReset}
                    style={{
                      marginTop: 10,
                      background: "#f1f5f9",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: ".98rem",
                      padding: "0.36rem 1rem",
                      cursor: "pointer"
                    }}>
                    Reset Progress
                  </button>
                )}
                {profile.progressLog && profile.progressLog.length > 0 && (
                  <div style={{ marginTop: 10, textAlign: "left", fontSize: ".97rem", color: "#64748b" }}>
                    <strong>Progress Log:</strong>
                    <ul style={{ margin: "7px 0 0 0", padding: "0 0 0 18px" }}>
                      {profile.progressLog.slice().reverse().map((item, i) => (
                        <li key={i}>
                          +{item.amount} ({new Date(item.date).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: "#aaa" }}>Set a target to track your progress!</span>
            )}
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
              disabled
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4, background: "#f1f5f9" }}
              required
            />
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
            <label style={{ fontWeight: 600 }}>Main Target (label)</label>
            <input
              name="targetLabel"
              value={profile.targetLabel}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              placeholder="e.g. Workouts, Kilometers, Sessions"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Target Amount (number)</label>
            <input
              name="targetTotal"
              value={profile.targetTotal}
              onChange={handleChange}
              type="number"
              min={1}
              style={{ width: "100%", padding: 8, borderRadius: 7, border: "1px solid #cbd5e1", marginTop: 4 }}
              placeholder="e.g. 20"
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
      <style>
        {`
        @media (max-width: 480px) {
          .profile-container {
            padding: 1rem 0.5rem !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .profile-container input,
          .profile-container textarea,
          .profile-container select {
            font-size: 1.1rem;
            padding: 10px;
          }
          .profile-container h1 {
            font-size: 1.4rem !important;
          }
          .profile-container button {
            font-size: 1.08rem !important;
            padding: 0.8rem 1.2rem;
          }
        }
        html, body { max-width: 100vw; overflow-x: hidden; }
        `}
      </style>
    </div>
  );
}
