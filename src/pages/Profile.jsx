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

async function ensureUserProfile(user) {
  if (!user) return;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || null,
  }, { onConflict: 'id' });

  if (error) {
    console.error("Error upserting profile:", error);
  }
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
    async function getUserProfile() {
      setLoading(true);

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthUser(null);
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }

      setAuthUser(user);

      await ensureUserProfile(user);

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
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMsg.trim() || !authUser || !authUser.id) {
      toast.error("You need to be logged in to send a message.");
      return;
    }

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

    try {
      const { data, error: uploadError } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        setAvatarUploading(false);
        return;
      }

      const { publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);

      if (!publicUrl) {
        toast.error("Failed to get avatar URL.");
        setAvatarUploading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", authUser.id);

      if (updateError) {
        console.error("Failed to update avatar URL in profile:", updateError);
        toast.error("Failed to update avatar.");
        setAvatarUploading(false);
        return;
      }

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("Unexpected error during avatar upload:", err);
      toast.error("Unexpected error during upload.");
    } finally {
      setAvatarUploading(false);
    }
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

  const handleDeleteMessage = async (messageId) => {
    if (!authUser) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", authUser.id);

    if (error) {
      toast.error("Failed to delete message.");
    } else {
      setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
      toast.success("Message deleted!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authUser) return <div>Please log in to view your profile.</div>;

  return (
    <div className="container" style={{
      maxWidth: 540, margin: "3.5rem auto", background: "#fff", borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", margin: "2rem 0",
      }}>
        <div
          style={{
            width: 100, height: 100, backgroundColor: "#e0e7ef", borderRadius: "50%",
            display: "flex", justifyContent: "center", alignItems: "center", position: "relative"
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#fff" }}>
              {getInitials(profile.name, profile.email)}
            </span>
          )}
        </div>

        <div style={{ marginLeft: 16 }}>
          <label style={{ cursor: "pointer", color: "#007bff", display: "inline-block", marginBottom: 8 }}>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploading} style={{ display: "none" }} />
            {avatarUploading ? "Uploading..." : "Upload Avatar"}
          </label>
          {profile.avatar_url && (
            <button onClick={handleAvatarRemove} style={{ display: "block", marginTop: 8 }}>
              Remove Avatar
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ padding: "0 2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editMode}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email:</label>
          <input type="email" value={profile.email} disabled style={{ width: "100%", padding: 8, borderRadius: 6, background: "#f0f0f0" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Goals:</label>
          <textarea
            name="goals"
            value={profile.goals}
            onChange={handleChange}
            disabled={!editMode}
            style={{ width: "100%", minHeight: 70, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Target Label:</label>
          <input
            type="text"
            name="targetLabel"
            value={profile.targetLabel}
            onChange={handleChange}
            disabled={!editMode}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Target Total:</label>
          <input
            type="number"
            name="targetTotal"
            value={profile.targetTotal}
            onChange={handleChange}
            disabled={!editMode}
            min="0"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        {!editMode ? (
          <button type="button" onClick={() => setEditMode(true)} style={{ marginBottom: 16 }}>
            Edit Profile
          </button>
        ) : (
          <button type="submit" style={{ marginBottom: 16 }}>
            Save Profile
          </button>
        )}
      </form>

      <div style={{ padding: "0 2rem" }}>
        <h3>Progress</h3>
        <p>{profile.currentProgress} / {profile.targetTotal} {profile.targetLabel}</p>
        <progress value={pct} max="100" style={{ width: "100%" }}></progress>
        <p style={{ fontStyle: "italic", color: "#666" }}>{getMotivationalMsg(pct)}</p>

        <form onSubmit={handleProgressAdd} style={{ marginBottom: 16 }}>
          <input
            type="number"
            min="0"
            step="1"
            value={progressInput}
            onChange={e => setProgressInput(e.target.value)}
            placeholder="Add progress amount"
            required
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", width: "60%" }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>
            Add
          </button>
          <button type="button" onClick={handleProgressReset} style={{ marginLeft: 8 }}>
            Reset Progress
          </button>
        </form>

        <h4>Progress Log</h4>
        {profile.progressLog.length === 0 ? (
          <p>No progress logged yet.</p>
        ) : (
          <ul style={{ maxHeight: 120, overflowY: "auto" }}>
            {profile.progressLog.map((log, i) => (
              <li key={i}>
                {new Date(log.date).toLocaleDateString()}: +{log.amount} {profile.targetLabel}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ padding: "0 2rem", marginTop: 40 }}>
        <h3>Global Chat</h3>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            height: 300,
            overflowY: "auto",
            padding: 10,
            marginBottom: 8,
          }}
        >
          {messages.length === 0 ? (
            <p>No messages yet. Be the first!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{
                marginBottom: 8,
                backgroundColor: msg.sender_id === authUser.id ? "#daf5d7" : "#f1f1f1",
                padding: 6,
                borderRadius: 6,
                position: "relative"
              }}>
                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 2 }}>
                  {msg.sender_id === authUser.id ? "You" : msg.sender_id}
                </div>
                <div style={{ fontSize: 14 }}>{msg.content}</div>
                {msg.sender_id === authUser.id && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                      border: "none",
                      background: "transparent",
                      color: "red",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    title="Delete message"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex" }}>
          <input
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Write a message..."
            style={{ flexGrow: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
