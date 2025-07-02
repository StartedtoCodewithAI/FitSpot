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
      toast.error(Failed to send message: ${error.message});
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
    const path = ${authUser.id}_${Date.now()}.${ext};

    try {
      const { data, error: uploadError } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        toast.error(Upload failed: ${uploadError.message});
        setAvatarUploading(false);
        return;
      }

      const { data: urlData, error: urlError } = supabase.storage.from("avatars").getPublicUrl(path);

      if (urlError) {
        console.error("Error getting public URL:", urlError);
        toast.error("Failed to get avatar URL.");
        setAvatarUploading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", authUser.id);

      if (updateError) {
        console.error("Failed to update avatar URL in profile:", updateError);
        toast.error("Failed to update avatar.");
        setAvatarUploading(false);
        return;
      }

      setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
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

      <div style={{ padding: "0 1rem" }}>
        <h3>Profile</h3>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Name:</label>
            {editMode ? (
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your name"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "5px" }}
              />
            ) : (
              <div>{profile.name}</div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Email:</label>
            <div>{profile.email}</div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Goals:</label>
            {editMode ? (
              <textarea
                name="goals"
                value={profile.goals}
                onChange={handleChange}
                placeholder="Enter your goals"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "5px" }}
              />
            ) : (
              <div>{profile.goals}</div>
            )}
          </div>

          {editMode && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <FSButton text="Save Changes" />
            </div>
          )}
        </form>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Current Progress</h3>
        <div style={{
          padding: "10px", backgroundColor: "#f1f5f9", borderRadius: "5px",
          textAlign: "center", marginBottom: "1rem"
        }}>
          <div style={{ fontWeight: 600 }}>Progress: {profile.currentProgress}/{profile.targetTotal}</div>
          <div>{getMotivationalMsg(pct)}</div>
        </div>

        <form
          onSubmit={handleProgressAdd}
          style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}
        >
          <input
            type="number"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            placeholder="Add progress"
            style={{ flex: 1, marginRight: 8, padding: "0.5rem" }}
          />
          <FSButton text="Add" />
        </form>
        <button onClick={handleProgressReset} style={{ backgroundColor: "#f87171", color: "#fff", padding: "0.5rem 1rem", borderRadius: 5 }}>
          Reset Progress
        </button>
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h3>Messages</h3>
        <div style={{
          maxHeight: 180,     // smaller height for chat box
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "1rem",
          background: "#fafafa",
          fontSize: "0.9rem",
          lineHeight: "1.3",
        }}>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>
                <div style={{ fontWeight: "600" }}>
                  {msg.sender_id === authUser.id ? "You" : msg.sender_id} at{" "}
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <div>{msg.content}</div>
                {msg.sender_id === authUser.id && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    style={{
                      color: "red",
                      fontSize: "0.75rem",
                      marginTop: 2,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-label="Delete message"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          style={{
            display: "flex",
            marginTop: 8,
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "1rem",
              borderRadius: "25px",
              border: "1px solid #ddd",
              outline: "none",
              transition: "border-color 0.3s ease",
              boxShadow: "inset 0 1px 3px rgb(0 0 0 / 0.1)",
            }}
            onFocus={(e) => e.target.style.borderColor = "#0047ab"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#0047ab",
              color: "#fff",
              borderRadius: "25px",
              border: "none",
              padding: "10px 18px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,71,171,0.3)",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#003380"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0047ab"}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            backgroundColor: editMode ? "#dc2626" : "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "25px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: editMode
              ? "0 4px 8px rgba(220,38,38,0.4)"
              : "0 4px 8px rgba(37,99,235,0.4)",
            transition: "background-color 0.3s ease",
          }}
          aria-pressed={editMode}
        >
          {editMode ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}
