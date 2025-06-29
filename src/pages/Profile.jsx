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
  const [users, setUsers] = useState([]); // all users for recipient selection
  const [selectedReceiver, setSelectedReceiver] = useState(null); // chosen receiver id
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

    async function fetchUsers() {
      // Fetch all users except the authUser for messaging
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .neq("id", authUser.id);

      if (usersError) {
        console.error("Error loading users:", usersError);
        return;
      }
      setUsers(usersData);
      if (usersData.length > 0) setSelectedReceiver(usersData[0].id);
    }

    async function fetchMessages() {
      // Fetch messages where the authUser is sender or receiver
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }
      setMessages(data);
    }

    fetchUsers();
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
          const msg = payload.new;
          // only add messages where authUser is sender or receiver
          if (msg.sender_id === authUser.id || msg.receiver_id === authUser.id) {
            setMessages((msgs) => [...msgs, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !authUser || !selectedReceiver) return;

    const payload = {
      sender_id: authUser.id,
      receiver_id: selectedReceiver,
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
            <FSButton type="submit" style={{ width: 110 }}>Add</FSButton>
          </form>

          <button onClick={handleProgressReset} style={{ color: "#ef4444", fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>
            Reset Progress
          </button>

          <button onClick={() => setEditMode(true)} style={{
            background: "#2563eb", color: "#fff", borderRadius: 12,
            padding: "0.6rem 1.3rem", fontWeight: 700, cursor: "pointer"
          }}>
            Edit Profile
          </button>

          <hr style={{ margin: "2.2rem 0" }} />

          {/* Messages Section */}
          <h3>Messages</h3>

          <form onSubmit={handleSendMessage} style={{ marginBottom: 16 }}>
            <select
              value={selectedReceiver || ""}
              onChange={e => setSelectedReceiver(e.target.value)}
              style={{ padding: "0.4rem 0.8rem", marginRight: 12 }}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Type a message..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              style={{ padding: "0.4rem 0.8rem", width: 260, marginRight: 12 }}
            />
            <FSButton type="submit" style={{ width: 100 }}>Send</FSButton>
          </form>

          <div style={{
            maxHeight: 220, overflowY: "auto", textAlign: "left",
            border: "1px solid #e0e7ef", borderRadius: 10, padding: "0.6rem 1rem",
            background: "#f9fafb"
          }}>
            {messages.length === 0 && <p style={{ color: "#64748b" }}>No messages yet.</p>}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 8,
                  textAlign: msg.sender_id === authUser.id ? "right" : "left"
                }}
              >
                <span style={{
                  display: "inline-block", padding: "6px 12px", borderRadius: 16,
                  background: msg.sender_id === authUser.id ? "#2563eb" : "#e0e7ef",
                  color: msg.sender_id === authUser.id ? "#fff" : "#333",
                  maxWidth: "80%", wordWrap: "break-word",
                  fontSize: "0.95rem",
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 12 }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              style={{ width: "100%", padding: "0.5rem", background: "#f0f0f0" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Goals:</label>
            <textarea
              name="goals"
              value={profile.goals}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Target Label:</label>
            <input
              type="text"
              name="targetLabel"
              value={profile.targetLabel}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Target Total:</label>
            <input
              type="number"
              name="targetTotal"
              value={profile.targetTotal}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem" }}
              min="0"
            />
          </div>

          <FSButton type="submit" style={{ marginRight: 12 }}>Save</FSButton>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
