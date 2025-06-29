import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import FSButton from "../components/FSButton";

const defaultProfile = {
  id: null,
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
  { pct: 100, msg: "Congratulations! Target achieved! 🎉" },
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
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      // Try to fetch profile for user.id
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") { 
        // no profile found, create one
        const insertPayload = {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || "",
          full_name: user.user_metadata?.full_name || "",
          avatar_url: null,
        };
        const { error: insertError } = await supabase.from("profiles").insert(insertPayload);

        if (insertError) {
          toast.error("Failed to create profile.");
          setLoading(false);
          return;
        }

        data = insertPayload; // assign newly created profile data
      } else if (error) {
        toast.error("Failed to load profile.");
        setLoading(false);
        return;
      }

      setProfile({
        id: data.id,
        name: data.full_name || data.name || "",
        email: data.email || user.email,
        goals: data.goals || "",
        targetLabel: data.targetLabel || "",
        targetTotal: data.targetTotal || "",
        currentProgress: data.currentProgress || 0,
        progressLog: data.progressLog || [],
        avatar_url: data.avatar_url || null,
      });

      setLoading(false);
    }

    getUserProfile();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }
      setMessages(data);
    }

    fetchMessages();

    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !authUser) return;

    // For now, let's send to receiver_id = null (or you can add UI later to select receiver)
    const payload = {
      sender_id: authUser.id,
      receiver_id: null,
      content: newMsg.trim(),
    };

    const { error } = await supabase.from("messages").insert([payload]);
    if (error) {
      console.error("Send message error:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } else {
      setNewMsg("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;

    const { error } = await supabase.from("profiles").upsert({
      id: authUser.id,
      full_name: profile.name,
      email: authUser.email,
      goals: profile.goals,
      targetLabel: profile.targetLabel,
      targetTotal: profile.targetTotal,
      currentProgress: profile.currentProgress,
      progressLog: profile.progressLog,
      avatar_url: profile.avatar_url,
    });

    if (error) {
      toast.error("Failed to update profile.");
      console.error("Profile update error:", error);
    } else {
      toast.success("Profile updated!");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !authUser) return;

    setAvatarUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${authUser.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed.");
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
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

  const targetTotalNum = Number(profile.targetTotal) || 0;
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
      progressLog: [...(prev.progressLog || []), {
        date: new Date().toISOString(),
        amount: addNum
      }]
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
    <div className="container" style={{
      maxWidth: 540, margin: "3.5rem auto", background: "#fff", borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.09)", padding: "2.4rem 2.1rem 1.7rem",
      textAlign: "center"
    }}>
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>

      {/* Avatar */}
      <div style={{ marginBottom: 22 }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" style={{
            width: 130, height: 130, borderRadius: "50%", objectFit: "cover",
            border: "3px solid #2563eb", marginBottom: 8
          }} />
        ) : (
          <div style={{
            width: 130, height: 130, borderRadius: "50%", background: "#f1f5f9",
            color: "#64748b", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2.8rem", fontWeight: 700,
            border: "3px solid #e0e7ef", marginBottom: 8
          }}>
            {getInitials(profile.name, profile.email)}
          </div>
        )}

        <label htmlFor="avatar-upload" style={{
          background: "#2563eb", color: "#fff", borderRadius: 8, padding: "0.45rem 1.1rem",
          cursor: "pointer", fontWeight: "bold", userSelect: "none", fontSize: "0.85rem"
        }}>
          {avatarUploading ? "Uploading..." : "Change Avatar"}
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: "none" }}
            disabled={avatarUploading}
          />
        </label>
        {profile.avatar_url && (
          <button
            type="button"
            onClick={handleAvatarRemove}
            style={{
              marginLeft: 12, background: "#e11d48", color: "#fff",
              border: "none", padding: "0.45rem 1rem", borderRadius: 8,
              fontWeight: "bold", cursor: "pointer"
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Editable info */}
      {!editMode ? (
        <>
          <h2>{profile.name || "(No name set)"}</h2>
          <p>{profile.email}</p>
          <p><b>Goals:</b> {profile.goals || "(Not set)"}</p>
          <p><b>Target:</b> {profile.targetLabel || "(Not set)"}</p>
          <p><b>Target Amount:</b> {profile.targetTotal || "(Not set)"}</p>
          <p><b>Current Progress:</b> {profile.currentProgress}</p>
          <p><b>Progress %:</b> {pct}%</p>
          <p style={{ fontStyle: "italic", color: "#555" }}>{getMotivationalMsg(pct)}</p>
          <button onClick={() => setEditMode(true)} style={{
            background: "#2563eb", color: "#fff", borderRadius: 8,
            padding: "0.5rem 1.3rem", border: "none", cursor: "pointer",
            fontWeight: "bold"
          }}>
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} style={{ textAlign: "left" }}>
          <label>
            Name:
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </label>
          <label>
            Goals:
            <input
              name="goals"
              value={profile.goals}
              onChange={handleChange}
              placeholder="What are you aiming for?"
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </label>
          <label>
            Target Label:
            <input
              name="targetLabel"
              value={profile.targetLabel}
              onChange={handleChange}
              placeholder="Name your target (e.g. Books read)"
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </label>
          <label>
            Target Total:
            <input
              name="targetTotal"
              type="number"
              value={profile.targetTotal}
              onChange={handleChange}
              placeholder="Total amount for target"
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </label>

          <button type="submit" style={{
            background: "#2563eb", color: "#fff", borderRadius: 8,
            padding: "0.5rem 1.3rem", border: "none", cursor: "pointer",
            fontWeight: "bold"
          }}>
            Save
          </button>{" "}
          <button type="button" onClick={() => setEditMode(false)} style={{
            background: "#999", color: "#fff", borderRadius: 8,
            padding: "0.5rem 1.3rem", border: "none", cursor: "pointer",
            fontWeight: "bold", marginLeft: 12
          }}>
            Cancel
          </button>
        </form>
      )}

      {/* Progress update */}
      <form
        onSubmit={handleProgressAdd}
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          alignItems: "center"
        }}
      >
        <input
          type="number"
          min="1"
          value={progressInput}
          onChange={(e) => setProgressInput(e.target.value)}
          placeholder="Add progress"
          style={{ flex: "1 1 auto", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <FSButton type="submit" disabled={!progressInput}>Add</FSButton>
        <button
          type="button"
          onClick={handleProgressReset}
          style={{ background: "#dc2626", color: "#fff", padding: "0.45rem 1rem", borderRadius: 6, border: "none" }}
        >
          Reset
        </button>
      </form>

      {/* Messages Section */}
      <div
        style={{
          marginTop: 40,
          textAlign: "left",
          borderTop: "1px solid #ddd",
          paddingTop: 20,
          maxHeight: 280,
          overflowY: "auto",
          backgroundColor: "#fafafa",
          borderRadius: 12,
          padding: "1rem",
        }}
      >
        <h3 style={{ marginBottom: 10 }}>Messages</h3>
        <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                padding: "6px 10px",
                marginBottom: 6,
                backgroundColor: m.sender_id === authUser.id ? "#dbf4ff" : "#eee",
                borderRadius: 8,
                fontSize: 14,
                wordWrap: "break-word",
              }}
            >
              <b>{m.sender_id === authUser.id ? "You" : m.sender_id}</b>: {m.content}
              <div style={{ fontSize: 10, color: "#999" }}>
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Type message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
