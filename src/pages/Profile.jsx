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

    // Check if the user is logged in and message is not empty
    if (!authUser?.id || !newMsg.trim()) {
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

  const handleDeleteMessage = async (messageId) => {
    if (!authUser) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", authUser.id); // Ensure only the sender can delete the message

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
            display: "flex", justifyContent: "center", alignItems: "center", position: "relative",
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>{getInitials(profile.name, profile.email)}</span>
          )}
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={avatarUploading}
            style={{
              position: "absolute", bottom: 0, right: 0, fontSize: "1.2rem", cursor: "pointer", opacity: 0,
            }}
          />
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <h2>{profile.name || "No Name"}</h2>
        <p>{profile.email}</p>
        {editMode ? (
          <div style={{ marginTop: "1rem" }}>
            <textarea
              name="goals"
              value={profile.goals}
              onChange={handleChange}
              placeholder="Your goals..."
              rows="3"
              style={{ width: "100%", padding: "0.5rem", borderRadius: 8 }}
            />
            <textarea
              name="targetLabel"
              value={profile.targetLabel}
              onChange={handleChange}
              placeholder="Target label"
              rows="1"
              style={{ width: "100%", padding: "0.5rem", borderRadius: 8, marginTop: "1rem" }}
            />
            <input
              type="number"
              name="targetTotal"
              value={profile.targetTotal}
              onChange={handleChange}
              placeholder="Target Total"
              style={{ width: "100%", padding: "0.5rem", borderRadius: 8, marginTop: "1rem" }}
            />
            <div style={{ marginTop: "1rem" }}>
              <FSButton text="Save Profile" onClick={handleSave} />
            </div>
          </div>
        ) : (
          <div>
            <p>{getMotivationalMsg(pct)}</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h4>{profile.targetLabel}</h4>
                <p>{profile.currentProgress} / {profile.targetTotal}</p>
                <progress value={profile.currentProgress} max={profile.targetTotal} />
              </div>
              <div>
                <h4>Progress Log</h4>
                <button onClick={handleProgressReset}>Reset Progress</button>
                <form onSubmit={handleProgressAdd}>
                  <input
                    type="number"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="Add progress"
                    style={{ padding: "0.5rem", borderRadius: 8 }}
                  />
                  <FSButton text="Add Progress" />
                </form>
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h3>Your Messages</h3>
        <div style={{ marginBottom: "1rem" }}>
          <form onSubmit={handleSendMessage}>
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              rows="3"
              style={{ width: "100%", padding: "0.5rem", borderRadius: 8 }}
            />
            <FSButton text="Send Message" />
          </form>
        </div>
        <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: "0.5rem", padding: "0.5rem", backgroundColor: "#f9f9f9", borderRadius: 8 }}>
              <p>{msg.content}</p>
              <button onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </div>
  );
}
