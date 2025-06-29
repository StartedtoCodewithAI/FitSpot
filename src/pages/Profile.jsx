import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import FSButton from "../components/FSButton";

const defaultProfile = {
  id: "",
  email: "",
  username: "",
  full_name: "",
  avatar_url: "",
  goals: "",
  targetLabel: "",
  targetTotal: "",
  currentProgress: 0,
  progressLog: [],
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

      // Fetch profile row
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data) {
        // Profile missing — create it!
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || "",
            full_name: user.user_metadata?.full_name || "",
            avatar_url: null,
            goals: "",
            targetLabel: "",
            targetTotal: "",
            currentProgress: 0,
            progressLog: [],
          }]);

        if (insertError) {
          toast.error("Failed to create profile.");
          console.error("Create profile error:", insertError);
          setLoading(false);
          return;
        }

        // Fetch the newly created profile
        ({ data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single());
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          username: data.username || "",
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          goals: data.goals || "",
          targetLabel: data.targetLabel || "",
          targetTotal: data.targetTotal || "",
          currentProgress: data.currentProgress || 0,
          progressLog: data.progressLog || [],
        });
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

    // Set receiver_id to null or implement a receiver selection UI
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
      email: authUser.email,
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      goals: profile.goals,
      targetLabel: profile.targetLabel,
      targetTotal: profile.targetTotal,
      currentProgress: profile.currentProgress,
      progressLog: profile.progressLog,
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

      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="Avatar"
          style={{ width: 100, height: 100, borderRadius: 100, marginBottom: 20 }}
        />
      ) : (
        <div style={{
          width: 100, height: 100, borderRadius: 100, marginBottom: 20,
          backgroundColor: "#ccc", display: "flex", justifyContent: "center",
          alignItems: "center", fontSize: 50, fontWeight: "bold",
          color: "#666"
        }}>
          {getInitials(profile.full_name, profile.email)}
        </div>
      )}

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarUpload}
        disabled={avatarUploading}
      />
      <label htmlFor="avatar-upload" style={{
        cursor: avatarUploading ? "not-allowed" : "pointer",
        display: "inline-block",
        marginBottom: 15,
        color: "#2563eb",
        fontWeight: "600",
      }}>
        {avatarUploading ? "Uploading..." : "Upload Avatar"}
      </label>
      {profile.avatar_url && (
        <button onClick={handleAvatarRemove} style={{
          background: "none", border: "none", color: "red",
          cursor: "pointer", marginBottom: 20
        }}>
          Remove Avatar
        </button>
      )}

      {editMode ? (
        <form onSubmit={handleSave} style={{ textAlign: "left", marginBottom: 20 }}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <label>Email (read-only):</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            readOnly
            style={{ width: "100%", marginBottom: 10, backgroundColor: "#eee" }}
          />

          <label>Goals:</label>
          <textarea
            name="goals"
            value={profile.goals}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <label>Target Label:</label>
          <input
            type="text"
            name="targetLabel"
            value={profile.targetLabel}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <label>Target Total:</label>
          <input
            type="number"
            name="targetTotal"
            value={profile.targetTotal}
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <FSButton
            type="submit"
            style={{ marginTop: 15, width: "100%" }}
          >
            Save Profile
          </FSButton>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            style={{ marginTop: 10, width: "100%", backgroundColor: "#ddd" }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p><strong>Username:</strong> {profile.username || "-"}</p>
          <p><strong>Full Name:</strong> {profile.full_name || "-"}</p>
          <p><strong>Email:</strong> {profile.email || "-"}</p>
          <p><strong>Goals:</strong> {profile.goals || "-"}</p>
          <p><strong>Target:</strong> {profile.targetLabel || "-"} {targetTotalNum ? `(${targetTotalNum})` : ""}</p>
          <p><strong>Current Progress:</strong> {profile.currentProgress || 0}</p>
          <p style={{ fontWeight: "bold", color: "#2563eb" }}>{getMotivationalMsg(pct)}</p>

          <form onSubmit={handleProgressAdd} style={{ marginTop: 15 }}>
            <input
              type="number"
              placeholder="Add progress amount"
              value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              style={{ width: "70%", marginRight: 10 }}
            />
            <button type="submit" disabled={!progressInput}>Add</button>
          </form>
          <button
            onClick={handleProgressReset}
            style={{ marginTop: 10, backgroundColor: "#ddd", border: "none", padding: "6px 12px", cursor: "pointer" }}
          >
            Reset Progress
          </button>

          <button
            onClick={() => setEditMode(true)}
            style={{ marginTop: 15, width: "100%" }}
          >
            Edit Profile
          </button>
        </>
      )}

      <hr style={{ margin: "30px 0" }} />

      <h2>Messages</h2>
      <div
        style={{
          maxHeight: 250,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
          textAlign: "left",
          backgroundColor: "#fafafa",
          borderRadius: 8,
        }}
      >
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map(msg => (
          <div key={msg.id} style={{
            marginBottom: 10,
            backgroundColor: msg.sender_id === authUser.id ? "#d0f0c0" : "#f0f0f0",
            padding: 8,
            borderRadius: 6,
            wordBreak: "break-word",
          }}>
            <small style={{ fontSize: 11, color: "#666" }}>
              {msg.sender_id === authUser.id ? "You" : msg.sender_id}
              {" • "}
              {new Date(msg.created_at).toLocaleString()}
            </small>
            <p style={{ margin: "4px 0 0" }}>{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message"
          style={{ flexGrow: 1, padding: "8px 12px" }}
          disabled={!authUser}
        />
        <button type="submit" disabled={!newMsg.trim()}>Send</button>
      </form>
    </div>
  );
}
