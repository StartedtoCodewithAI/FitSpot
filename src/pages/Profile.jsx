import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import FSButton from "../components/FSButton";

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
  const [isSending, setIsSending] = useState(false);
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
    if (!newMsg.trim() || !authUser || isSending) return;

    setIsSending(true);
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
    setIsSending(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;

    const { error } = await supabase.from("profiles").upsert({
      id: authUser.id,
      ...profile,
      email: authUser.email,
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
          cursor: "pointer", marginRight: 12, fontWeight: 600,
        }}>
          {avatarUploading ? "Uploading..." : "Change Avatar"}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarUpload}
          disabled={avatarUploading}
        />
        {profile.avatar_url && (
          <button onClick={handleAvatarRemove} style={{
            background: "transparent", border: "none", color: "#ef4444",
            fontWeight: 600, cursor: "pointer"
          }}>
            Remove
          </button>
        )}
      </div>

      {/* Profile content */}
      {!editMode ? (
        <>
          <h2>{profile.name || profile.email || "User"}</h2>
          <p style={{ color: "#64748b", marginBottom: 16 }}>{profile.email}</p>
          <p><b>Goal:</b> {profile.goals || "No goal set"}</p>
          <p><b>Target:</b> {profile.targetLabel || "-"}: {profile.targetTotal || "-"}</p>
          <p><b>Progress:</b> {profile.currentProgress} / {profile.targetTotal} ({pct}%)</p>

          {/* Progress bar */}
          <div style={{
            height: 18, borderRadius: 12, background: "#e0e7ef",
            marginBottom: 12, overflow: "hidden"
          }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: pct === 100 ? "#22c55e" : "#2563eb",
              transition: "width 0.5s ease-in-out"
            }} />
          </div>
          <p style={{ fontStyle: "italic", color: "#2563eb" }}>
            {getMotivationalMsg(pct)}
          </p>

          <form onSubmit={handleProgressAdd} style={{ marginBottom: 12 }}>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Add progress"
              value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              style={{ padding: "0.5rem 1rem", width: 150, marginRight: 12 }}
            />
            <FSButton type="submit">Add</FSButton>
          </form>

          <button onClick={handleProgressReset} style={{
            background: "transparent", border: "none", color: "#ef4444",
            fontWeight: 600, cursor: "pointer"
          }}>
            Reset progress
          </button>

          <br />
          <button
            onClick={() => setEditMode(true)}
            style={{
              marginTop: 26, background: "#2563eb", color: "#fff",
              borderRadius: 12, padding: "0.75rem 1.5rem", border: "none",
              cursor: "pointer"
            }}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} style={{ marginTop: 18, textAlign: "left" }}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Full Name"
            style={{ display: "block", width: "100%", marginBottom: 12, padding: "0.5rem" }}
          />

          <label htmlFor="email">Email (readonly)</label>
          <input
            id="email"
            name="email"
            value={profile.email}
            readOnly
            style={{ display: "block", width: "100%", marginBottom: 12, padding: "0.5rem", background: "#f9fafb" }}
          />

          <label htmlFor="goals">Goals</label>
          <textarea
            id="goals"
            name="goals"
            value={profile.goals}
            onChange={handleChange}
            placeholder="Describe your goals"
            style={{ display: "block", width: "100%", marginBottom: 12, padding: "0.5rem", minHeight: 60 }}
          />

          <label htmlFor="targetLabel">Target Label</label>
          <input
            id="targetLabel"
            name="targetLabel"
            value={profile.targetLabel}
            onChange={handleChange}
            placeholder="e.g., Steps, Pages"
            style={{ display: "block", width: "100%", marginBottom: 12, padding: "0.5rem" }}
          />

          <label htmlFor="targetTotal">Target Total</label>
          <input
            id="targetTotal"
            name="targetTotal"
            type="number"
            min="0"
            step="1"
            value={profile.targetTotal}
            onChange={handleChange}
            placeholder="Total target number"
            style={{ display: "block", width: "100%", marginBottom: 20, padding: "0.5rem" }}
          />

          <FSButton type="submit">Save</FSButton>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            style={{
              marginLeft: 12,
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* Messages section */}
      <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
        {messages.length === 0 && <p style={{ color: "#64748b" }}>No messages yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 10, textAlign: msg.sender_id === authUser.id ? "right" : "left" }}>
            <div style={{
              display: "inline-block",
              background: msg.sender_id === authUser.id ? "#2563eb" : "#e0e7ef",
              color: msg.sender_id === authUser.id ? "#fff" : "#000",
              padding: "0.5rem 1rem",
              borderRadius: 16,
              maxWidth: "70%",
              wordBreak: "break-word"
            }}>
              {msg.content}
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Type a message"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          style={{ flexGrow: 1, padding: "0.5rem 1rem", borderRadius: 12, border: "1px solid #ccc" }}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || newMsg.trim() === ""}
          style={{
            background: isSending ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "0.5rem 1.4rem",
            cursor: isSending ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
