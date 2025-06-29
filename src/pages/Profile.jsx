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
    if (!newMsg.trim() || !authUser) return;

    const payload = {
      sender_id: authUser.id,
      receiver_id: null, // you can later update to select a receiver
      content: newMsg.trim(),  // <-- key fixed here (was 'context')
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
              background: "#2563eb",
              transition: "width 0.3s ease"
            }} />
          </div>

          <p style={{ fontStyle: "italic", color: "#2563eb", marginBottom: 16 }}>
            {getMotivationalMsg(pct)}
          </p>

          <button onClick={() => setEditMode(true)} style={{
            background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 12, padding: "0.65rem 1.6rem",
            fontWeight: 600, cursor: "pointer", marginBottom: 24
          }}>
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} style={{ textAlign: "left" }}>
          <label htmlFor="name" style={{ fontWeight: 600 }}>Name</label><br />
          <input
            id="name"
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "0.6rem 1.1rem",
              fontSize: "1rem",
              borderRadius: 12,
              border: "1.5px solid #2563eb",
              outline: "none"
            }}
          />
          <label htmlFor="goals" style={{ fontWeight: 600 }}>Goals</label><br />
          <textarea
            id="goals"
            name="goals"
            rows={4}
            value={profile.goals}
            onChange={handleChange}
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "0.6rem 1.1rem",
              fontSize: "1rem",
              borderRadius: 12,
              border: "1.5px solid #2563eb",
              outline: "none",
              resize: "vertical"
            }}
          />
          <label htmlFor="targetLabel" style={{ fontWeight: 600 }}>Target Label</label><br />
          <input
            id="targetLabel"
            name="targetLabel"
            type="text"
            value={profile.targetLabel}
            onChange={handleChange}
            style={{
              width: "100%",
              marginBottom: 12,
              padding: "0.6rem 1.1rem",
              fontSize: "1rem",
              borderRadius: 12,
              border: "1.5px solid #2563eb",
              outline: "none"
            }}
          />
          <label htmlFor="targetTotal" style={{ fontWeight: 600 }}>Target Total</label><br />
          <input
            id="targetTotal"
            name="targetTotal"
            type="number"
            value={profile.targetTotal}
            onChange={handleChange}
            style={{
              width: "100%",
              marginBottom: 20,
              padding: "0.6rem 1.1rem",
              fontSize: "1rem",
              borderRadius: 12,
              border: "1.5px solid #2563eb",
              outline: "none"
            }}
          />
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "0.7rem 0",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "2px solid #2563eb",
                color: "#2563eb",
                borderRadius: 12,
                padding: "0.7rem 0",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add progress */}
      <form onSubmit={handleProgressAdd} style={{ marginBottom: 16 }}>
        <input
          type="number"
          min={0}
          step={1}
          placeholder="Add progress"
          value={progressInput}
          onChange={(e) => setProgressInput(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem 1.2rem",
            borderRadius: 12,
            border: "1.5px solid #2563eb",
            fontSize: "1rem",
            marginBottom: 12,
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "0.7rem 0",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Add Progress
        </button>
      </form>

      {profile.progressLog && profile.progressLog.length > 0 && (
        <>
          <h3>Progress Log</h3>
          <ul style={{
            maxHeight: 160,
            overflowY: "auto",
            listStyle: "none",
            paddingLeft: 0,
            marginBottom: 16,
            textAlign: "left",
            fontSize: "0.9rem",
            color: "#555",
          }}>
            {profile.progressLog.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                {new Date(item.date).toLocaleDateString()} — {item.amount}
              </li>
            ))}
          </ul>
          <button
            onClick={handleProgressReset}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0.6rem 1.2rem",
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: 16,
              width: "100%"
            }}
          >
            Reset Progress
          </button>
        </>
      )}

      {/* Messages section */}
      <div style={{
        borderTop: "1px solid #ddd",
        paddingTop: 20,
        textAlign: "left"
      }}>
        <h2 style={{ color: "#2563eb", marginBottom: 12 }}>Messages</h2>
        <div style={{
          maxHeight: 220,
          overflowY: "auto",
          background: "#f9fafb",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          fontSize: "0.9rem"
        }}>
          {messages.length === 0 && <p style={{ color: "#888" }}>No messages yet</p>}
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 8 }}>
              <b>{msg.sender_id === authUser.id ? "You" : msg.sender_id}:</b> {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "0.6rem 1.2rem",
              borderRadius: 12,
              border: "1.5px solid #2563eb",
              fontSize: "1rem",
              outline: "none",
              fontWeight: 500,
              color: "#111",
              boxShadow: "0 0 6px rgba(37, 99, 235, 0.3)",
              transition: "box-shadow 0.3s ease",
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 8px rgba(37, 99, 235, 0.7)"}
            onBlur={e => e.target.style.boxShadow = "0 0 6px rgba(37, 99, 235, 0.3)"}
          />
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0.7rem 1.4rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
