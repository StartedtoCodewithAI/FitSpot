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

  // Messages state
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user profile on mount
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

  // Load and subscribe to messages
  useEffect(() => {
    if (!authUser) return;

    // Fetch messages with sender info
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        // join sender profile: "profiles" table is related via sender_id = profiles.id
        .select(`
          id,
          sender_id,
          receiver_id,
          context,
          created_at,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url,
            email
          )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }
      setMessages(data);
    }

    fetchMessages();

    // Listen for new messages and update list
    const subscription = supabase
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
      supabase.removeChannel(subscription);
    };
  }, [authUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !authUser) return;

    const payload = {
      sender_id: authUser.id,
      receiver_id: null, // general chat, no receiver
      context: newMsg.trim(),
    };

    const { error } = await supabase.from("messages").insert([payload]);
    if (error) {
      toast.error("Failed to send message.");
      console.error("Send message error:", error);
    } else {
      setNewMsg("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    if (!authUser) return;

    await supabase.from("profiles").upsert({
      id: authUser.id,
      ...profile,
      email: authUser.email,
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
    <div
      className="container"
      style={{
        maxWidth: 540,
        margin: "3.5rem auto",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
        padding: "2.4rem 2.1rem 1.7rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#2563eb", marginBottom: 20 }}>Your Profile</h1>

      {/* Avatar */}
      <div style={{ marginBottom: 22 }}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #2563eb",
              marginBottom: 8,
            }}
          />
        ) : (
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "#f1f5f9",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.8rem",
              fontWeight: 700,
              border: "3px solid #e0e7ef",
              marginBottom: 8,
            }}
          >
            {getInitials(profile.name, profile.email)}
          </div>
        )}

        <label
          htmlFor="avatar-upload"
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            padding: "0.45rem 1.1rem",
            cursor: "pointer",
            marginRight: 12,
            fontWeight: 600,
          }}
        >
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
          <button
            onClick={handleAvatarRemove}
            style={{
              background: "transparent",
              border: "none",
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>

      {/* Profile content */}
      {!editMode ? (
        <>
          <h2>{profile.name || profile.email || "User"}</h2>
          <p style={{ color: "#64748b", marginBottom: 16 }}>{profile.email}</p>
          <p>
            <b>Goal:</b> {profile.goals || "No goal set"}
          </p>
          <p>
            <b>Target:</b> {profile.targetLabel || "-"}: {profile.targetTotal || "-"}
          </p>
          <p>
            <b>Progress:</b> {profile.currentProgress} / {profile.targetTotal} ({pct}
            %)
          </p>

          {/* Progress bar */}
          <div
            style={{
              height: 18,
              borderRadius: 12,
              background: "#e0e7ef",
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: pct === 100 ? "#22c55e" : "#2563eb",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>
          <p style={{ fontStyle: "italic", color: "#2563eb" }}>
            {getMotivationalMsg(pct)}
          </p>

          <form onSubmit={handleProgressAdd} style={{ marginTop: 16 }}>
            <input
              type="number"
              min="1"
              step="1"
              value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              placeholder="Add progress"
              style={{
                padding: "0.5rem 0.7rem",
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                width: 140,
                marginRight: 8,
              }}
            />
            <button
              type="submit"
              disabled={!progressInput || Number(progressInput) <= 0}
              style={{
                background: "#2563eb",
                color: "#fff",
                borderRadius: 8,
                padding: "0.5rem 1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </form>
          <button
            onClick={handleProgressReset}
            style={{
              marginTop: 8,
              color: "#ef4444",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reset Progress
          </button>

          <button
            onClick={() => setEditMode(true)}
            style={{
              marginTop: 20,
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <input
            name="name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
          />
          <textarea
            name="goals"
            placeholder="Goals"
            value={profile.goals}
            onChange={handleChange}
            rows={2}
            style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
          />
          <input
            name="targetLabel"
            placeholder="Target Label (e.g. Miles)"
            value={profile.targetLabel}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
          />
          <input
            name="targetTotal"
            type="number"
            min="0"
            placeholder="Target Total"
            value={profile.targetTotal}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
          />
          <FSButton type="submit" text="Save" />
          <button
            type="button"
            onClick={() => setEditMode(false)}
            style={{
              marginLeft: 12,
              background: "#ef4444",
              color: "#fff",
              borderRadius: 8,
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Chat Section */}
      <div
        style={{
          marginTop: 40,
          borderTop: "1px solid #e0e7ef",
          paddingTop: 20,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        <h3>General Chat</h3>
        <div
          style={{
            marginBottom: 12,
            maxHeight: 300,
            overflowY: "auto",
            padding: "0 8px",
          }}
        >
          {messages.length === 0 && (
            <p style={{ color: "#64748b" }}>No messages yet.</p>
          )}
          {messages.map((msg) => {
            const sender = msg.profiles || {};
            const isMe = sender.id === authUser.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
              >
                {!isMe && (
                  <img
                    src={sender.avatar_url || ""}
                    alt={sender.username || sender.full_name || "User"}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: 8,
                      background: "#f0f0f0",
                    }}
                  />
                )}
                <div
                  style={{
                    background: isMe ? "#2563eb" : "#e0e7ef",
                    color: isMe ? "#fff" : "#000",
                    borderRadius: 12,
                    padding: "0.5rem 1rem",
                    maxWidth: "70%",
                    fontSize: 14,
                  }}
                  title={new Date(msg.created_at).toLocaleString()}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: 13,
                      marginBottom: 4,
                      color: isMe ? "#a5c7ff" : "#444",
                    }}
                  >
                    {isMe
                      ? "You"
                      : sender.full_name ||
                        sender.username ||
                        sender.email?.split("@")[0] ||
                        "Unknown"}
                  </div>
                  {msg.context}
                </div>
                {isMe && (
                  <img
                    src={sender.avatar_url || ""}
                    alt="You"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginLeft: 8,
                      background: "#f0f0f0",
                    }}
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex" }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{
              flexGrow: 1,
              padding: "0.6rem 1rem",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              marginRight: 8,
            }}
          />
          <button
            type="submit"
            disabled={!newMsg.trim()}
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              padding: "0.6rem 1.3rem",
              fontWeight: 600,
              cursor: newMsg.trim() ? "pointer" : "not-allowed",
              border: "none",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
